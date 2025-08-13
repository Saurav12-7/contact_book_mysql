-- Drop the old unique index on phone_number if it exists
DROP INDEX phone_number ON contacts;
-- Drop the old unique index on (user_id, phone_number) if it exists (ignore error if not present)
DROP INDEX unique_user_phone ON contacts;
-- Add the correct unique index
CREATE UNIQUE INDEX unique_user_phone ON contacts (user_id, phone_number); 