#!/usr/bin/env python
"""
Registration Debug Script for DominionTrust Bank
Tests the registration endpoint to identify the 400 error cause
"""

import os
import sys
import django
import json
import requests
from datetime import datetime, date

# Add the project root to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from django.conf import settings
from django.test import Client
from django.contrib.auth.models import User

def test_registration_endpoint():
    """Test the registration endpoint to identify issues"""
    
    print("=" * 80)
    print("🏦 DOMINIONTRUST BANK - REGISTRATION DEBUG")
    print("=" * 80)
    
    # Create test client
    client = Client()
    
    # Test data that should work
    test_data = {
        "username": "testuser123",
        "email": "test@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        
        # Profile fields
        "phone_number": "+1234567890",
        "phone_country": "US",
        "date_of_birth": "1990-01-01",
        "gender": "M",  # Use single letter: M, F, O
        "marital_status": "single",
        
        # Address
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postal_code": "10001",
        "country": "USA",
        
        # Account preferences
        "account_type": "savings",
        "email_notifications": True,
        "sms_notifications": True,
        "statement_delivery": "email"
    }
    
    print("🧪 Testing registration with valid data...")
    print(f"📧 Username: {test_data['username']}")
    print(f"📧 Email: {test_data['email']}")
    print(f"📅 Date of Birth: {test_data['date_of_birth']}")
    print("-" * 80)
    
    try:
        # Make the request
        response = client.post(
            '/api/auth/register/',
            data=json.dumps(test_data),
            content_type='application/json'
        )
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.items())}")
        
        if response.content:
            try:
                response_data = json.loads(response.content.decode())
                print(f"📄 Response Data: {json.dumps(response_data, indent=2)}")
            except:
                print(f"📄 Raw Response: {response.content.decode()}")
        
        if response.status_code == 201:
            print("✅ Registration successful!")
            
            # Check if user was created
            try:
                user = User.objects.get(username=test_data['username'])
                print(f"👤 User created: {user.username} ({user.email})")
                print(f"🔒 User active: {user.is_active}")
                
                # Check profile
                if hasattr(user, 'userprofile'):
                    profile = user.userprofile
                    print(f"📋 Profile created: KYC Status = {profile.kyc_status}")
                    print(f"📞 Phone: {profile.phone_number}")
                
                # Check bank account
                if user.bank_accounts.exists():
                    account = user.bank_accounts.first()
                    print(f"🏦 Bank account created: {account.account_number} ({account.account_type})")
                
                # Clean up - delete the test user
                user.delete()
                print("🗑️  Test user cleaned up")
                
            except User.DoesNotExist:
                print("❌ User was not created despite 201 response")
                
        elif response.status_code == 400:
            print("❌ Registration failed with validation errors")
            
        else:
            print(f"❌ Unexpected response code: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        import traceback
        traceback.print_exc()

def test_with_different_scenarios():
    """Test various scenarios that might cause issues"""
    
    print("\n" + "=" * 80)
    print("🔍 TESTING DIFFERENT SCENARIOS")
    print("=" * 80)
    
    client = Client()
    
    scenarios = [
        {
            "name": "Missing Required Fields",
            "data": {
                "username": "testuser456",
                "email": "test2@example.com",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!"
                # Missing required profile fields
            }
        },
        {
            "name": "Invalid Date Format",
            "data": {
                "username": "testuser789",
                "email": "test3@example.com",
                "first_name": "Jane",
                "last_name": "Doe",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
                "phone_number": "+1234567890",
                "date_of_birth": "invalid-date",  # Invalid format
                "gender": "F",  # Use single letter
                "marital_status": "single",
                "address": "123 Main St",
                "city": "New York",
                "state": "NY",
                "postal_code": "10001",
                "account_type": "savings"
            }
        },
        {
            "name": "Underage User",
            "data": {
                "username": "testuser101",
                "email": "test4@example.com",
                "first_name": "Young",
                "last_name": "Person",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
                "phone_number": "+1234567890",
                "date_of_birth": "2010-01-01",  # Too young
                "gender": "M",  # Use single letter
                "marital_status": "single",
                "address": "123 Main St",
                "city": "New York",
                "state": "NY",
                "postal_code": "10001",
                "account_type": "savings"
            }
        }
    ]
    
    for scenario in scenarios:
        print(f"\n🧪 Testing: {scenario['name']}")
        print("-" * 40)
        
        try:
            response = client.post(
                '/api/auth/register/',
                data=json.dumps(scenario['data']),
                content_type='application/json'
            )
            
            print(f"Status: {response.status_code}")
            
            if response.content:
                try:
                    response_data = json.loads(response.content.decode())
                    print(f"Response: {json.dumps(response_data, indent=2)}")
                except:
                    print(f"Raw Response: {response.content.decode()}")
                    
        except Exception as e:
            print(f"Error: {str(e)}")

def check_database_state():
    """Check the current database state"""
    
    print("\n" + "=" * 80)
    print("🗄️ DATABASE STATE CHECK")
    print("=" * 80)
    
    try:
        user_count = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        
        print(f"👤 Total Users: {user_count}")
        print(f"✅ Active Users: {active_users}")
        print(f"❌ Inactive Users: {inactive_users}")
        
        # Check recent users
        recent_users = User.objects.order_by('-date_joined')[:5]
        print(f"\n📅 Recent Users:")
        for user in recent_users:
            print(f"  • {user.username} ({user.email}) - Active: {user.is_active}")
        
        # Check profiles
        from accounts.models import UserProfile
        profiles = UserProfile.objects.count()
        print(f"\n📋 User Profiles: {profiles}")
        
        # Check bank accounts
        from accounts.models import BankAccount
        accounts = BankAccount.objects.count()
        print(f"🏦 Bank Accounts: {accounts}")
        
        # Check email verifications
        from accounts.models import EmailVerification
        verifications = EmailVerification.objects.count()
        pending_verifications = EmailVerification.objects.filter(verified_at__isnull=True).count()
        print(f"📧 Email Verifications: {verifications} (Pending: {pending_verifications})")
        
    except Exception as e:
        print(f"❌ Database check failed: {str(e)}")

def main():
    """Main debug function"""
    
    # Check database state first
    check_database_state()
    
    # Test registration
    test_registration_endpoint()
    
    # Test different scenarios
    test_with_different_scenarios()
    
    print("\n" + "=" * 80)
    print("🎯 REGISTRATION DEBUG COMPLETED")
    print("=" * 80)

if __name__ == "__main__":
    main()
