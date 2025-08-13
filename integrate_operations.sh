#!/bin/bash

# integrate_operations.sh

# --- MySQL Configuration ---
MYSQL_USER="root" # e.g., root
MYSQL_PASSWORD="root" # e.g., your_root_password
MYSQL_DB="contact_book_db"
# ---------------------------

echo "--- Basic Contact Book Operations (MySQL) ---"
echo "Database: $MYSQL_DB"
echo ""

# Ensure the database exists (optional, but good for first run)
echo "Creating/Using database '$MYSQL_DB' if it doesn't exist..."
mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $MYSQL_DB;"
if [ $? -ne 0 ]; then
    echo "Error creating database or connecting. Exiting."
    exit 1
fi
echo "Database ready."
echo ""

# 1. Create Table (ensure it's only done once or safely)
echo "1. Creating/Ensuring contacts table exists..."
mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB" < sql/01_create_table.sql
echo "Table creation complete."
echo ""

# 2. Add Contacts
echo "2. Adding initial contacts..."
mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB" < sql/02_add_contact.sql
echo "Contacts added."
echo ""

# 3. List All Contacts (initial view)
echo "3. Listing all contacts after adding:"
mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB" < sql/06_list_all_contacts.sql
echo ""

# 4. Update a Contact
echo "4. Updating contact (ID 1 - John Doe's email/phone/address)..."
# IMPORTANT: Manually edit sql/03_update_contact.sql to set the correct values and WHERE clause
mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB" < sql/03_update_contact.sql
echo "Contact updated."
echo ""

# 5. List All Contacts (after update)
echo "5. Listing all contacts after update:"
mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB" < sql/06_list_all_contacts.sql
echo ""

# 6. Search Contacts
echo "6. Searching for contacts containing 'John' or '123'..."
# IMPORTANT: Manually edit sql/05_search_contacts.sql to set the desired search terms
mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB" < sql/05_search_contacts.sql
echo "Search complete."
echo ""

# 7. Delete a Contact
echo "7. Deleting contact (ID 3 - Peter Jones)..."
# IMPORTANT: Manually edit sql/04_delete_contact.sql to set the correct WHERE clause
mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB" < sql/04_delete_contact.sql
echo "Contact deleted."
echo ""

# 8. List All Contacts (final view)
echo "8. Listing all contacts after deletion:"
mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB" < sql/06_list_all_contacts.sql
echo ""

echo "--- Operations complete. ---"