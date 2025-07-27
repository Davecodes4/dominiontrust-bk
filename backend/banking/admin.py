from django.contrib import admin
from django.utils.html import format_html
from django import forms
from django.urls import path, reverse
from django.shortcuts import render, redirect
from django.contrib import messages
from django.utils import timezone
from accounts.models import BankAccount, User
from decimal import Decimal
from .models import (
    Transaction, TransferRequest, DepositRequest, Card, AccountStatement, 
    AccountNotification, TransactionLimit
)


class DepositForm(forms.Form):
    """Form for creating admin deposits"""
    user = forms.ModelChoiceField(
        queryset=User.objects.filter(is_active=True),
        empty_label="-- Select User --",
        widget=forms.Select(attrs={'class': 'form-control', 'id': 'user_id'}),
        help_text="Select the user to credit"
    )
    
    account = forms.ModelChoiceField(
        queryset=BankAccount.objects.none(),
        required=False,
        empty_label="-- Auto-select primary account --",
        widget=forms.Select(attrs={'class': 'form-control', 'id': 'account_id'}),
        help_text="Leave blank to use the user's primary account"
    )
    
    amount = forms.DecimalField(
        max_digits=15,
        decimal_places=2,
        min_value=Decimal('0.01'),
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.01',
            'min': '0.01',
            'placeholder': 'Enter amount'
        }),
        help_text="Amount to deposit (must be positive)"
    )
    
    description = forms.CharField(
        max_length=255,
        initial="Admin deposit",
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Optional description'
        }),
        help_text="Optional description for the deposit"
    )
    
    auto_approve = forms.BooleanField(
        initial=True,
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        help_text="If checked, funds will be immediately credited. If unchecked, deposit will be pending."
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Get all active users with their profiles for better display
        self.fields['user'].queryset = User.objects.filter(
            is_active=True
        ).select_related('userprofile').order_by('username')
        
        # Set up account field to be populated via JavaScript based on user selection
        self.fields['account'].queryset = BankAccount.objects.select_related('user').order_by('account_number')
    
    def clean(self):
        cleaned_data = super().clean()
        user = cleaned_data.get('user')
        account = cleaned_data.get('account')
        amount = cleaned_data.get('amount')
        
        if user and not account:
            # Try to get user's primary account (first active account)
            try:
                primary_account = BankAccount.objects.filter(
                    user=user, 
                    status='active'
                ).first()
                if not primary_account:
                    raise forms.ValidationError(f"User {user.username} has no active accounts.")
                cleaned_data['account'] = primary_account
            except BankAccount.DoesNotExist:
                raise forms.ValidationError(f"User {user.username} has no active accounts.")
        
        if account and account.user != user:
            raise forms.ValidationError("Selected account does not belong to the selected user.")
            
        if amount and amount <= 0:
            raise forms.ValidationError("Deposit amount must be positive.")
            
        return cleaned_data


class TransactionAdminForm(forms.ModelForm):
    """Custom form for Transaction admin with enhanced validation"""
    
    class Meta:
        model = Transaction
        fields = '__all__'
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3, 'cols': 50}),
            'narration': forms.TextInput(attrs={'size': 50}),
            'failure_reason': forms.Textarea(attrs={'rows': 2, 'cols': 50}),
        }
    
    def clean(self):
        cleaned_data = super().clean()
        transaction_type = cleaned_data.get('transaction_type')
        from_account = cleaned_data.get('from_account')
        to_account = cleaned_data.get('to_account')
        amount = cleaned_data.get('amount')
        
        # Validate transaction parties based on type
        if transaction_type in ['transfer', 'payment']:
            if not from_account:
                raise forms.ValidationError("From account is required for transfers and payments.")
            # For transfers, to_account is optional (can be external)
            # For payments, to_account is required
            if transaction_type == 'payment' and not to_account:
                raise forms.ValidationError("To account is required for payments.")
        
        elif transaction_type == 'deposit':
            if not to_account:
                raise forms.ValidationError("To account is required for deposits.")
                
        elif transaction_type == 'withdrawal':
            if not from_account:
                raise forms.ValidationError("From account is required for withdrawals.")
        
        # Validate amount
        if amount and amount <= 0:
            raise forms.ValidationError("Transaction amount must be positive.")
            
        return cleaned_data


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    form = TransactionAdminForm
    list_display = (
        'reference', 'transaction_type', 'get_formatted_amount', 'fee', 'total_amount', 'currency', 
        'get_status_display_with_icon', 'channel', 'get_from_account', 'get_to_account', 
        'confirmed_at', 'created_at'
    )
    list_filter = (
        'transaction_type', 'status', 'channel', 'currency', 'deposit_source',
        'auto_confirm', 'created_at', 'processed_at', 'completed_at', 'confirmed_at'
    )
    search_fields = (
        'reference', 'description', 'narration', 'deposit_reference',
        'depositor_name', 'depositor_bank_name',
        'recipient_name', 'recipient_bank_name', 'external_reference',
        'from_account__account_number', 'to_account__account_number', 
        'from_account__user__username', 'to_account__user__username',
        'from_account__user__email', 'to_account__user__email'
    )
    readonly_fields = (
        'id', 'reference', 'from_balance_before', 'from_balance_after',
        'to_balance_before', 'to_balance_after', 'created_at', 
        'updated_at', 'processed_at', 'completed_at', 'confirmed_at', 'failed_at',
        'total_amount'
    )
    date_hierarchy = 'created_at'
    list_per_page = 25
    list_max_show_all = 100
    
    # Allow deletion and proper cascade handling
    def has_delete_permission(self, request, obj=None):
        """Allow superusers to delete transactions"""
        return request.user.is_superuser
    
    def delete_model(self, request, obj):
        """Handle transaction deletion with balance restoration"""
        # Restore account balances if transaction was completed
        if obj.status == 'completed':
            from decimal import Decimal
            
            if obj.transaction_type == 'deposit' and obj.to_account and obj.to_balance_before is not None:
                # Reverse deposit - remove funds from account
                obj.to_account.balance = obj.to_balance_before
                obj.to_account.save()
                
            elif obj.transaction_type in ['withdrawal', 'transfer', 'fee', 'charge'] and obj.from_account and obj.from_balance_before is not None:
                # Reverse withdrawal/transfer - restore funds to account
                obj.from_account.balance = obj.from_balance_before
                obj.from_account.save()
                
                # For internal transfers, also restore destination account
                if obj.transaction_type == 'transfer' and obj.to_account and obj.to_balance_before is not None:
                    obj.to_account.balance = obj.to_balance_before
                    obj.to_account.save()
        
        # Delete the transaction
        super().delete_model(request, obj)
    
    def delete_queryset(self, request, queryset):
        """Handle bulk deletion of transactions"""
        for obj in queryset:
            self.delete_model(request, obj)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'reference', 'transaction_type', 'amount', 'fee', 'total_amount', 'currency'),
            'description': 'Core transaction details and amounts'
        }),
        ('Transaction Parties', {
            'fields': ('from_account', 'to_account'),
            'description': 'Source and destination accounts'
        }),
        ('Deposit Information', {
            'fields': (
                'deposit_source', 'deposit_reference', 'depositor_name', 
                'depositor_account_number', 'depositor_bank_name'
            ),
            'classes': ('collapse',),
            'description': 'Additional information for deposit transactions'
        }),
        ('External Transfer & Recipient Details', {
            'fields': (
                'recipient_name', 'recipient_account_number', 'recipient_bank_name',
                'routing_number', 'swift_code', 'external_reference', 'purpose_code'
            ),
            'classes': ('collapse',),
            'description': 'Information for external transfers and recipient details'
        }),
        ('Card Information', {
            'fields': ('card_brand', 'card_last_four'),
            'classes': ('collapse',),
            'description': 'Card-related transaction information'
        }),
        ('Transaction Context', {
            'fields': ('description', 'narration', 'channel', 'status_message'),
            'description': 'Descriptive information, processing channel, and status messaging'
        }),
        ('Processing & Confirmation', {
            'fields': ('status', 'auto_confirm', 'confirmation_delay_hours', 'confirmed_at'),
            'description': 'Transaction processing and confirmation settings'
        }),
        ('Balance Tracking', {
            'fields': (
                ('from_balance_before', 'from_balance_after'),
                ('to_balance_before', 'to_balance_after')
            ),
            'classes': ('collapse',),
            'description': 'Account balance snapshots before and after transaction'
        }),
        ('Failure Information', {
            'fields': ('failure_reason', 'failed_at'),
            'classes': ('collapse',),
            'description': 'Information about failed transactions'
        }),
        ('Timestamps', {
            'fields': (
                ('created_at', 'updated_at'),
                ('processed_at', 'completed_at'),
                'expected_completion_date'
            ),
            'classes': ('collapse',),
            'description': 'Transaction timeline and processing dates'
        })
    )
    
    actions = ['process_selected_transactions', 'fail_selected_transactions', 'reverse_selected_transactions']
    
    def process_selected_transactions(self, request, queryset):
        """Admin action to process selected pending transactions"""
        processed_count = 0
        failed_count = 0
        
        for transaction in queryset.filter(status='pending'):
            if transaction.process_transaction():
                processed_count += 1
            else:
                failed_count += 1
        
        if processed_count:
            messages.success(request, f"Successfully processed {processed_count} transactions.")
        if failed_count:
            messages.warning(request, f"Failed to process {failed_count} transactions.")
        
        if not processed_count and not failed_count:
            messages.info(request, "No pending transactions were selected.")
    
    process_selected_transactions.short_description = "Process selected pending transactions"
    
    def fail_selected_transactions(self, request, queryset):
        """Admin action to fail selected pending transactions"""
        failed_count = 0
        
        for transaction in queryset.filter(status__in=['pending', 'processing']):
            if transaction.fail_transaction("Manually failed by admin"):
                failed_count += 1
        
        if failed_count:
            messages.success(request, f"Successfully failed {failed_count} transactions.")
        else:
            messages.info(request, "No processable transactions were selected.")
    
    fail_selected_transactions.short_description = "Fail selected transactions"
    
    def reverse_selected_transactions(self, request, queryset):
        """Admin action to reverse selected completed transactions"""
        reversed_count = 0
        failed_count = 0
        
        for transaction in queryset.filter(status='completed'):
            try:
                # Create a reversal transaction
                reversal = Transaction.objects.create(
                    transaction_type='reversal',
                    from_account=transaction.to_account,  # Reverse the direction
                    to_account=transaction.from_account,
                    amount=transaction.amount,
                    fee=Decimal('0.00'),  # No fee for reversals
                    description=f"Reversal of {transaction.reference}",
                    status='pending',
                    auto_confirm=True,
                    confirmation_delay_hours=0,  # Process immediately
                    channel='admin'
                )
                
                # Process the reversal immediately
                if reversal.process_transaction():
                    reversed_count += 1
                else:
                    failed_count += 1
                    
            except Exception as e:
                failed_count += 1
                messages.error(request, f"Failed to reverse {transaction.reference}: {str(e)}")
        
        if reversed_count:
            messages.success(request, f"Successfully reversed {reversed_count} transactions.")
        if failed_count:
            messages.warning(request, f"Failed to reverse {failed_count} transactions.")
        
        if not reversed_count and not failed_count:
            messages.info(request, "No completed transactions were selected.")
    
    reverse_selected_transactions.short_description = "Reverse selected completed transactions"
    
    def get_from_account(self, obj):
        if obj.from_account:
            return f"{obj.from_account.account_number} ({obj.from_account.user.get_full_name()})"
        return '-'
    get_from_account.short_description = 'From Account'
    
    def get_to_account(self, obj):
        if obj.to_account:
            return f"{obj.to_account.account_number} ({obj.to_account.user.get_full_name()})"
        return '-'
    get_to_account.short_description = 'To Account'
    
    def get_formatted_amount(self, obj):
        color = 'green' if obj.transaction_type in ['deposit', 'credit'] else 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {}</span>',
            color, obj.currency, obj.amount
        )
    get_formatted_amount.short_description = 'Amount'
    
    def get_status_display_with_icon(self, obj):
        status_colors = {
            'pending': ('orange', '⏳'),
            'processing': ('blue', '🔄'),
            'confirmed': ('purple', '✅'),
            'completed': ('green', '✅'),
            'failed': ('red', '❌'),
            'cancelled': ('gray', '🚫'),
            'reversed': ('orange', '↩️'),
            'scheduled': ('teal', '📅'),
        }
        color, icon = status_colors.get(obj.status, ('black', '❓'))
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {}</span>',
            color, icon, obj.get_status_display()
        )
    get_status_display_with_icon.short_description = 'Status'
    
    def get_processing_timeline(self, obj):
        timeline = []
        if obj.created_at:
            timeline.append(f"Created: {obj.created_at.strftime('%m/%d %H:%M')}")
        if obj.confirmed_at:
            timeline.append(f"Confirmed: {obj.confirmed_at.strftime('%m/%d %H:%M')}")
        if obj.processed_at:
            timeline.append(f"Processed: {obj.processed_at.strftime('%m/%d %H:%M')}")
        if obj.completed_at:
            timeline.append(f"Completed: {obj.completed_at.strftime('%m/%d %H:%M')}")
        elif obj.failed_at:
            timeline.append(f"Failed: {obj.failed_at.strftime('%m/%d %H:%M')}")
            
        return format_html('<br>'.join(timeline))
    get_processing_timeline.short_description = 'Timeline'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'from_account__user', 'to_account__user'
        )
    
    def changelist_view(self, request, extra_context=None):
        """Add summary statistics to the change list view"""
        extra_context = extra_context or {}
        
        # Get queryset with applied filters
        cl = self.get_changelist_instance(request)
        queryset = cl.get_queryset(request)
        
        # Calculate summary statistics
        from django.db.models import Sum, Count
        from decimal import Decimal
        
        stats = {
            'total_transactions': queryset.count(),
            'total_amount': queryset.aggregate(Sum('amount'))['amount__sum'] or Decimal('0'),
            'pending_count': queryset.filter(status='pending').count(),
            'completed_count': queryset.filter(status='completed').count(),
            'failed_count': queryset.filter(status='failed').count(),
            'pending_amount': queryset.filter(status='pending').aggregate(Sum('amount'))['amount__sum'] or Decimal('0'),
            'completed_amount': queryset.filter(status='completed').aggregate(Sum('amount'))['amount__sum'] or Decimal('0'),
        }
        
        extra_context['transaction_stats'] = stats
        return super().changelist_view(request, extra_context=extra_context)
    
    def has_delete_permission(self, request, obj=None):
        """Restrict deletion of completed/failed transactions"""
        if obj and obj.status in ['completed', 'failed']:
            return False
        return super().has_delete_permission(request, obj)
    
    def save_model(self, request, obj, form, change):
        """Custom save logic for transactions"""
        # Simply save the model without trying to set non-existent processed_by field
        super().save_model(request, obj, form, change)
    
    def get_form(self, request, obj=None, **kwargs):
        """Customize form based on transaction status"""
        form = super().get_form(request, obj, **kwargs)
        if obj and obj.status in ['completed', 'failed']:
            # Make most fields readonly for completed/failed transactions
            for field_name in ['amount', 'transaction_type', 'from_account', 'to_account']:
                if field_name in form.base_fields:
                    form.base_fields[field_name].disabled = True
        return form


@admin.register(TransferRequest)
class TransferRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'get_from_account', 'to_account_number', 'amount', 'transfer_type',
        'get_status_display', 'created_at'
    )
    list_filter = ('transfer_type', 'created_at')
    search_fields = (
        'from_account__account_number', 'to_account_number', 'beneficiary_name',
        'from_account__user__username', 'description'
    )
    readonly_fields = ('created_at', 'updated_at', 'get_status_display')
    date_hierarchy = 'created_at'
    
    def has_delete_permission(self, request, obj=None):
        """Allow superusers to delete transfer requests"""
        return request.user.is_superuser
    
    def delete_model(self, request, obj):
        """Handle transfer request deletion with transaction cleanup"""
        # If there's an associated transaction, handle it properly
        if obj.transaction:
            # If transaction is completed, we might want to create a reversal
            if obj.transaction.status == 'completed':
                messages.warning(request, f"Transfer {obj.id} has a completed transaction. Consider reversing instead of deleting.")
        
        super().delete_model(request, obj)
    
    def delete_queryset(self, request, queryset):
        """Handle bulk deletion of transfer requests"""
        for obj in queryset:
            self.delete_model(request, obj)
    
    fieldsets = (
        ('Transfer Details', {
            'fields': ('from_account', 'to_account_number', 'to_account', 'to_bank_name')
        }),
        ('External Transfer Fields', {
            'fields': ('to_routing_number', 'to_swift_code', 'beneficiary_name', 'beneficiary_address'),
            'classes': ('collapse',)
        }),
        ('Amount and Context', {
            'fields': ('amount', 'transfer_type', 'description')
        }),
        ('Processing', {
            'fields': ('get_status_display', 'transaction', 'rejection_reason')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_status_display(self, obj):
        return obj.status.title() if obj.status else 'Pending'
    get_status_display.short_description = 'Status'
    
    def get_from_account(self, obj):
        return f"{obj.from_account.account_number} ({obj.from_account.user.get_full_name()})"
    get_from_account.short_description = 'From Account'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'from_account__user', 'to_account__user', 'transaction'
        )


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = (
        'get_masked_number', 'card_name', 'card_type', 'card_brand', 'status',
        'expiry_date', 'get_account', 'is_expired_display'
    )
    list_filter = (
        'card_type', 'card_brand', 'status', 'international_transactions',
        'online_transactions', 'contactless_enabled', 'created_at'
    )
    search_fields = (
        'card_number', 'card_name', 'account__account_number', 
        'account__user__username', 'account__user__email'
    )
    readonly_fields = (
        'card_number', 'cvv', 'expiry_date', 'issued_date', 'created_at', 
        'updated_at', 'last_used_date'
    )
    
    fieldsets = (
        ('Card Details', {
            'fields': ('account', 'card_number', 'card_brand', 'card_type', 'card_name')
        }),
        ('Security', {
            'fields': ('expiry_date', 'cvv', 'pin_hash')
        }),
        ('Limits and Configuration', {
            'fields': ('status', 'daily_limit', 'weekly_limit', 'monthly_limit')
        }),
        ('Features', {
            'fields': ('international_transactions', 'online_transactions', 'contactless_enabled')
        }),
        ('Usage Tracking', {
            'fields': ('last_used_date', 'failed_attempts'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'issued_date'),
            'classes': ('collapse',)
        }),
    )
    
    def get_masked_number(self, obj):
        return f"****-****-****-{obj.card_number[-4:]}"
    get_masked_number.short_description = 'Card Number'
    
    def get_account(self, obj):
        return f"{obj.account.account_number} ({obj.account.user.get_full_name()})"
    get_account.short_description = 'Account'
    
    def is_expired_display(self, obj):
        is_expired = obj.is_expired()
        if is_expired:
            return format_html('<span style="color: red;">Expired</span>')
        return format_html('<span style="color: green;">Active</span>')
    is_expired_display.short_description = 'Expiry Status'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('account__user')


@admin.register(AccountStatement)
class AccountStatementAdmin(admin.ModelAdmin):
    list_display = (
        'get_account', 'statement_type', 'start_date', 'end_date',
        'closing_balance', 'is_generated', 'is_delivered', 'created_at'
    )
    list_filter = (
        'statement_type', 'delivery_method', 'is_generated', 'is_delivered', 'created_at'
    )
    search_fields = ('account__account_number', 'account__user__username')
    readonly_fields = ('created_at', 'generated_at', 'delivered_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Statement Details', {
            'fields': ('account', 'statement_type', 'start_date', 'end_date', 'statement_date')
        }),
        ('Balances', {
            'fields': ('opening_balance', 'closing_balance', 'total_credits', 'total_debits')
        }),
        ('Statement Generation', {
            'fields': ('is_generated', 'file_path', 'delivery_method', 'is_delivered')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'generated_at', 'delivered_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_account(self, obj):
        return f"{obj.account.account_number} ({obj.account.user.get_full_name()})"
    get_account.short_description = 'Account'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('account__user')


@admin.register(AccountNotification)
class AccountNotificationAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'notification_type', 'title', 'priority', 'delivery_channel',
        'is_sent', 'is_read', 'created_at'
    )
    list_filter = (
        'notification_type', 'priority', 'delivery_channel', 'is_sent', 'is_read', 'created_at'
    )
    search_fields = ('user__username', 'title', 'message')
    readonly_fields = ('created_at', 'sent_at', 'read_at')
    date_hierarchy = 'created_at'
    
    def has_delete_permission(self, request, obj=None):
        """Allow superusers to delete notifications"""
        return request.user.is_superuser
    
    def delete_queryset(self, request, queryset):
        """Handle bulk deletion of notifications"""
        super().delete_queryset(request, queryset)
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'account', 'notification_type', 'title', 'message', 'priority')
        }),
        ('Delivery', {
            'fields': ('delivery_channel', 'is_sent', 'is_read')
        }),
        ('Related Objects', {
            'fields': ('transaction',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'sent_at', 'read_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'account', 'transaction')


@admin.register(TransactionLimit)
class TransactionLimitAdmin(admin.ModelAdmin):
    list_display = (
        'account_type', 'customer_tier', 'transaction_category', 'limit_type',
        'limit_amount', 'is_active', 'created_at'
    )
    list_filter = (
        'account_type', 'customer_tier', 'transaction_category', 'limit_type', 'is_active'
    )
    search_fields = ('account_type', 'customer_tier', 'transaction_category')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Account Configuration', {
            'fields': ('account_type', 'customer_tier')
        }),
        ('Limit Configuration', {
            'fields': ('limit_type', 'transaction_category', 'limit_amount')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# Enhanced admin actions for transactions
@admin.action(description='Create new deposit transaction')
def create_deposit_transaction(modeladmin, request, queryset):
    """Create a new deposit - this will redirect to a form"""
    # This action doesn't use queryset, it's just a way to add a button to create deposits
    from django.shortcuts import redirect
    from django.urls import reverse
    
    # Redirect to the standard add transaction form but with preset values for deposit
    url = reverse('admin:banking_transaction_add')
    return redirect(f"{url}?transaction_type=deposit&channel=system")


@admin.action(description='Mark selected transactions as completed')
def mark_transactions_completed(modeladmin, request, queryset):
    updated = queryset.update(status='completed')
    modeladmin.message_user(request, f'{updated} transactions marked as completed.')


@admin.action(description='Mark selected transactions as pending')
def mark_transactions_pending(modeladmin, request, queryset):
    updated = queryset.update(status='pending')
    modeladmin.message_user(request, f'{updated} transactions marked as pending.')


@admin.action(description='Mark selected transactions as failed')
def mark_transactions_failed(modeladmin, request, queryset):
    updated = queryset.update(status='failed')
    modeladmin.message_user(request, f'{updated} transactions marked as failed.')


@admin.action(description='Confirm selected transactions')
def confirm_transactions(modeladmin, request, queryset):
    confirmed_count = 0
    for transaction in queryset:
        if transaction.confirm_transaction(confirmed_by=f"Admin: {request.user.username}"):
            confirmed_count += 1
    modeladmin.message_user(request, f'{confirmed_count} transactions confirmed for processing.')


@admin.action(description='Mark OFAC screening as cleared')
def clear_ofac_screening(modeladmin, request, queryset):
    updated = queryset.update(ofac_screening_status='cleared')
    modeladmin.message_user(request, f'{updated} transactions cleared for OFAC screening.')


@admin.action(description='Process selected transactions')
def process_transactions(modeladmin, request, queryset):
    from django.utils import timezone
    updated = queryset.filter(status='confirmed').update(
        status='processing',
        processed_at=timezone.now(),
        processed_by=f"Admin: {request.user.username}"
    )
    modeladmin.message_user(request, f'{updated} transactions marked as processing.')


@admin.action(description='Approve transactions requiring approval')
def approve_transactions(modeladmin, request, queryset):
    updated = queryset.filter(approval_required=True, status='pending').update(
        approved_by=f"Admin: {request.user.username}",
        status='confirmed'
    )
    modeladmin.message_user(request, f'{updated} transactions approved.')


@admin.action(description='Approve pending deposits and credit accounts')
def approve_pending_deposits(modeladmin, request, queryset):
    approved_count = 0
    total_amount = Decimal('0')
    
    for transaction in queryset.filter(
        transaction_type='deposit', 
        status='pending',
        to_account__isnull=False
    ):
        # Credit the account
        account = transaction.to_account
        account.balance += transaction.amount
        
        # Update transaction
        transaction.to_account_balance_after = account.balance
        transaction.status = 'completed'
        transaction.processed_at = timezone.now()
        transaction.completed_at = timezone.now()
        transaction.processed_by = f"Admin: {request.user.username}"
        
        # Save changes
        account.save()
        transaction.save()
        
        # Create notification
        AccountNotification.objects.create(
            user=account.user,
            account=account,
            notification_type='transaction',
            title='Deposit Approved',
            message=f'Your pending deposit of {transaction.amount} {transaction.currency} has been approved and credited to account {account.account_number}.',
            priority='medium',
            delivery_channel='in_app',
            transaction=transaction
        )
        
        approved_count += 1
        total_amount += transaction.amount
    
    modeladmin.message_user(
        request, 
        f'{approved_count} deposits approved totaling {total_amount} credited to accounts.'
    )


@admin.action(description='Export selected transactions to CSV')
def export_transactions_csv(modeladmin, request, queryset):
    import csv
    from django.http import HttpResponse
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="transactions.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Reference', 'Type', 'Amount', 'Currency', 'Status', 'From Account', 
        'To Account', 'Description', 'Channel', 'Created At', 'Processed At'
    ])
    
    for transaction in queryset:
        writer.writerow([
            transaction.reference,
            transaction.transaction_type,
            transaction.amount,
            transaction.currency,
            transaction.status,
            transaction.from_account.account_number if transaction.from_account else '',
            transaction.to_account.account_number if transaction.to_account else transaction.to_account_number,
            transaction.description,
            transaction.channel,
            transaction.created_at,
            transaction.processed_at
        ])
    
    return response


@admin.action(description='Mark selected notifications as read')
def mark_notifications_read(modeladmin, request, queryset):
    from django.utils import timezone
    updated = queryset.update(is_read=True, read_at=timezone.now())
    modeladmin.message_user(request, f'{updated} notifications marked as read.')


@admin.action(description='Mark selected notifications as sent')
def mark_notifications_sent(modeladmin, request, queryset):
    from django.utils import timezone
    updated = queryset.update(is_sent=True, sent_at=timezone.now())
    modeladmin.message_user(request, f'{updated} notifications marked as sent.')


@admin.action(description='Activate selected cards')
def activate_cards(modeladmin, request, queryset):
    updated = queryset.update(status='active')
    modeladmin.message_user(request, f'{updated} cards activated.')


@admin.action(description='Block selected cards')
def block_cards(modeladmin, request, queryset):
    updated = queryset.update(status='blocked')
    modeladmin.message_user(request, f'{updated} cards blocked.')


@admin.action(description='Suspend selected cards')
def suspend_cards(modeladmin, request, queryset):
    updated = queryset.update(status='suspended')
    modeladmin.message_user(request, f'{updated} cards suspended.')


@admin.action(description='Enable international transactions')
def enable_international_transactions(modeladmin, request, queryset):
    updated = queryset.update(international_transactions=True)
    modeladmin.message_user(request, f'International transactions enabled for {updated} cards.')


@admin.action(description='Disable international transactions')
def disable_international_transactions(modeladmin, request, queryset):
    updated = queryset.update(international_transactions=False)
    modeladmin.message_user(request, f'International transactions disabled for {updated} cards.')


# Add enhanced actions to TransactionAdmin
TransactionAdmin.actions = [
    create_deposit_transaction, mark_transactions_completed, mark_transactions_pending, mark_transactions_failed,
    confirm_transactions, clear_ofac_screening, process_transactions, 
    approve_transactions, approve_pending_deposits, export_transactions_csv
]
AccountNotificationAdmin.actions = [mark_notifications_read, mark_notifications_sent]
CardAdmin.actions = [activate_cards, block_cards, suspend_cards, enable_international_transactions, disable_international_transactions]

@admin.action(description='Process deposit requests and create transactions')
def process_deposit_requests(modeladmin, request, queryset):
    """Process selected deposit requests by creating and approving transactions"""
    processed_count = 0
    total_amount = Decimal('0')
    
    for deposit_request in queryset.filter(transaction__isnull=True):
        try:
            # Create transaction from deposit request
            transaction = deposit_request.create_transaction()
            
            # Process the transaction immediately
            transaction.process_transaction()
            
            # Mark as approved by admin
            deposit_request.approved_by = request.user
            deposit_request.approved_at = timezone.now()
            deposit_request.save()
            
            processed_count += 1
            total_amount += deposit_request.amount
            
        except Exception as e:
            modeladmin.message_user(
                request,
                f'Failed to process deposit request {deposit_request.id}: {str(e)}',
                level=messages.ERROR
            )
    
    if processed_count > 0:
        modeladmin.message_user(
            request,
            f'{processed_count} deposit requests processed totaling ${total_amount}. Transactions created and funds credited.',
            level=messages.SUCCESS
        )
    else:
        modeladmin.message_user(
            request,
            'No unprocessed deposit requests found in selection.',
            level=messages.WARNING
        )


@admin.register(DepositRequest)
class DepositRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'to_account', 'amount', 'deposit_source', 'depositor_name', 'get_status_display', 'created_at')
    list_filter = ('deposit_source', 'created_at')
    search_fields = ('to_account__account_number', 'depositor_name', 'depositor_account_number', 'depositor_bank_name')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at', 'get_status_display')
    actions = [process_deposit_requests]
    
    def has_delete_permission(self, request, obj=None):
        """Allow superusers to delete deposit requests"""
        return request.user.is_superuser
    
    def delete_model(self, request, obj):
        """Handle deposit request deletion with transaction cleanup"""
        # If there's an associated transaction, handle it properly
        if obj.transaction:
            # If transaction is completed, we might want to create a reversal
            if obj.transaction.status == 'completed':
                messages.warning(request, f"Deposit {obj.id} has a completed transaction. Consider reversing instead of deleting.")
        
        super().delete_model(request, obj)
    
    def delete_queryset(self, request, queryset):
        """Handle bulk deletion of deposit requests"""
        for obj in queryset:
            self.delete_model(request, obj)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('to_account', 'amount', 'deposit_source', 'description')
        }),
        ('Depositor Details', {
            'fields': ('depositor_name', 'depositor_account_number', 'depositor_bank_name', 'deposit_reference')
        }),
        ('Processing', {
            'fields': ('get_status_display', 'transaction', 'rejection_reason')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_status_display(self, obj):
        return obj.status.title() if obj.status else 'Pending'
    get_status_display.short_description = 'Status'
