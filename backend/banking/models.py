from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.utils import timezone
from accounts.models import BankAccount
import uuid
import random
import string
import holidays
from datetime import date, timedelta, datetime


def is_business_day(check_date):
    """
    Check if a given date is a business day
    Business days are Monday-Friday, excluding US federal holidays
    """
    # Check if it's a weekend
    if check_date.weekday() >= 5:  # Saturday = 5, Sunday = 6
        return False
    
    # Check if it's a US federal holiday
    us_holidays = holidays.US()
    if check_date in us_holidays:
        return False
    
    return True


def get_next_business_day(start_date=None, days_ahead=1):
    """
    Calculate next business day (excluding weekends and US federal holidays)
    """
    if start_date is None:
        start_date = date.today()
    
    current_date = start_date
    business_days_added = 0
    
    while business_days_added < days_ahead:
        current_date += timedelta(days=1)
        
        # Check if this date is a business day
        if is_business_day(current_date):
            business_days_added += 1
    
    return current_date


def get_holiday_info(check_date):
    """
    Get holiday information for a specific date
    Returns tuple: (is_holiday, holiday_name)
    """
    us_holidays = holidays.US()
    if check_date in us_holidays:
        return True, us_holidays[check_date]
    return False, None


def calculate_business_days_between(start_date, end_date):
    """
    Calculate the number of business days between two dates
    """
    if start_date >= end_date:
        return 0
    
    business_days = 0
    current_date = start_date
    
    while current_date < end_date:
        current_date += timedelta(days=1)
        if is_business_day(current_date):
            business_days += 1
    
    return business_days


class Transaction(models.Model):
    """Simplified transaction model for all banking operations"""
    TRANSACTION_TYPES = [
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('transfer', 'Transfer'),
        ('payment', 'Payment'),
        ('fee', 'Fee'),
        ('interest', 'Interest'),
        ('reversal', 'Reversal'),
        ('charge', 'Service Charge'),
    ]
    
    DEPOSIT_SOURCES = [
        ('cash', 'Cash Deposit'),
        ('check', 'Check Deposit'),
        ('wire', 'Wire Transfer'),
        ('ach', 'ACH Transfer'),
        ('mobile_check', 'Mobile Check Deposit'),
        ('direct_deposit', 'Direct Deposit'),
        ('atm', 'ATM Deposit'),
        ('branch', 'Branch Deposit'),
        ('other', 'Other'),
    ]
    
    TRANSACTION_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    TRANSACTION_CHANNELS = [
        ('online', 'Online Banking'),
        ('mobile', 'Mobile Banking'),
        ('atm', 'ATM'),
        ('branch', 'Branch'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=20, unique=True, blank=True)
    
    # Transaction Parties
    from_account = models.ForeignKey(
        BankAccount, 
        on_delete=models.CASCADE, 
        related_name='outgoing_transactions',
        null=True, 
        blank=True,
        help_text="Source account for withdrawals/transfers. Leave null for deposits."
    )
    
    # For deposits - the account receiving funds
    to_account = models.ForeignKey(
        BankAccount,
        on_delete=models.CASCADE,
        related_name='incoming_transactions',
        null=True,
        blank=True,
        help_text="Destination account for deposits/transfers. Leave null for withdrawals."
    )
    
    # Deposit-specific fields (used when transaction_type = 'deposit')
    deposit_source = models.CharField(max_length=20, choices=DEPOSIT_SOURCES, blank=True, 
                                    help_text="Source of deposit funds")
    deposit_reference = models.CharField(max_length=100, blank=True,
                                       help_text="External reference for deposit (check number, wire ref, etc.)")
    depositor_name = models.CharField(max_length=200, blank=True,
                                    help_text="Name of person making deposit (if different from account holder)")
    depositor_account_number = models.CharField(max_length=50, blank=True,
                                              help_text="Account number of the depositor (for wire/ACH deposits)")
    depositor_bank_name = models.CharField(max_length=200, blank=True,
                                         help_text="Bank name of the depositor (for external deposits)")
    
    # External transfer and recipient details (for transfers/withdrawals)
    recipient_name = models.CharField(max_length=200, blank=True,
                                    help_text="Name of the recipient (for external transfers)")
    recipient_account_number = models.CharField(max_length=50, blank=True,
                                              help_text="Recipient account number")
    recipient_bank_name = models.CharField(max_length=200, blank=True,
                                         help_text="Recipient bank name")
    routing_number = models.CharField(max_length=20, blank=True,
                                    help_text="Bank routing number for external transfers")
    swift_code = models.CharField(max_length=11, blank=True,
                                help_text="SWIFT/BIC code for international transfers")
    
    # Additional transaction context
    external_reference = models.CharField(max_length=100, blank=True,
                                        help_text="External reference ID from third-party processors")
    purpose_code = models.CharField(max_length=10, blank=True,
                                  help_text="Transaction purpose code for regulatory compliance")
    
    # Card-related information (for card transactions)
    card_last_four = models.CharField(max_length=4, blank=True,
                                    help_text="Last 4 digits of card used")
    card_brand = models.CharField(max_length=20, blank=True,
                                help_text="Card brand (Visa, Mastercard, etc.)")
    
    # Status messaging
    status_message = models.TextField(blank=True,
                                    help_text="Detailed status message for user display")
    
    # Transaction Details
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)  # auto-calculated
    currency = models.CharField(max_length=3, default='USD')
    
    # Transaction Context
    description = models.TextField(blank=True)
    narration = models.CharField(max_length=200, blank=True)
    
    # Processing Information
    status = models.CharField(max_length=20, choices=TRANSACTION_STATUS, default='pending')
    channel = models.CharField(max_length=20, choices=TRANSACTION_CHANNELS, default='online', 
                              help_text="Channel through which transaction was initiated")
 
    
    # Simple Confirmation (internal only)
    auto_confirm = models.BooleanField(default=True)  # Auto-confirm after delay
    confirmation_delay_hours = models.IntegerField(default=1)  # Hours to wait before auto-confirm
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    # Balance Snapshots
    from_balance_before = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True,
                                            help_text="Balance before transaction for source account")
    from_balance_after = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True,
                                           help_text="Balance after transaction for source account")
    to_balance_before = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True,
                                          help_text="Balance before transaction for destination account")
    to_balance_after = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True,
                                         help_text="Balance after transaction for destination account")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    expected_completion_date = models.DateField(null=True, blank=True)
    
    # Failure Information
    failure_reason = models.TextField(blank=True)
    
    def save(self, *args, **kwargs):
        from decimal import Decimal
        
        # Generate reference if not set
        if not self.reference:
            self.reference = self.generate_reference()
        
        # Calculate total amount if not set
        if not self.total_amount:
            amount = Decimal(str(self.amount)) if self.amount else Decimal('0')
            fee = Decimal(str(self.fee)) if self.fee else Decimal('0')
            self.total_amount = amount + fee
        
        # Set expected completion date for pending transactions
        if not self.expected_completion_date and self.status == 'pending':
            days_ahead = 1 if self.auto_confirm else 3  # Faster for auto-confirm
            self.expected_completion_date = get_next_business_day(
                start_date=date.today(), 
                days_ahead=days_ahead
            )
        
        super().save(*args, **kwargs)
    
    def generate_reference(self):
        """Generate a unique transaction reference"""
        while True:
            reference = 'TXN' + ''.join(random.choices(
                string.ascii_uppercase + string.digits, 
                k=getattr(settings, 'TRANSACTION_REFERENCE_LENGTH', 12)
            ))
            if not Transaction.objects.filter(reference=reference).exists():
                return reference
    
    def get_primary_account(self):
        """Get the primary account affected by this transaction"""
        if self.transaction_type == 'deposit':
            return self.to_account  # For deposits, the destination account is primary
        else:
            return self.from_account  # For withdrawals/transfers, the source account is primary
    
    def is_deposit(self):
        """Check if this is a deposit transaction"""
        return self.transaction_type == 'deposit'
    
    def is_withdrawal_or_transfer(self):
        """Check if this is a withdrawal or transfer transaction"""
        return self.transaction_type in ['withdrawal', 'transfer']
    
    def can_be_processed(self):
        """Check if transaction can be processed now"""
        if self.status != 'pending':
            return False
        
        # For auto-confirm transactions, check delay
        if self.auto_confirm:
            confirm_time = self.created_at + timedelta(hours=self.confirmation_delay_hours)
            return timezone.now() >= confirm_time
        
        return True  # Manual transactions can be processed anytime
    
    def process_transaction(self):
        """Process the transaction (confirm and execute balance changes)"""
        if not self.can_be_processed():
            return False
        
        try:
            from decimal import Decimal
            
            # Update status to processing
            self.status = 'processing'
            self.processed_at = timezone.now()
            self.confirmed_at = timezone.now()
            
            # Capture balances before transaction
            if self.from_account:
                self.from_balance_before = self.from_account.balance
            if self.to_account:
                self.to_balance_before = self.to_account.balance
            
            # Execute balance changes based on transaction type
            total_amount = self.total_amount or (self.amount + (self.fee or Decimal('0')))
            
            if self.transaction_type == 'deposit' and self.to_account:
                # Credit the destination account
                self.to_account.balance += self.amount
                self.to_account.save()
                self.to_balance_after = self.to_account.balance
                
            elif self.transaction_type in ['withdrawal', 'fee', 'charge'] and self.from_account:
                # Debit the source account
                if self.from_account.balance >= total_amount:
                    self.from_account.balance -= total_amount
                    self.from_account.save()
                    self.from_balance_after = self.from_account.balance
                else:
                    raise ValueError("Insufficient funds")
                    
            elif self.transaction_type == 'transfer':
                # Handle transfer between accounts
                if self.from_account and self.to_account:
                    # Internal transfer
                    if self.from_account.balance >= total_amount:
                        self.from_account.balance -= total_amount
                        self.to_account.balance += self.amount  # Only transfer amount, not fees
                        self.from_account.save()
                        self.to_account.save()
                        self.from_balance_after = self.from_account.balance
                        self.to_balance_after = self.to_account.balance
                    else:
                        raise ValueError("Insufficient funds")
                elif self.from_account:
                    # External transfer - only debit source account
                    if self.from_account.balance >= total_amount:
                        self.from_account.balance -= total_amount
                        self.from_account.save()
                        self.from_balance_after = self.from_account.balance
                    else:
                        raise ValueError("Insufficient funds")
                        
            elif self.transaction_type == 'interest' and self.to_account:
                # Credit interest to account
                self.to_account.balance += self.amount
                self.to_account.save()
                self.to_balance_after = self.to_account.balance
                
            elif self.transaction_type == 'reversal':
                # Reverse the original transaction
                if self.from_account and self.to_account:
                    # Reverse transfer
                    self.from_account.balance += self.amount
                    self.to_account.balance -= self.amount
                    self.from_account.save()
                    self.to_account.save()
                    self.from_balance_after = self.from_account.balance
                    self.to_balance_after = self.to_account.balance
                elif self.from_account:
                    # Reverse withdrawal/charge
                    self.from_account.balance += total_amount
                    self.from_account.save()
                    self.from_balance_after = self.from_account.balance
                elif self.to_account:
                    # Reverse deposit
                    self.to_account.balance -= self.amount
                    self.to_account.save()
                    self.to_balance_after = self.to_account.balance
            
            # Set final status based on transaction type
            if self.transaction_type == 'transfer':
                # Transfers should remain in processing status until confirmed by external network
                self.status = 'processing'
            else:
                # Other transaction types (deposits, withdrawals) are completed immediately
                self.status = 'completed'
                self.completed_at = timezone.now()
            
            self.save()
            
            return True
            
        except Exception as e:
            self.fail_transaction(str(e))
            return False
    
    def fail_transaction(self, reason=""):
        """Fail the transaction and restore funds if applicable"""
        if self.status in ['failed', 'completed']:
            return False
        
        from decimal import Decimal
        
        # Restore funds based on transaction type if they were already deducted
        if self.status in ['processing'] and self.from_balance_before is not None:
            total_amount = self.total_amount or (self.amount + (self.fee or Decimal('0')))
            
            if self.transaction_type in ['withdrawal', 'transfer', 'fee', 'charge'] and self.from_account:
                # Restore funds to source account
                self.from_account.balance = self.from_balance_before
                self.from_account.save()
                
            if self.transaction_type == 'transfer' and self.to_account and self.to_balance_before is not None:
                # Restore destination account balance for internal transfers
                self.to_account.balance = self.to_balance_before
                self.to_account.save()
                
            elif self.transaction_type == 'deposit' and self.to_account and self.to_balance_before is not None:
                # Remove provisional credit from destination account
                self.to_account.balance = self.to_balance_before
                self.to_account.save()
        
        self.status = 'failed'
        self.failure_reason = reason
        self.failed_at = timezone.now()
        self.save()
        
        return True
    
    def get_status_message(self):
        """Get user-friendly status message"""
        if self.status_message:
            return self.status_message
        
        status_messages = {
            'pending': 'Transaction is pending confirmation',
            'processing': 'Transaction is being processed',
            'completed': 'Transaction completed successfully',
            'failed': f'Transaction failed: {self.failure_reason}',
            'cancelled': 'Transaction was cancelled',
        }
        return status_messages.get(self.status, f'Status: {self.get_status_display()}')
    
    def get_transaction_type_display(self):
        """Get formatted transaction type for display"""
        type_display = {
            'deposit': 'Deposit',
            'withdrawal': 'Withdrawal', 
            'transfer': 'Transfer',
            'payment': 'Payment',
            'fee': 'Fee',
            'charge': 'Service Charge',
            'interest': 'Interest Credit',
            'reversal': 'Reversal'
        }
        return type_display.get(self.transaction_type, self.transaction_type.replace('_', ' ').title())
    
    def get_status_display_formatted(self):
        """Get formatted status for display"""
        return self.get_status_display()
    
    def get_estimated_completion(self):
        """Get estimated completion date/time"""
        if self.status == 'completed':
            return self.completed_at
        elif self.expected_completion_date:
            return f"Expected by {self.expected_completion_date.strftime('%B %d, %Y')}"
        return None
    
    def has_external_banking_info(self):
        """Check if transaction has external banking information"""
        return any([
            self.recipient_bank_name,
            self.routing_number,
            self.swift_code,
            self.depositor_bank_name
        ])
    
    def get_banking_details(self):
        """Get banking details for display"""
        details = {}
        
        if self.recipient_bank_name:
            details['bank_name'] = self.recipient_bank_name
        elif self.depositor_bank_name:
            details['bank_name'] = self.depositor_bank_name
        
        if self.routing_number:
            details['routing_number'] = self.routing_number
        
        if self.recipient_account_number:
            details['account_number'] = self.recipient_account_number
        elif self.depositor_account_number:
            details['account_number'] = self.depositor_account_number
        
        if self.swift_code:
            details['swift_code'] = self.swift_code
            
        return details
    
    def get_estimated_completion_message(self):
        """Get user-friendly completion message with business day awareness"""
        if self.status == 'completed':
            return "Transaction completed successfully"
        elif self.status == 'pending':
            if self.expected_completion_date:
                business_days = calculate_business_days_between(date.today(), self.expected_completion_date)
                
                if business_days <= 1:
                    return "Your transaction will be completed within 1 business day"
                else:
                    max_days = min(business_days, 3)
                    return f"Your transaction will be completed within {max_days} business days"
            return "Your transaction is being processed"
        elif self.status == 'processing':
            return "Your transaction is currently being processed"
        else:
            return f"Transaction status: {self.get_status_display()}"
    
    def __str__(self):
        if self.is_deposit():
            account = self.to_account.account_number if self.to_account else 'Unknown'
            source = f" from {self.get_deposit_source_display()}" if self.deposit_source else ""
            return f"{self.reference} - Deposit to {account}{source} - {self.amount}"
        elif self.transaction_type == 'transfer':
            from_acc = self.from_account.account_number if self.from_account else 'Unknown'
            to_acc = self.to_account.account_number if self.to_account else 'External'
            return f"{self.reference} - Transfer {from_acc} → {to_acc} - {self.amount}"
        else:
            account = self.from_account.account_number if self.from_account else 'Unknown'
            return f"{self.reference} - {self.transaction_type.title()} from {account} - {self.amount}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"


class TransferRequest(models.Model):
    """Simplified model for handling transfer requests between accounts"""
    
    TRANSFER_TYPES = [
        ('internal', 'Internal Transfer'),
        ('domestic_external', 'Domestic External Transfer'),  # ACH
        ('international', 'International Transfer'),          # SWIFT
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Transfer Details
    from_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='transfer_requests_sent')
    to_account_number = models.CharField(max_length=50, help_text="Destination account number")
    to_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='transfer_requests_to_account', null=True, blank=True)
    
    # External Transfer Fields (only for external transfers)
    to_bank_name = models.CharField(max_length=200, blank=True, help_text="Destination bank name")
    to_routing_number = models.CharField(max_length=20, blank=True, help_text="ACH routing number")
    to_swift_code = models.CharField(max_length=11, blank=True, help_text="SWIFT BIC code")
    beneficiary_name = models.CharField(max_length=200, blank=True, help_text="Beneficiary full name")
    beneficiary_address = models.TextField(blank=True, help_text="Required for international transfers")
    
    # Amount and Details
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    transfer_type = models.CharField(max_length=20, choices=TRANSFER_TYPES, default='internal')
    description = models.TextField(blank=True, help_text="Transfer description or purpose")
    
    # Processing
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Auto-detect transfer type if not set
        if not hasattr(self, '_transfer_type_set'):
            if self.to_account:
                self.transfer_type = 'internal'
            elif self.to_swift_code:
                self.transfer_type = 'international'
            elif self.to_routing_number:
                self.transfer_type = 'domestic_external'
        
        super().save(*args, **kwargs)
    
    @property
    def status(self):
        """Get status from associated transaction"""
        if self.transaction:
            return self.transaction.status
        return 'pending'
    
    def get_transfer_fee(self):
        """Calculate transfer fee based on type"""
        from decimal import Decimal
        fee_structure = {
            'internal': Decimal('0.00'),
            'domestic_external': Decimal('15.00'),
            'international': Decimal('45.00'),
        }
        return fee_structure.get(self.transfer_type, Decimal('0.00'))
    
    def create_transaction(self):
        """Create a corresponding Transaction record with processing status and fund deduction"""
        if self.transaction:
            return self.transaction
        
        # Calculate fee and total amount
        transfer_fee = self.get_transfer_fee()
        total_amount = self.amount + transfer_fee
        
        transaction = Transaction.objects.create(
            transaction_type='transfer',
            from_account=self.from_account,
            to_account=self.to_account,  # Will be None for external transfers
            amount=self.amount,
            fee=transfer_fee,
            total_amount=total_amount,  # Explicitly set total amount
            description=self.description or f"Transfer to {self.to_account_number}",
            status='pending',  # Start as pending for processing
            auto_confirm=False,  # Manual processing
            from_balance_before=self.from_account.balance,
            to_balance_before=self.to_account.balance if self.to_account else None,
            
            # Populate external transfer fields from TransferRequest
            recipient_name=self.beneficiary_name,
            recipient_account_number=self.to_account_number,
            recipient_bank_name=self.to_bank_name,
            routing_number=self.to_routing_number,
            swift_code=self.to_swift_code,
            channel='online',
            status_message=f'Transfer to {self.beneficiary_name or "external account"} is being processed'
        )
        
        # Immediately deduct funds from source account
        transaction.process_transaction()
        
        self.transaction = transaction
        self.save()
        
        # Status will now be 'processing' since it comes from transaction.status
        
        return transaction
    
    def approve(self):
        """Approve the transfer request"""
        if self.status == 'pending':
            transaction = self.create_transaction()
            # Transaction will be processed automatically based on auto_confirm setting
            return True
        return False
    
    def reject(self, reason=""):
        """Reject the transfer request"""
        if self.status == 'pending':
            self.rejection_reason = reason
            if self.transaction:
                self.transaction.fail_transaction(reason)
            self.save()
            return True
        return False
    
    def get_completion_message(self):
        """Get completion message from associated transaction if available"""
        if self.transaction:
            return self.transaction.get_estimated_completion_message()
        elif self.status == 'completed':
            return "Transfer completed successfully"
        elif self.status in ['pending', 'processing']:
            return f"Transfer is {self.status}"
        else:
            return f"Transfer status: {self.status}"
    
    def __str__(self):
        to_display = self.to_account.account_number if self.to_account else self.to_account_number
        return f"Transfer: {self.from_account.account_number} → {to_display} - ${self.amount}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Transfer Request"
        verbose_name_plural = "Transfer Requests"


class DepositRequest(models.Model):
    """Model for manual deposit requests created through admin interface"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Deposit Target
    to_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='deposit_requests')
    
    # Deposit Details
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    deposit_source = models.CharField(max_length=20, choices=Transaction.DEPOSIT_SOURCES)
    deposit_reference = models.CharField(max_length=100, blank=True,
                                       help_text="Check number, wire reference, etc.")
    
    # Depositor Information
    depositor_name = models.CharField(max_length=200,
                                    help_text="Name of person/entity making deposit")
    depositor_account_number = models.CharField(max_length=50, blank=True,
                                              help_text="External account number (for wire/ACH)")
    depositor_bank_name = models.CharField(max_length=200, blank=True,
                                         help_text="External bank name")
    
    # Additional Details
    description = models.TextField(blank=True, help_text="Additional notes about the deposit")
    admin_notes = models.TextField(blank=True, help_text="Internal admin notes")
    
    # Processing
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Staff tracking
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_deposits')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_deposits')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    @property
    def status(self):
        """Get status from associated transaction"""
        if self.transaction:
            return self.transaction.status
        return 'pending'
    
    def create_transaction(self):
        """Create a corresponding Transaction record"""
        if self.transaction:
            return self.transaction
        
        transaction = Transaction.objects.create(
            transaction_type='deposit',
            from_account=None,  # Deposits have no source account
            to_account=self.to_account,
            amount=self.amount,
            deposit_source=self.deposit_source,
            deposit_reference=self.deposit_reference,
            depositor_name=self.depositor_name,
            depositor_account_number=self.depositor_account_number,
            depositor_bank_name=self.depositor_bank_name,
            description=self.description,
            status='pending',
            channel='branch'  # Admin deposits are typically branch-based
        )
        
        self.transaction = transaction
        self.save()
        return transaction
    
    def approve(self, approved_by_user=None):
        """Approve the deposit request"""
        if self.status == 'pending':
            self.approved_by = approved_by_user
            self.approved_at = timezone.now()
            transaction = self.create_transaction()
            # Transaction will be processed automatically based on auto_confirm setting
            self.save()
            return True
        return False
    
    def reject(self, reason="", rejected_by_user=None):
        """Reject the deposit request"""
        if self.status == 'pending':
            self.rejection_reason = reason
            self.approved_by = rejected_by_user  # Track who rejected it
            self.approved_at = timezone.now()
            if self.transaction:
                self.transaction.fail_transaction(reason)
            self.save()
            return True
        return False
    
    def get_status_message(self):
        """Get user-friendly status message"""
        if self.transaction:
            return self.transaction.get_status_message()
        else:
            return f"Deposit request is pending review"
    
    def __str__(self):
        source_display = f" via {self.get_deposit_source_display()}" if self.deposit_source else ""
        return f"Deposit: ${self.amount} to {self.to_account.account_number}{source_display}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Deposit Request"
        verbose_name_plural = "Deposit Requests"


class Card(models.Model):
    """Enhanced bank card model (Debit/Credit cards)"""
    CARD_TYPES = [
        ('debit', 'Debit Card'),
        ('credit', 'Credit Card'),
        ('prepaid', 'Prepaid Card'),
    ]
    
    CARD_STATUS = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('blocked', 'Blocked'),
        ('expired', 'Expired'),
        ('damaged', 'Damaged'),
        ('stolen', 'Stolen'),
    ]
    
    CARD_BRANDS = [
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
        ('verve', 'Verve'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='cards')
    
    # Card Details
    card_number = models.CharField(max_length=16, unique=True, blank=True)
    card_brand = models.CharField(max_length=20, choices=CARD_BRANDS, default='verve')
    card_type = models.CharField(max_length=10, choices=CARD_TYPES, default='debit')
    card_name = models.CharField(max_length=200, blank=True)  # Name on card
    
    # Security
    expiry_date = models.DateField()
    cvv = models.CharField(max_length=3, blank=True)
    pin_hash = models.CharField(max_length=255, blank=True)  # Hashed PIN
    
    # Limits and Configuration
    status = models.CharField(max_length=20, choices=CARD_STATUS, default='active')
    daily_limit = models.DecimalField(max_digits=10, decimal_places=2, default=100000.00)
    weekly_limit = models.DecimalField(max_digits=10, decimal_places=2, default=700000.00)
    monthly_limit = models.DecimalField(max_digits=10, decimal_places=2, default=3000000.00)
    
    # Features
    international_transactions = models.BooleanField(default=False)
    online_transactions = models.BooleanField(default=True)
    contactless_enabled = models.BooleanField(default=True)
    
    # Usage Tracking
    last_used_date = models.DateTimeField(null=True, blank=True)
    failed_attempts = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    issued_date = models.DateField(default=date.today)
    
    def save(self, *args, **kwargs):
        if not self.card_number:
            self.card_number = self.generate_card_number()
        if not self.cvv:
            self.cvv = ''.join(random.choices(string.digits, k=3))
        if not self.card_name and self.account.user:
            profile = getattr(self.account.user, 'userprofile', None)
            if profile:
                self.card_name = profile.get_full_name().upper()
            else:
                self.card_name = self.account.user.get_full_name().upper()
        super().save(*args, **kwargs)
    
    def generate_card_number(self):
        """Generate a unique 16-digit card number"""
        while True:
            card_number = ''.join(random.choices(string.digits, k=16))
            if not Card.objects.filter(card_number=card_number).exists():
                return card_number
    
    def is_expired(self):
        """Check if card is expired"""
        return date.today() > self.expiry_date
    
    def __str__(self):
        return f"{self.card_type} - {self.card_number[-4:]} - {self.card_name}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Card"
        verbose_name_plural = "Cards"


class AccountStatement(models.Model):
    """Account statement generation and management"""
    STATEMENT_TYPES = [
        ('monthly', 'Monthly Statement'),
        ('quarterly', 'Quarterly Statement'),
        ('annual', 'Annual Statement'),
        ('custom', 'Custom Period'),
    ]
    
    DELIVERY_METHODS = [
        ('email', 'Email'),
        ('postal', 'Postal Mail'),
        ('download', 'Download'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='statements')
    
    # Statement Details
    statement_type = models.CharField(max_length=20, choices=STATEMENT_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    statement_date = models.DateField(default=date.today)
    
    # Balances
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2)
    closing_balance = models.DecimalField(max_digits=15, decimal_places=2)
    total_credits = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    total_debits = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    
    # Statement Generation
    is_generated = models.BooleanField(default=False)
    file_path = models.CharField(max_length=500, blank=True)
    delivery_method = models.CharField(max_length=20, choices=DELIVERY_METHODS, default='email')
    is_delivered = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    generated_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.account.account_number} - {self.statement_type} - {self.start_date} to {self.end_date}"
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['account', 'statement_type', 'start_date', 'end_date']
        verbose_name = "Account Statement"
        verbose_name_plural = "Account Statements"


class AccountNotification(models.Model):
    """Account notifications and alerts"""
    NOTIFICATION_TYPES = [
        ('transaction', 'Transaction Alert'),
        ('low_balance', 'Low Balance Alert'),
        ('large_transaction', 'Large Transaction Alert'),
        ('login', 'Login Alert'),
        ('card_transaction', 'Card Transaction Alert'),
        ('account_update', 'Account Update'),
        ('security', 'Security Alert'),
        ('maintenance', 'Maintenance Notice'),
        ('promotion', 'Promotional Message'),
    ]
    
    DELIVERY_CHANNELS = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
        ('in_app', 'In-App Notification'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='account_notifications')
    account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    
    # Notification Details
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    
    # Delivery
    delivery_channel = models.CharField(max_length=20, choices=DELIVERY_CHANNELS)
    is_sent = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)
    
    # Related Objects
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.notification_type} - {self.title}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Account Notification"
        verbose_name_plural = "Account Notifications"


class TransactionLimit(models.Model):
    """Transaction limits for different account types and customer tiers"""
    LIMIT_TYPES = [
        ('daily', 'Daily Limit'),
        ('weekly', 'Weekly Limit'),
        ('monthly', 'Monthly Limit'),
        ('yearly', 'Yearly Limit'),
        ('per_transaction', 'Per Transaction Limit'),
    ]
    
    TRANSACTION_CATEGORIES = [
        ('transfer', 'Transfers'),
        ('withdrawal', 'Withdrawals'),
        ('payment', 'Payments'),
        ('international', 'International Transactions'),
        ('card_transaction', 'Card Transactions'),
    ]
    
    # Account Configuration
    account_type = models.CharField(max_length=20, choices=BankAccount.ACCOUNT_TYPES)
    customer_tier = models.CharField(max_length=20, choices=models.TextChoices)  # Will reference UserProfile choices
    
    # Limit Configuration
    limit_type = models.CharField(max_length=20, choices=LIMIT_TYPES)
    transaction_category = models.CharField(max_length=20, choices=TRANSACTION_CATEGORIES)
    limit_amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.account_type} - {self.customer_tier} - {self.transaction_category} - {self.limit_type}: {self.limit_amount}"
    
    class Meta:
        unique_together = ['account_type', 'customer_tier', 'limit_type', 'transaction_category']
        verbose_name = "Transaction Limit"
        verbose_name_plural = "Transaction Limits"
