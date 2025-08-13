-- sql/01_create_table.sql

USE contact_book_db; -- Specify the database to use

CREATE TABLE IF NOT EXISTS contacts (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    email_address VARCHAR(255) UNIQUE,
    address VARCHAR(255),
    INDEX idx_name (first_name, last_name),
    INDEX idx_phone (phone_number)
) ENGINE=InnoDB;
