#!/usr/bin/env python3
"""
Database initialization script for Contact Book application
"""

import os
import sys
from flask import Flask
from flask_mysqldb import MySQL
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app for database operations
app = Flask(__name__)

# MySQL config
app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.environ.get('MYSQL_USER', 'root')
app.config['MYSQL_PASSWORD'] = os.environ.get('MYSQL_PASSWORD', 'root')
app.config['MYSQL_DB'] = os.environ.get('MYSQL_DB', 'contact_book_db')

mysql = MySQL(app)

def init_database():
    """Initialize the database and create all necessary tables"""
    try:
        with app.app_context():
            cursor = mysql.connection.cursor()
            
            print("Creating database if it doesn't exist...")
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {app.config['MYSQL_DB']}")
            cursor.execute(f"USE {app.config['MYSQL_DB']}")
            
            print("Creating users table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'user'
                )
            """)
            
            print("Adding gmail column to users table...")
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN gmail VARCHAR(255)")
                print("Added gmail column")
            except Exception as e:
                if "Duplicate column name" in str(e):
                    print("gmail column already exists")
                else:
                    raise e
            
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN gmail_app_password VARCHAR(255)")
                print("Added gmail_app_password column")
            except Exception as e:
                if "Duplicate column name" in str(e):
                    print("gmail_app_password column already exists")
                else:
                    raise e
            
            print("Creating contacts table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS contacts (
                    contact_id INT AUTO_INCREMENT PRIMARY KEY,
                    first_name VARCHAR(255) NOT NULL,
                    last_name VARCHAR(255) NOT NULL,
                    phone_number VARCHAR(20) NOT NULL,
                    email_address VARCHAR(255),
                    address TEXT,
                    user_id INT,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)
            
            print("Adding unique constraint for phone per user...")
            try:
                cursor.execute("""
                    ALTER TABLE contacts 
                    ADD CONSTRAINT unique_phone_per_user 
                    UNIQUE (phone_number, user_id)
                """)
                print("Added unique constraint for phone per user")
            except Exception as e:
                if "Duplicate key name" in str(e):
                    print("Unique constraint already exists")
                else:
                    raise e
            
            mysql.connection.commit()
            print("Database initialization completed successfully!")
            
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    init_database() 