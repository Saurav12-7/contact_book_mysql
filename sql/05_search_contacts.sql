-- sql/05_search_contacts.sql

USE contact_book_db;

SELECT
    contact_id,
    first_name,
    last_name,
    phone_number,
    email_address,
    address
FROM
    contacts
WHERE
    first_name LIKE '%John%'    -- Search by part of the first name
    OR last_name LIKE '%Doe%'   -- Search by part of the last name
    OR phone_number LIKE '%123%'; -- Search by part of the phone number

