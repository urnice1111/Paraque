import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
} from 'baileys'
import qrcode from 'qrcode-terminal'
import P from 'pino'

import { writeMessage } from './database_handler.mjs'

const logger = P({ level: 'silent' })

import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('../data/dev.db');

async function connect() {
  // creates ./auth_info if it doesn't exist; loads it if it does
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const { version } = await fetchLatestBaileysVersion()

  const messages_bucket = {}
  let currentBatch = 1;

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

  sock.ev.on('messages.upsert', async ({messages}) => {
    console.log("current batch: ", currentBatch)
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

            const group = msg.key.remoteJid;

            const msg_object = {
              message_id : msg.key.id,
              from_me : msg.key.fromMe,
              time_stamp: msg.messageTimestamp,
              message_content: text,
            }

            console.log(msg_object.message_id);

            if (group in messages_bucket){
              messages_bucket[group].push(msg_object);
            } else {
              messages_bucket[group] = [msg_object];
            }

            if (messages_bucket[group].length >= 5){
              try {
                for (const m of messages_bucket[group]){
                  await writeMessage(db, m, currentBatch);
                  messages_bucket[group] = [];
                }
                currentBatch++;
              } catch (err){
                console.error('Batch failed', err)
              }
            }
        }
    }
  })



  return sock
}

connect()