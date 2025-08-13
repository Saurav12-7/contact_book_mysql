-- sql/04_delete_contact.sql

USE contact_book_db;

DELETE FROM contacts
WHERE
    contact_id = 3; -- Replace 3 with the actual contact_id you want to delete
    -- OR WHERE first_name = 'Peter' AND last_name = 'Jones';
