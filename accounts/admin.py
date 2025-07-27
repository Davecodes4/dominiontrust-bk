from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from django.utils import timezone
from .models import UserProfile, BankAccount, AccountBeneficiary, SecurityQuestion, LoginHistory, KYCDocument, EmailVerification


class KYCDocumentInline(admin.TabularInline):
    model = KYCDocument
    extra = 0
    readonly_fields = ('uploaded_at', 'file_size', 'document_name', 'reviewed_at')
    fields = ('document_type', 'document_file', 'verification_status', 'is_approved', 'rejection_reason')
    can_delete = False


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile Information'
    readonly_fields = ('created_at', 'updated_at', 'kyc_completed_at', 'kyc_reviewed_at')
    fieldsets = (
        ('Personal Information', {
            'fields': ('middle_name', 'phone_number', 'alternative_phone', 'date_of_birth', 
                      'gender', 'marital_status', 'nationality')
        }),
        ('Address Information', {
            'fields': ('address', 'city', 'state', 'postal_code', 'country')
        }),
        ('Identification', {
            'fields': ('id_type', 'id_number', 'id_expiry_date')
        }),
        ('Employment Information', {
            'fields': ('employer_name', 'job_title', 'employment_type', 'monthly_income', 'work_address')
        }),
        ('Emergency Contact', {
            'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship')
        }),
        ('Banking Information', {
            'fields': ('customer_tier', 'account_officer', 'preferred_branch')
        }),
        ('KYC & Compliance', {
            'fields': ('is_verified', 'kyc_status', 'risk_profile', 'pep_status', 'aml_check_status', 
                      'kyc_rejection_reason', 'kyc_notes', 'kyc_completed_at', 'kyc_reviewed_at')
        }),
        ('Preferences', {
            'fields': ('email_notifications', 'sms_notifications', 'statement_delivery')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'get_customer_tier', 'get_kyc_status', 'date_joined')
    list_filter = UserAdmin.list_filter + ('userprofile__customer_tier', 'userprofile__kyc_status', 'userprofile__is_verified', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'userprofile__phone_number', 'userprofile__id_number')
    list_per_page = 25
    
    def get_customer_tier(self, obj):
        try:
            return obj.userprofile.get_customer_tier_display()
        except UserProfile.DoesNotExist:
            return '-'
    get_customer_tier.short_description = 'Customer Tier'
    
    def get_kyc_status(self, obj):
        try:
            status = obj.userprofile.kyc_status
            if status == 'approved':
                return format_html('<span style="color: green;">✓ {}</span>', status.title())
            elif status == 'rejected':
                return format_html('<span style="color: red;">✗ {}</span>', status.title())
            elif status == 'under_review':
                return format_html('<span style="color: orange;">⏳ {}</span>', status.replace('_', ' ').title())
            else:
                return format_html('<span style="color: gray;">{}</span>', status.replace('_', ' ').title())
        except UserProfile.DoesNotExist:
            return '-'
    get_kyc_status.short_description = 'KYC Status'


# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'get_full_name', 'phone_number', 'customer_tier', 
        'kyc_status_display', 'is_verified', 'kyc_completion', 'created_at', 'get_user_status'
    )
    list_filter = (
        'customer_tier', 'kyc_status', 'is_verified', 'pep_status', 'gender', 
        'marital_status', 'id_type', 'created_at', 'user__is_active'
    )
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'phone_number', 'id_number')
    readonly_fields = ('created_at', 'updated_at', 'kyc_completed_at', 'kyc_reviewed_at')
    inlines = [KYCDocumentInline]
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('middle_name', 'phone_number', 'alternative_phone', 'date_of_birth', 
                      'gender', 'marital_status', 'nationality')
        }),
        ('Address Information', {
            'fields': ('address', 'city', 'state', 'postal_code', 'country')
        }),
        ('Identification', {
            'fields': ('id_type', 'id_number', 'id_expiry_date')
        }),
        ('Employment Information', {
            'fields': ('employer_name', 'job_title', 'employment_type', 'monthly_income', 'work_address')
        }),
        ('Emergency Contact', {
            'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship')
        }),
        ('Banking Information', {
            'fields': ('customer_tier', 'account_officer', 'preferred_branch')
        }),
        ('KYC & Compliance', {
            'fields': ('is_verified', 'kyc_status', 'risk_profile', 'pep_status', 'aml_check_status', 
                      'kyc_rejection_reason', 'kyc_notes', 'kyc_completed_at', 'kyc_reviewed_at')
        }),
        ('Preferences', {
            'fields': ('email_notifications', 'sms_notifications', 'statement_delivery')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Full Name'
    
    def get_user_status(self, obj):
        if obj.user.is_active:
            return format_html('<span style="color: green;">✓ Active</span>')
        return format_html('<span style="color: red;">✗ Inactive</span>')
    get_user_status.short_description = 'User Status'
    
    def kyc_status_display(self, obj):
        status = obj.kyc_status
        if status == 'approved':
            return format_html('<span style="color: green; font-weight: bold;">✓ Approved</span>')
        elif status == 'rejected':
            return format_html('<span style="color: red; font-weight: bold;">✗ Rejected</span>')
        elif status == 'under_review':
            return format_html('<span style="color: orange; font-weight: bold;">⏳ Under Review</span>')
        elif status == 'documents_required':
            return format_html('<span style="color: blue; font-weight: bold;">📄 Documents Required</span>')
        else:
            return format_html('<span style="color: gray;">{}</span>', status.replace('_', ' ').title())
    kyc_status_display.short_description = 'KYC Status'
    
    def kyc_completion(self, obj):
        percentage = obj.get_kyc_completion_percentage()
        # Ensure percentage is a numeric value
        try:
            percentage = float(percentage)
        except (ValueError, TypeError):
            percentage = 0.0
            
        if percentage == 100:
            return format_html('<span style="color: green; font-weight: bold;">100% Complete</span>')
        elif percentage >= 50:
            return format_html('<span style="color: orange;">{:.0f}% Complete</span>', percentage)
        else:
            return format_html('<span style="color: red;">{:.0f}% Complete</span>', percentage)
    kyc_completion.short_description = 'KYC Completion'

    actions = ['approve_kyc', 'reject_kyc', 'mark_under_review', 'upgrade_to_premium', 'downgrade_to_basic', 'mark_verified', 'mark_unverified']

    def approve_kyc(self, request, queryset):
        updated = queryset.update(
            kyc_status='approved',
            is_verified=True,
            kyc_reviewed_at=timezone.now()
        )
        self.message_user(request, f'{updated} profiles approved.')
    approve_kyc.short_description = 'Approve KYC for selected profiles'

    def reject_kyc(self, request, queryset):
        updated = queryset.update(
            kyc_status='rejected',
            is_verified=False,
            kyc_reviewed_at=timezone.now()
        )
        self.message_user(request, f'{updated} profiles rejected.')
    reject_kyc.short_description = 'Reject KYC for selected profiles'

    def mark_under_review(self, request, queryset):
        updated = queryset.update(kyc_status='under_review')
        self.message_user(request, f'{updated} profiles marked under review.')
    mark_under_review.short_description = 'Mark as under review'
    
    def upgrade_to_premium(self, request, queryset):
        updated = queryset.update(customer_tier='premium')
        self.message_user(request, f'{updated} profiles upgraded to premium.')
    upgrade_to_premium.short_description = 'Upgrade to Premium tier'
    
    def downgrade_to_basic(self, request, queryset):
        updated = queryset.update(customer_tier='basic')
        self.message_user(request, f'{updated} profiles downgraded to basic.')
    downgrade_to_basic.short_description = 'Downgrade to Basic tier'
    
    def mark_verified(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'{updated} profiles marked as verified.')
    mark_verified.short_description = 'Mark as verified'
    
    def mark_unverified(self, request, queryset):
        updated = queryset.update(is_verified=False)
        self.message_user(request, f'{updated} profiles marked as unverified.')
    mark_unverified.short_description = 'Mark as unverified'


@admin.register(KYCDocument)
class KYCDocumentAdmin(admin.ModelAdmin):
    list_display = (
        'user_display', 'document_type', 'document_name', 'verification_status_display', 
        'file_size_display', 'uploaded_at', 'reviewed_at'
    )
    list_filter = (
        'document_type', 'verification_status', 'is_approved', 'uploaded_at'
    )
    search_fields = (
        'user_profile__user__username', 'user_profile__user__email', 
        'document_name', 'document_type'
    )
    readonly_fields = (
        'uploaded_at', 'file_size', 'document_name', 'user_profile'
    )
    
    fieldsets = (
        ('Document Information', {
            'fields': ('user_profile', 'document_type', 'document_name', 'document_file', 'file_size')
        }),
        ('Verification', {
            'fields': ('verification_status', 'is_approved', 'rejection_reason', 'reviewer_notes', 'reviewed_by')
        }),
        ('Timestamps', {
            'fields': ('uploaded_at', 'reviewed_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_display(self, obj):
        return f"{obj.user_profile.user.get_full_name()} ({obj.user_profile.user.username})"
    user_display.short_description = 'User'
    
    def verification_status_display(self, obj):
        status = obj.verification_status
        if status == 'approved':
            return format_html('<span style="color: green; font-weight: bold;">✓ Approved</span>')
        elif status == 'rejected':
            return format_html('<span style="color: red; font-weight: bold;">✗ Rejected</span>')
        elif status == 'requires_resubmission':
            return format_html('<span style="color: orange; font-weight: bold;">⚠ Resubmission Required</span>')
        else:
            return format_html('<span style="color: blue;">⏳ Pending Review</span>')
    verification_status_display.short_description = 'Status'
    
    def file_size_display(self, obj):
        return obj.get_file_size_display()
    file_size_display.short_description = 'File Size'

    actions = ['approve_documents', 'reject_documents', 'require_resubmission', 'auto_approve_test_documents']

    def approve_documents(self, request, queryset):
        updated = queryset.update(
            verification_status='approved',
            is_approved=True,
            reviewed_at=timezone.now(),
            reviewed_by=request.user
        )
        self.message_user(request, f'{updated} documents approved.')
    approve_documents.short_description = 'Approve selected documents'

    def reject_documents(self, request, queryset):
        updated = queryset.update(
            verification_status='rejected',
            is_approved=False,
            reviewed_at=timezone.now(),
            reviewed_by=request.user
        )
        self.message_user(request, f'{updated} documents rejected.')
    reject_documents.short_description = 'Reject selected documents'

    def require_resubmission(self, request, queryset):
        updated = queryset.update(
            verification_status='requires_resubmission',
            is_approved=False,
            reviewed_at=timezone.now(),
            reviewed_by=request.user
        )
        self.message_user(request, f'{updated} documents marked for resubmission.')
    require_resubmission.short_description = 'Require resubmission'

    def auto_approve_test_documents(self, request, queryset):
        """Auto-approve documents for testing purposes"""
        updated = 0
        for doc in queryset:
            doc.verification_status = 'approved'
            doc.is_approved = True
            doc.reviewed_at = timezone.now()
            doc.reviewed_by = request.user
            doc.save()
            
            # Update profile KYC status if all required docs are approved
            profile = doc.user_profile
            if profile.has_required_kyc_documents():
                profile.kyc_status = 'approved'
                profile.is_verified = True
                profile.kyc_completed_at = timezone.now()
                profile.save()
            
            updated += 1
        
        self.message_user(request, f'{updated} documents auto-approved and profiles updated.')
    auto_approve_test_documents.short_description = 'Auto-approve and update profiles'


class AccountBeneficiaryInline(admin.TabularInline):
    model = AccountBeneficiary
    extra = 0
    fields = ('full_name', 'relationship', 'percentage_share', 'is_primary', 'phone_number')


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = (
        'account_number', 'account_name', 'user', 'account_type', 'currency',
        'get_formatted_balance', 'status', 'kyc_status_display', 'created_at', 'last_transaction_date'
    )
    list_filter = (
        'account_type', 'currency', 'status', 'is_joint_account', 
        'allow_online_transactions', 'allow_international_transactions', 'created_at'
    )
    search_fields = ('account_number', 'account_name', 'user__username', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('account_number', 'available_balance', 'created_at', 'updated_at', 'last_transaction_date')
    inlines = [AccountBeneficiaryInline]
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Account Details', {
            'fields': ('user', 'account_number', 'account_name', 'account_type', 'currency')
        }),
        ('Balances', {
            'fields': ('balance', 'available_balance', 'hold_balance')
        }),
        ('Account Configuration', {
            'fields': ('minimum_balance', 'daily_transaction_limit', 'monthly_transaction_limit')
        }),
        ('Interest and Fees', {
            'fields': ('interest_rate', 'monthly_maintenance_fee', 'overdraft_limit')
        }),
        ('Account Management', {
            'fields': ('status', 'account_officer', 'branch_code', 'purpose_of_account', 'source_of_funds')
        }),
        ('Flags and Settings', {
            'fields': (
                'is_joint_account', 'requires_two_signatures', 
                'allow_online_transactions', 'allow_international_transactions'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_transaction_date'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'user__userprofile')
    
    def get_formatted_balance(self, obj):
        color = 'green' if obj.balance >= 0 else 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {}</span>',
            color, obj.currency, obj.balance
        )
    get_formatted_balance.short_description = 'Balance'
    
    def kyc_status_display(self, obj):
        try:
            status = obj.user.userprofile.kyc_status
            if status == 'approved':
                return format_html('<span style="color: green;">✓ Verified</span>')
            elif status in ['rejected', 'documents_required']:
                return format_html('<span style="color: red;">✗ Pending</span>')
            else:
                return format_html('<span style="color: orange;">⏳ Review</span>')
        except UserProfile.DoesNotExist:
            return format_html('<span style="color: gray;">No Profile</span>')
    kyc_status_display.short_description = 'KYC Status'
    
    actions = ['activate_accounts', 'suspend_accounts', 'freeze_accounts']
    
    def activate_accounts(self, request, queryset):
        updated = queryset.update(status='active')
        self.message_user(request, f'{updated} accounts activated.')
    activate_accounts.short_description = 'Activate selected accounts'
    
    def suspend_accounts(self, request, queryset):
        updated = queryset.update(status='suspended')
        self.message_user(request, f'{updated} accounts suspended.')
    suspend_accounts.short_description = 'Suspend selected accounts'
    
    def freeze_accounts(self, request, queryset):
        updated = queryset.update(status='frozen')
        self.message_user(request, f'{updated} accounts frozen.')
    freeze_accounts.short_description = 'Freeze selected accounts'


@admin.register(AccountBeneficiary)
class AccountBeneficiaryAdmin(admin.ModelAdmin):
    list_display = (
        'full_name', 'account', 'relationship', 'percentage_share', 'is_primary', 'created_at'
    )
    list_filter = ('relationship', 'is_primary', 'id_type', 'created_at')
    search_fields = ('full_name', 'account__account_number', 'phone_number', 'id_number')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Beneficiary Details', {
            'fields': ('account', 'full_name', 'relationship', 'phone_number', 'email', 'address')
        }),
        ('Beneficiary Configuration', {
            'fields': ('percentage_share', 'is_primary')
        }),
        ('Identification', {
            'fields': ('id_type', 'id_number')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SecurityQuestion)
class SecurityQuestionAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_question_display', 'created_at')
    list_filter = ('question', 'created_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at', 'answer_hash')
    
    fieldsets = (
        ('Security Question', {
            'fields': ('user', 'question', 'answer_hash')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'ip_address', 'login_successful', 'login_time', 'logout_time', 'device_info'
    )
    list_filter = ('login_successful', 'login_time')
    search_fields = ('user__username', 'ip_address', 'user_agent')
    readonly_fields = ('login_time',)
    date_hierarchy = 'login_time'
    
    fieldsets = (
        ('Login Details', {
            'fields': ('user', 'ip_address', 'user_agent', 'device_info', 'location')
        }),
        ('Status', {
            'fields': ('login_successful', 'login_time', 'logout_time')
        }),
    )
    
    def has_add_permission(self, request):
        return False  # Login history should not be manually added
    
    def has_change_permission(self, request, obj=None):
        return False  # Login history should not be modified


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'get_masked_token', 'created_at', 'expires_at', 
        'is_used', 'is_expired_display', 'is_valid_display'
    )
    list_filter = ('is_used', 'created_at', 'expires_at')
    search_fields = ('user__username', 'user__email', 'token')
    readonly_fields = ('token', 'created_at', 'expires_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Verification Details', {
            'fields': ('user', 'token', 'is_used')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_masked_token(self, obj):
        if len(obj.token) > 8:
            return f"{obj.token[:4]}...{obj.token[-4:]}"
        return obj.token
    get_masked_token.short_description = 'Token'
    
    def is_expired_display(self, obj):
        if obj.is_expired():
            return format_html('<span style="color: red;">✗ Expired</span>')
        return format_html('<span style="color: green;">✓ Valid</span>')
    is_expired_display.short_description = 'Expiry Status'
    
    def is_valid_display(self, obj):
        if obj.is_valid():
            return format_html('<span style="color: green;">✓ Valid</span>')
        return format_html('<span style="color: red;">✗ Invalid</span>')
    is_valid_display.short_description = 'Token Valid'
    
    def has_add_permission(self, request):
        return False  # Email verification tokens should not be manually added
    
    def has_change_permission(self, request, obj=None):
        return False  # Email verification tokens should not be modified
    
    actions = ['mark_as_used']
    
    def mark_as_used(self, request, queryset):
        updated = queryset.update(is_used=True)
        self.message_user(request, f'{updated} verification tokens marked as used.')
    mark_as_used.short_description = 'Mark selected tokens as used'


# Customize admin site header and title
admin.site.site_header = "DominionTrust Bank - Complete Administration Portal"
admin.site.site_title = "DominionTrust Bank Admin"
admin.site.index_title = "Welcome to DominionTrust Bank Complete Administration System"
