# Test script for Gmail SMTP
import smtplib
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

username = os.environ.get('SMTP_USERNAME', '')
password = os.environ.get('SMTP_PASSWORD', '')
from_email = os.environ.get('EMAIL_FROM_EMAIL', '')

print(f"Username: {username}")
print(f"Password: '{password}'")
print(f"Password length: {len(password)}")
print(f"From email: {from_email}")

# Try to connect
try:
    print("\nTrying port 465 with SSL...")
    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    server.login(username, password)
    print("SUCCESS on port 465!")
    server.quit()
except Exception as e:
    print(f"Port 465 failed: {str(e)[:100]}")

try:
    print("\nTrying port 587 with TLS...")
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(username, password)
    print("SUCCESS on port 587!")
    server.quit()
except Exception as e:
    print(f"Port 587 failed: {str(e)[:100]}")
