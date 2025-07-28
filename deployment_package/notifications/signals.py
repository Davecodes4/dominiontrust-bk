from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.contrib.auth.models import User
from django.utils import timezone
from django import db
from banking.models import Transaction, Card
from accounts.models import UserProfile
from .services import NotificationService, SecurityService, TwoFactorService
from .models import NotificationPreference, SecurityEvent
import logging

logger = logging.getLogger(__name__)

# Initialize services
notification_service = NotificationService()
security_service = SecurityService()
two_factor_service = TwoFactorService()


@receiver(post_save, sender=User)
def user_created_notification(sender, instance, created, **kwargs):
    """Send welcome notification when user is created"""
    if created:
        try:
            # Create default notification preferences
            NotificationPreference.objects.create(user=instance)
            
            # Send welcome notification (account activation will be handled separately)
            notification_service.send_notification(
                user=instance,
                notification_type='account',
                template_type='welcome_message',
                context_data={
                    'user_name': instance.get_full_name() or instance.username,
                    'created_at': instance.date_joined.strftime('%B %d, %Y')
                }
            )
            
        except Exception as e:
            logger.error(f"Failed to send user created notification: {str(e)}")


@receiver(user_logged_in)
def user_login_notification(sender, request, user, **kwargs):
    """Handle user login notifications and security tracking"""
    try:
        # Get request metadata
        ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Track login for security analysis
        security_service.track_login(
            user=user,
            ip_address=ip_address,
            user_agent=user_agent,
            success=True
        )
        
        # Send login notification for high-risk logins
        # (This is handled within the security service)
        
    except Exception as e:
        logger.error(f"Failed to handle login notification: {str(e)}")


@receiver(user_logged_out)
def user_logout_notification(sender, request, user, **kwargs):
    """Handle user logout events"""
    try:
        if user:
            # Log security event
            SecurityEvent.objects.create(
                user=user,
                event_type='logout',
                description='User logged out',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                risk_level='low'
            )
            
    except Exception as e:
        logger.error(f"Failed to handle logout notification: {str(e)}")


@receiver(post_save, sender=Transaction)
def transaction_created_notification(sender, instance, created, **kwargs):
    """Send notification when a transaction is created"""
    if created:
        # Use transaction.on_commit to ensure notifications are sent after the transaction completes
        db.transaction.on_commit(lambda: _send_transaction_notification(instance))


def _send_transaction_notification(instance):
    """Helper function to send transaction notification outside of atomic transaction"""
    try:
        # Determine notification type based on transaction
        if instance.transaction_type == 'deposit':
            template_type = 'deposit_received'
        elif instance.transaction_type == 'withdrawal':
            template_type = 'withdrawal_processed'
        elif instance.transaction_type == 'transfer':
            template_type = 'transfer_sent'
        else:
            template_type = 'transaction_created'
        
        # Use from_account for the transaction owner (sender)
        account = instance.from_account
        if not account:
            # For deposits, the to_account is the owner
            account = instance.to_account
        
        if not account:
            logger.warning(f"Transaction {instance.id} has no associated account")
            return
        
        # Send notification
        notification_service.send_notification(
            user=account.user,
            notification_type='transaction',
            template_type=template_type,
            context_data={
                'user_name': account.user.get_full_name() or account.user.username,
                'transaction_id': str(instance.id),
                'transaction_type': instance.get_transaction_type_display(),
                'amount': instance.amount,
                'currency': 'USD',
                'description': instance.description or 'Transaction',
                'date': instance.created_at.strftime('%B %d, %Y at %I:%M %p'),
                'account_name': account.account_type.title(),
                'account_number': account.account_number[-4:],
                'balance': account.balance,
                'reference': instance.reference or 'N/A'
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to send transaction created notification: {str(e)}")


@receiver(pre_save, sender=Transaction)
def transaction_status_changed_notification(sender, instance, **kwargs):
    """Send notification when transaction status changes"""
    if instance.pk:
        try:
            old_instance = Transaction.objects.get(pk=instance.pk)
            
            # Check if status changed
            if old_instance.status != instance.status:
                if instance.status == 'completed':
                    template_type = 'transaction_completed'
                elif instance.status == 'failed':
                    template_type = 'transaction_failed'
                else:
                    return  # Don't send notification for other status changes
                
                # Use transaction.on_commit to ensure notifications are sent after the transaction completes
                db.transaction.on_commit(lambda: _send_status_change_notification(instance, template_type))
                
        except Transaction.DoesNotExist:
            pass
        except Exception as e:
            logger.error(f"Failed to send transaction status notification: {str(e)}")


def _send_status_change_notification(instance, template_type):
    """Helper function to send transaction status change notification outside of atomic transaction"""
    try:
        # Get the account for notification (from_account for transfers, to_account for deposits)
        account = instance.from_account or instance.to_account
        if not account:
            logger.warning(f"Transaction {instance.id} has no associated account for status notification")
            return
        
        # Send notification
        notification_service.send_notification(
            user=account.user,
            notification_type='transaction',
            template_type=template_type,
            context_data={
                'user_name': account.user.get_full_name() or account.user.username,
                'transaction_id': str(instance.id),
                'transaction_type': instance.get_transaction_type_display(),
                'amount': instance.amount,
                'currency': 'USD',
                'description': instance.description or 'Transaction',
                'date': instance.created_at.strftime('%B %d, %Y at %I:%M %p'),
                'status': instance.get_status_display(),
                'account_name': account.account_type.title(),
                'account_number': account.account_number[-4:],
                'balance': account.balance,
                'reference': instance.reference or 'N/A'
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to send transaction status notification: {str(e)}")


@receiver(post_save, sender=Card)
def card_created_notification(sender, instance, created, **kwargs):
    """Send notification when a card is created"""
    if created:
        try:
            notification_service.send_notification(
                user=instance.account.user,
                notification_type='card',
                template_type='card_created',
                context_data={
                    'user_name': instance.account.user.get_full_name() or instance.account.user.username,
                    'card_type': instance.get_card_type_display(),
                    'card_number': f"****-****-****-{instance.card_number[-4:]}",
                    'expiry_date': instance.expiry_date.strftime('%m/%Y'),
                    'created_at': instance.created_at.strftime('%B %d, %Y'),
                    'account_name': instance.account.account_type.title()
                }
            )
            
        except Exception as e:
            logger.error(f"Failed to send card created notification: {str(e)}")


@receiver(pre_save, sender=Card)
def card_status_changed_notification(sender, instance, **kwargs):
    """Send notification when card status changes"""
    if instance.pk:
        try:
            old_instance = Card.objects.get(pk=instance.pk)
            
            # Check if status changed
            if old_instance.status != instance.status:
                if instance.status == 'blocked':
                    template_type = 'card_blocked'
                elif instance.status == 'active' and old_instance.status == 'blocked':
                    template_type = 'card_unblocked'
                else:
                    return  # Don't send notification for other status changes
                
                # Send notification
                notification_service.send_notification(
                    user=instance.account.user,
                    notification_type='card',
                    template_type=template_type,
                    context_data={
                        'user_name': instance.account.user.get_full_name() or instance.account.user.username,
                        'card_type': instance.get_card_type_display(),
                        'card_number': f"****-****-****-{instance.card_number[-4:]}",
                        'status': instance.get_status_display(),
                        'changed_at': timezone.now().strftime('%B %d, %Y at %I:%M %p'),
                        'account_name': instance.account.account_type.title()
                    }
                )
                
        except Card.DoesNotExist:
            pass
        except Exception as e:
            logger.error(f"Failed to send card status notification: {str(e)}")


@receiver(pre_save, sender=UserProfile)
def kyc_status_changed_notification(sender, instance, **kwargs):
    """Send notification when KYC status changes"""
    if instance.pk:
        try:
            old_instance = UserProfile.objects.get(pk=instance.pk)
            
            # Check if KYC status changed
            if old_instance.kyc_status != instance.kyc_status:
                if instance.kyc_status == 'approved':
                    template_type = 'kyc_approved'
                elif instance.kyc_status == 'rejected':
                    template_type = 'kyc_rejected'
                else:
                    return  # Don't send notification for other status changes
                
                # Send notification
                notification_service.send_notification(
                    user=instance.user,
                    notification_type='kyc',
                    template_type=template_type,
                    context_data={
                        'user_name': instance.user.get_full_name() or instance.user.username,
                        'kyc_status': instance.get_kyc_status_display(),
                        'changed_at': timezone.now().strftime('%B %d, %Y at %I:%M %p'),
                        'notes': instance.kyc_notes or 'No additional notes'
                    }
                )
                
        except UserProfile.DoesNotExist:
            pass
        except Exception as e:
            logger.error(f"Failed to send KYC status notification: {str(e)}")


# Low balance alert (daily check)
def check_low_balance_alerts():
    """Check for low balance accounts and send alerts"""
    try:
        from banking.models import BankAccount
        
        # Get accounts with low balance (less than $100)
        low_balance_accounts = BankAccount.objects.filter(
            balance__lt=100,
            is_active=True
        )
        
        for account in low_balance_accounts:
            # Check if alert was sent in last 24 hours
            recent_alert = SecurityEvent.objects.filter(
                user=account.user,
                event_type='low_balance_alert',
                created_at__gte=timezone.now() - timezone.timedelta(days=1)
            ).exists()
            
            if not recent_alert:
                # Send low balance alert
                notification_service.send_notification(
                    user=account.user,
                    notification_type='account',
                    template_type='low_balance',
                    context_data={
                        'user_name': account.user.get_full_name() or account.user.username,
                        'account_type': account.account_type.title(),
                        'account_number': account.account_number[-4:],
                        'balance': account.balance,
                        'alert_date': timezone.now().strftime('%B %d, %Y')
                    }
                )
                
                # Log the alert
                SecurityEvent.objects.create(
                    user=account.user,
                    event_type='low_balance_alert',
                    description=f'Low balance alert sent for {account.account_type} account',
                    risk_level='low'
                )
                
    except Exception as e:
        logger.error(f"Failed to check low balance alerts: {str(e)}")


# Security event signals
@receiver(post_save, sender=SecurityEvent)
def security_event_notification(sender, instance, created, **kwargs):
    """Send notification for high-risk security events"""
    if created and instance.risk_level in ['high', 'critical']:
        try:
            # Send immediate security alert
            notification_service.send_notification(
                user=instance.user,
                notification_type='security',
                template_type='security_alert',
                context_data={
                    'user_name': instance.user.get_full_name() or instance.user.username,
                    'alert_type': instance.get_event_type_display(),
                    'alert_description': instance.description,
                    'event_time': instance.created_at.strftime('%B %d, %Y at %I:%M %p'),
                    'ip_address': instance.ip_address,
                    'location': instance.location or 'Unknown',
                    'device_info': instance.user_agent or 'Unknown',
                    'risk_level': instance.risk_level,
                    'was_you': True,
                    'confirm_link': f"/security/confirm-activity/{instance.id}",
                    'secure_account_link': "/security/secure-account",
                    'security_phone': '+1-800-BANK-SEC',
                    'security_email': 'security@dominiontrust.com',
                    'alert_id': f"SEC-{instance.id}"
                },
                channels=['email', 'sms']  # High priority channels
            )
            
        except Exception as e:
            logger.error(f"Failed to send security event notification: {str(e)}") 
 