from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.core.validators import FileExtensionValidator
from decimal import Decimal
import uuid
import random
import string
import os
from datetime import datetime, timedelta
from django.utils import timezone


def kyc_document_upload_path(instance, filename):
    """Generate upload path for KYC documents"""
    # Create path: kyc_documents/user_id/document_type/filename
    return f'kyc_documents/{instance.user_profile.user.id}/{instance.document_type}/{filename}'


class EmailVerification(models.Model):
    """Email verification tokens for user registration"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verifications')
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = self.generate_token()
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)  # 24 hour expiry
        super().save(*args, **kwargs)
    
    def generate_token(self):
        """Generate a unique verification token"""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=64))
    
    def is_expired(self):
        """Check if token is expired"""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Check if token is valid (not used and not expired)"""
        return not self.is_used and not self.is_expired()
    
    class Meta:
        ordering = ['-created_at']


class UserProfile(models.Model):
    """Extended user profile for banking customers with KYC information"""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    MARITAL_STATUS_CHOICES = [
        ('single', 'Single'),
        ('married', 'Married'),
        ('divorced', 'Divorced'),
        ('widowed', 'Widowed'),
    ]
    
    ID_TYPE_CHOICES = [
        ('national_id', 'National ID'),
        ('passport', 'International Passport'),
        ('drivers_license', 'Driver\'s License'),
        ('voters_card', 'Voter\'s Card'),
    ]
    
    CUSTOMER_TIER_CHOICES = [
        ('standard', 'Standard'),
        ('premium', 'Premium'),
        ('vip', 'VIP'),
        ('corporate', 'Corporate'),
    ]
    
    KYC_STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('documents_required', 'Documents Required'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('additional_info_required', 'Additional Information Required'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Personal Information
    middle_name = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, unique=True)
    phone_country = models.CharField(max_length=5, default='US', help_text="Country code for phone number")
    alternative_phone = models.CharField(max_length=15, blank=True)
    alternative_phone_country = models.CharField(max_length=5, blank=True, help_text="Country code for alternative phone")
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES)
    nationality = models.CharField(max_length=100, blank=True)
    
    # Address Information
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    country = models.CharField(max_length=100, blank=True)
    
    # Identification
    id_type = models.CharField(max_length=20, choices=ID_TYPE_CHOICES)
    id_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    # id_number = models.CharField(max_length=50, unique=True)
    id_expiry_date = models.DateField(null=True, blank=True)
    
    # SSN and Additional Identification
    ssn = models.CharField(max_length=11, blank=True, help_text="Social Security Number (XXX-XX-XXXX)")
    ssn_encrypted = models.BinaryField(null=True, blank=True)  # For encrypted storage
    tax_id = models.CharField(max_length=20, blank=True, help_text="Tax Identification Number")
    
    # Additional KYC Information
    place_of_birth = models.CharField(max_length=100, blank=True)
    mother_maiden_name = models.CharField(max_length=100, blank=True)
    politically_exposed_person = models.BooleanField(default=False, help_text="Are you a Politically Exposed Person?")
    source_of_funds = models.CharField(max_length=100, blank=True, help_text="Primary source of funds")
    
    # Employment Information
    employer_name = models.CharField(max_length=200, blank=True)
    job_title = models.CharField(max_length=100, blank=True)
    employment_type = models.CharField(max_length=50, blank=True)  # Full-time, Part-time, Self-employed, etc.
    monthly_income = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    work_address = models.TextField(blank=True)
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=200, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    emergency_contact_relationship = models.CharField(max_length=100, blank=True)
    
    # Banking Information
    customer_tier = models.CharField(max_length=20, choices=CUSTOMER_TIER_CHOICES, default='standard')
    account_officer = models.CharField(max_length=200, blank=True)
    preferred_branch = models.CharField(max_length=200, blank=True)
    transfer_pin_hash = models.CharField(max_length=255, blank=True, help_text="Hashed 4-digit transfer PIN")
    
    # KYC and Compliance
    is_verified = models.BooleanField(default=False)
    kyc_status = models.CharField(max_length=30, choices=KYC_STATUS_CHOICES, default='pending')
    risk_profile = models.CharField(max_length=20, default='low')  # low, medium, high
    pep_status = models.BooleanField(default=False)  # Politically Exposed Person
    aml_check_status = models.CharField(max_length=20, default='pending')
    kyc_rejection_reason = models.TextField(blank=True)  # Reason for KYC rejection
    kyc_notes = models.TextField(blank=True)  # Internal notes for KYC review
    
    # Preferences
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=True)
    statement_delivery = models.CharField(max_length=20, default='email')  # email, postal, both
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    kyc_completed_at = models.DateTimeField(null=True, blank=True)
    kyc_reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.phone_number}"
    
    def get_full_name(self):
        """Get full name including middle name"""
        names = [self.user.first_name, self.middle_name, self.user.last_name]
        return ' '.join(filter(None, names))
    
    def get_kyc_completion_percentage(self):
        """Calculate KYC completion percentage based on international requirements"""
        # Determine if user is U.S.-based (simplified check based on country)
        is_us_client = self.country and self.country.upper() in ['US', 'USA', 'UNITED STATES']
        
        if is_us_client:
            # U.S. clients require: Government ID + Address Proof + SSN/ITIN + Selfie
            required_categories = [
                ['government_id_us_drivers_license', 'government_id_us_state_id', 'government_id_us_passport'],
                ['proof_address_utility_bill', 'proof_address_bank_statement', 'proof_address_lease_agreement', 'proof_address_mortgage_statement'],
                ['us_ssn_card', 'us_itin_letter'],
                ['selfie_with_id']
            ]
        else:
            # Non-U.S. clients require: Government ID + Address Proof + Selfie
            required_categories = [
                ['government_id_passport', 'government_id_national_id', 'government_id_drivers_license'],
                ['proof_address_utility_bill', 'proof_address_bank_statement', 'proof_address_credit_card_statement', 'proof_address_lease_agreement'],
                ['selfie_with_id']
            ]
        
        uploaded_docs = self.kyc_documents.filter(
            verification_status='approved'
        ).values_list('document_type', flat=True)
        
        completed_categories = 0
        for category in required_categories:
            if any(doc_type in uploaded_docs for doc_type in category):
                completed_categories += 1
        
        completion = (completed_categories / len(required_categories)) * 100
        return min(completion, 100)
    
    def has_required_kyc_documents(self):
        """Check if user has uploaded all required KYC documents based on residency"""
        # Determine if user is U.S.-based
        is_us_client = self.country and self.country.upper() in ['US', 'USA', 'UNITED STATES']
        
        if is_us_client:
            # U.S. clients require all 4 categories
            required_categories = [
                ['government_id_us_drivers_license', 'government_id_us_state_id', 'government_id_us_passport'],
                ['proof_address_utility_bill', 'proof_address_bank_statement', 'proof_address_lease_agreement', 'proof_address_mortgage_statement'],
                ['us_ssn_card', 'us_itin_letter'],
                ['selfie_with_id']
            ]
        else:
            # Non-U.S. clients require 3 categories
            required_categories = [
                ['government_id_passport', 'government_id_national_id', 'government_id_drivers_license'],
                ['proof_address_utility_bill', 'proof_address_bank_statement', 'proof_address_credit_card_statement', 'proof_address_lease_agreement'],
                ['selfie_with_id']
            ]
        
        uploaded_docs = self.kyc_documents.filter(
            verification_status='approved'
        ).values_list('document_type', flat=True)
        
        # Check if each required category has at least one document
        for category in required_categories:
            if not any(doc_type in uploaded_docs for doc_type in category):
                return False
        
        return True
    
    def requires_profile_completion(self):
        """Check if user needs to complete additional profile information"""
        # Check if username is still auto-generated (contains underscore and timestamp)
        username_needs_update = '_' in self.user.username and self.user.username.split('_')[-1].isdigit()
        
        # Check if any required fields are missing (all fields required for Complete Profile)
        missing_required_fields = (
            not self.middle_name or
            not self.nationality or
            not self.address or
            not self.city or
            not self.state or
            not self.postal_code or
            not self.id_type or
            not self.id_number or
            not self.job_title or
            not self.employment_type or
            not self.work_address or
            not self.preferred_branch
        )
        
        return username_needs_update or missing_required_fields

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"


class KYCDocument(models.Model):
    """Model for storing KYC documents with international compliance"""
    DOCUMENT_TYPE_CHOICES = [
        # Core Identity Documents (Required for all clients)
        ('government_id_us_drivers_license', 'U.S. Driver\'s License'),
        ('government_id_us_state_id', 'U.S. State-issued ID'),
        ('government_id_us_passport', 'U.S. Passport'),
        ('government_id_passport', 'International Passport'),
        ('government_id_national_id', 'National ID Card'),
        ('government_id_drivers_license', 'Driver\'s License (Non-U.S.)'),
        
        # Proof of Address Documents (Required for all clients)
        ('proof_address_utility_bill', 'Utility Bill (Water/Electricity/Gas)'),
        ('proof_address_bank_statement', 'Bank Statement'),
        ('proof_address_credit_card_statement', 'Credit Card Statement'),
        ('proof_address_lease_agreement', 'Lease/Rental Agreement'),
        ('proof_address_mortgage_statement', 'Mortgage Statement'),
        
        # U.S.-Specific Tax Documents (Required for U.S. clients)
        ('us_ssn_card', 'Social Security Number (SSN) Card'),
        ('us_itin_letter', 'IRS ITIN Letter'),
        ('us_w2_form', 'W-2 Tax Form'),
        ('us_1099_form', '1099 Tax Form'),
        ('us_tax_return', 'U.S. Tax Return'),
        
        # Verification Documents (Required for all clients)
        ('selfie_with_id', 'Selfie with Government ID'),
        
        # Additional Supporting Documents (Optional)
        ('employment_verification', 'Employment Verification Letter'),
        ('income_statement', 'Income Statement/Pay Stub'),
        ('birth_certificate', 'Birth Certificate'),
        ('other_supporting', 'Other Supporting Document'),
    ]
    
    VERIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('requires_resubmission', 'Requires Resubmission'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='kyc_documents')
    
    # Document Information
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    document_name = models.CharField(max_length=200)
    document_file = models.FileField(
        upload_to=kyc_document_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])]
    )
    file_size = models.PositiveIntegerField(null=True, blank=True)  # Size in bytes
    
    # Verification Information
    verification_status = models.CharField(max_length=25, choices=VERIFICATION_STATUS_CHOICES, default='pending')
    is_approved = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True)
    reviewer_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_documents')
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)  # For documents with expiry
    
    def save(self, *args, **kwargs):
        if self.document_file:
            self.file_size = self.document_file.size
            if not self.document_name:
                self.document_name = os.path.basename(self.document_file.name)
        super().save(*args, **kwargs)
    
    def get_file_size_display(self):
        """Return human-readable file size"""
        if not self.file_size:
            return "Unknown"
        
        # Make a copy to avoid modifying the original value
        size = float(self.file_size)
        
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    
    def __str__(self):
        return f"{self.user_profile.user.get_full_name()} - {self.get_document_type_display()}"
    
    class Meta:
        ordering = ['-uploaded_at']
        unique_together = ['user_profile', 'document_type']  # One document per type per user
        verbose_name = "KYC Document"
        verbose_name_plural = "KYC Documents"


class BankAccount(models.Model):
    """Enhanced bank account model for professional banking"""
    ACCOUNT_TYPES = [
        ('savings', 'Savings Account'),
        ('current', 'Current Account'),
        ('fixed_deposit', 'Fixed Deposit'),
        ('foreign_currency', 'Foreign Currency Account'),
        ('joint', 'Joint Account'),
        ('corporate', 'Corporate Account'),
    ]
    
    ACCOUNT_STATUS = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('closed', 'Closed'),
        ('dormant', 'Dormant'),
    ]
    
    CURRENCY_CHOICES = [
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
        ('GBP', 'British Pound'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bank_accounts')
    
    # Account Details
    account_number = models.CharField(max_length=20, unique=True, blank=True)
    account_name = models.CharField(max_length=200, blank=True)  # For corporate accounts
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES, default='savings')
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD')
    
    # Balances
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    available_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    hold_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    # Account Configuration
    minimum_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('1000.00'))
    daily_transaction_limit = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('500000.00'))
    monthly_transaction_limit = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('10000000.00'))
    
    # Interest and Fees
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('2.50'))  # Annual interest rate
    monthly_maintenance_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('100.00'))
    overdraft_limit = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    # Account Management
    status = models.CharField(max_length=20, choices=ACCOUNT_STATUS, default='active')
    account_officer = models.CharField(max_length=200, blank=True)
    branch_code = models.CharField(max_length=10, blank=True)
    purpose_of_account = models.TextField(blank=True)
    source_of_funds = models.CharField(max_length=200, blank=True)
    
    # Flags and Settings
    is_joint_account = models.BooleanField(default=False)
    requires_two_signatures = models.BooleanField(default=False)
    allow_online_transactions = models.BooleanField(default=True)
    allow_international_transactions = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_transaction_date = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.account_number:
            self.account_number = self.generate_account_number()
        if not self.account_name and self.user:
            profile = getattr(self.user, 'userprofile', None)
            if profile:
                self.account_name = profile.get_full_name()
            else:
                self.account_name = self.user.get_full_name()
        # Calculate available balance
        self.available_balance = self.balance - self.hold_balance
        super().save(*args, **kwargs)
    
    def generate_account_number(self):
        """Generate a unique 10-digit account number"""
        while True:
            account_number = ''.join(random.choices(string.digits, k=getattr(settings, 'ACCOUNT_NUMBER_LENGTH', 10)))
            if not BankAccount.objects.filter(account_number=account_number).exists():
                return account_number
    
    def can_debit(self, amount):
        """Check if account can be debited for the specified amount"""
        return (self.available_balance + self.overdraft_limit) >= amount
    
    def __str__(self):
        return f"{self.account_name or self.user.get_full_name()} - {self.account_number}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Bank Account"
        verbose_name_plural = "Bank Accounts"


class AccountBeneficiary(models.Model):
    """Account beneficiaries for inheritance purposes"""
    account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='beneficiaries')
    
    # Beneficiary Details
    full_name = models.CharField(max_length=200)
    relationship = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField()
    
    # Beneficiary Configuration
    percentage_share = models.DecimalField(max_digits=5, decimal_places=2)  # 0.00 to 100.00
    is_primary = models.BooleanField(default=False)
    
    # Identification
    id_type = models.CharField(max_length=20, choices=UserProfile.ID_TYPE_CHOICES)
    id_number = models.CharField(max_length=50)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.full_name} - {self.account.account_number} ({self.percentage_share}%)"
    
    class Meta:
        verbose_name = "Account Beneficiary"
        verbose_name_plural = "Account Beneficiaries"


class SecurityQuestion(models.Model):
    """Security questions for additional authentication"""
    QUESTION_CHOICES = [
        ('mother_maiden_name', 'What is your mother\'s maiden name?'),
        ('first_pet_name', 'What was the name of your first pet?'),
        ('birth_city', 'In which city were you born?'),
        ('first_school', 'What was the name of your first school?'),
        ('favorite_color', 'What is your favorite color?'),
        ('childhood_nickname', 'What was your childhood nickname?'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='security_questions')
    question = models.CharField(max_length=50, choices=QUESTION_CHOICES)
    answer_hash = models.CharField(max_length=255)  # Store hashed answer for security
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'question']
        verbose_name = "Security Question"
        verbose_name_plural = "Security Questions"


class LoginHistory(models.Model):
    """Track user login history for security"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history')
    
    # Login Details
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    device_info = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)
    
    # Status
    login_successful = models.BooleanField(default=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    login_time = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.login_time} - {self.ip_address}"
    
    class Meta:
        ordering = ['-login_time']
        verbose_name = "Login History"
        verbose_name_plural = "Login Histories"
