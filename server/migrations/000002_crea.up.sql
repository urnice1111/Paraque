CREATE TABLE IF NOT EXISTS contacts(
    contact_id VARCHAR(255) PRIMARY KEY,
    contact_name VARCHAR(255)
);

ALTER TABLE mensajes_queue
ADD COLUMN contact_id INT NOT NULL REFERENCES contacts(contact_id);

CREATE TABLE IF NOT EXISTS relevant_data(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at BIGINT DEFAULT (strftime('%s','now')),

    CONSTRAINT FK_relevant_data_customers
    FOREIGN KEY (contact_id) REFERENCES contacts(contact_id)
);

CREATE TABLE IF NOT EXISTS gift_ideas(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INT,
    title TEXT NOT NULL,
    created_at BIGINT DEFAULT (strftime('%s','now')),

    CONSTRAINT FK_gift_ideas_customers
    FOREIGN KEY (contact_id) REFERENCES contacts(contact_id)
);

CREATE TABLE IF NOT EXISTS recordatories(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date BIGINT NOT NULL,
    created_at BIGINT DEFAULT (strftime('%s','now')),

    CONSTRAINT FK_recordatories_customers
    FOREIGN KEY (contact_id) REFERENCES contacts(contact_id)
);