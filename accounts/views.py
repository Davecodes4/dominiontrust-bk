from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.conf import settings
from django.urls import reverse
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from decimal import Decimal
import json
from datetime import datetime, timedelta
from .models import UserProfile, BankAccount, LoginHistory, EmailVerification, KYCDocument
from .serializers import UserRegistrationSerializer, UserSerializer, UserProfileSerializer, BankAccountSerializer, KYCDocumentSerializer
from banking.models import Transaction
from banking.serializers import TransactionSerializer
from notifications.services import NotificationService
from django.db.models import Sum, Q
from .serializers import KYCUpdateSerializer, KYCDocumentUploadSerializer, KYCDocumentSerializer, LoginHistorySerializer, ProfileCompletionSerializer
from .models import KYCDocument
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


def _get_client_ip(request):
    """Get client IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class RegisterView(generics.CreateAPIView):
    """Enhanced user registration endpoint with email verification"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create inactive user (will be activated after email verification)
        user = serializer.save()
        user.is_active = False
        user.save()
        
        # Create email verification token
        verification = EmailVerification.objects.create(user=user)
        
        # Send verification email
        self._send_verification_email(user, verification.token, request)
        
        return Response({
            'message': 'Registration successful! Please check your email to verify your account.',
            'email': user.email,
            'verification_required': True,
            'next_step': 'email_verification'
        }, status=status.HTTP_201_CREATED)
    
    def _send_verification_email(self, user, token, request):
        """Send email verification email"""
        try:
            # Build verification URL pointing to frontend
            from django.conf import settings
            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
            
            # Send email using notification service
            notification_service = NotificationService()
            notification_service.send_email_verification(
                user=user,
                verification_url=verification_url
            )
        except Exception as e:
            # Log error but don't fail registration
            print(f"Failed to send verification email: {e}")
    
    def _create_login_history(self, request, user, login_successful):
        """Create login history entry"""
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        LoginHistory.objects.create(
            user=user,
            ip_address=ip_address,
            user_agent=user_agent,
            login_successful=login_successful
        )
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Enhanced user login endpoint with login history tracking"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'error': 'Username and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get IP address and user agent for login history
    ip_address = _get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    # Authenticate user (now supports both username and email)
    user = authenticate(username=username, password=password)
    
    if user is not None:
        # Check if user is active (email verified)
        if not user.is_active:
            return Response({
                'error': 'Please verify your email address before logging in.',
                'email_verification_required': True,
                'email': user.email
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Create or get token
        token, created = Token.objects.get_or_create(user=user)
        
        # Create successful login history
        LoginHistory.objects.create(
            user=user,
            ip_address=ip_address,
            user_agent=user_agent,
            login_successful=True
        )
        
        # Determine next step based on user profile completeness
        try:
            profile = user.userprofile
            
            # Check if profile completion is required first
            if profile.requires_profile_completion():
                next_step = 'complete_profile'
                kyc_required = False
            elif profile.kyc_status == 'documents_required':
                kyc_required = True
                next_step = 'document_upload'
            elif profile.kyc_status == 'pending_review':
                kyc_required = True
                next_step = 'pending_review'
            else:
                kyc_required = False
                next_step = 'dashboard'
        except UserProfile.DoesNotExist:
            kyc_required = False
            next_step = 'complete_profile'
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Login successful',
            'kyc_required': kyc_required,
            'next_step': next_step
        })
    else:
        # Create failed login history if user exists
        try:
            # Try to find user by username or email for failed login tracking
            from django.db.models import Q
            failed_user = User.objects.get(Q(username=username) | Q(email=username))
            LoginHistory.objects.create(
                user=failed_user,
                ip_address=ip_address,
                user_agent=user_agent,
                login_successful=False
            )
        except User.DoesNotExist:
            pass
        
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Enhanced user logout endpoint with logout time tracking"""
    try:
        token = Token.objects.get(user=request.user)
        token.delete()
        
        # Update the last login history entry with logout time
        last_login = LoginHistory.objects.filter(
            user=request.user, 
            login_successful=True,
            logout_time__isnull=True
        ).order_by('-login_time').first()
        
        if last_login:
            last_login.logout_time = timezone.now()
            last_login.save()
        
        return Response({
            'message': 'Logout successful'
        })
    except Token.DoesNotExist:
        return Response({
            'error': 'User is not logged in'
        }, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Enhanced user profile view with comprehensive information"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class ProfileCompletionView(APIView):
    """Profile completion endpoint for new users after email verification"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current profile completion status and required fields"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            
            # Check if profile completion is required
            requires_completion = profile.requires_profile_completion()
            
            # Get current profile data
            serializer = ProfileCompletionSerializer(profile)
            
            return Response({
                'requires_completion': requires_completion,
                'current_data': serializer.data,
                'completion_fields': {
                    'username': {
                        'required': True,
                        'current': profile.user.username,
                        'auto_generated': '_' in profile.user.username and profile.user.username.split('_')[-1].isdigit()
                    },
                    'optional_fields': [
                        {'field': 'middle_name', 'label': 'Middle Name', 'current': profile.middle_name},
                        {'field': 'alternative_phone', 'label': 'Alternative Phone', 'current': profile.alternative_phone},
                        {'field': 'nationality', 'label': 'Nationality', 'current': profile.nationality},
                        {'field': 'job_title', 'label': 'Job Title', 'current': profile.job_title},
                        {'field': 'employment_type', 'label': 'Employment Type', 'current': profile.employment_type},
                        {'field': 'emergency_contact_name', 'label': 'Emergency Contact Name', 'current': profile.emergency_contact_name},
                        {'field': 'emergency_contact_phone', 'label': 'Emergency Contact Phone', 'current': profile.emergency_contact_phone},
                        {'field': 'emergency_contact_relationship', 'label': 'Emergency Contact Relationship', 'current': profile.emergency_contact_relationship},
                        {'field': 'preferred_branch', 'label': 'Preferred Branch', 'current': profile.preferred_branch}
                    ]
                }
            })
            
        except UserProfile.DoesNotExist:
            return Response({
                'error': 'User profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        """Complete user profile with additional information"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            
            serializer = ProfileCompletionSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                updated_profile = serializer.save()
                
                # Profile completion is KYC-free, so we don't change KYC status
                # Users can access dashboard after completing profile
                
                return Response({
                    'message': 'Profile completed successfully!',
                    'profile': ProfileCompletionSerializer(updated_profile).data,
                    'next_step': 'dashboard'  # Always go to dashboard after profile completion
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except UserProfile.DoesNotExist:
            return Response({
                'error': 'User profile not found'
            }, status=status.HTTP_404_NOT_FOUND)


class KYCUpdateView(generics.UpdateAPIView):
    """Update KYC information"""
    serializer_class = KYCUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        
        # Update KYC status to pending review after update
        profile = self.get_object()
        if profile.kyc_status == 'rejected':
            profile.kyc_status = 'pending'
            profile.save()
        
        return Response({
            'message': 'KYC information updated successfully. Your documents will be reviewed.',
            'profile': UserProfileSerializer(profile, context={'request': request}).data
        })


class KYCDocumentUploadView(generics.CreateAPIView):
    """Upload KYC documents"""
    serializer_class = KYCDocumentUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        document = serializer.save()
        
        # Update user profile KYC status
        try:
            profile = UserProfile.objects.get(user=request.user)
            if profile.kyc_status == 'documents_required':
                profile.kyc_status = 'under_review'
                profile.save()
        except UserProfile.DoesNotExist:
            pass
        
        return Response({
            'message': 'Document uploaded successfully',
            'document': KYCDocumentSerializer(document, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)


class KYCDocumentListView(generics.ListAPIView):
    """List user's KYC documents"""
    serializer_class = KYCDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            profile = UserProfile.objects.get(user=self.request.user)
            return KYCDocument.objects.filter(user_profile=profile)
        except UserProfile.DoesNotExist:
            return KYCDocument.objects.none()


class KYCDocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete specific KYC document"""
    serializer_class = KYCDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        try:
            profile = UserProfile.objects.get(user=self.request.user)
            return KYCDocument.objects.filter(user_profile=profile)
        except UserProfile.DoesNotExist:
            return KYCDocument.objects.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def kyc_status(request):
    """Get detailed KYC status information"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        
        # Get uploaded documents
        uploaded_docs = list(profile.kyc_documents.values_list('document_type', flat=True))
        
        # Get approved documents
        approved_docs = list(profile.kyc_documents.filter(is_approved=True).values_list('document_type', flat=True))
        
        return Response({
            'kyc_status': profile.kyc_status,
            'kyc_status_display': profile.get_kyc_status_display(),
            'kyc_completion_percentage': profile.get_kyc_completion_percentage(),
            'has_required_documents': profile.has_required_kyc_documents(),
            'is_verified': profile.is_verified,
            'required_documents': [],  # Empty for now since we're using category-based selection
            'uploaded_documents': KYCDocumentSerializer(profile.kyc_documents.all(), many=True).data,
            'rejection_reason': profile.kyc_rejection_reason,
            'last_reviewed': profile.kyc_reviewed_at
        })
        
    except UserProfile.DoesNotExist:
        return Response({
            'error': 'User profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


class BankAccountListView(generics.ListCreateAPIView):
    """Enhanced list user's bank accounts or create new account"""
    serializer_class = BankAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return BankAccount.objects.filter(user=self.request.user).select_related('user')
    
    def perform_create(self, serializer):
        # Check if user can create additional accounts based on tier
        user_accounts_count = BankAccount.objects.filter(user=self.request.user).count()
        
        try:
            profile = UserProfile.objects.get(user=self.request.user)
            max_accounts = self._get_max_accounts_for_tier(profile.customer_tier)
            
            if user_accounts_count >= max_accounts:
                raise serializers.ValidationError(
                    f"You can only have {max_accounts} account(s) with your current tier."
                )
                
            # Check KYC status for additional accounts
            if user_accounts_count > 0 and profile.kyc_status != 'approved':
                raise serializers.ValidationError(
                    "Please complete KYC verification to create additional accounts."
                )
                
        except UserProfile.DoesNotExist:
            if user_accounts_count >= 1:  # Default limit for users without profile
                raise serializers.ValidationError("Please complete your profile to create additional accounts.")
        
        serializer.save(user=self.request.user)
    
    def _get_max_accounts_for_tier(self, tier):
        tier_limits = {
            'standard': 2,
            'premium': 5,
            'vip': 10,
            'corporate': 20
        }
        return tier_limits.get(tier, 1)


class BankAccountDetailView(generics.RetrieveUpdateAPIView):
    """Enhanced retrieve or update specific bank account"""
    serializer_class = BankAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return BankAccount.objects.filter(user=self.request.user).select_related('user')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard(request):
    """Enhanced dashboard view with comprehensive user summary"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        accounts = BankAccount.objects.filter(user=request.user).select_related('user')
        
        # Calculate financial summary
        total_balance = accounts.aggregate(total=Sum('balance'))['total'] or 0
        total_available = accounts.aggregate(total=Sum('available_balance'))['total'] or 0
        
        # Get recent transactions (last 5)
        from banking.models import Transaction
        recent_transactions = Transaction.objects.filter(
            Q(from_account__in=accounts) | Q(to_account__in=accounts)
        ).distinct().order_by('-created_at')[:5]
        
        # Get recent login history
        recent_logins = LoginHistory.objects.filter(
            user=request.user
        ).order_by('-login_time')[:5]
        
        # Account statistics
        account_stats = {
            'total_accounts': accounts.count(),
            'active_accounts': accounts.filter(status='active').count(),
            'savings_accounts': accounts.filter(account_type='savings').count(),
            'current_accounts': accounts.filter(account_type='current').count(),
        }
        
        # KYC information
        kyc_info = {
            'status': profile.kyc_status,
            'completion_percentage': profile.get_kyc_completion_percentage(),
            'has_required_documents': profile.has_required_kyc_documents(),
            'is_verified': profile.is_verified
        }
        
        from banking.serializers import TransactionSerializer
        
        return Response({
            'user': UserSerializer(request.user).data,
            'profile': UserProfileSerializer(profile, context={'request': request}).data,
            'accounts': BankAccountSerializer(accounts, many=True).data,
            'financial_summary': {
                'total_balance': total_balance,
                'total_available': total_available,
                'currency': 'USD'  # Default currency
            },
            'account_statistics': account_stats,
            'kyc_information': kyc_info,
            'recent_transactions': TransactionSerializer(recent_transactions, many=True).data,
            'recent_logins': LoginHistorySerializer(recent_logins, many=True).data,
            'verification_required': not profile.is_verified
        })
    except UserProfile.DoesNotExist:
        return Response({
            'error': 'User profile not found. Please complete your registration.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def account_summary(request, account_id):
    """Get detailed summary for a specific account"""
    try:
        account = BankAccount.objects.get(id=account_id, user=request.user)
        
        # Get recent transactions for this account
        from banking.models import Transaction
        recent_transactions = Transaction.objects.filter(
            Q(from_account=account) | Q(to_account=account)
        ).order_by('-created_at')[:10]
        
        # Get cards for this account
        from banking.models import Card
        cards = Card.objects.filter(account=account)
        
        from banking.serializers import TransactionSerializer, CardSerializer
        
        return Response({
            'account': BankAccountSerializer(account).data,
            'recent_transactions': TransactionSerializer(recent_transactions, many=True).data,
            'cards': CardSerializer(cards, many=True).data,
            'transaction_summary': {
                'total_transactions': recent_transactions.count(),
                'pending_transactions': recent_transactions.filter(status='pending').count(),
            }
        })
    except BankAccount.DoesNotExist:
        return Response({'error': 'Account not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


class EmailVerificationView(APIView):
    """Email verification endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, token):
        """Verify email with token"""
        try:
            verification = EmailVerification.objects.get(token=token)
            
            if not verification.is_valid():
                return Response({
                    'error': 'Invalid or expired verification token',
                    'expired': verification.is_expired(),
                    'used': verification.is_used
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Activate user
            user = verification.user
            user.is_active = True
            user.save()
            
            # Mark verification as used
            verification.is_used = True
            verification.save()
            
            # Create token for the user
            token, created = Token.objects.get_or_create(user=user)
            
            # Create login history entry
            self._create_login_history(request, user, True)
            
            # Determine next step based on profile completion
            try:
                profile = user.userprofile
                if profile.requires_profile_completion():
                    next_step = 'complete_profile'
                elif profile.kyc_status == 'documents_required':
                    next_step = 'document_upload'
                else:
                    next_step = 'dashboard'
            except UserProfile.DoesNotExist:
                next_step = 'complete_profile'
            
            return Response({
                'message': 'Email verified successfully! Your account is now active.',
                'user': UserSerializer(user).data,
                'token': token.key,
                'next_step': next_step
            }, status=status.HTTP_200_OK)
            
        except EmailVerification.DoesNotExist:
            return Response({
                'error': 'Invalid verification token'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _create_login_history(self, request, user, login_successful):
        """Create login history entry"""
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        LoginHistory.objects.create(
            user=user,
            ip_address=ip_address,
            user_agent=user_agent,
            login_successful=login_successful
        )
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ResendVerificationView(APIView):
    """Resend email verification"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Resend verification email"""
        email = request.data.get('email')
        
        if not email:
            return Response({
                'error': 'Email address is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email, is_active=False)
            
            # Check if there's already a recent verification
            recent_verification = EmailVerification.objects.filter(
                user=user,
                created_at__gte=timezone.now() - timedelta(minutes=5)
            ).first()
            
            if recent_verification:
                return Response({
                    'error': 'Verification email was sent recently. Please wait before requesting another.'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Create new verification token
            verification = EmailVerification.objects.create(user=user)
            
            # Send verification email
            self._send_verification_email(user, verification.token, request)
            
            return Response({
                'message': 'Verification email sent successfully'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found or already verified'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def _send_verification_email(self, user, token, request):
        """Send email verification email"""
        try:
            # Build verification URL pointing to frontend
            from django.conf import settings
            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
            
            # Send email using notification service
            notification_service = NotificationService()
            notification_service.send_email_verification(
                user=user,
                verification_url=verification_url
            )
        except Exception as e:
            print(f"Failed to send verification email: {e}")


class ChangePasswordView(APIView):
    """Change user password with current password verification"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        # Validate input
        if not current_password or not new_password:
            return Response({
                'error': 'Both current_password and new_password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify current password
        if not request.user.check_password(current_password):
            return Response({
                'error': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate new password
        if len(new_password) < 8:
            return Response({
                'error': 'New password must be at least 8 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        request.user.set_password(new_password)
        request.user.save()
        
        # Log the password change
        LoginHistory.objects.create(
            user=request.user,
            ip_address=_get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:200],
            device_info=f"Password changed from {request.META.get('HTTP_USER_AGENT', '')[:50]}",
            login_successful=True
        )
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


class TransferPinView(APIView):
    """Manage transfer PIN - set and verify"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Set or update transfer PIN"""
        new_pin = request.data.get('new_pin')
        current_pin = request.data.get('current_pin')
        
        # Validate new PIN
        if not new_pin:
            return Response({
                'error': 'New PIN is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not new_pin.isdigit() or len(new_pin) != 4:
            return Response({
                'error': 'PIN must be exactly 4 digits'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get or create user profile
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            
            # If user already has a PIN, verify current PIN
            if profile.transfer_pin_hash and current_pin:
                if not check_password(current_pin, profile.transfer_pin_hash):
                    return Response({
                        'error': 'Current PIN is incorrect'
                    }, status=status.HTTP_400_BAD_REQUEST)
            elif profile.transfer_pin_hash and not current_pin:
                return Response({
                    'error': 'Current PIN is required to change existing PIN'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Hash and save new PIN
            profile.transfer_pin_hash = make_password(new_pin)
            profile.save()
            
            return Response({
                'message': 'Transfer PIN set successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to set transfer PIN'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """Check if user has a transfer PIN set"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            has_pin = bool(profile.transfer_pin_hash)
            
            return Response({
                'has_transfer_pin': has_pin
            }, status=status.HTTP_200_OK)
            
        except UserProfile.DoesNotExist:
            return Response({
                'has_transfer_pin': False
            }, status=status.HTTP_200_OK)


class CheckTransferPinView(APIView):
    """Check if user has transfer PIN set"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Check if user has a transfer PIN set"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            has_pin = bool(profile.transfer_pin_hash)
            
            return Response({
                'hasPin': has_pin
            }, status=status.HTTP_200_OK)
            
        except UserProfile.DoesNotExist:
            return Response({
                'hasPin': False
            }, status=status.HTTP_200_OK)


class VerifyTransferPinView(APIView):
    """Verify transfer PIN for transactions"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Verify transfer PIN"""
        pin = request.data.get('pin')
        
        if not pin:
            return Response({
                'error': 'PIN is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            profile = UserProfile.objects.get(user=request.user)
            
            if not profile.transfer_pin_hash:
                return Response({
                    'error': 'Transfer PIN not set'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify PIN
            if check_password(pin, profile.transfer_pin_hash):
                return Response({
                    'valid': True,
                    'message': 'PIN verified successfully'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'valid': False,
                    'error': 'Invalid PIN'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except UserProfile.DoesNotExist:
            return Response({
                'error': 'User profile not found'
            }, status=status.HTTP_404_NOT_FOUND)


class UpdateNotificationSettingsView(APIView):
    """Update user notification preferences"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Update notification settings"""
        email_notifications = request.data.get('email_notifications')
        sms_notifications = request.data.get('sms_notifications')
        
        try:
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            
            # Update notification settings if provided
            if email_notifications is not None:
                profile.email_notifications = bool(email_notifications)
            
            if sms_notifications is not None:
                profile.sms_notifications = bool(sms_notifications)
            
            profile.save()
            
            return Response({
                'message': 'Notification settings updated successfully',
                'email_notifications': profile.email_notifications,
                'sms_notifications': profile.sms_notifications
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to update notification settings'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
