from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from notifications.twilio_config import TwilioHelper, format_phone_number, is_valid_phone_number
from notifications.services import TwoFactorService, NotificationService
import json


class Command(BaseCommand):
    help = 'Test Twilio SMS functionality'
    
    def add_arguments(self, parser):
        parser.add_argument('--phone', type=str, help='Phone number to test SMS')
        parser.add_argument('--check-setup', action='store_true', help='Check Twilio setup')
        parser.add_argument('--account-info', action='store_true', help='Show account information')
        parser.add_argument('--phone-numbers', action='store_true', help='List Twilio phone numbers')
        parser.add_argument('--test-2fa', type=str, help='Test 2FA SMS with username')
        parser.add_argument('--test-notification', type=str, help='Test notification SMS with username')
    
    def handle(self, *args, **options):
        helper = TwilioHelper()
        
        if options['check_setup']:
            self.check_setup(helper)
        
        elif options['account_info']:
            self.show_account_info(helper)
        
        elif options['phone_numbers']:
            self.show_phone_numbers(helper)
        
        elif options['phone']:
            self.test_sms(helper, options['phone'])
        
        elif options['test_2fa']:
            self.test_2fa_sms(options['test_2fa'])
        
        elif options['test_notification']:
            self.test_notification_sms(options['test_notification'])
        
        else:
            self.show_help()
    
    def check_setup(self, helper):
        """Check Twilio setup"""
        self.stdout.write(self.style.HTTP_INFO('Checking Twilio setup...'))
        
        setup_check = helper.check_setup()
        
        if setup_check['configured']:
            self.stdout.write(
                self.style.SUCCESS('✅ Twilio is properly configured!')
            )
            
            # Show account info if configured
            account_info = helper.get_account_info()
            if 'error' not in account_info:
                self.stdout.write(f"Account: {account_info['friendly_name']}")
                self.stdout.write(f"Status: {account_info['status']}")
                self.stdout.write(f"Type: {account_info['type']}")
        else:
            self.stdout.write(
                self.style.ERROR('❌ Twilio setup issues found:')
            )
            for issue in setup_check['issues']:
                self.stdout.write(f"  • {issue}")
            
            self.stdout.write(
                self.style.WARNING('\n📋 Setup Instructions:')
            )
            self.stdout.write('1. Go to https://www.twilio.com and create an account')
            self.stdout.write('2. Get your Account SID and Auth Token from the dashboard')
            self.stdout.write('3. Purchase a phone number (or use trial number)')
            self.stdout.write('4. Update settings in backend/dominion_bank/settings.py:')
            self.stdout.write('   TWILIO_ACCOUNT_SID = "your_actual_account_sid"')
            self.stdout.write('   TWILIO_AUTH_TOKEN = "your_actual_auth_token"')
            self.stdout.write('   TWILIO_PHONE_NUMBER = "+your_actual_phone_number"')
    
    def show_account_info(self, helper):
        """Show Twilio account information"""
        self.stdout.write(self.style.HTTP_INFO('Fetching account information...'))
        
        account_info = helper.get_account_info()
        
        if 'error' in account_info:
            self.stdout.write(
                self.style.ERROR(f'❌ Error: {account_info["error"]}')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('✅ Account Information:')
            )
            self.stdout.write(f"Account SID: {account_info['account_sid']}")
            self.stdout.write(f"Friendly Name: {account_info['friendly_name']}")
            self.stdout.write(f"Status: {account_info['status']}")
            self.stdout.write(f"Type: {account_info['type']}")
    
    def show_phone_numbers(self, helper):
        """Show Twilio phone numbers"""
        self.stdout.write(self.style.HTTP_INFO('Fetching phone numbers...'))
        
        phone_numbers = helper.get_phone_numbers()
        
        if isinstance(phone_numbers, dict) and 'error' in phone_numbers:
            self.stdout.write(
                self.style.ERROR(f'❌ Error: {phone_numbers["error"]}')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'✅ Found {len(phone_numbers)} phone numbers:')
            )
            for number in phone_numbers:
                self.stdout.write(f"  📞 {number['phone_number']}")
                self.stdout.write(f"     Name: {number['friendly_name']}")
                self.stdout.write(f"     SMS: {'✅' if number['capabilities'].get('sms') else '❌'}")
                self.stdout.write(f"     Voice: {'✅' if number['capabilities'].get('voice') else '❌'}")
                self.stdout.write("")
    
    def test_sms(self, helper, phone_number):
        """Test SMS sending"""
        self.stdout.write(f'Testing SMS to {phone_number}...')
        
        # Format phone number
        formatted_phone = format_phone_number(phone_number)
        
        if not is_valid_phone_number(formatted_phone):
            self.stdout.write(
                self.style.ERROR(f'❌ Invalid phone number: {phone_number}')
            )
            return
        
        # Send test SMS
        result = helper.send_test_sms(
            formatted_phone,
            "🏦 Test message from DominionTrust Bank! Your SMS notifications are working correctly."
        )
        
        if result['success']:
            self.stdout.write(
                self.style.SUCCESS('✅ SMS sent successfully!')
            )
            self.stdout.write(f"Message SID: {result['message_sid']}")
            self.stdout.write(f"Status: {result['status']}")
            self.stdout.write(f"To: {result['to']}")
            self.stdout.write(f"From: {result['from']}")
        else:
            self.stdout.write(
                self.style.ERROR(f'❌ SMS failed: {result["error"]}')
            )
    
    def test_2fa_sms(self, username):
        """Test 2FA SMS"""
        self.stdout.write(f'Testing 2FA SMS for user: {username}')
        
        try:
            user = User.objects.get(username=username)
            
            # Check if user has phone number
            try:
                phone_number = user.userprofile.phone_number
                if not phone_number:
                    self.stdout.write(
                        self.style.ERROR('❌ User has no phone number in profile')
                    )
                    return
            except:
                self.stdout.write(
                    self.style.ERROR('❌ User has no profile or phone number')
                )
                return
            
            # Test 2FA setup
            two_factor_service = TwoFactorService()
            result = two_factor_service.setup_2fa(user, method='sms')
            
            if result['success']:
                self.stdout.write(
                    self.style.SUCCESS('✅ 2FA SMS setup initiated!')
                )
                self.stdout.write(f"Message: {result['message']}")
                
                # Get the generated code
                from notifications.models import TwoFactorCode
                latest_code = TwoFactorCode.objects.filter(
                    user=user,
                    purpose='setup'
                ).order_by('-created_at').first()
                
                if latest_code:
                    self.stdout.write(f"Generated code: {latest_code.code}")
                    self.stdout.write(f"Expires at: {latest_code.expires_at}")
            else:
                self.stdout.write(
                    self.style.ERROR(f'❌ 2FA SMS failed: {result["error"]}')
                )
                
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'❌ User "{username}" not found')
            )
    
    def test_notification_sms(self, username):
        """Test notification SMS"""
        self.stdout.write(f'Testing notification SMS for user: {username}')
        
        try:
            user = User.objects.get(username=username)
            
            notification_service = NotificationService()
            
            # Test security alert SMS
            notifications = notification_service.send_notification(
                user=user,
                notification_type='security',
                template_type='security_alert',
                context_data={
                    'user_name': user.get_full_name() or user.username,
                    'alert_type': 'Test Security Alert',
                    'alert_description': 'This is a test security alert',
                    'event_time': '2024-01-01 10:00:00',
                    'ip_address': '192.168.1.1',
                    'location': 'Test Location',
                    'device_info': 'Test Device',
                    'risk_level': 'medium'
                },
                channels=['sms']
            )
            
            if notifications:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Sent {len(notifications)} SMS notifications!')
                )
                for notification in notifications:
                    self.stdout.write(f"Notification ID: {notification.id}")
                    self.stdout.write(f"Status: {notification.status}")
            else:
                self.stdout.write(
                    self.style.WARNING('⚠️ No SMS notifications sent (check user preferences)')
                )
                
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'❌ User "{username}" not found')
            )
    
    def show_help(self):
        """Show help information"""
        self.stdout.write(self.style.HTTP_INFO('Twilio SMS Testing Commands:'))
        self.stdout.write('')
        self.stdout.write('Setup and Configuration:')
        self.stdout.write('  --check-setup              Check if Twilio is properly configured')
        self.stdout.write('  --account-info              Show Twilio account information')
        self.stdout.write('  --phone-numbers             List available Twilio phone numbers')
        self.stdout.write('')
        self.stdout.write('SMS Testing:')
        self.stdout.write('  --phone +1234567890         Send test SMS to phone number')
        self.stdout.write('  --test-2fa username         Test 2FA SMS for user')
        self.stdout.write('  --test-notification user    Test notification SMS for user')
        self.stdout.write('')
        self.stdout.write('Examples:')
        self.stdout.write('  python manage.py test_twilio_sms --check-setup')
        self.stdout.write('  python manage.py test_twilio_sms --phone +1234567890')
        self.stdout.write('  python manage.py test_twilio_sms --test-2fa testuser') 
 