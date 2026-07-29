import sqlite3 from 'sqlite3';

export function writeMessage(db, msg, batch) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO mensajes_queue(message_id, from_me, time_stamp, message_content, batch, contact_id)
            VALUES (?, ?, ?, ?, ?, ?)`
        );

        stmt.run(
            msg.message_id, msg.from_me, msg.time_stamp, msg.message_content, batch, msg.contact_id,
            function (err) {
                if (err) reject(err);
                else {resolve(this.changes); console.log("message inserted")}; 
            }
        );
        stmt.finalize();
    });
}

export function addContact(db, contact_id, contact_name){
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(
            `
            INSERT OR IGNORE INTO contacts (contact_id, contact_name)
            VALUES(?, ?)
            `
        )

        stmt.run(contact_id, contact_name, 
            function (err) {
            if (err) reject(err);
            else resolve(this.changes);
            }
        );
        stmt.finalize();
    })

}