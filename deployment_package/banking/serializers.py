from rest_framework import serializers
from .models import Transaction, TransferRequest, Card, DepositRequest
from accounts.models import BankAccount
from accounts.serializers import BankAccountSerializer


class TransactionSerializer(serializers.ModelSerializer):
    from_account_number = serializers.CharField(source='from_account.account_number', read_only=True)
    to_account_number = serializers.CharField(source='to_account.account_number', read_only=True)
    from_account_name = serializers.CharField(source='from_account.account_name', read_only=True)
    to_account_name = serializers.CharField(source='to_account.account_name', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    channel_display = serializers.CharField(source='get_channel_display', read_only=True)
    
    # Status and confirmation information
    status_message = serializers.SerializerMethodField()
    can_be_processed = serializers.SerializerMethodField()
    estimated_completion = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'reference', 'from_account', 'to_account',
            'from_account_number', 'to_account_number', 'from_account_name', 'to_account_name',
            'transaction_type', 'transaction_type_display', 'amount', 'fee', 'total_amount', 'currency',
            'description', 'narration', 'channel', 'channel_display',
            'status', 'status_display', 'auto_confirm', 'confirmation_delay_hours',
            'from_balance_before', 'from_balance_after', 'to_balance_before', 'to_balance_after',
            'created_at', 'updated_at', 'confirmed_at', 'processed_at', 'completed_at', 'failed_at',
            'expected_completion_date', 'failure_reason',
            'deposit_source', 'deposit_reference', 'depositor_name', 'depositor_account_number', 'depositor_bank_name',
            # New fields for external transfers and recipient details
            'recipient_name', 'recipient_account_number', 'recipient_bank_name', 'routing_number', 'swift_code',
            'external_reference', 'purpose_code',
            # Card-related fields
            'card_last_four', 'card_brand',
            # Status messaging
            'status_message',
            # Computed fields
            'can_be_processed', 'estimated_completion'
        ]
        read_only_fields = [
            'id', 'reference', 'fee', 'total_amount', 'narration',
            'from_balance_before', 'from_balance_after', 'to_balance_before', 'to_balance_after',
            'created_at', 'updated_at', 'confirmed_at', 'processed_at', 'completed_at', 'failed_at',
            'expected_completion_date', 'failure_reason'
        ]
    
    def get_status_message(self, obj):
        return obj.get_status_message()
    
    def get_can_be_processed(self, obj):
        return obj.can_be_processed()
    
    def get_estimated_completion(self, obj):
        return obj.get_estimated_completion()


class TransferRequestSerializer(serializers.ModelSerializer):
    from_account_number = serializers.CharField(source='from_account.account_number', read_only=True)
    from_account_name = serializers.CharField(source='from_account.account_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    transfer_type_display = serializers.CharField(source='get_transfer_type_display', read_only=True)
    completion_message = serializers.SerializerMethodField()
    transfer_fee = serializers.SerializerMethodField()
    
    class Meta:
        model = TransferRequest
        fields = [
            'id', 'from_account', 'from_account_number', 'from_account_name',
            'to_account_number', 'to_account', 'to_bank_name', 'to_routing_number', 'to_swift_code',
            'beneficiary_name', 'beneficiary_address', 'amount', 'transfer_fee',
            'transfer_type', 'transfer_type_display', 'description',
            'status', 'status_display', 'transaction', 'rejection_reason',
            'created_at', 'updated_at',
            'completion_message'
        ]
        read_only_fields = [
            'id', 'from_account', 'to_account', 'transaction',
            'created_at', 'updated_at'
        ]
    
    def get_completion_message(self, obj):
        return obj.get_completion_message()
    
    def get_transfer_fee(self, obj):
        return float(obj.get_transfer_fee())


class CreateTransferSerializer(serializers.Serializer):
    from_account_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)  # Changed to CharField to handle UUIDs
    to_account_number = serializers.CharField(max_length=20)
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=0.01)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return value
    
    def validate_from_account_id(self, value):
        # Allow None/null/empty values for backward compatibility
        if value and value.strip():
            # Validate that it's a valid UUID or integer
            try:
                import uuid
                uuid.UUID(value)  # Try to parse as UUID
            except ValueError:
                try:
                    int(value)  # Try to parse as integer
                except ValueError:
                    raise serializers.ValidationError("from_account_id must be a valid UUID or integer")
        return value


class ExternalTransferSerializer(serializers.Serializer):
    """Serializer for external bank transfers (ACH/SWIFT)"""
    
    # Basic transfer details
    to_account_number = serializers.CharField(max_length=34)  # Support IBAN length
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=0.01)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)
    beneficiary_name = serializers.CharField(max_length=200)
    
    # Transfer type
    transfer_type = serializers.ChoiceField(choices=[
        ('domestic_external', 'Domestic External Transfer'),
        ('international', 'International Transfer')
    ])
    
    # ACH fields (for domestic_external)
    to_routing_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    to_bank_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    
    # SWIFT fields (for international)
    to_swift_code = serializers.CharField(max_length=11, required=False, allow_blank=True)
    to_iban = serializers.CharField(max_length=34, required=False, allow_blank=True)
    beneficiary_address = serializers.CharField(required=False, allow_blank=True)
    beneficiary_country = serializers.CharField(max_length=3, required=False, allow_blank=True)
    currency = serializers.CharField(max_length=3, default='USD')
    purpose_code = serializers.CharField(max_length=10, required=False, allow_blank=True)
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        if value > 50000:  # Mock limit for external transfers
            raise serializers.ValidationError("Amount exceeds maximum limit for external transfers ($50,000)")
        return value
    
    def validate(self, data):
        transfer_type = data.get('transfer_type')
        
        if transfer_type == 'domestic_external':
            # ACH transfers require routing number
            if not data.get('to_routing_number'):
                raise serializers.ValidationError("Routing number is required for domestic external transfers")
            if not data.get('to_bank_name'):
                raise serializers.ValidationError("Bank name is required for domestic external transfers")
                
        elif transfer_type == 'international':
            # SWIFT transfers require SWIFT code or IBAN
            if not data.get('to_swift_code') and not data.get('to_iban'):
                raise serializers.ValidationError("SWIFT code or IBAN is required for international transfers")
            if not data.get('beneficiary_address'):
                raise serializers.ValidationError("Beneficiary address is required for international transfers")
            if not data.get('beneficiary_country'):
                raise serializers.ValidationError("Beneficiary country is required for international transfers")
        
        return data


class CreateCardSerializer(serializers.Serializer):
    card_type = serializers.ChoiceField(choices=[
        ('debit', 'Debit Card'),
        ('credit', 'Credit Card'),
        ('prepaid', 'Prepaid Card')
    ])
    card_brand = serializers.ChoiceField(choices=[
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
        ('verve', 'Verve')
    ], required=True)
    card_name = serializers.CharField(max_length=200, required=False)
    daily_limit = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class DepositSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=0.01)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return value


class WithdrawalSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=0.01)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return value


class CardSerializer(serializers.ModelSerializer):
    account_number = serializers.CharField(source='account.account_number', read_only=True)
    card_type_display = serializers.CharField(source='get_card_type_display', read_only=True)
    card_brand_display = serializers.CharField(source='get_card_brand_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    masked_card_number = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = Card
        fields = [
            'id', 'account', 'account_number',
            'card_number', 'masked_card_number', 'card_brand', 'card_brand_display',
            'card_type', 'card_type_display', 'card_name',
            'expiry_date', 'status', 'status_display',
            'daily_limit', 'weekly_limit', 'monthly_limit',
            'international_transactions', 'online_transactions', 'contactless_enabled',
            'last_used_date', 'failed_attempts',
            'created_at', 'updated_at', 'issued_date', 'is_expired'
        ]
        read_only_fields = [
            'id', 'card_number', 'cvv', 'pin_hash', 'created_at', 'updated_at'
        ]
    
    def get_masked_card_number(self, obj):
        if obj.card_number:
            return f"****-****-****-{obj.card_number[-4:]}"
        return None
    
    def get_is_expired(self, obj):
        return obj.is_expired()


class DepositRequestSerializer(serializers.ModelSerializer):
    to_account_number = serializers.CharField(source='to_account.account_number', read_only=True)
    to_account_name = serializers.CharField(source='to_account.account_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    deposit_source_display = serializers.CharField(source='get_deposit_source_display', read_only=True)
    status_message = serializers.SerializerMethodField()
    
    class Meta:
        model = DepositRequest
        fields = [
            'id', 'to_account', 'to_account_number', 'to_account_name',
            'amount', 'deposit_source', 'deposit_source_display', 'deposit_reference',
            'depositor_name', 'depositor_account_number', 'depositor_bank_name',
            'description', 'admin_notes', 'status', 'status_display',
            'status_message', 'transaction', 'rejection_reason',
            'created_by', 'approved_by', 'created_at', 'updated_at', 'approved_at'
        ]
        read_only_fields = [
            'id', 'transaction', 'created_at', 'updated_at', 'approved_at'
        ]
    
    def get_status_message(self, obj):
        return obj.get_status_message() 