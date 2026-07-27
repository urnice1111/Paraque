import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
} from 'baileys'
import qrcode from 'qrcode-terminal'
import P from 'pino'

const logger = P({ level: 'debug' })

async function connect() {
  // creates ./auth_info if it doesn't exist; loads it if it does
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger,
    auth: {
      creds: state.creds,
      // caching the key store massively reduces disk I/O
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    // If the qr gotten on the update, this means new connection
    if (qr) qrcode.generate(qr, { small: true })

    if (connection === 'open') console.log('connected')

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      if (code === DisconnectReason.loggedOut) {
        console.log('logged out, delete auth_info and restart')
      } else {
        connect()
      }
    }
  })

  sock.ev.on('messages.upsert', ({messages}) => {
    for (const msg of messages){
        if (!msg.message) continue

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text

    
        if (text) {
            // Convert unix timestamp into date
            var date = new Date(msg.messageTimestamp * 1000)

            console.log('From:', msg.key.remoteJid)
            console.log('When:', date)
            console.log(`Text:`, text)
            console.log('Category:', msg.category)
            console.log('From me:', msg.key.fromMe)
            console.log('--------------------------------')
        }
    }
  })



  return sock
}

connect()