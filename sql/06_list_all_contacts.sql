-- sql/06_list_all_contacts.sql

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
ORDER BY
    last_name, first_name;
