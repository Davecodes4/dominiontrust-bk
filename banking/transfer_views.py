"""
Enhanced Transfer Request Views with comprehensive error handling
"""
from decimal import Decimal
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from accounts.models import BankAccount
from .models import Transaction, TransferRequest, get_next_business_day
from .serializers import TransferRequestSerializer, TransactionSerializer


class TransferRequestListCreateView(APIView):
    """
    List user's transfer requests or create a new one
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's transfer requests with pagination"""
        try:
            # Get all transfer requests for user's accounts
            user_accounts = BankAccount.objects.filter(user=request.user)
            transfer_requests = TransferRequest.objects.filter(
                from_account__in=user_accounts
            ).order_by('-created_at')
            
            # Apply pagination
            paginator = PageNumberPagination()
            paginator.page_size = 20
            paginated_requests = paginator.paginate_queryset(transfer_requests, request)
            
            serializer = TransferRequestSerializer(paginated_requests, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        except Exception as e:
            return Response({
                'error': 'Failed to fetch transfer requests',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create a new transfer request"""
        try:
            data = request.data.copy()
            
            # Validate required fields
            required_fields = ['from_account_id', 'to_account_number', 'amount', 'transfer_type']
            missing_fields = [field for field in required_fields if not data.get(field)]
            
            if missing_fields:
                return Response({
                    'error': 'Missing required fields',
                    'missing_fields': missing_fields
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get and validate source account
            try:
                from_account = BankAccount.objects.get(
                    id=data['from_account_id'],
                    user=request.user,
                    status='active'
                )
            except BankAccount.DoesNotExist:
                return Response({
                    'error': 'Invalid source account or account not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Validate amount
            try:
                amount = Decimal(str(data['amount']))
                if amount <= 0:
                    raise ValueError("Amount must be positive")
            except (ValueError, TypeError):
                return Response({
                    'error': 'Invalid amount. Must be a positive number'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check transfer limits and balance
            validation_result = self._validate_transfer(from_account, amount, data['transfer_type'])
            if not validation_result['valid']:
                return Response({
                    'error': validation_result['error']
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle different transfer types
            if data['transfer_type'] == 'internal':
                return self._create_internal_transfer(request, from_account, data, amount)
            elif data['transfer_type'] == 'domestic_external':
                return self._create_external_transfer(request, from_account, data, amount)
            elif data['transfer_type'] == 'international':
                return self._create_international_transfer(request, from_account, data, amount)
            else:
                return Response({
                    'error': 'Invalid transfer type'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': 'Failed to create transfer request',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _validate_transfer(self, from_account, amount, transfer_type):
        """Validate transfer constraints"""
        # Check account balance
        if from_account.balance < amount:
            return {
                'valid': False,
                'error': f'Insufficient balance. Available: ${from_account.balance:.2f}'
            }
        
        # Check daily transfer limits (simplified - you can expand this)
        daily_limit = Decimal('50000.00')  # $50k daily limit
        if amount > daily_limit:
            return {
                'valid': False,
                'error': f'Transfer amount exceeds daily limit of ${daily_limit:.2f}'
            }
        
        # Check transfer type specific limits
        if transfer_type == 'international' and amount > Decimal('10000.00'):
            return {
                'valid': False,
                'error': 'International transfers are limited to $10,000 per transaction'
            }
        
        return {'valid': True}
    
    def _create_internal_transfer(self, request, from_account, data, amount):
        """Create internal transfer between accounts in the same bank"""
        try:
            # Find destination account
            to_account = BankAccount.objects.get(
                account_number=data['to_account_number'],
                status='active'
            )
        except BankAccount.DoesNotExist:
            return Response({
                'error': 'Destination account not found or inactive'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Prevent self-transfer to same account
        if from_account.id == to_account.id:
            return Response({
                'error': 'Cannot transfer to the same account'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Create transfer request
            transfer_request = TransferRequest.objects.create(
                from_account=from_account,
                to_account_number=data['to_account_number'],
                to_account=to_account,
                amount=amount,
                transfer_type='internal',
                description=data.get('description', ''),
                beneficiary_name=data.get('beneficiary_name', to_account.account_name or to_account.user.get_full_name())
            )
            
            # Create corresponding transaction
            transfer_request.create_transaction()
            
            # For internal transfers, auto-approve if same user
            if from_account.user == to_account.user:
                transfer_request.approve()
        
        return Response({
            'message': 'Internal transfer request created successfully',
            'transfer_request': TransferRequestSerializer(transfer_request).data,
            'completion_message': transfer_request.get_completion_message()
        }, status=status.HTTP_201_CREATED)
    
    def _create_external_transfer(self, request, from_account, data, amount):
        """Create external domestic transfer (ACH)"""
        # Validate required external fields
        required_fields = ['to_routing_number', 'to_bank_name', 'beneficiary_name']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return Response({
                'error': 'Missing required fields for external transfer',
                'missing_fields': missing_fields
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate routing number format (simplified)
        routing_number = data['to_routing_number']
        if len(routing_number) != 9 or not routing_number.isdigit():
            return Response({
                'error': 'Invalid routing number. Must be 9 digits'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Create transfer request
            transfer_request = TransferRequest.objects.create(
                from_account=from_account,
                to_account_number=data['to_account_number'],
                to_account=None,  # External account
                amount=amount,
                transfer_type='domestic_external',
                description=data.get('description', ''),
                to_routing_number=routing_number,
                to_bank_name=data['to_bank_name'],
                beneficiary_name=data['beneficiary_name']
            )
            
            # Create corresponding transaction with fee
            transfer_request.create_transaction()
        
        return Response({
            'message': 'External transfer request created successfully',
            'transfer_request': TransferRequestSerializer(transfer_request).data,
            'transfer_fee': transfer_request.get_transfer_fee(),
            'completion_message': transfer_request.get_completion_message()
        }, status=status.HTTP_201_CREATED)
    
    def _create_international_transfer(self, request, from_account, data, amount):
        """Create international transfer (SWIFT)"""
        # Validate required international fields
        required_fields = ['to_swift_code', 'to_bank_name', 'beneficiary_name', 'beneficiary_address']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return Response({
                'error': 'Missing required fields for international transfer',
                'missing_fields': missing_fields
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate SWIFT code format (simplified)
        swift_code = data['to_swift_code']
        if len(swift_code) not in [8, 11] or not swift_code.isalnum():
            return Response({
                'error': 'Invalid SWIFT code format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Create transfer request
            transfer_request = TransferRequest.objects.create(
                from_account=from_account,
                to_account_number=data['to_account_number'],
                to_account=None,  # External account
                amount=amount,
                transfer_type='international',
                description=data.get('description', ''),
                to_swift_code=swift_code,
                to_bank_name=data['to_bank_name'],
                beneficiary_name=data['beneficiary_name'],
                beneficiary_address=data['beneficiary_address']
            )
            
            # Create corresponding transaction with fee
            transfer_request.create_transaction()
        
        return Response({
            'message': 'International transfer request created successfully',
            'transfer_request': TransferRequestSerializer(transfer_request).data,
            'transfer_fee': transfer_request.get_transfer_fee(),
            'completion_message': transfer_request.get_completion_message(),
            'processing_info': {
                'business_days': '3-5',
                'additional_fees_may_apply': True
            }
        }, status=status.HTTP_201_CREATED)


class TransferRequestDetailView(APIView):
    """
    Retrieve, update or cancel a specific transfer request
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """Get transfer request details"""
        try:
            transfer_request = get_object_or_404(
                TransferRequest,
                id=pk,
                from_account__user=request.user
            )
            
            serializer = TransferRequestSerializer(transfer_request)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({
                'error': 'Failed to fetch transfer request',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def patch(self, request, pk):
        """Update transfer request (limited fields)"""
        try:
            transfer_request = get_object_or_404(
                TransferRequest,
                id=pk,
                from_account__user=request.user,
                status='pending'  # Only pending requests can be updated
            )
            
            # Only allow updating description
            if 'description' in request.data:
                transfer_request.description = request.data['description']
                transfer_request.save()
            
            serializer = TransferRequestSerializer(transfer_request)
            return Response({
                'message': 'Transfer request updated successfully',
                'transfer_request': serializer.data
            })
            
        except TransferRequest.DoesNotExist:
            return Response({
                'error': 'Transfer request not found or cannot be updated'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Failed to update transfer request',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, pk):
        """Cancel transfer request"""
        try:
            transfer_request = get_object_or_404(
                TransferRequest,
                id=pk,
                from_account__user=request.user,
                status='pending'  # Only pending requests can be cancelled
            )
            
            with transaction.atomic():
                # Cancel the transfer request
                transfer_request.status = 'cancelled'
                transfer_request.save()
                
                # Cancel associated transaction if exists
                if transfer_request.transaction:
                    transfer_request.transaction.status = 'cancelled'
                    transfer_request.transaction.save()
            
            return Response({
                'message': 'Transfer request cancelled successfully'
            }, status=status.HTTP_200_OK)
            
        except TransferRequest.DoesNotExist:
            return Response({
                'error': 'Transfer request not found or cannot be cancelled'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Failed to cancel transfer request',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_transfer_fees(request):
    """Get transfer fees for different transfer types"""
    try:
        amount = request.GET.get('amount', '0')
        transfer_type = request.GET.get('type', 'internal')
        
        try:
            amount_decimal = Decimal(str(amount))
        except (ValueError, TypeError):
            amount_decimal = Decimal('0')
        
        # Create a temporary transfer request to calculate fees
        temp_request = TransferRequest(
            amount=amount_decimal,
            transfer_type=transfer_type
        )
        
        fee = temp_request.get_transfer_fee()
        
        return Response({
            'transfer_type': transfer_type,
            'amount': amount_decimal,
            'fee': fee,
            'total_amount': amount_decimal + fee,
            'fee_breakdown': {
                'base_fee': fee,
                'processing_fee': Decimal('0.00'),  # Could add processing fees here
                'currency_conversion_fee': Decimal('0.00')  # For international transfers
            }
        })
        
    except Exception as e:
        return Response({
            'error': 'Failed to calculate transfer fees',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def validate_account_number(request):
    """Validate destination account number for internal transfers"""
    try:
        account_number = request.data.get('account_number')
        
        if not account_number:
            return Response({
                'error': 'Account number is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            account = BankAccount.objects.get(
                account_number=account_number,
                status='active'
            )
            
            return Response({
                'valid': True,
                'account_name': account.account_name,
                'account_holder': account.user.get_full_name(),
                'bank_name': 'Dominion Trust Bank'  # Your bank name
            })
            
        except BankAccount.DoesNotExist:
            return Response({
                'valid': False,
                'error': 'Account not found or inactive'
            })
            
    except Exception as e:
        return Response({
            'error': 'Failed to validate account number',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def validate_routing_number(request):
    """Validate routing number for external transfers"""
    try:
        routing_number = request.data.get('routing_number')
        
        if not routing_number:
            return Response({
                'error': 'Routing number is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Basic validation
        if len(routing_number) != 9 or not routing_number.isdigit():
            return Response({
                'valid': False,
                'error': 'Routing number must be 9 digits'
            })
        
        # You could add more sophisticated routing number validation here
        # For now, we'll just return basic validation
        
        return Response({
            'valid': True,
            'bank_name': 'External Bank',  # You could look this up in a routing table
            'supported': True
        })
        
    except Exception as e:
        return Response({
            'error': 'Failed to validate routing number',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
