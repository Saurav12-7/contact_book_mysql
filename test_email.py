#!/usr/bin/env python3
"""
Test script to verify Gmail authentication setup
"""

import smtplib
from email.mime.text import MIMEText
import os

def test_gmail_auth(gmail_user, gmail_app_password):
    """Test Gmail authentication with app password"""
    try:
        # Create message
        msg = MIMEText("This is a test email from the Contact Book application.")
        msg['Subject'] = 'Test Email - Contact Book'
        msg['From'] = gmail_user
        msg['To'] = gmail_user  # Send to self for testing
        
        # Connect to Gmail SMTP
        print(f"Connecting to Gmail SMTP...")
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        
        print(f"Attempting to login with app password...")
        server.login(gmail_user, gmail_app_password)
        
        print(f"Sending test email...")
        server.sendmail(gmail_user, [gmail_user], msg.as_string())
        server.quit()
        
        print("✅ Gmail authentication successful! Test email sent.")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ Gmail authentication failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. Make sure 2-Step Verification is enabled on your Google Account")
        print("2. Generate a new app password: Google Account → Security → 2-Step Verification → App passwords")
        print("3. Use the 16-character app password (without spaces)")
        print("4. Make sure your Gmail address is correct")
        return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("Gmail Authentication Test")
    print("=" * 40)
    
    # Get credentials from user
    gmail_user = input("Enter your Gmail address: ").strip()
    gmail_app_password = input("Enter your Gmail app password: ").strip()
    
    if not gmail_user or not gmail_app_password:
        print("❌ Both Gmail address and app password are required.")
        exit(1)
    
    # Test authentication
    success = test_gmail_auth(gmail_user, gmail_app_password)
    
    if success:
        print("\n🎉 Your Gmail settings are working correctly!")
        print("You can now use the email functionality in the Contact Book application.")
    else:
        print("\n🔧 Please fix the authentication issues before using email features.") 