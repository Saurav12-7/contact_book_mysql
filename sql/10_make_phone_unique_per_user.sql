ALTER TABLE contacts DROP INDEX phone_number;
CREATE UNIQUE INDEX unique_user_phone ON contacts (user_id, phone_number); 