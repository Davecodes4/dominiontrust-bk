#!/usr/bin/env python
"""
Email SMTP Test Script for DominionTrust Bank
Tests both development (terminal) and production (SMTP) email sending
"""

import os
import sys
import django
from datetime import datetime

# Add the project root to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from notifications.services import NotificationService

def test_email_configuration():
    """Test the current email configuration"""
    
    print("=" * 80)
    print("🏦 DOMINIONTRUST BANK - EMAIL CONFIGURATION TEST")
    print("=" * 80)
    
    # Display current configuration
    print(f"📧 Email Backend: {settings.EMAIL_BACKEND}")
    print(f"📧 Email Host: {settings.EMAIL_HOST}")
    print(f"📧 Email Port: {settings.EMAIL_PORT}")
    print(f"📧 Use TLS: {settings.EMAIL_USE_TLS}")
    print(f"📧 From Email: {settings.DEFAULT_FROM_EMAIL}")
    print(f"📧 Host User: {settings.EMAIL_HOST_USER}")
    print(f"📧 Password Set: {'Yes' if settings.EMAIL_HOST_PASSWORD else 'No'}")
    
    # Determine mode
    is_smtp_mode = (
        settings.EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend' and
        settings.EMAIL_HOST_USER and 
        settings.EMAIL_HOST_PASSWORD
    )
    
    mode = "🌐 SMTP (Production)" if is_smtp_mode else "🔧 Console (Development)"
    print(f"📊 Mode: {mode}")
    print("=" * 80)
    
    return is_smtp_mode

def test_django_email():
    """Test Django's built-in email functionality"""
    
    print("\n🧪 TESTING DJANGO EMAIL FUNCTIONALITY")
    print("-" * 80)
    
    try:
        # Simple test email
        result = send_mail(
            subject='DominionTrust Bank - Email Test',
            message='This is a test email to verify SMTP configuration.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['test@example.com'],
            fail_silently=False,
        )
        
        if result:
            print("✅ Django email test: SUCCESS")
        else:
            print("❌ Django email test: FAILED")
            
    except Exception as e:
        print(f"❌ Django email test: FAILED - {str(e)}")

def test_notification_service():
    """Test the notification service email functionality"""
    
    print("\n🔔 TESTING NOTIFICATION SERVICE")
    print("-" * 80)
    
    try:
        # Get or create a test user
        user, created = User.objects.get_or_create(
            username='email_test_user',
            defaults={
                'email': 'test@dominiontrust.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        
        if created:
            print(f"👤 Created test user: {user.username}")
        else:
            print(f"👤 Using existing user: {user.username}")
        
        # Test notification service
        notification_service = NotificationService()
        
        # Test different types of notifications
        test_scenarios = [
            {
                'type': 'transaction',
                'template': 'transaction_created',
                'name': 'Transaction Created',
                'context': {
                    'user_name': user.get_full_name() or user.username,
                    'transaction_type': 'Transfer',
                    'amount': '100.00',
                    'reference': 'TEST001',
                    'date': datetime.now().strftime('%B %d, %Y'),
                }
            },
            {
                'type': 'security',
                'template': 'two_factor_code',
                'name': '2FA Code',
                'context': {
                    'user_name': user.get_full_name() or user.username,
                    'verification_code': '123456',
                    'expires_at': '10 minutes',
                }
            },
            {
                'type': 'account',
                'template': 'welcome_message',
                'name': 'Welcome Message',
                'context': {
                    'user_name': user.get_full_name() or user.username,
                    'created_at': datetime.now().strftime('%B %d, %Y'),
                }
            }
        ]
        
        for i, scenario in enumerate(test_scenarios, 1):
            print(f"\n{i}. Testing {scenario['name']}...")
            
            try:
                notifications = notification_service.send_notification(
                    user=user,
                    notification_type=scenario['type'],
                    template_type=scenario['template'],
                    context_data=scenario['context'],
                    channels=['email']
                )
                
                if notifications:
                    print(f"   ✅ {scenario['name']}: SUCCESS")
                else:
                    print(f"   ❌ {scenario['name']}: FAILED - No notifications sent")
                    
            except Exception as e:
                print(f"   ❌ {scenario['name']}: FAILED - {str(e)}")
        
        # Clean up test user if we created it
        if created:
            user.delete()
            print(f"\n🗑️  Cleaned up test user")
            
    except Exception as e:
        print(f"❌ Notification service test: FAILED - {str(e)}")

def provide_setup_instructions(is_smtp_mode):
    """Provide setup instructions based on current mode"""
    
    print("\n📋 SETUP INSTRUCTIONS")
    print("=" * 80)
    
    if is_smtp_mode:
        print("🌐 You are in SMTP mode - emails will be sent via your configured provider")
        print("✅ Configuration looks good!")
        print("\n📊 Next Steps:")
        print("• Test with a real email address")
        print("• Monitor delivery rates")
        print("• Set up bounce handling if needed")
        
    else:
        print("🔧 You are in development mode - emails will display in terminal")
        print("💡 To send real emails, follow these steps:")
        print("\n1. 📧 Configure Gmail SMTP (Recommended for testing):")
        print("   • Enable 2FA on your Gmail account")
        print("   • Generate an App Password")
        print("   • Edit .env file with these settings:")
        print("""
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-16-character-app-password
   DEFAULT_FROM_EMAIL=DominionTrust Bank <your-email@gmail.com>
   """)
        
        print("2. 🔄 Restart the Django server")
        print("3. 🧪 Run this test script again")
        
    print("\n📖 For more options, see: SMTP_SETUP_GUIDE.md")

def main():
    """Main test function"""
    
    # Test configuration
    is_smtp_mode = test_email_configuration()
    
    # Test Django email
    test_django_email()
    
    # Test notification service
    test_notification_service()
    
    # Provide instructions
    provide_setup_instructions(is_smtp_mode)
    
    print("\n" + "=" * 80)
    print("🎯 EMAIL TEST COMPLETED")
    print("=" * 80)

if __name__ == "__main__":
    main()
