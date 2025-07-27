#!/usr/bin/env python3

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import BankAccount
from banking.models import Transaction
from notifications.services import NotificationService
from notifications.models import Notification

def test_transfer_notification():
    """Test if transfer notifications are working"""
    
    # Get test user
    user = User.objects.get(username='andrewmeyers838')
    print(f"🧪 Testing notifications for user: {user.username} ({user.email})")
    
    # Count current notifications
    initial_count = Notification.objects.filter(user=user).count()
    print(f"📊 Initial notification count: {initial_count}")
    
    # Test notification service directly
    ns = NotificationService()
    try:
        result = ns.send_notification(
            user=user,
            notification_type='transaction',
            template_type='transfer_sent',
            context_data={
                'user_name': user.get_full_name() or user.username,
                'transaction_id': 'TEST-TRANSFER-123',
                'amount': 500.00,
                'currency': 'USD',
                'description': 'Test Transfer Notification',
                'date': 'January 26, 2025 at 7:30 AM',
                'account_number': '****7890',
                'reference': 'REF-TEST-123',
                'recipient_name': 'John Smith'
            }
        )
        print(f"✅ Notification sent successfully: {len(result)} notifications created")
        
        # Count notifications after
        final_count = Notification.objects.filter(user=user).count()
        print(f"📊 Final notification count: {final_count}")
        print(f"📈 New notifications created: {final_count - initial_count}")
        
        # Show recent notifications
        recent_notifications = Notification.objects.filter(user=user).order_by('-created_at')[:3]
        print(f"\n📧 Recent notifications:")
        for notif in recent_notifications:
            print(f"  - {notif.notification_type}: {notif.title} ({notif.channel}) - Status: {notif.status}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error sending notification: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_email_settings():
    """Check Django email settings"""
    from django.conf import settings
    
    print(f"\n⚙️  Email Configuration:")
    print(f"   EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"   DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    
    if hasattr(settings, 'EMAIL_HOST'):
        print(f"   EMAIL_HOST: {settings.EMAIL_HOST}")
        print(f"   EMAIL_PORT: {settings.EMAIL_PORT}")
        print(f"   EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")

if __name__ == "__main__":
    print("🧪 Testing Transfer Notification System")
    print("=" * 50)
    
    check_email_settings()
    print()
    
    success = test_transfer_notification()
    
    print(f"\n{'✅ Test PASSED' if success else '❌ Test FAILED'}")
    print("\n💡 Note: With EMAIL_BACKEND = 'console.EmailBackend', emails appear in the Django server console.")
    print("💡 For real email sending, configure SMTP settings in your .env file.")
