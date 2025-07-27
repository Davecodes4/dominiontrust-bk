from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    NotificationTemplate, NotificationPreference, Notification, 
    NotificationBatch, NotificationLog, TwoFactorAuth, TwoFactorCode,
    TrustedDevice, SecurityEvent
)


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['template_type', 'channel', 'subject', 'is_active', 'is_default', 'priority', 'created_at']
    list_filter = ['template_type', 'channel', 'is_active', 'is_default', 'priority']
    search_fields = ['template_type', 'subject', 'body_template']
    ordering = ['template_type', 'channel']
    list_per_page = 25
    
    fieldsets = (
        ('Template Information', {
            'fields': ('template_type', 'channel', 'is_active', 'is_default', 'priority')
        }),
        ('Content', {
            'fields': ('subject', 'title', 'body_template', 'html_template')
        }),
    )
    
    actions = ['activate_templates', 'deactivate_templates', 'set_as_default']
    
    def activate_templates(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} templates activated.')
    activate_templates.short_description = 'Activate selected templates'
    
    def deactivate_templates(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} templates deactivated.')
    deactivate_templates.short_description = 'Deactivate selected templates'
    
    def set_as_default(self, request, queryset):
        updated = queryset.update(is_default=True)
        self.message_user(request, f'{updated} templates set as default.')
    set_as_default.short_description = 'Set as default templates'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_enabled', 'sms_enabled', 'in_app_enabled', 'push_enabled', 'quiet_hours_enabled']
    list_filter = ['email_enabled', 'sms_enabled', 'in_app_enabled', 'push_enabled', 'quiet_hours_enabled']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Email Preferences', {
            'fields': ('email_enabled', 'email_transactions', 'email_security', 'email_marketing', 'email_low_balance')
        }),
        ('SMS Preferences', {
            'fields': ('sms_enabled', 'sms_transactions', 'sms_security', 'sms_low_balance')
        }),
        ('In-App Preferences', {
            'fields': ('in_app_enabled', 'in_app_transactions', 'in_app_security', 'in_app_marketing')
        }),
        ('Push Preferences', {
            'fields': ('push_enabled', 'push_transactions', 'push_security')
        }),
        ('Quiet Hours', {
            'fields': ('quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end')
        }),
    )


class NotificationLogInline(admin.TabularInline):
    model = NotificationLog
    extra = 0
    readonly_fields = ['event_type', 'message', 'created_at']
    can_delete = False


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'channel', 'notification_type', 'status', 'priority', 'created_at', 'sent_at', 'read_at']
    list_filter = ['channel', 'notification_type', 'status', 'priority', 'created_at', 'sent_at']
    search_fields = ['title', 'message', 'user__username', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at', 'sent_at', 'delivered_at', 'read_at']
    ordering = ['-created_at']
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'notification_type', 'channel', 'template', 'priority')
        }),
        ('Content', {
            'fields': ('title', 'message', 'html_message')
        }),
        ('Status & Delivery', {
            'fields': ('status', 'sent_at', 'delivered_at', 'read_at')
        }),
        ('Retry Logic', {
            'fields': ('retry_count', 'max_retries', 'next_retry_at')
        }),
        ('External References', {
            'fields': ('external_id', 'error_message')
        }),
        ('Related Objects', {
            'fields': ('related_transaction', 'related_card')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [NotificationLogInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'template')
    
    actions = ['mark_as_read', 'retry_failed_notifications', 'mark_as_sent', 'mark_as_delivered']
    
    def mark_as_read(self, request, queryset):
        updated = 0
        for notification in queryset:
            if notification.channel == 'in_app' and not notification.read_at:
                notification.mark_as_read()
                updated += 1
        self.message_user(request, f'{updated} notifications marked as read.')
    mark_as_read.short_description = "Mark selected in-app notifications as read"
    
    def retry_failed_notifications(self, request, queryset):
        retried = 0
        for notification in queryset.filter(status='failed'):
            if notification.can_retry():
                notification.schedule_retry()
                retried += 1
        self.message_user(request, f'{retried} notifications scheduled for retry.')
    retry_failed_notifications.short_description = "Retry failed notifications"
    
    def mark_as_sent(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(status='sent', sent_at=timezone.now())
        self.message_user(request, f'{updated} notifications marked as sent.')
    mark_as_sent.short_description = "Mark as sent"
    
    def mark_as_delivered(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(status='delivered', delivered_at=timezone.now())
        self.message_user(request, f'{updated} notifications marked as delivered.')
    mark_as_delivered.short_description = "Mark as delivered"


@admin.register(NotificationBatch)
class NotificationBatchAdmin(admin.ModelAdmin):
    list_display = ['name', 'notification_type', 'status', 'total_notifications', 'sent_notifications', 'failed_notifications', 'created_at']
    list_filter = ['notification_type', 'status', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'started_at', 'completed_at']
    
    fieldsets = (
        ('Batch Information', {
            'fields': ('name', 'description', 'notification_type', 'channels')
        }),
        ('Status', {
            'fields': ('status', 'total_notifications', 'sent_notifications', 'failed_notifications')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'started_at', 'completed_at')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request)


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ['notification', 'event_type', 'message', 'created_at']
    list_filter = ['event_type', 'created_at']
    search_fields = ['notification__title', 'event_type', 'message']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('notification', 'notification__user')


@admin.register(TwoFactorAuth)
class TwoFactorAuthAdmin(admin.ModelAdmin):
    list_display = ['user', 'method', 'backup_method', 'is_enabled', 'is_verified', 'last_used', 'failed_attempts', 'created_at']
    list_filter = ['method', 'backup_method', 'is_enabled', 'is_verified', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['secret_key', 'backup_codes', 'verified_at', 'last_used', 'created_at', 'updated_at']
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Settings', {
            'fields': ('method', 'backup_method', 'is_enabled', 'is_verified')
        }),
        ('Security', {
            'fields': ('secret_key', 'backup_codes', 'verified_at')
        }),
        ('Usage', {
            'fields': ('last_used', 'failed_attempts', 'locked_until')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['enable_2fa', 'disable_2fa', 'reset_failed_attempts', 'unlock_accounts']
    
    def enable_2fa(self, request, queryset):
        updated = queryset.update(is_enabled=True)
        self.message_user(request, f'{updated} 2FA accounts enabled.')
    enable_2fa.short_description = 'Enable 2FA for selected accounts'
    
    def disable_2fa(self, request, queryset):
        updated = queryset.update(is_enabled=False)
        self.message_user(request, f'{updated} 2FA accounts disabled.')
    disable_2fa.short_description = 'Disable 2FA for selected accounts'
    
    def reset_failed_attempts(self, request, queryset):
        updated = queryset.update(failed_attempts=0)
        self.message_user(request, f'{updated} accounts had failed attempts reset.')
    reset_failed_attempts.short_description = 'Reset failed attempts'
    
    def unlock_accounts(self, request, queryset):
        updated = queryset.update(locked_until=None)
        self.message_user(request, f'{updated} accounts unlocked.')
    unlock_accounts.short_description = 'Unlock locked accounts'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(TwoFactorCode)
class TwoFactorCodeAdmin(admin.ModelAdmin):
    list_display = ['user', 'purpose', 'code', 'expires_at', 'is_used', 'created_at']
    list_filter = ['purpose', 'is_used', 'created_at']
    search_fields = ['user__username', 'user__email', 'code']
    readonly_fields = ['code', 'expires_at', 'used_at', 'created_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Code Details', {
            'fields': ('code', 'purpose', 'expires_at', 'is_used', 'used_at')
        }),
        ('Metadata', {
            'fields': ('ip_address', 'user_agent')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(TrustedDevice)
class TrustedDeviceAdmin(admin.ModelAdmin):
    list_display = ['user', 'device_name', 'device_type', 'is_trusted', 'is_active', 'last_used', 'login_count', 'created_at']
    list_filter = ['device_type', 'is_trusted', 'is_active', 'created_at', 'last_used']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name', 'device_name', 'ip_address']
    readonly_fields = ['device_id', 'last_used', 'login_count', 'created_at', 'updated_at']
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Device Info', {
            'fields': ('device_id', 'device_name', 'device_type', 'browser', 'operating_system', 'user_agent')
        }),
        ('Location', {
            'fields': ('ip_address', 'location', 'country')
        }),
        ('Status', {
            'fields': ('is_active', 'is_trusted', 'trust_expires_at')
        }),
        ('Usage', {
            'fields': ('last_used', 'login_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['trust_devices', 'untrust_devices', 'activate_devices', 'deactivate_devices']
    
    def trust_devices(self, request, queryset):
        updated = queryset.update(is_trusted=True)
        self.message_user(request, f'{updated} devices marked as trusted.')
    trust_devices.short_description = 'Mark as trusted devices'
    
    def untrust_devices(self, request, queryset):
        updated = queryset.update(is_trusted=False)
        self.message_user(request, f'{updated} devices marked as untrusted.')
    untrust_devices.short_description = 'Mark as untrusted devices'
    
    def activate_devices(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} devices activated.')
    activate_devices.short_description = 'Activate devices'
    
    def deactivate_devices(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} devices deactivated.')
    deactivate_devices.short_description = 'Deactivate devices'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(SecurityEvent)
class SecurityEventAdmin(admin.ModelAdmin):
    list_display = ['user', 'event_type', 'risk_level', 'ip_address', 'is_resolved', 'created_at', 'resolved_at']
    list_filter = ['event_type', 'risk_level', 'is_resolved', 'created_at', 'resolved_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name', 'description', 'ip_address']
    readonly_fields = ['created_at']
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Event Details', {
            'fields': ('event_type', 'risk_level', 'description')
        }),
        ('Location & Device', {
            'fields': ('ip_address', 'user_agent', 'location', 'trusted_device')
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Resolution', {
            'fields': ('is_resolved', 'resolved_at', 'resolved_by')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
    
    actions = ['mark_as_resolved', 'mark_as_unresolved', 'escalate_high_risk']
    
    def mark_as_resolved(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(is_resolved=True, resolved_at=timezone.now(), resolved_by=request.user)
        self.message_user(request, f'{updated} security events marked as resolved.')
    mark_as_resolved.short_description = 'Mark as resolved'
    
    def mark_as_unresolved(self, request, queryset):
        updated = queryset.update(is_resolved=False, resolved_at=None, resolved_by=None)
        self.message_user(request, f'{updated} security events marked as unresolved.')
    mark_as_unresolved.short_description = 'Mark as unresolved'
    
    def escalate_high_risk(self, request, queryset):
        high_risk_events = queryset.filter(risk_level='high')
        # Custom logic for escalation could go here
        self.message_user(request, f'{high_risk_events.count()} high-risk events identified for escalation.')
    escalate_high_risk.short_description = 'Escalate high-risk events'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'trusted_device', 'resolved_by')


# Custom admin site configuration
admin.site.site_header = "DominionTrust Bank - Complete Administration Portal"
admin.site.site_title = "DominionTrust Admin"
admin.site.index_title = "Complete Banking Administration System" 
 