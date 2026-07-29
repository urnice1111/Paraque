CREATE TABLE IF NOT EXISTS mensajes_queue(
    message_id TEXT PRIMARY KEY NOT NULL,
    from_me BOOLEAN NOT NULL DEFAULT FALSE,
    time_stamp BIGINT NOT NULL,
    message_content TEXT NOT NULL,
    created_at BIGINT DEFAULT (strftime('%s','now')),
    message_status DEFAULT 'missing' NOT NULL,
    batch INT
);