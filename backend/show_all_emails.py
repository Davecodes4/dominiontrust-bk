#!/usr/bin/env python
"""
Email Notification Display Script
Shows all email notifications that can be sent by the DominionTrust Bank system
"""

import os
import sys
import django
from datetime import datetime, date, timedelta

# Add the project root to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import BankAccount, UserProfile
from banking.models import Transaction, Card
from notifications.services import NotificationService
from notifications.models import NotificationTemplate
from decimal import Decimal

def get_or_create_test_user():
    """Get existing user or use first available user"""
    try:
        # Try to find an existing user with a profile and account
        user = User.objects.filter(userprofile__isnull=False, bank_accounts__isnull=False).first()
        if user:
            profile = user.userprofile
            account = user.bank_accounts.first()
            return user, profile, account
        
        # If no suitable user exists, get any user and add missing components
        user = User.objects.first()
        if not user:
            # Create a minimal user if none exist
            user = User.objects.create_user(
                username='demo_user',
                email='demo@dominiontrust.com',
                first_name='Demo',
                last_name='User',
                password='demo123'
            )
        
        # Get or create profile
        try:
            profile = user.userprofile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(
                user=user,
                phone_number=f'+123456{user.id:04d}',  # Unique phone number
                date_of_birth=date(1990, 1, 1),
                address='123 Demo Street',
                city='Demo City',
                state='TX',
                postal_code='12345',
                country='US',
                kyc_status='approved'
            )
        
        # Get or create account
        account = user.bank_accounts.first()
        if not account:
            account = BankAccount.objects.create(
                user=user,
                account_type='savings',
                balance=Decimal('5000.00'),
                currency='USD',
                status='active'
            )
        
        return user, profile, account
        
    except Exception as e:
        print(f"Error setting up test user: {e}")
        return None, None, None

def display_all_email_notifications():
    """Display all email notifications for different scenarios"""
    
    print("=" * 100)
    print("🏦 DOMINIONTRUST BANK - ALL EMAIL NOTIFICATIONS")
    print("=" * 100)
    
    # Get test user
    user, profile, account = get_or_create_test_user()
    if not user:
        print("❌ Could not set up test user")
        return
    notification_service = NotificationService()
    
    # Get all available notification templates
    email_templates = NotificationTemplate.objects.filter(channel='email')
    
    print(f"\n📧 Found {email_templates.count()} email templates")
    print("=" * 100)
    
    scenarios = [
        # Transaction notifications
        {
            'type': 'transaction',
            'template': 'transaction_created',
            'title': '💳 TRANSACTION CREATED',
            'context': {
                'user_name': user.get_full_name(),
                'transaction_id': 'TXN001234567890',
                'transaction_type': 'Transfer',
                'amount': '250.00',
                'currency': 'USD',
                'description': 'Transfer to John Smith',
                'date': datetime.now().strftime('%B %d, %Y at %I:%M %p'),
                'account_name': 'Savings Account',
                'account_number': account.account_number[-4:],
                'balance': '4750.00',
                'reference': 'TXN001234567890',
                'from_account': account.account_number,
                'to_account': '9876543210',
                'expected_completion': (date.today() + timedelta(days=1)).strftime('%B %d, %Y')
            }
        },
        {
            'type': 'transaction',
            'template': 'transaction_completed',
            'title': '✅ TRANSACTION COMPLETED',
            'context': {
                'user_name': user.get_full_name(),
                'transaction_id': 'TXN001234567891',
                'transaction_type': 'Deposit',
                'amount': '1000.00',
                'currency': 'USD',
                'description': 'Salary deposit',
                'date': datetime.now().strftime('%B %d, %Y at %I:%M %p'),
                'account_name': 'Savings Account',
                'account_number': account.account_number[-4:],
                'balance': '6000.00',
                'reference': 'TXN001234567891',
                'completion_time': datetime.now().strftime('%I:%M %p')
            }
        },
        {
            'type': 'transaction',
            'template': 'transaction_failed',
            'title': '❌ TRANSACTION FAILED',
            'context': {
                'user_name': user.get_full_name(),
                'transaction_id': 'TXN001234567892',
                'transaction_type': 'Withdrawal',
                'amount': '10000.00',
                'currency': 'USD',
                'description': 'ATM withdrawal',
                'date': datetime.now().strftime('%B %d, %Y at %I:%M %p'),
                'account_name': 'Savings Account',
                'account_number': account.account_number[-4:],
                'failure_reason': 'Insufficient funds',
                'reference': 'TXN001234567892'
            }
        },
        
        # Account management
        {
            'type': 'account',
            'template': 'account_activation',
            'title': '🎉 ACCOUNT ACTIVATION',
            'context': {
                'user_name': user.get_full_name(),
                'email': user.email,
                'created_at': user.date_joined.strftime('%B %d, %Y'),
                'activation_link': 'https://app.dominiontrust.com/activate/abc123def456'
            }
        },
        {
            'type': 'account',
            'template': 'welcome_message',
            'title': '👋 WELCOME MESSAGE',
            'context': {
                'user_name': user.get_full_name(),
                'created_at': user.date_joined.strftime('%B %d, %Y'),
                'account_number': account.account_number,
                'login_url': 'https://app.dominiontrust.com/login'
            }
        },
        
        # Security notifications
        {
            'type': 'security',
            'template': 'security_alert',
            'title': '🚨 SECURITY ALERT',
            'context': {
                'user_name': user.get_full_name(),
                'alert_type': 'Suspicious Login Attempt',
                'alert_description': 'Login attempt from unrecognized device',
                'event_time': datetime.now().strftime('%B %d, %Y at %I:%M %p'),
                'ip_address': '192.168.1.100',
                'location': 'New York, NY, United States',
                'device_info': 'Chrome on Windows 10',
                'risk_level': 'High',
                'action_required': True,
                'secure_account_url': 'https://app.dominiontrust.com/security'
            }
        },
        {
            'type': 'security',
            'template': 'login_alert',
            'title': '🔐 LOGIN ALERT',
            'context': {
                'user_name': user.get_full_name(),
                'login_time': datetime.now().strftime('%B %d, %Y at %I:%M %p'),
                'ip_address': '192.168.1.50',
                'location': 'Los Angeles, CA, United States',
                'device_info': 'Safari on iPhone',
                'is_new_device': True
            }
        },
        
        # 2FA notifications
        {
            'type': 'security',
            'template': 'two_factor_code',
            'title': '🔐 TWO-FACTOR AUTHENTICATION CODE',
            'context': {
                'user_name': user.get_full_name(),
                'verification_code': '789456',
                'expires_at': (datetime.now() + timedelta(minutes=10)).strftime('%I:%M %p'),
                'attempt_info': {
                    'time': datetime.now().strftime('%I:%M %p'),
                    'ip': '192.168.1.75',
                    'device': 'Chrome on macOS'
                }
            }
        },
        
        # Email verification
        {
            'type': 'account',
            'template': 'email_verification',
            'title': '📧 EMAIL VERIFICATION',
            'context': {
                'user_name': user.get_full_name(),
                'verification_url': 'https://app.dominiontrust.com/verify/xyz789abc123',
                'expires_at': (datetime.now() + timedelta(hours=24)).strftime('%B %d, %Y at %I:%M %p')
            }
        },
        
        # Card notifications
        {
            'type': 'account',
            'template': 'card_created',
            'title': '💳 CARD CREATED',
            'context': {
                'user_name': user.get_full_name(),
                'card_type': 'Debit Card',
                'card_number': '****1234',
                'card_brand': 'Visa',
                'expiry_date': '12/28',
                'account_linked': account.account_number[-4:],
                'activation_required': True
            }
        },
        
        # Low balance alert
        {
            'type': 'account',
            'template': 'low_balance',
            'title': '⚠️ LOW BALANCE ALERT',
            'context': {
                'user_name': user.get_full_name(),
                'account_name': 'Savings Account',
                'account_number': account.account_number[-4:],
                'current_balance': '45.67',
                'threshold_amount': '100.00',
                'currency': 'USD',
                'date': datetime.now().strftime('%B %d, %Y')
            }
        },
        
        # Password reset
        {
            'type': 'security',
            'template': 'password_reset',
            'title': '🔑 PASSWORD RESET REQUEST',
            'context': {
                'user_name': user.get_full_name(),
                'reset_url': 'https://app.dominiontrust.com/reset/password123token',
                'expires_at': (datetime.now() + timedelta(hours=1)).strftime('%I:%M %p'),
                'request_ip': '192.168.1.25',
                'request_time': datetime.now().strftime('%B %d, %Y at %I:%M %p')
            }
        }
    ]
    
    # Send each notification and display the output
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n{i:02d}. {scenario['title']}")
        print("=" * 80)
        
        try:
            notifications = notification_service.send_notification(
                user=user,
                notification_type=scenario['type'],
                template_type=scenario['template'],
                context_data=scenario['context'],
                channels=['email']
            )
            
            if notifications:
                print(f"✅ Notification sent successfully (ID: {notifications[0].id})")
            else:
                print("❌ No notifications sent")
                
        except Exception as e:
            print(f"❌ Error sending notification: {str(e)}")
        
        print("\n" + "-" * 80)
    
    print(f"\n🎯 SUMMARY")
    print("=" * 80)
    print(f"Total scenarios tested: {len(scenarios)}")
    print("All email notifications are displayed above in terminal format")
    print("In production, these would be sent as HTML emails to recipients")
    print("=" * 80)
    
    # Cleanup not needed since we used existing user
    print("✅ Email notification demo completed")

if __name__ == "__main__":
    display_all_email_notifications()
