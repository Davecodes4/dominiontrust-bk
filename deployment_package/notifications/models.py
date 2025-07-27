from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import uuid
import json
import secrets
import string
from datetime import datetime, timedelta


class NotificationTemplate(models.Model):
    """Templates for different types of notifications"""
    TEMPLATE_TYPES = [
        # Transaction notifications
        ('transaction_created', 'Transaction Created'),
        ('transaction_confirmed', 'Transaction Confirmed'),
        ('transaction_completed', 'Transaction Completed'),
        ('transaction_failed', 'Transaction Failed'),
        ('deposit_received', 'Deposit Received'),
        ('withdrawal_processed', 'Withdrawal Processed'),
        ('transfer_sent', 'Transfer Sent'),
        ('transfer_received', 'Transfer Received'),
        
        # Account management
        ('account_created', 'Account Created'),
        ('account_activated', 'Account Activated'),
        ('account_deactivated', 'Account Deactivated'),
        ('account_locked', 'Account Locked'),
        ('account_unlocked', 'Account Unlocked'),
        ('password_reset_request', 'Password Reset Request'),
        ('password_reset_success', 'Password Reset Success'),
        ('password_changed', 'Password Changed'),
        ('email_changed', 'Email Address Changed'),
        ('phone_changed', 'Phone Number Changed'),
        
        # Security & 2FA
        ('login_alert', 'Login Alert'),
        ('suspicious_login', 'Suspicious Login Detected'),
        ('failed_login_attempts', 'Failed Login Attempts'),
        ('account_lockout', 'Account Lockout'),
        ('two_factor_enabled', '2FA Enabled'),
        ('two_factor_disabled', '2FA Disabled'),
        ('two_factor_code', '2FA Verification Code'),
        ('two_factor_backup_codes', '2FA Backup Codes'),
        ('device_registered', 'New Device Registered'),
        ('device_removed', 'Device Removed'),
        
        # Account alerts
        ('low_balance', 'Low Balance Alert'),
        ('large_transaction', 'Large Transaction Alert'),
        ('international_transaction', 'International Transaction'),
        ('spending_limit_reached', 'Spending Limit Reached'),
        
        # Card management
        ('card_created', 'Card Created'),
        ('card_activated', 'Card Activated'),
        ('card_blocked', 'Card Blocked'),
        ('card_unblocked', 'Card Unblocked'),
        ('card_expired', 'Card Expired'),
        ('card_expiring_soon', 'Card Expiring Soon'),
        ('card_replacement', 'Card Replacement'),
        
        # KYC & Compliance
        ('kyc_approved', 'KYC Approved'),
        ('kyc_rejected', 'KYC Rejected'),
        ('kyc_documents_required', 'KYC Documents Required'),
        ('kyc_review_pending', 'KYC Review Pending'),
        ('compliance_alert', 'Compliance Alert'),
        
        # Account verification
        ('email_verification', 'Email Verification'),
        ('phone_verification', 'Phone Verification'),
        ('identity_verification', 'Identity Verification'),
        
        # Promotional & Service
        ('welcome_message', 'Welcome Message'),
        ('service_update', 'Service Update'),
        ('maintenance_notice', 'Maintenance Notice'),
        ('promotional_offer', 'Promotional Offer'),
    ]
    
    CHANNELS = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('in_app', 'In-App'),
        ('push', 'Push Notification'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template_type = models.CharField(max_length=50, choices=TEMPLATE_TYPES)
    channel = models.CharField(max_length=20, choices=CHANNELS)
    
    # Template content
    subject = models.CharField(max_length=200, blank=True)  # For email/push
    title = models.CharField(max_length=100, blank=True)    # For in-app
    body_template = models.TextField()                      # Template content
    html_template = models.TextField(blank=True)            # HTML version for email
    
    # Settings
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    priority = models.IntegerField(default=1)  # 1=high, 2=medium, 3=low
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['template_type', 'channel']
        ordering = ['template_type', 'channel']
    
    def __str__(self):
        return f"{self.get_template_type_display()} - {self.get_channel_display()}"


class TwoFactorAuth(models.Model):
    """Two-factor authentication settings and codes"""
    METHOD_CHOICES = [
        ('sms', 'SMS'),
        ('email', 'Email'),
        ('app', 'Authenticator App'),
        ('hardware', 'Hardware Token'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='two_factor_auth')
    
    # 2FA Settings
    is_enabled = models.BooleanField(default=False)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='sms')
    backup_method = models.CharField(max_length=20, choices=METHOD_CHOICES, blank=True)
    
    # Secret keys
    secret_key = models.CharField(max_length=32, blank=True)  # For TOTP
    backup_codes = models.JSONField(default=list, blank=True)  # Emergency codes
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Usage tracking
    last_used = models.DateTimeField(null=True, blank=True)
    failed_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def generate_backup_codes(self):
        """Generate new backup codes"""
        codes = []
        for _ in range(10):
            code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
            codes.append(code)
        self.backup_codes = codes
        self.save()
        return codes
    
    def verify_backup_code(self, code):
        """Verify and consume a backup code"""
        if code.upper() in self.backup_codes:
            self.backup_codes.remove(code.upper())
            self.save()
            return True
        return False
    
    def is_locked(self):
        """Check if 2FA is temporarily locked"""
        if self.locked_until and timezone.now() < self.locked_until:
            return True
        return False
    
    def record_failed_attempt(self):
        """Record a failed 2FA attempt"""
        self.failed_attempts += 1
        if self.failed_attempts >= 5:
            self.locked_until = timezone.now() + timedelta(minutes=30)
        self.save()
    
    def reset_failed_attempts(self):
        """Reset failed attempts counter"""
        self.failed_attempts = 0
        self.locked_until = None
        self.save()
    
    def __str__(self):
        return f"2FA for {self.user.username} - {self.get_method_display()}"


class TwoFactorCode(models.Model):
    """Temporary 2FA codes"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='two_factor_codes')
    code = models.CharField(max_length=10)
    purpose = models.CharField(max_length=50, choices=[
        ('login', 'Login Verification'),
        ('setup', 'Setup Verification'),
        ('disable', 'Disable 2FA'),
        ('password_reset', 'Password Reset'),
        ('email_change', 'Email Change'),
        ('phone_change', 'Phone Change'),
    ])
    
    # Expiration
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    @classmethod
    def generate_code(cls, user, purpose, expires_minutes=10):
        """Generate a new 2FA code"""
        code = ''.join(secrets.choice(string.digits) for _ in range(6))
        expires_at = timezone.now() + timedelta(minutes=expires_minutes)
        
        return cls.objects.create(
            user=user,
            code=code,
            purpose=purpose,
            expires_at=expires_at
        )
    
    def is_valid(self):
        """Check if code is still valid"""
        return not self.is_used and timezone.now() < self.expires_at
    
    def use_code(self):
        """Mark code as used"""
        self.is_used = True
        self.used_at = timezone.now()
        self.save()
    
    def __str__(self):
        return f"2FA Code for {self.user.username} - {self.purpose}"


class TrustedDevice(models.Model):
    """Trusted devices for users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trusted_devices')
    
    # Device identification
    device_id = models.CharField(max_length=100, unique=True)
    device_name = models.CharField(max_length=200)
    device_type = models.CharField(max_length=50, choices=[
        ('mobile', 'Mobile Device'),
        ('tablet', 'Tablet'),
        ('desktop', 'Desktop'),
        ('laptop', 'Laptop'),
        ('other', 'Other'),
    ])
    
    # Browser/OS info
    browser = models.CharField(max_length=100, blank=True)
    operating_system = models.CharField(max_length=100, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Location
    ip_address = models.GenericIPAddressField()
    location = models.CharField(max_length=200, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_trusted = models.BooleanField(default=False)
    trust_expires_at = models.DateTimeField(null=True, blank=True)
    
    # Usage tracking
    last_used = models.DateTimeField(null=True, blank=True)
    login_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def is_trust_expired(self):
        """Check if device trust has expired"""
        if self.trust_expires_at and timezone.now() > self.trust_expires_at:
            return True
        return False
    
    def extend_trust(self, days=30):
        """Extend device trust period"""
        self.trust_expires_at = timezone.now() + timedelta(days=days)
        self.save()
    
    def record_login(self):
        """Record a login from this device"""
        self.last_used = timezone.now()
        self.login_count += 1
        self.save()
    
    def __str__(self):
        return f"{self.device_name} ({self.user.username})"


class SecurityEvent(models.Model):
    """Security events and audit log"""
    EVENT_TYPES = [
        ('login_success', 'Successful Login'),
        ('login_failure', 'Failed Login'),
        ('password_change', 'Password Changed'),
        ('email_change', 'Email Changed'),
        ('phone_change', 'Phone Changed'),
        ('2fa_enabled', '2FA Enabled'),
        ('2fa_disabled', '2FA Disabled'),
        ('2fa_code_sent', '2FA Code Sent'),
        ('2fa_verification_success', '2FA Verification Success'),
        ('2fa_verification_failure', '2FA Verification Failed'),
        ('device_registered', 'Device Registered'),
        ('device_removed', 'Device Removed'),
        ('account_locked', 'Account Locked'),
        ('account_unlocked', 'Account Unlocked'),
        ('suspicious_activity', 'Suspicious Activity'),
        ('password_reset_request', 'Password Reset Requested'),
        ('password_reset_success', 'Password Reset Success'),
    ]
    
    RISK_LEVELS = [
        ('low', 'Low Risk'),
        ('medium', 'Medium Risk'),
        ('high', 'High Risk'),
        ('critical', 'Critical Risk'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='security_events')
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS, default='low')
    
    # Event details
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    
    # Related objects
    trusted_device = models.ForeignKey(TrustedDevice, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    # Status
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_security_events')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'event_type']),
            models.Index(fields=['risk_level', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_event_type_display()} - {self.user.username}"


class NotificationPreference(models.Model):
    """User preferences for different notification types"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email preferences
    email_enabled = models.BooleanField(default=True)
    email_transactions = models.BooleanField(default=True)
    email_security = models.BooleanField(default=True)
    email_marketing = models.BooleanField(default=False)
    email_low_balance = models.BooleanField(default=True)
    email_2fa_codes = models.BooleanField(default=True)
    email_account_changes = models.BooleanField(default=True)
    
    # SMS preferences
    sms_enabled = models.BooleanField(default=True)
    sms_transactions = models.BooleanField(default=True)
    sms_security = models.BooleanField(default=True)
    sms_low_balance = models.BooleanField(default=True)
    sms_2fa_codes = models.BooleanField(default=True)
    sms_login_alerts = models.BooleanField(default=True)
    
    # In-app preferences
    in_app_enabled = models.BooleanField(default=True)
    in_app_transactions = models.BooleanField(default=True)
    in_app_security = models.BooleanField(default=True)
    in_app_marketing = models.BooleanField(default=True)
    in_app_2fa_alerts = models.BooleanField(default=True)
    
    # Push notification preferences
    push_enabled = models.BooleanField(default=True)
    push_transactions = models.BooleanField(default=True)
    push_security = models.BooleanField(default=True)
    push_2fa_codes = models.BooleanField(default=True)
    
    # Quiet hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(default='22:00')
    quiet_hours_end = models.TimeField(default='08:00')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Notification preferences for {self.user.username}"


class Notification(models.Model):
    """Individual notification records"""
    NOTIFICATION_TYPES = [
        ('transaction', 'Transaction'),
        ('security', 'Security'),
        ('account', 'Account'),
        ('card', 'Card'),
        ('kyc', 'KYC'),
        ('marketing', 'Marketing'),
        ('system', 'System'),
        ('two_factor', 'Two Factor'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    CHANNELS = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('in_app', 'In-App'),
        ('push', 'Push Notification'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    
    # Notification details
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    channel = models.CharField(max_length=20, choices=CHANNELS)
    template = models.ForeignKey(NotificationTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Content
    title = models.CharField(max_length=200)
    message = models.TextField()
    html_message = models.TextField(blank=True)
    
    # Metadata
    context_data = models.JSONField(default=dict, blank=True)  # Additional data for template rendering
    priority = models.IntegerField(default=2)  # 1=high, 2=medium, 3=low
    
    # Status and delivery
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Retry logic
    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)
    next_retry_at = models.DateTimeField(null=True, blank=True)
    
    # External references
    external_id = models.CharField(max_length=100, blank=True)  # For SMS/email provider IDs
    error_message = models.TextField(blank=True)
    
    # Related objects
    related_transaction = models.ForeignKey('banking.Transaction', on_delete=models.CASCADE, null=True, blank=True)
    related_card = models.ForeignKey('banking.Card', on_delete=models.CASCADE, null=True, blank=True)
    related_security_event = models.ForeignKey(SecurityEvent, on_delete=models.CASCADE, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['channel', 'status']),
            models.Index(fields=['notification_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_channel_display()} notification for {self.user.username}: {self.title}"
    
    def mark_as_sent(self):
        """Mark notification as sent"""
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save()
    
    def mark_as_delivered(self):
        """Mark notification as delivered"""
        self.status = 'delivered'
        self.delivered_at = timezone.now()
        self.save()
    
    def mark_as_failed(self, error_message=''):
        """Mark notification as failed"""
        self.status = 'failed'
        self.error_message = error_message
        self.save()
    
    def mark_as_read(self):
        """Mark notification as read (for in-app notifications)"""
        if not self.read_at:
            self.read_at = timezone.now()
            self.save()
    
    def can_retry(self):
        """Check if notification can be retried"""
        return (
            self.status == 'failed' and 
            self.retry_count < self.max_retries and
            (self.next_retry_at is None or self.next_retry_at <= timezone.now())
        )
    
    def schedule_retry(self):
        """Schedule next retry attempt"""
        if self.retry_count < self.max_retries:
            self.retry_count += 1
            # Exponential backoff: 5 minutes, 15 minutes, 45 minutes
            delay_minutes = 5 * (3 ** (self.retry_count - 1))
            self.next_retry_at = timezone.now() + timedelta(minutes=delay_minutes)
            self.status = 'pending'
            self.save()


class NotificationBatch(models.Model):
    """Batch processing for bulk notifications"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Batch settings
    notification_type = models.CharField(max_length=20, choices=Notification.NOTIFICATION_TYPES)
    channels = models.JSONField(default=list)  # List of channels to send to
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ], default='pending')
    
    # Progress tracking
    total_notifications = models.IntegerField(default=0)
    sent_notifications = models.IntegerField(default=0)
    failed_notifications = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Batch: {self.name} ({self.status})"


class NotificationLog(models.Model):
    """Audit log for notification events"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='logs')
    
    # Event details
    event_type = models.CharField(max_length=50)  # created, sent, delivered, failed, retry
    message = models.TextField(blank=True)
    
    # Context
    context_data = models.JSONField(default=dict, blank=True)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.event_type} - {self.notification.title}" 
 