-- sql/03_update_contact.sql

USE contact_book_db;

UPDATE contacts
SET
    phone_number = '111-222-3333',
    email_address = 'john.doe.new@example.com',
    address = 'New Address, New City'
WHERE
    contact_id = 1; -- Replace 1 with the actual contact_id you want to update
    -- OR WHERE first_name = 'John' AND last_name = 'Doe';
