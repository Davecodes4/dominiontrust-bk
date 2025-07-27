from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import User
from .models import (
    Notification, NotificationTemplate, NotificationPreference, NotificationLog,
    TwoFactorAuth, TwoFactorCode, TrustedDevice, SecurityEvent
)
import logging
import requests
import secrets
import string
from typing import Dict, List, Optional
from decimal import Decimal
import json
from datetime import datetime, time, timedelta

logger = logging.getLogger(__name__)


class NotificationService:
    """Main service for handling all notification types"""
    
    def __init__(self):
        self.email_service = EmailNotificationService()
        self.sms_service = SMSNotificationService()
        self.in_app_service = InAppNotificationService()
        self.push_service = PushNotificationService()
    
    def send_email_verification(self, user, verification_url):
        """Send email verification notification"""
        try:
            context = {
                'user': user,
                'verification_url': verification_url,
                'site_name': 'DominionTrust Bank'
            }
            
            # Send email verification
            self.email_service.send_email_verification(
                user=user,
                context=context
            )
            
            # Log the notification
            self._log_notification(
                user=user,
                notification_type='email_verification',
                channel='email',
                status='sent',
                details=f'Verification email sent to {user.email}'
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email verification to {user.email}: {str(e)}")
            
            # Log the failure
            self._log_notification(
                user=user,
                notification_type='email_verification',
                channel='email',
                status='failed',
                details=f'Failed to send verification email: {str(e)}'
            )
            
            return False

    def send_notification(self, user, notification_type, template_type, context_data=None, channels=None):
        """Send notification through specified channels"""
        if context_data is None:
            context_data = {}
        
        # Get user preferences
        preferences = self._get_user_preferences(user)
        
        # Determine channels to use
        if channels is None:
            channels = self._get_default_channels(notification_type, preferences)
        
        notifications_sent = []
        
        for channel in channels:
            if self._should_send_to_channel(channel, notification_type, preferences):
                try:
                    notification = self._create_notification(
                        user, notification_type, template_type, channel, context_data
                    )
                    
                    success = self._send_to_channel(channel, notification, context_data)
                    
                    if success:
                        notification.mark_as_sent()
                        notifications_sent.append(notification)
                    else:
                        notification.mark_as_failed("Failed to send via channel")
                        
                except Exception as e:
                    logger.error(f"Failed to send {channel} notification to {user.username}: {str(e)}")
        
        return notifications_sent
    
    def _get_user_preferences(self, user):
        """Get user notification preferences"""
        try:
            return user.notification_preferences
        except NotificationPreference.DoesNotExist:
            # Create default preferences
            return NotificationPreference.objects.create(user=user)
    
    def _get_default_channels(self, notification_type, preferences):
        """Get default channels for notification type"""
        channels = []
        
        if notification_type in ['transaction', 'security', 'account']:
            if preferences.email_enabled:
                channels.append('email')
            if preferences.sms_enabled:
                channels.append('sms')
            if preferences.in_app_enabled:
                channels.append('in_app')
        
        return channels
    
    def _should_send_to_channel(self, channel, notification_type, preferences):
        """Check if notification should be sent to specific channel"""
        if not self._is_within_quiet_hours(preferences):
            return False
        
        # Channel-specific checks
        if channel == 'email':
            return preferences.email_enabled and getattr(preferences, f'email_{notification_type}', True)
        elif channel == 'sms':
            return preferences.sms_enabled and getattr(preferences, f'sms_{notification_type}', True)
        elif channel == 'in_app':
            return preferences.in_app_enabled and getattr(preferences, f'in_app_{notification_type}', True)
        elif channel == 'push':
            return preferences.push_enabled and getattr(preferences, f'push_{notification_type}', True)
        
        return True
    
    def _is_within_quiet_hours(self, preferences):
        """Check if current time is within quiet hours"""
        if not preferences.quiet_hours_enabled:
            return True
        
        current_time = timezone.now().time()
        start_time = preferences.quiet_hours_start
        end_time = preferences.quiet_hours_end
        
        if start_time <= end_time:
            return not (start_time <= current_time <= end_time)
        else:
            return not (current_time >= start_time or current_time <= end_time)
    
    def _sanitize_context_data(self, context_data):
        """
        Sanitize context data to ensure JSON serialization compatibility.
        Convert Decimal objects to strings and other non-serializable types.
        """
        if not context_data:
            return {}
        
        def convert_value(value):
            if isinstance(value, Decimal):
                return str(value)  # Convert Decimal to string for JSON compatibility
            elif isinstance(value, dict):
                return {k: convert_value(v) for k, v in value.items()}
            elif isinstance(value, (list, tuple)):
                return [convert_value(item) for item in value]
            elif hasattr(value, 'isoformat'):  # datetime objects
                return value.isoformat()
            else:
                return value
        
        return convert_value(context_data)
    
    def _create_notification(self, user, notification_type, template_type, channel, context_data):
        """Create notification record"""
        # Sanitize context data to ensure JSON compatibility
        sanitized_context_data = self._sanitize_context_data(context_data)
        
        template = self._get_template(template_type, channel)
        
        if template:
            title = self._render_template(template.subject or template.title, context_data)
            message = self._render_template(template.body_template, context_data)
            html_message = self._render_template(template.html_template, context_data) if template.html_template else ""
        else:
            title = f"Notification: {template_type}"
            message = "You have a new notification"
            html_message = ""
        
        return Notification.objects.create(
            user=user,
            notification_type=notification_type,
            channel=channel,
            template=template,
            title=title,
            message=message,
            html_message=html_message,
            context_data=sanitized_context_data  # Use sanitized data for JSON field
        )
    
    def _send_to_channel(self, channel, notification, context_data):
        """Send notification to specific channel"""
        if channel == 'email':
            return self.email_service.send_email(notification, context_data)
        elif channel == 'sms':
            return self.sms_service.send_sms(notification)
        elif channel == 'in_app':
            return self.in_app_service.send_in_app(notification)
        elif channel == 'push':
            return self.push_service.send_push(notification)
        
        return False
    
    def _get_template(self, template_type, channel):
        """Get notification template"""
        try:
            return NotificationTemplate.objects.get(
                template_type=template_type,
                channel=channel,
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            return None
    
    def _render_template(self, template_content, context):
        """Render template with context"""
        from django.template import Context, Template
        template = Template(template_content)
        return template.render(Context(context))
    
    def _log_notification(self, user, notification_type, channel, status, details):
        """Log notification event"""
        try:
            # For now, skip logging since we don't have a notification object
            # This method should be called with a notification object instead
            logger.info(f"Notification event: {notification_type} via {channel} for {user.username} - {status}")
            if details:
                logger.info(f"Details: {details}")
        except Exception as e:
            logger.error(f"Failed to log notification: {str(e)}")


class EmailNotificationService:
    """Service for sending email notifications"""
    
    def send_email(self, notification, context_data=None):
        """Send email notification via SMTP or terminal output based on configuration"""
        try:
            user = notification.user
            
            # Use HTML template if available
            if notification.html_message:
                html_content = notification.html_message
            else:
                # Render email template
                html_content = self._render_email_template(notification, context_data)
            
            # Create plain text version
            text_content = strip_tags(html_content)
            
            # Check if we should send real emails or display in terminal
            if self._should_send_real_email():
                return self._send_real_email(user, notification, html_content, text_content)
            else:
                return self._display_email_in_terminal(user, notification, html_content, text_content)
            
        except Exception as e:
            error_msg = f"Failed to send email: {str(e)}"
            logger.error(error_msg)
            self._log_notification(
                user=user,
                notification_type='email',
                channel='email',
                status='failed',
                details=error_msg
            )
            return False
    
    def _should_send_real_email(self):
        """Check if we should send real emails or use console output"""
        return (
            settings.EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend' and
            hasattr(settings, 'EMAIL_HOST') and settings.EMAIL_HOST and
            hasattr(settings, 'EMAIL_HOST_USER') and settings.EMAIL_HOST_USER and 
            hasattr(settings, 'EMAIL_HOST_PASSWORD') and settings.EMAIL_HOST_PASSWORD
        )
    
    def _send_real_email(self, user, notification, html_content, text_content):
        """Send actual email via SMTP"""
        try:
            from django.core.mail import EmailMultiAlternatives
            
            # Create email message
            email = EmailMultiAlternatives(
                subject=notification.title,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email]
            )
            
            # Attach HTML version
            email.attach_alternative(html_content, "text/html")
            
            # Send email
            email.send()
            
            # Log success
            self._log_notification(
                user=user,
                notification_type='email',
                channel='email',
                status='sent',
                details=f'Email sent to {user.email} via SMTP'
            )
            
            logger.info(f"📧 Email sent to {user.email}: {notification.title}")
            
            return True
            
        except Exception as e:
            error_msg = f"Failed to send SMTP email: {str(e)}"
            logger.error(error_msg)
            self._log_notification(
                user=user,
                notification_type='email',
                channel='email',
                status='failed',
                details=error_msg
            )
            return False
    
    def _display_email_in_terminal(self, user, notification, html_content, text_content):
        """Display email in terminal for development"""
        try:
            # Output to terminal instead of sending email
            print("\n" + "="*80)
            print("📧 EMAIL NOTIFICATION (DEVELOPMENT MODE)")
            print("="*80)
            print(f"To: {user.email}")
            print(f"Subject: {notification.title}")
            print(f"From: {settings.DEFAULT_FROM_EMAIL}")
            print("-"*80)
            print("PLAIN TEXT CONTENT:")
            print(text_content)
            print("-"*80)
            print("HTML CONTENT:")
            print(html_content)
            print("="*80)
            print("💡 To send real emails, configure SMTP in your .env file")
            print("📖 See SMTP_SETUP_GUIDE.md for configuration instructions")
            print("="*80)
            
            # Log success
            self._log_notification(
                user=user,
                notification_type='email',
                channel='email',
                status='sent',
                details='Email displayed in terminal (development mode)'
            )
            
            return True
            
        except Exception as e:
            error_msg = f"Failed to display email in terminal: {str(e)}"
            logger.error(error_msg)
            return False
    
    def send_email_verification(self, user, context):
        """Send email verification notification via SMTP or terminal output"""
        try:
            verification_url = context['verification_url']
            site_name = context['site_name']
            
            subject = f"Verify your email address for {site_name}"
            html_template = render_to_string("emails/email_verification.html", context)
            text_template = strip_tags(html_template)
            
            # Check if we should send real emails or display in terminal
            if self._should_send_real_email():
                # Send real email via SMTP
                try:
                    from django.core.mail import EmailMultiAlternatives
                    
                    email = EmailMultiAlternatives(
                        subject=subject,
                        body=text_template,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[user.email]
                    )
                    
                    email.attach_alternative(html_template, "text/html")
                    email.send()
                    
                    logger.info(f"📧 Email verification sent to {user.email}")
                    
                    self._log_notification(
                        user=user,
                        notification_type='email_verification',
                        channel='email',
                        status='sent',
                        details=f'Email verification sent to {user.email} via SMTP'
                    )
                    return True
                    
                except Exception as e:
                    logger.error(f"Failed to send SMTP email verification: {str(e)}")
                    # Fall back to terminal display
                    return self._display_verification_in_terminal(user, subject, text_template, html_template, verification_url)
            else:
                # Display in terminal for development
                return self._display_verification_in_terminal(user, subject, text_template, html_template, verification_url)
                
        except Exception as e:
            logger.error(f"Failed to send email verification to {user.email}: {str(e)}")
            self._log_notification(
                user=user,
                notification_type='email_verification',
                channel='email',
                status='failed',
                details=f"Failed to send verification email: {str(e)}"
            )
            return False
    
    def _display_verification_in_terminal(self, user, subject, text_template, html_template, verification_url):
        """Display email verification in terminal for development"""
        try:
            print("\n" + "="*80)
            print("📧 EMAIL VERIFICATION (DEVELOPMENT MODE)")
            print("="*80)
            print(f"To: {user.email}")
            print(f"Subject: {subject}")
            print(f"From: {settings.DEFAULT_FROM_EMAIL}")
            print("-"*80)
            print("PLAIN TEXT CONTENT:")
            print(text_template)
            print("-"*80)
            print("HTML CONTENT:")
            print(html_template)
            print("-"*80)
            print(f"🔗 VERIFICATION URL: {verification_url}")
            print("="*80)
            print("💡 To send real emails, configure SMTP in your .env file")
            print("📖 See SMTP_SETUP_GUIDE.md for configuration instructions")
            print("="*80)
            
            self._log_notification(
                user=user,
                notification_type='email_verification',
                channel='email',
                status='sent',
                details='Email verification displayed in terminal (development mode)'
            )
            return True
            
        except Exception as e:
            logger.error(f"Failed to display verification in terminal: {str(e)}")
            return False
    
    def _render_email_template(self, notification, context_data):
        """Render email template"""
        if not notification.template:
            return notification.message
        
        template_name = f"emails/{notification.template.template_type}.html"
        
        try:
            return render_to_string(template_name, context_data)
        except Exception as e:
            logger.warning(f"Failed to render template {template_name}: {str(e)}")
            return notification.message
    
    def _log_notification(self, user, notification_type, channel, status, details):
        """Log notification event"""
        try:
            # For now, skip logging since we don't have a notification object
            # This method should be called with a notification object instead
            logger.info(f"Notification event: {notification_type} via {channel} for {user.username} - {status}")
            if details:
                logger.info(f"Details: {details}")
        except Exception as e:
            logger.error(f"Failed to log notification: {str(e)}")


class SMSNotificationService:
    """Service for sending SMS notifications"""
    
    def send_sms(self, notification):
        """Send SMS notification (mock implementation)"""
        try:
            user = notification.user
            
            # Get user's phone number from profile
            try:
                phone_number = user.userprofile.phone_number
            except:
                phone_number = ''
            
            # Send SMS via Twilio
            response = self._send_sms_via_provider(
                phone_number=phone_number,
                message=notification.message
            )
            
            if response.get('success'):
                self._log_notification(notification, 'sent', 'SMS sent successfully')
                return True
            else:
                error_msg = response.get('error', 'Unknown SMS error')
                self._log_notification(notification, 'failed', error_msg)
                return False
                
        except Exception as e:
            error_msg = f"Failed to send SMS: {str(e)}"
            logger.error(error_msg)
            self._log_notification(notification, 'failed', error_msg)
            return False
    
    def _send_sms_via_provider(self, phone_number, message):
        """Send SMS via Twilio"""
        try:
            from twilio.rest import Client
            
            if not phone_number:
                return {'success': False, 'error': 'No phone number provided'}
            
            # Initialize Twilio client
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            
            # Send SMS
            message_instance = client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=phone_number
            )
            
            return {
                'success': True,
                'message_id': message_instance.sid,
                'status': message_instance.status
            }
            
        except Exception as e:
            logger.error(f"Twilio SMS error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _log_notification(self, notification, event_type, message):
        """Log notification event"""
        NotificationLog.objects.create(
            notification=notification,
            event_type=event_type,
            message=message
        )


class InAppNotificationService:
    """Service for in-app notifications"""
    
    def send_in_app(self, notification):
        """Send in-app notification"""
        try:
            # In-app notifications are stored in database and shown in UI
            # No external sending required
            
            self._log_notification(notification, 'sent', 'In-app notification created')
            return True
            
        except Exception as e:
            error_msg = f"Failed to create in-app notification: {str(e)}"
            logger.error(error_msg)
            self._log_notification(notification, 'failed', error_msg)
            return False
    
    def get_user_notifications(self, user, limit=50, unread_only=False):
        """Get user's in-app notifications"""
        notifications = Notification.objects.filter(
            user=user,
            channel='in_app'
        ).order_by('-created_at')
        
        if unread_only:
            notifications = notifications.filter(read_at__isnull=True)
        
        return notifications[:limit]
    
    def mark_as_read(self, notification_id, user):
        """Mark notification as read"""
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user=user,
                channel='in_app'
            )
            notification.mark_as_read()
            return True
        except Notification.DoesNotExist:
            return False
    
    def _log_notification(self, notification, event_type, message):
        """Log notification event"""
        NotificationLog.objects.create(
            notification=notification,
            event_type=event_type,
            message=message
        )


class PushNotificationService:
    """Service for push notifications"""
    
    def send_push(self, notification):
        """Send push notification"""
        try:
            user = notification.user
            
            # Send push notification via external provider
            response = self._send_push_via_provider(
                user=user,
                title=notification.title,
                message=notification.message
            )
            
            if response.get('success'):
                self._log_notification(notification, 'sent', 'Push notification sent')
                return True
            else:
                error_msg = response.get('error', 'Unknown push error')
                self._log_notification(notification, 'failed', error_msg)
                return False
                
        except Exception as e:
            error_msg = f"Failed to send push notification: {str(e)}"
            logger.error(error_msg)
            self._log_notification(notification, 'failed', error_msg)
            return False
    
    def _log_notification(self, notification, event_type, message):
        """Log notification event"""
        NotificationLog.objects.create(
            notification=notification,
            event_type=event_type,
            message=message
        )
    
    def _get_template(self, template_type, channel):
        """Get notification template"""
        try:
            return NotificationTemplate.objects.get(
                template_type=template_type,
                channel=channel,
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            return None
    
    def _render_template(self, template_content, context):
        """Render template with context"""
        from django.template import Context, Template
        template = Template(template_content)
        return template.render(Context(context))
    
    def _send_push_via_provider(self, user, title, message):
        """Send push notification via external provider (mock implementation)"""
        # This is a mock implementation - replace with actual push provider
        # Examples: Firebase FCM, Apple Push Notification Service, etc.
        
        # Mock successful response
        return {
            'success': True,
            'message_id': f"push_{timezone.now().timestamp()}",
            'status': 'sent'
        }


class TwoFactorService:
    """Service for two-factor authentication"""
    
    def __init__(self):
        self.notification_service = NotificationService()
    
    def setup_2fa(self, user, method='sms', phone_number=None):
        """Setup two-factor authentication for user"""
        try:
            # Get or create 2FA record
            two_factor, created = TwoFactorAuth.objects.get_or_create(
                user=user,
                defaults={
                    'method': method,
                    'is_enabled': False,
                    'is_verified': False
                }
            )
            
            if not created:
                two_factor.method = method
                two_factor.save()
            
            # Generate setup verification code
            verification_code = TwoFactorCode.generate_code(
                user=user,
                purpose='setup',
                expires_minutes=10
            )
            
            # Send setup code
            self._send_2fa_code(user, verification_code, 'setup')
            
            # Log security event
            SecurityEvent.objects.create(
                user=user,
                event_type='2fa_enabled',
                description=f'Two-factor authentication setup initiated with {method}',
                risk_level='low'
            )
            
            return {
                'success': True,
                'message': f'Setup code sent via {method}',
                'expires_at': verification_code.expires_at
            }
            
        except Exception as e:
            logger.error(f"Failed to setup 2FA for {user.username}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_setup(self, user, code):
        """Verify 2FA setup with code"""
        try:
            # Find valid setup code
            verification_code = TwoFactorCode.objects.filter(
                user=user,
                purpose='setup',
                code=code,
                is_used=False
            ).first()
            
            if not verification_code or not verification_code.is_valid():
                return {
                    'success': False,
                    'error': 'Invalid or expired code'
                }
            
            # Mark code as used
            verification_code.use_code()
            
            # Enable 2FA
            two_factor = user.two_factor_auth
            two_factor.is_enabled = True
            two_factor.is_verified = True
            two_factor.verified_at = timezone.now()
            two_factor.save()
            
            # Generate backup codes
            backup_codes = two_factor.generate_backup_codes()
            
            # Send confirmation notification
            self.notification_service.send_notification(
                user=user,
                notification_type='security',
                template_type='two_factor_enabled',
                context_data={
                    'user_name': user.get_full_name() or user.username,
                    'method': two_factor.get_method_display(),
                    'enabled_at': timezone.now().strftime('%B %d, %Y at %I:%M %p'),
                    'backup_codes': backup_codes
                }
            )
            
            # Log security event
            SecurityEvent.objects.create(
                user=user,
                event_type='2fa_enabled',
                description='Two-factor authentication successfully enabled',
                risk_level='low'
            )
            
            return {
                'success': True,
                'message': '2FA enabled successfully',
                'backup_codes': backup_codes
            }
            
        except Exception as e:
            logger.error(f"Failed to verify 2FA setup for {user.username}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def send_login_code(self, user, ip_address=None, user_agent=None):
        """Send 2FA code for login"""
        try:
            two_factor = user.two_factor_auth
            
            if not two_factor.is_enabled:
                return {
                    'success': False,
                    'error': '2FA is not enabled'
                }
            
            if two_factor.is_locked():
                return {
                    'success': False,
                    'error': '2FA is temporarily locked due to failed attempts'
                }
            
            # Generate login code
            verification_code = TwoFactorCode.generate_code(
                user=user,
                purpose='login',
                expires_minutes=10
            )
            
            # Add metadata
            verification_code.ip_address = ip_address
            verification_code.user_agent = user_agent
            verification_code.save()
            
            # Send code
            self._send_2fa_code(user, verification_code, 'login')
            
            # Log security event
            SecurityEvent.objects.create(
                user=user,
                event_type='2fa_code_sent',
                description='2FA login code sent',
                ip_address=ip_address,
                user_agent=user_agent,
                risk_level='low'
            )
            
            return {
                'success': True,
                'message': f'Code sent via {two_factor.get_method_display()}',
                'expires_at': verification_code.expires_at
            }
            
        except Exception as e:
            logger.error(f"Failed to send 2FA code for {user.username}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_login_code(self, user, code, ip_address=None, user_agent=None):
        """Verify 2FA code for login"""
        try:
            two_factor = user.two_factor_auth
            
            if two_factor.is_locked():
                return {
                    'success': False,
                    'error': '2FA is temporarily locked'
                }
            
            # Try regular code first
            verification_code = TwoFactorCode.objects.filter(
                user=user,
                purpose='login',
                code=code,
                is_used=False
            ).first()
            
            if verification_code and verification_code.is_valid():
                # Valid code
                verification_code.use_code()
                two_factor.reset_failed_attempts()
                two_factor.last_used = timezone.now()
                two_factor.save()
                
                # Log success
                SecurityEvent.objects.create(
                    user=user,
                    event_type='2fa_verification_success',
                    description='2FA login verification successful',
                    ip_address=ip_address,
                    user_agent=user_agent,
                    risk_level='low'
                )
                
                return {
                    'success': True,
                    'message': '2FA verification successful'
                }
            
            # Try backup code
            if two_factor.verify_backup_code(code):
                two_factor.reset_failed_attempts()
                two_factor.last_used = timezone.now()
                two_factor.save()
                
                # Log backup code usage
                SecurityEvent.objects.create(
                    user=user,
                    event_type='2fa_verification_success',
                    description='2FA backup code used successfully',
                    ip_address=ip_address,
                    user_agent=user_agent,
                    risk_level='medium'
                )
                
                return {
                    'success': True,
                    'message': '2FA backup code accepted',
                    'backup_code_used': True
                }
            
            # Failed verification
            two_factor.record_failed_attempt()
            
            # Log failure
            SecurityEvent.objects.create(
                user=user,
                event_type='2fa_verification_failure',
                description='2FA verification failed',
                ip_address=ip_address,
                user_agent=user_agent,
                risk_level='medium'
            )
            
            return {
                'success': False,
                'error': 'Invalid or expired code'
            }
            
        except Exception as e:
            logger.error(f"Failed to verify 2FA code for {user.username}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def disable_2fa(self, user, code):
        """Disable 2FA with verification"""
        try:
            # Verify code first
            verification_result = self.verify_login_code(user, code)
            
            if not verification_result['success']:
                return verification_result
            
            # Disable 2FA
            two_factor = user.two_factor_auth
            two_factor.is_enabled = False
            two_factor.is_verified = False
            two_factor.backup_codes = []
            two_factor.save()
            
            # Send notification
            self.notification_service.send_notification(
                user=user,
                notification_type='security',
                template_type='two_factor_disabled',
                context_data={
                    'user_name': user.get_full_name() or user.username,
                    'disabled_at': timezone.now().strftime('%B %d, %Y at %I:%M %p')
                }
            )
            
            # Log security event
            SecurityEvent.objects.create(
                user=user,
                event_type='2fa_disabled',
                description='Two-factor authentication disabled',
                risk_level='medium'
            )
            
            return {
                'success': True,
                'message': '2FA disabled successfully'
            }
            
        except Exception as e:
            logger.error(f"Failed to disable 2FA for {user.username}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _send_2fa_code(self, user, verification_code, purpose):
        """Send 2FA code via configured method"""
        two_factor = user.two_factor_auth
        
        context_data = {
            'user_name': user.get_full_name() or user.username,
            'verification_code': verification_code.code,
            'purpose': purpose,
            'expires_at': verification_code.expires_at.isoformat(),
            'ip_address': verification_code.ip_address,
            'location': 'Unknown',  # Could be enhanced with IP geolocation
            'backup_codes_available': len(two_factor.backup_codes) > 0,
            'help_link': f"{settings.FRONTEND_URL}/help/2fa"
        }
        
        # Send via preferred method
        if two_factor.method == 'email':
            channels = ['email']
        elif two_factor.method == 'sms':
            channels = ['sms']
        else:
            channels = ['email']  # Default fallback
        
        self.notification_service.send_notification(
            user=user,
            notification_type='two_factor',
            template_type='two_factor_code',
            context_data=context_data,
            channels=channels
        )


class SecurityService:
    """Service for security events and alerts"""
    
    def __init__(self):
        self.notification_service = NotificationService()
    
    def track_login(self, user, ip_address=None, user_agent=None, success=True):
        """Track login attempt"""
        try:
            event_type = 'login_success' if success else 'login_failure'
            risk_level = 'low' if success else 'medium'
            
            # Check for suspicious patterns
            if success:
                risk_assessment = self._assess_login_risk(user, ip_address, user_agent)
                risk_level = risk_assessment['risk_level']
                
                if risk_level in ['high', 'critical']:
                    self._send_security_alert(user, 'suspicious_login', risk_assessment)
            
            # Create security event
            SecurityEvent.objects.create(
                user=user,
                event_type=event_type,
                description=f'Login attempt from {ip_address}',
                ip_address=ip_address,
                user_agent=user_agent,
                risk_level=risk_level
            )
            
            # Send login alert for high-risk logins
            if success and risk_level in ['medium', 'high']:
                self._send_login_alert(user, ip_address, user_agent, risk_level)
            
        except Exception as e:
            logger.error(f"Failed to track login for {user.username}: {str(e)}")
    
    def register_device(self, user, device_info, ip_address=None, user_agent=None):
        """Register a new trusted device"""
        try:
            device_id = self._generate_device_id(user_agent, ip_address)
            
            device = TrustedDevice.objects.create(
                user=user,
                device_id=device_id,
                device_name=device_info.get('name', 'Unknown Device'),
                device_type=device_info.get('type', 'other'),
                browser=device_info.get('browser', ''),
                operating_system=device_info.get('os', ''),
                user_agent=user_agent or '',
                ip_address=ip_address,
                location=device_info.get('location', ''),
                country=device_info.get('country', ''),
                is_trusted=False  # Requires manual approval
            )
            
            # Send device registration notification
            self.notification_service.send_notification(
                user=user,
                notification_type='security',
                template_type='device_registered',
                context_data={
                    'user_name': user.get_full_name() or user.username,
                    'device_name': device.device_name,
                    'device_type': device.get_device_type_display(),
                    'location': device.location,
                    'ip_address': device.ip_address,
                    'registered_at': device.created_at
                }
            )
            
            # Log security event
            SecurityEvent.objects.create(
                user=user,
                event_type='device_registered',
                description=f'New device registered: {device.device_name}',
                ip_address=ip_address,
                user_agent=user_agent,
                trusted_device=device,
                risk_level='medium'
            )
            
            return device
            
        except Exception as e:
            logger.error(f"Failed to register device for {user.username}: {str(e)}")
            return None
    
    def _assess_login_risk(self, user, ip_address, user_agent):
        """Assess risk level of login attempt"""
        risk_factors = []
        risk_score = 0
        
        # Check for new IP address
        recent_logins = SecurityEvent.objects.filter(
            user=user,
            event_type='login_success',
            ip_address=ip_address,
            created_at__gte=timezone.now() - timedelta(days=30)
        ).exists()
        
        if not recent_logins:
            risk_factors.append('New IP address')
            risk_score += 30
        
        # Check for new user agent
        recent_agents = SecurityEvent.objects.filter(
            user=user,
            event_type='login_success',
            user_agent=user_agent,
            created_at__gte=timezone.now() - timedelta(days=30)
        ).exists()
        
        if not recent_agents:
            risk_factors.append('New device/browser')
            risk_score += 20
        
        # Check for multiple recent failures
        recent_failures = SecurityEvent.objects.filter(
            user=user,
            event_type='login_failure',
            created_at__gte=timezone.now() - timedelta(hours=1)
        ).count()
        
        if recent_failures >= 3:
            risk_factors.append('Multiple recent failed attempts')
            risk_score += 40
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = 'critical'
        elif risk_score >= 50:
            risk_level = 'high'
        elif risk_score >= 30:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'risk_level': risk_level,
            'risk_score': risk_score,
            'risk_factors': risk_factors,
            'ip_address': ip_address,
            'user_agent': user_agent
        }
    
    def _send_security_alert(self, user, alert_type, risk_assessment):
        """Send security alert notification"""
        context_data = {
            'user_name': user.get_full_name() or user.username,
            'alert_type': alert_type.replace('_', ' ').title(),
            'alert_description': 'suspicious login activity',
            'event_time': timezone.now().strftime('%B %d, %Y at %I:%M %p'),
            'ip_address': risk_assessment['ip_address'],
            'location': 'Unknown',  # Could be enhanced with IP geolocation
            'device_info': 'Unknown',
            'risk_level': risk_assessment['risk_level'],
            'was_you': True,  # Allow user to confirm
            'confirm_link': f"{settings.FRONTEND_URL}/security/confirm-activity",
            'secure_account_link': f"{settings.FRONTEND_URL}/security/secure-account",
            'security_phone': '+1-800-BANK-SEC',
            'security_email': 'security@dominiontrust.com',
            'alert_id': f"SEC-{timezone.now().strftime('%Y%m%d%H%M%S')}"
        }
        
        self.notification_service.send_notification(
            user=user,
            notification_type='security',
            template_type='security_alert',
            context_data=context_data,
            channels=['email', 'sms']  # High priority channels
        )
    
    def _send_login_alert(self, user, ip_address, user_agent, risk_level):
        """Send login alert notification"""
        context_data = {
            'user_name': user.get_full_name() or user.username,
            'login_time': timezone.now().strftime('%B %d, %Y at %I:%M %p'),
            'ip_address': ip_address,
            'location': 'Unknown',
            'device_info': user_agent,
            'risk_level': risk_level
        }
        
        self.notification_service.send_notification(
            user=user,
            notification_type='security',
            template_type='login_alert',
            context_data=context_data
        )
    
    def _generate_device_id(self, user_agent, ip_address):
        """Generate unique device ID"""
        import hashlib
        content = f"{user_agent}:{ip_address}:{timezone.now().date()}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]


class AccountActivationService:
    """Service for account activation"""
    
    def __init__(self):
        self.notification_service = NotificationService()
    
    def send_activation_email(self, user, activation_token):
        """Send account activation email"""
        try:
            activation_link = f"{settings.FRONTEND_URL}/activate/{activation_token}"
            
            context_data = {
                'user_name': user.get_full_name() or user.username,
                'email': user.email,
                'created_at': user.date_joined.strftime('%B %d, %Y'),
                'activation_link': activation_link
            }
            
            self.notification_service.send_notification(
                user=user,
                notification_type='account',
                template_type='account_activation',
                context_data=context_data,
                channels=['email']
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send activation email for {user.username}: {str(e)}")
            return False
    
    def activate_account(self, user):
        """Activate user account"""
        try:
            # Mark user as active
            user.is_active = True
            user.save()
            
            # Send welcome notification
            self.notification_service.send_notification(
                user=user,
                notification_type='account',
                template_type='welcome_message',
                context_data={
                    'user_name': user.get_full_name() or user.username,
                    'activated_at': timezone.now().strftime('%B %d, %Y at %I:%M %p')
                }
            )
            
            # Log security event
            SecurityEvent.objects.create(
                user=user,
                event_type='account_activated',
                description='Account successfully activated',
                risk_level='low'
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to activate account for {user.username}: {str(e)}")
            return False 