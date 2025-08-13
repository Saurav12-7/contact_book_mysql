-- sql/02_add_contact.sql

USE contact_book_db;

INSERT INTO contacts (first_name, last_name, phone_number, email_address, address)
VALUES ('John', 'Doe', '123-456-7890', 'john.doe@example.com', '123 Main St, Anytown');

INSERT INTO contacts (first_name, last_name, phone_number, email_address, address)
VALUES ('Jane', 'Smith', '987-654-3210', 'jane.smith@example.com', '456 Oak Ave, Othercity');

INSERT INTO contacts (first_name, last_name, phone_number, email_address, address)
VALUES ('Peter', 'Jones', '555-111-2222', 'peter.jones@example.com', '789 Pine Ln, Somewhere');
