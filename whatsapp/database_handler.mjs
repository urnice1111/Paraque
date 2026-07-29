import sqlite3 from 'sqlite3';

export function writeMessage(db, msg, batch) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO mensajes_queue(message_id, from_me, time_stamp, message_content, batch)
            VALUES (?, ?, ?, ?, ?)`
        );

        stmt.run(
            msg.message_id, msg.from_me, msg.time_stamp, msg.message_content, batch,
            function (err) {
                if (err) reject(err);
                else {resolve(this.changes); console.log("message inserted")}; 
            }
        );
        stmt.finalize();
    });
}