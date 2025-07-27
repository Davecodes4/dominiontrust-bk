#!/usr/bin/env python3
"""
Test script to verify the registration process works correctly.
This simulates a frontend registration request.
"""

import requests
import json
import datetime
from datetime import date

# Backend URL
BASE_URL = "http://localhost:8000"

def test_registration():
    """Test the registration endpoint with valid data"""
    
    # Generate a unique username and email
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    username = f"testuser_{timestamp}"
    email = f"testuser_{timestamp}@example.com"
    
    # Registration data matching the frontend format
    registration_data = {
        "username": username,
        "email": email,
        "password": "testpassword123",
        "password_confirm": "testpassword123",
        "first_name": "Test",
        "last_name": "User",
        "phone_number": "1234567890",
        "date_of_birth": "1990-01-15",
        "gender": "M",
        "marital_status": "single",
        "address": "123 Test Street",
        "city": "Test City",
        "state": "Test State",
        "postal_code": "12345",
        "country": "United States",
        "id_type": "drivers_license",
        "id_number": "DL123456789",
        "employer_name": "Test Company",
        "monthly_income": 50000,
        "email_notifications": True,
        "sms_notifications": True,
        "statement_delivery": "email",
        "account_type": "savings"
    }
    
    print("Testing registration endpoint...")
    print(f"Username: {username}")
    print(f"Email: {email}")
    print()
    
    try:
        # Make the registration request
        response = requests.post(
            f"{BASE_URL}/api/auth/register/",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print()
        
        if response.status_code == 201:
            # Registration successful
            data = response.json()
            print("✅ Registration successful!")
            print(f"User ID: {data['user']['id']}")
            print(f"Token: {data['token'][:20]}...")
            print(f"Message: {data['message']}")
            print(f"KYC Required: {data['kyc_required']}")
            print(f"Next Step: {data['next_step']}")
            
            # Test the token by making an authenticated request
            print("\nTesting authentication with token...")
            auth_response = requests.get(
                f"{BASE_URL}/api/auth/profile/",
                headers={"Authorization": f"Token {data['token']}"}
            )
            
            if auth_response.status_code == 200:
                profile_data = auth_response.json()
                print("✅ Authentication successful!")
                print(f"Profile: {profile_data['user']['first_name']} {profile_data['user']['last_name']}")
                print(f"KYC Status: {profile_data['kyc_status']}")
            else:
                print(f"❌ Authentication failed: {auth_response.status_code}")
                print(auth_response.text)
                
        else:
            # Registration failed
            print(f"❌ Registration failed: {response.status_code}")
            try:
                error_data = response.json()
                print("Error details:")
                for field, errors in error_data.items():
                    if isinstance(errors, list):
                        print(f"  {field}: {', '.join(errors)}")
                    else:
                        print(f"  {field}: {errors}")
            except:
                print(f"Raw response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Make sure the Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_validation_errors():
    """Test registration with invalid data to check validation"""
    
    print("\n" + "="*50)
    print("Testing validation errors...")
    print("="*50)
    
    # Test with invalid data
    invalid_data = {
        "username": "test",
        "email": "invalid-email",
        "password": "123",  # Too short
        "password_confirm": "456",  # Doesn't match
        "first_name": "",  # Empty
        "last_name": "",  # Empty
        "phone_number": "",  # Empty
        "date_of_birth": "2010-01-01",  # Too young
        "gender": "invalid",  # Invalid choice
        "marital_status": "invalid",  # Invalid choice
        "address": "",  # Empty
        "city": "",  # Empty
        "state": "",  # Empty
        "postal_code": "",  # Empty
        "id_type": "invalid",  # Invalid choice
        "id_number": ""  # Empty
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/register/",
            json=invalid_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ Validation working correctly!")
            error_data = response.json()
            print("Validation errors:")
            for field, errors in error_data.items():
                if isinstance(errors, list):
                    print(f"  {field}: {', '.join(errors)}")
                else:
                    print(f"  {field}: {errors}")
        else:
            print(f"❌ Expected 400 status code, got {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("DominionTrust Bank - Registration Test")
    print("="*50)
    
    # Test successful registration
    test_registration()
    
    # Test validation errors
    test_validation_errors()
    
    print("\n" + "="*50)
    print("Test completed!") 
 