"""
Test the upload endpoint with authentication
"""
import requests
import os

# First, login
login_url = "http://localhost:5000/api/login"
login_data = {
    "username": "admin",
    "password": "admin123"
}

print("Step 1: Logging in as admin...")
session = requests.Session()
response = session.post(login_url, json=login_data)
print(f"Login response status: {response.status_code}")
if response.status_code == 200:
    print("✓ Login successful")
    print(f"Response: {response.json()}")
else:
    print(f"✗ Login failed: {response.text}")
    exit()

# Now try to upload a file
print("\nStep 2: Testing upload endpoint...")
upload_url = "http://localhost:5000/api/upload"

# Find a test file
upload_dir = 'uploads'
files = [f for f in os.listdir(upload_dir) if f.endswith('.xlsb')]
if not files:
    print("No test files found in uploads directory")
    exit()

test_file = os.path.join(upload_dir, files[0])
print(f"Using test file: {test_file}")

# Test with a small request first
print("\nStep 3: Sending upload request...")
with open(test_file, 'rb') as f:
    files_dict = {'file': (os.path.basename(test_file), f, 'application/vnd.ms-excel.sheet.binary.macroEnabled.12')}
    response = session.post(upload_url, files=files_dict)

print(f"Upload response status: {response.status_code}")
if response.status_code == 200:
    print("✓ Upload successful!")
    print(f"Response: {response.json()}")
else:
    print(f"✗ Upload failed")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
