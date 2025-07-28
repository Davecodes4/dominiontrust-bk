#!/usr/bin/env python
"""
Real Email Test Script for DominionTrust Bank
Sends actual emails to andrewmeyers838@gmail.com
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

from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from django.contrib.auth.models import User
from accounts.models import UserProfile, BankAccount
from notifications.services import NotificationService

def test_smtp_connection():
    """Test SMTP connection and configuration"""
    
    print("=" * 80)
    print("🏦 DOMINIONTRUST BANK - REAL EMAIL TEST")
    print("=" * 80)
    
    print("📧 Current Email Configuration:")
    print(f"   Backend: {settings.EMAIL_BACKEND}")
    print(f"   Host: {getattr(settings, 'EMAIL_HOST', 'Not configured')}")
    print(f"   Port: {getattr(settings, 'EMAIL_PORT', 'Not configured')}")
    print(f"   Use TLS: {getattr(settings, 'EMAIL_USE_TLS', 'Not configured')}")
    print(f"   Host User: {getattr(settings, 'EMAIL_HOST_USER', 'Not configured')}")
    print(f"   From Email: {settings.DEFAULT_FROM_EMAIL}")
    print("-" * 80)
    
    return True

def test_simple_email():
    """Send a simple test email"""
    
    print("🧪 Testing Simple Email...")
    
    try:
        send_mail(
            subject='DominionTrust Bank - SMTP Test Email',
            message='This is a test email to verify SMTP configuration is working correctly.\n\nSent at: ' + datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['andrewmeyers838@gmail.com'],
            fail_silently=False,
        )
        print("✅ Simple email sent successfully!")
        return True
    except Exception as e:
        print(f"❌ Simple email failed: {str(e)}")
        return False

def test_html_email():
    """Send an HTML test email"""
    
    print("🧪 Testing HTML Email...")
    
    html_content = """
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>DominionTrust Bank</h1>
            <p>SMTP Configuration Test</p>
        </div>
        <div class="content">
            <h2>🎉 Email System Active!</h2>
            <p>Congratulations! Your SMTP configuration is working correctly.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
                <li>Test Time: """ + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + """</li>
                <li>Backend: SMTP (Real Email)</li>
                <li>Status: ✅ Working</li>
            </ul>
            <p>You can now send registration confirmations, 2FA codes, and transaction notifications!</p>
        </div>
        <div class="footer">
            <p>This email was sent automatically by the DominionTrust Bank system.</p>
        </div>
    </body>
    </html>
    """
    
    try:
        msg = EmailMessage(
            subject='DominionTrust Bank - HTML Email Test',
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=['andrewmeyers838@gmail.com'],
        )
        msg.content_subtype = "html"
        msg.send()
        print("✅ HTML email sent successfully!")
        return True
    except Exception as e:
        print(f"❌ HTML email failed: {str(e)}")
        return False

def test_notification_service():
    """Test the notification service with real emails"""
    
    print("🧪 Testing Notification Service...")
    
    try:
        # Create a temporary test user
        test_user = User.objects.create_user(
            username='email_test_' + str(int(datetime.now().timestamp())),
            email='andrewmeyers838@gmail.com',
            first_name='Andrew',
            last_name='Meyers'
        )
        
        # Create profile
        profile = UserProfile.objects.create(
            user=test_user,
            phone_number='+1234567890',
            date_of_birth='1990-01-01',
            gender='M',
            marital_status='single',
            address='123 Test St',
            city='Test City',
            state='TS',
            postal_code='12345',
            country='USA'
        )
        
        # Create bank account
        account = BankAccount.objects.create(
            user=test_user,
            account_type='savings',
            balance=1000.00
        )
        
        print(f"👤 Created test user: {test_user.username}")
        
        # Test welcome email
        print("   📧 Sending Welcome Email...")
        NotificationService.send_welcome_email(test_user)
        print("   ✅ Welcome email sent!")
        
        # Test 2FA code
        print("   📧 Sending 2FA Code...")
        NotificationService.send_2fa_code(test_user, '123456', purpose='login')
        print("   ✅ 2FA code sent!")
        
        # Test transaction notification
        print("   📧 Sending Transaction Notification...")
        transaction_data = {
            'reference_number': 'TEST001',
            'amount': 100.00,
            'transaction_type': 'transfer',
            'status': 'pending',
            'description': 'SMTP Test Transaction'
        }
        NotificationService.send_transaction_notification(test_user, 'created', transaction_data)
        print("   ✅ Transaction notification sent!")
        
        # Cleanup
        test_user.delete()
        print("🗑️  Test user cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Notification service test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function"""
    
    # Test SMTP configuration
    test_smtp_connection()
    
    # Run tests
    print("\n" + "🔬 RUNNING EMAIL TESTS")
    print("=" * 80)
    
    tests = [
        ("Simple Email", test_simple_email),
        ("HTML Email", test_html_email),
        ("Notification Service", test_notification_service),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{len(results) + 1}. {test_name}...")
        success = test_func()
        results.append((test_name, success))
        print()
    
    # Summary
    print("=" * 80)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 80)
    
    for test_name, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    print(f"\n🎯 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ All tests passed! Your SMTP is working perfectly!")
        print("📧 Check andrewmeyers838@gmail.com for the test emails.")
    else:
        print("❌ Some tests failed. Check the configuration and try again.")
    
    print("=" * 80)

if __name__ == "__main__":
    main()
