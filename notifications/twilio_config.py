"""
Twilio Configuration Helper for DominionTrust Bank
==================================================

This file contains Twilio setup instructions and configuration helpers.

SETUP INSTRUCTIONS:
==================

1. Create Twilio Account:
   - Go to https://www.twilio.com
   - Sign up for a free account
   - Verify your phone number

2. Get Your Credentials:
   - Login to Twilio Console
   - Find your Account SID and Auth Token on the dashboard
   - Purchase a phone number (or use the trial number)

3. Update Django Settings:
   - Open backend/dominion_bank/settings.py
   - Replace the placeholder values with your actual credentials:
     * TWILIO_ACCOUNT_SID = 'your_actual_account_sid'
     * TWILIO_AUTH_TOKEN = 'your_actual_auth_token'
     * TWILIO_PHONE_NUMBER = '+your_actual_phone_number'

4. Test SMS Functionality:
   - Run: python manage.py test_twilio_sms --phone +1234567890
   - Check if SMS is received

SECURITY NOTES:
===============
- Never commit real credentials to version control
- Use environment variables in production
- Consider using Django's SECRET_KEY for encryption
- Rotate credentials regularly

TWILIO FEATURES USED:
====================
- SMS messaging for 2FA codes
- SMS notifications for security alerts
- SMS transaction notifications
- SMS low balance alerts
"""

from django.conf import settings
from twilio.rest import Client
import logging

logger = logging.getLogger(__name__)


class TwilioHelper:
    """Helper class for Twilio SMS operations"""
    
    def __init__(self):
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.phone_number = settings.TWILIO_PHONE_NUMBER
        self.client = None
        
    def get_client(self):
        """Get Twilio client instance"""
        if not self.client:
            self.client = Client(self.account_sid, self.auth_token)
        return self.client
    
    def validate_credentials(self):
        """Validate Twilio credentials"""
        try:
            client = self.get_client()
            # Try to fetch account info to validate credentials
            account = client.api.accounts(self.account_sid).fetch()
            return {
                'valid': True,
                'account_sid': account.sid,
                'status': account.status,
                'friendly_name': account.friendly_name
            }
        except Exception as e:
            return {
                'valid': False,
                'error': str(e)
            }
    
    def send_test_sms(self, to_number, message="Test message from DominionTrust Bank"):
        """Send a test SMS"""
        try:
            client = self.get_client()
            message_instance = client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_number
            )
            return {
                'success': True,
                'message_sid': message_instance.sid,
                'status': message_instance.status,
                'to': message_instance.to,
                'from': message_instance.from_
            }
        except Exception as e:
            logger.error(f"Test SMS failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_account_info(self):
        """Get Twilio account information"""
        try:
            client = self.get_client()
            account = client.api.accounts(self.account_sid).fetch()
            return {
                'account_sid': account.sid,
                'friendly_name': account.friendly_name,
                'status': account.status,
                'type': account.type
            }
        except Exception as e:
            return {
                'error': str(e)
            }
    
    def get_phone_numbers(self):
        """Get list of Twilio phone numbers"""
        try:
            client = self.get_client()
            phone_numbers = client.incoming_phone_numbers.list()
            return [
                {
                    'sid': number.sid,
                    'phone_number': number.phone_number,
                    'friendly_name': number.friendly_name,
                    'capabilities': number.capabilities
                }
                for number in phone_numbers
            ]
        except Exception as e:
            return {
                'error': str(e)
            }
    
    def check_setup(self):
        """Check if Twilio is properly set up"""
        issues = []
        
        # Check if credentials are set
        if self.account_sid == 'your_account_sid_here':
            issues.append("TWILIO_ACCOUNT_SID not configured")
        
        if self.auth_token == 'your_auth_token_here':
            issues.append("TWILIO_AUTH_TOKEN not configured")
        
        if self.phone_number == '+1234567890':
            issues.append("TWILIO_PHONE_NUMBER not configured")
        
        # Check if credentials are valid
        if not issues:
            validation = self.validate_credentials()
            if not validation['valid']:
                issues.append(f"Invalid credentials: {validation['error']}")
        
        return {
            'configured': len(issues) == 0,
            'issues': issues
        }


def format_phone_number(phone_number):
    """Format phone number for Twilio (E.164 format)"""
    # Remove all non-digit characters
    digits = ''.join(filter(str.isdigit, phone_number))
    
    # Add country code if not present
    if len(digits) == 10:  # US number without country code
        return f"+1{digits}"
    elif len(digits) == 11 and digits.startswith('1'):  # US number with country code
        return f"+{digits}"
    elif digits.startswith('+'):
        return digits
    else:
        return f"+{digits}"


def is_valid_phone_number(phone_number):
    """Check if phone number is valid for SMS"""
    try:
        formatted = format_phone_number(phone_number)
        return len(formatted) >= 10 and formatted.startswith('+')
    except:
        return False


# Quick setup check
def check_twilio_setup():
    """Quick function to check Twilio setup"""
    helper = TwilioHelper()
    return helper.check_setup() 
 