from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.conf import settings
from .models import UserProfile, BankAccount, AccountBeneficiary, SecurityQuestion, LoginHistory, KYCDocument


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'is_active']
        read_only_fields = ['id', 'date_joined', 'is_active']


class KYCDocumentSerializer(serializers.ModelSerializer):
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    verification_status_display = serializers.CharField(source='get_verification_status_display', read_only=True)
    file_size_display = serializers.CharField(source='get_file_size_display', read_only=True)
    document_url = serializers.SerializerMethodField()
    
    class Meta:
        model = KYCDocument
        fields = [
            'id', 'document_type', 'document_type_display', 'document_name', 
            'document_file', 'document_url', 'file_size', 'file_size_display',
            'verification_status', 'verification_status_display', 'is_approved',
            'rejection_reason', 'reviewer_notes', 'uploaded_at', 'reviewed_at', 'expires_at'
        ]
        read_only_fields = [
            'id', 'file_size', 'verification_status', 'is_approved', 'rejection_reason',
            'reviewer_notes', 'uploaded_at', 'reviewed_at'
        ]
    
    def get_document_url(self, obj):
        if obj.document_file and hasattr(obj.document_file, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.document_file.url)
            return obj.document_file.url
        return None


class KYCDocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCDocument
        fields = ['document_type', 'document_file']
    
    def validate_document_file(self, value):
        # Check file size
        if value.size > getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024):
            raise serializers.ValidationError(
                f"File size cannot exceed {getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024) / (1024 * 1024):.0f}MB"
            )
        
        # Check file extension
        allowed_extensions = getattr(settings, 'ALLOWED_FILE_EXTENSIONS', ['pdf', 'jpg', 'jpeg', 'png'])
        extension = value.name.split('.')[-1].lower()
        if extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"File type not supported. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        return value
    
    def create(self, validated_data):
        # Get user profile from context
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required")
        
        try:
            user_profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError("User profile not found")
        
        # Check if document of this type already exists
        document_type = validated_data['document_type']
        existing_doc = KYCDocument.objects.filter(
            user_profile=user_profile,
            document_type=document_type
        ).first()
        
        if existing_doc:
            # Update existing document
            existing_doc.document_file = validated_data['document_file']
            existing_doc.verification_status = 'pending'
            existing_doc.is_approved = False
            existing_doc.rejection_reason = ''
            existing_doc.reviewer_notes = ''
            existing_doc.save()
            return existing_doc
        else:
            # Create new document
            validated_data['user_profile'] = user_profile
            return super().create(validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    kyc_completion_percentage = serializers.SerializerMethodField()
    has_required_documents = serializers.SerializerMethodField()
    kyc_documents = KYCDocumentSerializer(many=True, read_only=True)
    kyc_status_display = serializers.CharField(source='get_kyc_status_display', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 'full_name', 'middle_name', 'phone_number', 'alternative_phone',
            'date_of_birth', 'age', 'gender', 'marital_status', 'nationality',
            'address', 'city', 'state', 'postal_code', 'country',
            'id_type', 'id_number', 'id_expiry_date',
            'employer_name', 'job_title', 'employment_type', 'monthly_income', 'work_address',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            'customer_tier', 'account_officer', 'preferred_branch',
            'is_verified', 'kyc_status', 'kyc_status_display', 'risk_profile', 'pep_status', 'aml_check_status',
            'kyc_rejection_reason', 'kyc_notes',
            'email_notifications', 'sms_notifications', 'statement_delivery',
            'created_at', 'updated_at', 'kyc_completed_at', 'kyc_reviewed_at',
            'kyc_completion_percentage', 'has_required_documents', 'kyc_documents'
        ]
        read_only_fields = [
            'is_verified', 'kyc_status', 'risk_profile', 'pep_status', 'aml_check_status',
            'customer_tier', 'account_officer', 'kyc_rejection_reason', 'kyc_notes',
            'created_at', 'updated_at', 'kyc_completed_at', 'kyc_reviewed_at'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_age(self, obj):
        from datetime import date
        if obj.date_of_birth:
            today = date.today()
            return today.year - obj.date_of_birth.year - ((today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day))
        return None
    
    def get_kyc_completion_percentage(self, obj):
        return obj.get_kyc_completion_percentage()
    
    def get_has_required_documents(self, obj):
        return obj.has_required_kyc_documents()


class BankAccountSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    account_age_days = serializers.SerializerMethodField()
    is_overdraft_available = serializers.SerializerMethodField()
    
    class Meta:
        model = BankAccount
        fields = [
            'id', 'user', 'account_number', 'account_name', 'account_type', 'currency',
            'balance', 'available_balance', 'hold_balance',
            'minimum_balance', 'daily_transaction_limit', 'monthly_transaction_limit',
            'interest_rate', 'monthly_maintenance_fee', 'overdraft_limit',
            'status', 'account_officer', 'branch_code', 'purpose_of_account', 'source_of_funds',
            'is_joint_account', 'requires_two_signatures', 'allow_online_transactions', 'allow_international_transactions',
            'created_at', 'updated_at', 'last_transaction_date', 'account_age_days', 'is_overdraft_available'
        ]
        read_only_fields = [
            'id', 'account_number', 'balance', 'available_balance', 'hold_balance',
            'created_at', 'updated_at', 'last_transaction_date', 'account_age_days'
        ]
    
    def get_account_age_days(self, obj):
        from datetime import date
        return (date.today() - obj.created_at.date()).days
    
    def get_is_overdraft_available(self, obj):
        return obj.overdraft_limit > 0


class AccountBeneficiarySerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountBeneficiary
        fields = [
            'id', 'account', 'full_name', 'relationship', 'phone_number', 'email', 'address',
            'percentage_share', 'is_primary', 'id_type', 'id_number',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SecurityQuestionSerializer(serializers.ModelSerializer):
    question_display = serializers.CharField(source='get_question_display', read_only=True)
    
    class Meta:
        model = SecurityQuestion
        fields = ['id', 'question', 'question_display', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class LoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHistory
        fields = [
            'id', 'ip_address', 'user_agent', 'device_info', 'location',
            'login_successful', 'login_time', 'logout_time'
        ]
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    # Profile fields
    middle_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    phone_number = serializers.CharField(max_length=20)
    phone_country = serializers.CharField(max_length=5, required=False, default='US')
    alternative_phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    date_of_birth = serializers.DateField()
    gender = serializers.ChoiceField(choices=UserProfile.GENDER_CHOICES)
    marital_status = serializers.ChoiceField(choices=UserProfile.MARITAL_STATUS_CHOICES)
    nationality = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    # Address
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    postal_code = serializers.CharField(max_length=10)
    country = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    # Employment (optional for individual accounts)
    employer_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    job_title = serializers.CharField(max_length=100, required=False, allow_blank=True)
    employment_type = serializers.CharField(max_length=50, required=False, allow_blank=True)
    monthly_income = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True)
    work_address = serializers.CharField(required=False, allow_blank=True)
    
    # Emergency contact
    emergency_contact_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    emergency_contact_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    emergency_contact_relationship = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    # Preferences
    email_notifications = serializers.BooleanField(default=True)
    sms_notifications = serializers.BooleanField(default=True)
    statement_delivery = serializers.ChoiceField(
        choices=[('email', 'Email'), ('postal', 'Postal'), ('both', 'Both')],
        default='email'
    )
    
    # Account preferences
    account_type = serializers.ChoiceField(choices=BankAccount.ACCOUNT_TYPES, default='savings')
    preferred_branch = serializers.CharField(max_length=200, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 
            'password', 'password_confirm',
            # Profile fields
            'middle_name', 'phone_number', 'phone_country', 'alternative_phone', 'date_of_birth', 
            'gender', 'marital_status', 'nationality',
            # Address
            'address', 'city', 'state', 'postal_code', 'country',
            # Employment (optional for registration)
            'employer_name', 'job_title', 'employment_type', 'monthly_income', 'work_address',
            # Emergency contact (optional for registration)
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            # Preferences
            'email_notifications', 'sms_notifications', 'statement_delivery', 'account_type', 'preferred_branch'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        
        # Validate age (minimum 18 years for account opening)
        from datetime import date
        today = date.today()
        age = today.year - attrs['date_of_birth'].year - ((today.month, today.day) < (attrs['date_of_birth'].month, attrs['date_of_birth'].day))
        if age < 18:
            raise serializers.ValidationError("You must be at least 18 years old to open an account.")
        
        # Validate ID expiry date
        if attrs.get('id_expiry_date') and attrs['id_expiry_date'] <= today:
            raise serializers.ValidationError("ID document has expired.")
        
        return attrs
    
    def create(self, validated_data):
        # Remove password_confirm and profile fields
        password_confirm = validated_data.pop('password_confirm')
        
        # Extract profile data
        profile_fields = [
            'middle_name', 'phone_number', 'phone_country', 'alternative_phone', 'alternative_phone_country', 'date_of_birth', 
            'gender', 'marital_status', 'nationality',
            'address', 'city', 'state', 'postal_code', 'country',
            'employer_name', 'job_title', 'employment_type', 'monthly_income', 'work_address',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            'email_notifications', 'sms_notifications', 'statement_delivery', 'preferred_branch'
        ]
        
        profile_data = {}
        for field in profile_fields:
            if field in validated_data:
                profile_data[field] = validated_data.pop(field)
        
        account_type = validated_data.pop('account_type', 'savings')
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Create user profile with documents_required status
        profile_data['kyc_status'] = 'documents_required'
        UserProfile.objects.create(user=user, **profile_data)
        
        # Create default bank account
        BankAccount.objects.create(user=user, account_type=account_type)
        
        return user


class KYCUpdateSerializer(serializers.ModelSerializer):
    """Serializer for KYC information updates"""
    class Meta:
        model = UserProfile
        fields = [
            'id_type', 'id_number', 'id_expiry_date',
            'employer_name', 'job_title', 'employment_type', 'monthly_income', 'work_address'
        ]
    
    def validate_id_expiry_date(self, value):
        from datetime import date
        if value and value <= date.today():
            raise serializers.ValidationError("ID document has expired.")
        return value


class CreateSecurityQuestionSerializer(serializers.Serializer):
    """Serializer for creating security questions"""
    question = serializers.ChoiceField(choices=SecurityQuestion.QUESTION_CHOICES)
    answer = serializers.CharField(max_length=200, write_only=True)
    
    def create(self, validated_data):
        user = self.context['request'].user
        question = validated_data['question']
        answer = validated_data['answer']
        
        # Hash the answer for security
        answer_hash = make_password(answer.lower().strip())
        
        security_question, created = SecurityQuestion.objects.update_or_create(
            user=user,
            question=question,
            defaults={'answer_hash': answer_hash}
        )
        
        return security_question


class KYCStatusSerializer(serializers.Serializer):
    """Serializer for checking KYC status"""
    kyc_status = serializers.CharField(read_only=True)
    kyc_completion_percentage = serializers.FloatField(read_only=True)
    has_required_documents = serializers.BooleanField(read_only=True)
    required_documents = serializers.ListField(read_only=True)
    uploaded_documents = serializers.ListField(read_only=True) 


class ProfileCompletionSerializer(serializers.ModelSerializer):
    """Serializer for profile completion after email verification (KYC-free, 3-step)"""
    username = serializers.CharField(source='user.username')
    # Step 1: Personal Information
    middle_name = serializers.CharField(max_length=100, required=True)
    phone_number = serializers.CharField(max_length=20, required=True)
    phone_country = serializers.CharField(max_length=5, required=True)
    nationality = serializers.CharField(max_length=100, required=True)
    country = serializers.CharField(max_length=100, required=True)
    date_of_birth = serializers.DateField(required=True)
    gender = serializers.ChoiceField(
        choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')],
        required=True
    )
    marital_status = serializers.ChoiceField(
        choices=[
            ('single', 'Single'),
            ('married', 'Married'),
            ('divorced', 'Divorced'),
            ('widowed', 'Widowed'),
        ],
        required=True
    )
    # Address Information
    address = serializers.CharField(required=True)
    city = serializers.CharField(max_length=100, required=True)
    state = serializers.CharField(max_length=100, required=True)
    postal_code = serializers.CharField(max_length=10, required=True)
    # Identification
    id_type = serializers.ChoiceField(
        choices=[
            ('national_id', 'National ID'),
            ('passport', 'International Passport'),
            ('drivers_license', "Driver's License"),
            ('voters_card', "Voter's Card"),
        ],
        required=True
    )
    id_number = serializers.CharField(max_length=50, required=True)
    # Step 2: Employment Information  
    job_title = serializers.CharField(max_length=100, required=True)
    employment_type = serializers.CharField(max_length=50, required=True)
    work_address = serializers.CharField(required=True)
    # Optional fields
    alternative_phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    emergency_contact_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    emergency_contact_phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    emergency_contact_relationship = serializers.CharField(max_length=100, required=False, allow_blank=True)
    # Step 3: Preferences
    preferred_branch = serializers.CharField(max_length=200, required=True)
    email_notifications = serializers.BooleanField(default=True)
    sms_notifications = serializers.BooleanField(default=True)
    statement_delivery = serializers.ChoiceField(
        choices=[('email', 'Email'), ('postal', 'Postal'), ('both', 'Both')],
        default='email'
    )
    language = serializers.CharField(max_length=50, required=False, allow_blank=True)

    class Meta:
        model = UserProfile
        fields = [
            'username', 'middle_name', 'phone_number', 'phone_country', 'nationality', 'country',
            'date_of_birth', 'gender', 'marital_status',
            'address', 'city', 'state', 'postal_code',
            'id_type', 'id_number',
            'job_title', 'employment_type', 'work_address',
            'alternative_phone',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            'preferred_branch', 'email_notifications', 'sms_notifications', 'statement_delivery', 'language'
        ]

    def update(self, instance, validated_data):
        # Handle username update separately - it's nested under 'user'
        user_data = validated_data.pop('user', {})
        if 'username' in user_data:
            instance.user.username = user_data['username']
            instance.user.save()
        
        # Update profile fields - exclude any nested user data
        for attr, value in validated_data.items():
            if attr != 'user':  # Skip user data as it's handled above
                setattr(instance, attr, value)
        
        instance.save()
        return instance

    def validate(self, attrs):
        # Only validate fields that are actually provided in the request
        # This allows for partial updates and step-by-step completion
        
        # Check for fields that are required but empty (not just missing)
        validation_errors = {}
        
        # Username validation
        if 'username' in attrs and not attrs['username'].strip():
            validation_errors['username'] = 'Username cannot be empty.'
            
        # Personal information validation
        required_personal_fields = [
            'middle_name', 'phone_number', 'phone_country', 'nationality', 'country',
            'date_of_birth', 'gender', 'marital_status'
        ]
        for field in required_personal_fields:
            if field in attrs and not str(attrs[field]).strip():
                validation_errors[field] = f'{field.replace("_", " ").title()} is required.'
        
        # Address validation
        required_address_fields = ['address', 'city', 'state', 'postal_code']
        for field in required_address_fields:
            if field in attrs and not str(attrs[field]).strip():
                validation_errors[field] = f'{field.replace("_", " ").title()} is required.'
        
        # ID validation
        required_id_fields = ['id_type', 'id_number']
        for field in required_id_fields:
            if field in attrs and not str(attrs[field]).strip():
                validation_errors[field] = f'{field.replace("_", " ").title()} is required.'
        
        # Employment validation
        required_employment_fields = ['job_title', 'employment_type', 'work_address']
        for field in required_employment_fields:
            if field in attrs and not str(attrs[field]).strip():
                validation_errors[field] = f'{field.replace("_", " ").title()} is required.'
        
        # Preference validation
        if 'preferred_branch' in attrs and not str(attrs['preferred_branch']).strip():
            validation_errors['preferred_branch'] = 'Preferred branch is required.'
        
        if validation_errors:
            raise serializers.ValidationError(validation_errors)
            
        return attrs