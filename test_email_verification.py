#!/usr/bin/env python
"""
Test Email Verification Links for DominionTrust Bank
Tests that activation emails are being sent with proper links
"""

import os
import sys
import django
import json
from datetime import datetime

# Add the project root to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from django.conf import settings
from django.test import Client
from django.contrib.auth.models import User
from notifications.services import NotificationService
from accounts.models import EmailVerification

def test_email_verification_sending():
    """Test that email verification is being sent via SMTP"""
    
    print("=" * 80)
    print("🏦 DOMINIONTRUST BANK - EMAIL VERIFICATION TEST")
    print("=" * 80)
    
    # Print current email configuration
    print("📧 EMAIL CONFIGURATION:")
    print(f"   Backend: {settings.EMAIL_BACKEND}")
    print(f"   Host: {settings.EMAIL_HOST}")
    print(f"   Port: {settings.EMAIL_PORT}")
    print(f"   Use TLS: {getattr(settings, 'EMAIL_USE_TLS', False)}")
    print(f"   Use SSL: {getattr(settings, 'EMAIL_USE_SSL', False)}")
    print(f"   User: {settings.EMAIL_HOST_USER}")
    print(f"   Password Set: {'Yes' if settings.EMAIL_HOST_PASSWORD else 'No'}")
    print(f"   From Email: {settings.DEFAULT_FROM_EMAIL}")
    print("-" * 80)
    
    # Create test user
    timestamp = str(datetime.now().microsecond)
    test_username = f"testuser_{timestamp}"
    test_email = "andrewmeyers838@gmail.com"  # Send to Andrew's email
    
    print(f"🧪 CREATING TEST USER: {test_username}")
    print(f"📧 Email will be sent to: {test_email}")
    print("-" * 80)
    
    try:
        # Create user
        user = User.objects.create_user(
            username=test_username,
            email=test_email,
            first_name="Test",
            last_name="User",
            password="TestPassword123!"
        )
        print(f"✅ User created: {user.username}")
        
        # Create email verification record
        verification = EmailVerification.objects.create(
            user=user,
            email=user.email,
            verification_code="test123456"
        )
        print(f"✅ Email verification record created")
        
        # Generate verification URL
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{verification.verification_code}"
        print(f"🔗 Verification URL: {verification_url}")
        
        # Test notification service
        notification_service = NotificationService()
        
        print("\n🧪 TESTING EMAIL VERIFICATION SENDING...")
        print("-" * 40)
        
        # Send email verification
        success = notification_service.send_email_verification(
            user=user,
            verification_url=verification_url
        )
        
        if success:
            print("✅ Email verification sent successfully!")
            print(f"📬 Check {test_email} for the verification email")
            print(f"🔗 The email should contain this link: {verification_url}")
        else:
            print("❌ Failed to send email verification")
        
        # Clean up
        user.delete()
        print(f"🗑️  Test user cleaned up")
        
        return success
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_registration_with_email_verification():
    """Test full registration flow with email verification"""
    
    print("\n" + "=" * 80)
    print("🧪 TESTING FULL REGISTRATION WITH EMAIL VERIFICATION")
    print("=" * 80)
    
    client = Client()
    timestamp = str(datetime.now().microsecond)
    
    registration_data = {
        "username": f"regtest_{timestamp}",
        "email": "andrewmeyers838@gmail.com",  # Send to Andrew's email
        "first_name": "Registration",
        "last_name": "Test",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        
        # Required profile fields
        "phone_number": f"+123456{timestamp[-4:]}",
        "date_of_birth": "1990-01-01",
        "gender": "M",
        "marital_status": "single",
        "address": "123 Test Street",
        "city": "Test City",
        "state": "NY",
        "postal_code": "10001",
        "account_type": "savings"
    }
    
    print(f"🧪 Testing registration for: {registration_data['username']}")
    print(f"📧 Email will be sent to: {registration_data['email']}")
    print("-" * 80)
    
    try:
        response = client.post(
            '/api/auth/register/',
            data=json.dumps(registration_data),
            content_type='application/json'
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.content:
            try:
                response_data = json.loads(response.content.decode())
                print(f"📄 Response Data: {json.dumps(response_data, indent=2)}")
            except:
                print(f"📄 Raw Response: {response.content.decode()}")
        
        if response.status_code == 201:
            print("✅ Registration successful!")
            print("📬 Check andrewmeyers838@gmail.com for the verification email")
            
            # Check if verification record was created
            try:
                user = User.objects.get(username=registration_data['username'])
                verification = EmailVerification.objects.filter(user=user).first()
                if verification:
                    verification_url = f"{settings.FRONTEND_URL}/verify-email/{verification.verification_code}"
                    print(f"🔗 Verification URL: {verification_url}")
                    print(f"📝 Verification Code: {verification.verification_code}")
                
                # Clean up
                user.delete()
                print("🗑️  Test user cleaned up")
                
            except User.DoesNotExist:
                print("❌ User was not created")
                
            return True
        else:
            print(f"❌ Registration failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Registration test failed: {str(e)}")
        return False

def check_email_service_status():
    """Check if email service is properly configured"""
    
    print("\n" + "=" * 80)
    print("🔍 EMAIL SERVICE STATUS CHECK")
    print("=" * 80)
    
    from notifications.services import EmailNotificationService
    
    email_service = EmailNotificationService()
    
    # Check if should send real email
    should_send_real = email_service._should_send_real_email()
    print(f"📧 Should send real emails: {should_send_real}")
    
    if should_send_real:
        print("✅ Email service is configured for SMTP sending")
        print("📬 Emails will be sent to real email addresses")
    else:
        print("⚠️  Email service is in development mode")
        print("📺 Emails will be displayed in terminal")
        
        # Check what's missing
        print("\n🔍 Configuration check:")
        print(f"   EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
        print(f"   EMAIL_HOST: {getattr(settings, 'EMAIL_HOST', 'Not set')}")
        print(f"   EMAIL_HOST_USER: {getattr(settings, 'EMAIL_HOST_USER', 'Not set')}")
        print(f"   EMAIL_HOST_PASSWORD: {'Set' if getattr(settings, 'EMAIL_HOST_PASSWORD', '') else 'Not set'}")
    
    return should_send_real

def main():
    """Main test function"""
    
    print("🏦 DominionTrust Bank - Email Verification Test")
    print("This test will send emails to andrewmeyers838@gmail.com\n")
    
    # Check email service status
    email_configured = check_email_service_status()
    
    if not email_configured:
        print("\n❌ Email service is not configured for SMTP")
        print("📋 Fix your email configuration first")
        return
    
    # Test email verification sending
    verification_success = test_email_verification_sending()
    
    # Test full registration flow
    registration_success = test_registration_with_email_verification()
    
    print("\n" + "=" * 80)
    print("🎯 EMAIL VERIFICATION TEST RESULTS")
    print("=" * 80)
    print(f"📧 Email Service Configured: {'✅' if email_configured else '❌'}")
    print(f"📧 Email Verification Test: {'✅' if verification_success else '❌'}")
    print(f"📧 Registration Test: {'✅' if registration_success else '❌'}")
    
    if email_configured and verification_success and registration_success:
        print("\n🎉 ALL TESTS PASSED!")
        print("📬 Check andrewmeyers838@gmail.com for verification emails")
        print("🔗 The emails should contain activation links")
    else:
        print("\n❌ SOME TESTS FAILED")
        print("🛠️  Check your SMTP configuration")

if __name__ == "__main__":
    main()
