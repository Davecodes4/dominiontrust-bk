from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone
from django.contrib.auth.hashers import check_password
from decimal import Decimal
import re
from .models import Transaction, TransferRequest, Card, DepositRequest
from accounts.models import BankAccount, UserProfile
from .serializers import (
    TransactionSerializer, TransferRequestSerializer, CardSerializer,
    CreateTransferSerializer, DepositSerializer, WithdrawalSerializer,
    CreateCardSerializer, ExternalTransferSerializer
)
from .external_processors import get_payment_processor, get_compliance_checker


def determine_transfer_type(transfer_data, to_account_number, to_account=None):
    """
    Determine transfer type based on account patterns and additional data
    Returns: 'domestic', 'external', or 'international'
    """
    # If we found the account in our system, it's domestic
    if to_account is not None:
        return 'domestic'
    
    # Check for international indicators
    international_indicators = [
        transfer_data.get('to_swift_code'),
        transfer_data.get('to_iban'),
        transfer_data.get('beneficiary_country') and transfer_data.get('beneficiary_country').upper() != 'US'
    ]
    
    if any(international_indicators):
        return 'international'
    
    # Check for external US bank indicators
    external_indicators = [
        transfer_data.get('to_routing_number'),
        transfer_data.get('to_bank_name'),
        len(to_account_number) == 9 and to_account_number.isdigit(),  # US routing number pattern
        len(to_account_number) >= 8 and len(to_account_number) <= 17  # US account number pattern
    ]
    
    if any(external_indicators):
        return 'external'
    
    # Default to external for unknown patterns
    return 'external'


class TransactionListView(generics.ListAPIView):
    """List user's transactions"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_accounts = BankAccount.objects.filter(user=self.request.user)
        return Transaction.objects.filter(
            Q(from_account__in=user_accounts) | 
            Q(to_account__in=user_accounts)
        ).distinct().order_by('-created_at')


class TransactionDetailView(generics.RetrieveAPIView):
    """Retrieve specific transaction details"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_accounts = BankAccount.objects.filter(user=self.request.user)
        return Transaction.objects.filter(
            Q(from_account__in=user_accounts) | 
            Q(to_account__in=user_accounts)
        ).distinct()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def transfer_funds(request):
    """Transfer funds between accounts - now creates pending transaction"""
    serializer = CreateTransferSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Get user's primary account (first active account)
    try:
        from_account = BankAccount.objects.filter(
            user=request.user, 
            status='active'
        ).first()
        
        if not from_account:
            return Response({
                'error': 'No active account found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except BankAccount.DoesNotExist:
        return Response({
            'error': 'Account not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get destination account
    try:
        to_account = BankAccount.objects.get(
            account_number=serializer.validated_data['to_account_number'],
            status='active'
        )
    except BankAccount.DoesNotExist:
        return Response({
            'error': 'Destination account not found or inactive'
        }, status=status.HTTP_404_NOT_FOUND)
    
    amount = serializer.validated_data['amount']
    description = serializer.validated_data.get('description', '')
    
    # Check if user has sufficient balance (including pending and processing transactions)
    from django.db.models import Sum
    pending_debits = Transaction.objects.filter(
        from_account=from_account,
        status__in=['pending', 'confirmed', 'processing']
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    available_balance = from_account.balance - pending_debits
    
    if available_balance < amount:
        return Response({
            'error': f'Insufficient balance. Available: {available_balance}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Determine transfer type and processing delay
    if from_account.user == to_account.user:
        transfer_type = 'internal'
        processing_delay = 1  # Same user transfers - 1 day
    else:
        transfer_type = 'domestic'
        processing_delay = 2  # Different users - 2 days minimum
    
    # Create pending transaction and transfer request
    with transaction.atomic():
        # Create transaction record as processing (funds will be deducted)
        transfer_transaction = Transaction.objects.create(
            from_account=from_account,
            to_account=to_account,
            transaction_type='transfer',
            amount=amount,
            description=description,
            status='processing',  # Processing status indicates funds are deducted
            from_balance_before=from_account.balance,
            to_balance_before=to_account.balance if to_account else None,
            recipient_name=to_account.account_name or to_account.user.get_full_name() if to_account else '',
            recipient_account_number=to_account.account_number if to_account else '',
            channel='online',
            status_message=f'Internal transfer to {to_account.account_name or to_account.user.get_full_name() if to_account else "external account"}'
        )
        
        # Process the transaction immediately to deduct funds
        transfer_transaction.process_transaction()
        
        # Create transfer request record
        transfer_request = TransferRequest.objects.create(
            from_account=from_account,
            to_account_number=to_account.account_number if to_account else serializer.validated_data.get('to_account_number', ''),
            to_account=to_account,
            amount=amount,
            description=description,
            status='processing',  # Processing status indicates funds are being processed
            transfer_type=transfer_type,
            processing_delay_days=processing_delay,
            beneficiary_name=to_account.account_name or to_account.user.get_full_name() if to_account else serializer.validated_data.get('beneficiary_name', ''),
            transaction=transfer_transaction
        )
        
        # Calculate and apply transfer fees
        transfer_request.transfer_fee = transfer_request.get_transfer_fee()
        transfer_request.save()
        
        # Update transaction with fees and deduct fee amount
        if transfer_request.transfer_fee > 0:
            transfer_transaction.fee = transfer_request.transfer_fee
            transfer_transaction.total_amount = amount + transfer_request.transfer_fee
            transfer_transaction.save()
            
            # Deduct the fee from account balance (amount was already deducted by process_transaction)
            from_account.balance -= transfer_request.transfer_fee
            from_account.save()
    
    # Send notification after successful transfer
    def send_notification_after_commit():
        try:
            from notifications.services import NotificationService
            notification_service = NotificationService()
            notification_service.send_notification(
                user=request.user,
                notification_type='transaction',
                template_type='transfer_sent',
                context_data={
                    'user_name': request.user.get_full_name() or request.user.username,
                    'transaction_id': str(transfer_transaction.id),
                    'amount': amount,
                    'currency': 'USD',
                    'description': description or 'Internal Transfer',
                    'date': transfer_transaction.created_at.strftime('%B %d, %Y at %I:%M %p'),
                    'account_number': from_account.account_number[-4:],
                    'reference': transfer_transaction.reference or 'N/A',
                    'recipient_name': transfer_transaction.recipient_name or to_account.account_name if to_account else 'External Account'
                }
            )
        except Exception as e:
            # Don't fail the transfer if notification fails
            print(f"WARNING: Failed to send transfer notification: {e}")
    
    # Use transaction.on_commit to ensure notification is sent only after successful DB commit
    transaction.on_commit(send_notification_after_commit)
    
    return Response({
        'message': 'Transfer is being processed. Funds have been deducted from your account.',
        'status_message': 'Transfer funds have been deducted and are being processed',
        'transaction': TransactionSerializer(transfer_transaction).data,
        'transfer_request': TransferRequestSerializer(transfer_request).data,
        'account_balance': {
            'before': float(transfer_transaction.from_balance_before) if transfer_transaction.from_balance_before else None,
            'after': float(from_account.balance),
            'amount_transferred': float(amount),
            'total_deducted': float(transfer_transaction.total_amount) if transfer_transaction.total_amount else float(amount)
        },
        'processing_info': {
            'funds_deducted': True,
            'status': 'processing',
            'transfer_type': transfer_type,
            'timestamp': transfer_transaction.processed_at.isoformat() if transfer_transaction.processed_at else transfer_transaction.created_at.isoformat()
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_fail_transaction(request, transaction_id):
    """Admin-only manual failure of pending transactions with fund restoration"""
    try:
        transaction_obj = Transaction.objects.get(
            id=transaction_id,
            status__in=['pending', 'confirmed', 'processing']
        )
    except Transaction.DoesNotExist:
        return Response({
            'error': 'Transaction not found or cannot be failed'
        }, status=status.HTTP_404_NOT_FOUND)
    
    failure_reason = request.data.get('reason', 'Admin manual failure')
    failed_by_text = f"Admin: {request.user.username}"
    
    if transaction_obj.fail_transaction(reason=failure_reason, failed_by=failed_by_text):
        return Response({
            'message': 'Transaction failed successfully by admin. Funds have been restored if applicable.',
            'transaction': TransactionSerializer(transaction_obj).data,
            'failed_by': failed_by_text,
            'failure_reason': failure_reason,
            'funds_restored': transaction_obj.from_account is not None
        })
    else:
        return Response({
            'error': 'Failed to fail transaction'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_confirm_transaction(request, transaction_id):
    """Admin-only manual confirmation of pending transactions"""
    try:
        transaction_obj = Transaction.objects.get(
            id=transaction_id,
            status='pending'
        )
    except Transaction.DoesNotExist:
        return Response({
            'error': 'Transaction not found or cannot be confirmed'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Admin can force confirm even if minimum time hasn't passed
    force_confirm = request.data.get('force_confirm', False)
    
    if not force_confirm and not transaction_obj.can_be_confirmed():
        return Response({
            'error': 'Transaction cannot be confirmed yet. Use force_confirm=true to override.',
            'can_confirm_after': transaction_obj.confirmation_required_date
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Confirm the transaction
    confirmation_reason = request.data.get('reason', 'Admin manual confirmation')
    confirmed_by_text = f"Admin: {request.user.username}"
    
    if transaction_obj.confirm_transaction(confirmed_by=confirmed_by_text):
        
        return Response({
            'message': 'Transaction confirmed successfully by admin',
            'status_message': transaction_obj.get_estimated_completion_message(),
            'transaction': TransactionSerializer(transaction_obj).data,
            'confirmed_by': confirmed_by_text,
            'confirmation_reason': confirmation_reason
        })
    else:
        return Response({
            'error': 'Failed to confirm transaction'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def pending_transactions(request):
    """Get user's pending transactions (read-only for users)"""
    user_accounts = BankAccount.objects.filter(user=request.user)
    pending_txns = Transaction.objects.filter(
        Q(from_account__in=user_accounts) | Q(to_account__in=user_accounts),
        status='pending'
    ).distinct().order_by('-created_at')
    
    return Response({
        'pending_transactions': TransactionSerializer(pending_txns, many=True).data,
        'count': pending_txns.count(),
        'note': 'Transactions will be automatically processed by our system within 1-5 business days'
    })


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_add_deposit(request):
    """Admin-only endpoint to add deposit transactions to user accounts"""
    try:
        # Extract required data
        user_id = request.data.get('user_id')
        account_id = request.data.get('account_id')  # Optional - will use primary if not provided
        amount = request.data.get('amount')
        description = request.data.get('description', 'Admin deposit')
        auto_approve = request.data.get('auto_approve', False)  # Whether to immediately approve
        
        # Validate required fields
        if not user_id:
            return Response({
                'error': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not amount:
            return Response({
                'error': 'amount is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount = Decimal(str(amount))
            if amount <= 0:
                return Response({
                    'error': 'Amount must be positive'
                }, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({
                'error': 'Invalid amount format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get target user
        try:
            from django.contrib.auth.models import User
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'error': f'User with ID {user_id} not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get target account
        if account_id:
            try:
                target_account = BankAccount.objects.get(
                    id=account_id,
                    user=target_user,
                    status='active'
                )
            except BankAccount.DoesNotExist:
                return Response({
                    'error': f'Account with ID {account_id} not found for user {target_user.username}'
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            # Use primary account
            target_account = BankAccount.objects.filter(
                user=target_user,
                status='active'
            ).first()
            
            if not target_account:
                return Response({
                    'error': f'No active account found for user {target_user.username}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the deposit transaction
        with transaction.atomic():
            # Create transaction record
            deposit_transaction = Transaction.objects.create(
                to_account=target_account,
                transaction_type='deposit',
                amount=amount,
                description=f"[ADMIN] {description}",
                status='pending' if not auto_approve else 'completed',
                approval_required=not auto_approve,
                confirmation_method='admin_manual',
                business_days_delay=0 if auto_approve else 1,
                to_balance_before=target_account.balance
            )
            
            # If auto-approve, immediately credit the account
            if auto_approve:
                target_account.balance += amount
                target_account.save()
        
        # Send notification to the user after successful admin deposit (only if auto-approved)
        if auto_approve:
            def send_notification_after_commit():
                try:
                    from notifications.services import NotificationService
                    notification_service = NotificationService()
                    notification_service.send_notification(
                        user=target_user,
                        notification_type='transaction',
                        template_type='deposit_received',
                        context_data={
                            'user_name': target_user.get_full_name() or target_user.username,
                            'transaction_id': str(deposit_transaction.id),
                            'amount': amount,
                            'currency': 'USD',
                            'description': description or 'Admin Deposit',
                            'date': deposit_transaction.created_at.strftime('%B %d, %Y at %I:%M %p'),
                            'account_number': target_account.account_number[-4:],
                            'reference': deposit_transaction.reference or 'N/A',
                            'new_balance': float(target_account.balance),
                            'admin_note': f'Deposit processed by admin: {request.user.username}'
                        }
                    )
                except Exception as e:
                    # Don't fail the deposit if notification fails
                    print(f"WARNING: Failed to send admin deposit notification: {e}")
            
            # Use transaction.on_commit to ensure notification is sent only after successful DB commit
            transaction.on_commit(send_notification_after_commit)
        
        # Prepare response
        response_data = {
            'message': f'Deposit {"completed" if auto_approve else "created"} successfully',
            'transaction': TransactionSerializer(deposit_transaction).data,
            'target_user': {
                'id': target_user.id,
                'username': target_user.username,
                'full_name': target_user.get_full_name() or target_user.username
            },
            'target_account': {
                'id': target_account.id,
                'account_number': target_account.account_number,
                'account_type': target_account.account_type,
                'balance_before': float(deposit_transaction.to_balance_before),
                'balance_after': float(target_account.balance)
            },
            'admin_action': {
                'performed_by': request.user.username,
                'auto_approved': auto_approve,
                'timestamp': deposit_transaction.created_at.isoformat()
            }
        }
        
        if not auto_approve:
            response_data['note'] = 'Deposit is pending. Use admin-confirm endpoint to approve manually.'
            response_data['can_be_confirmed_after'] = deposit_transaction.confirmation_required_date
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Failed to create deposit: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_pending_transactions(request):
    """Admin view of all pending transactions with confirmation capabilities"""
    pending_txns = Transaction.objects.filter(
        status='pending'
    ).order_by('-created_at')
    
    # Optional filtering
    transaction_type = request.GET.get('type')
    if transaction_type:
        pending_txns = pending_txns.filter(transaction_type=transaction_type)
    
    user_id = request.GET.get('user_id')
    if user_id:
        pending_txns = pending_txns.filter(
            Q(from_account__user_id=user_id) | Q(to_account__user_id=user_id)
        )
    
    return Response({
        'pending_transactions': TransactionSerializer(pending_txns, many=True).data,
        'count': pending_txns.count(),
        'admin_note': 'Use /admin-confirm/<transaction_id>/ endpoint to manually confirm transactions'
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def deposit_funds(request):
    """Deposit funds to user's account - creates pending transaction with automatic processing"""
    serializer = DepositSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Get user's primary account
    try:
        account = BankAccount.objects.filter(
            user=request.user, 
            status='active'
        ).first()
        
        if not account:
            return Response({
                'error': 'No active account found'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except BankAccount.DoesNotExist:
        return Response({
            'error': 'Account not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    amount = serializer.validated_data['amount']
    description = serializer.validated_data.get('description', 'Deposit')
    
    # Create pending deposit transaction
    with transaction.atomic():
        # Create transaction record as pending
        deposit_transaction = Transaction.objects.create(
            to_account=account,
            transaction_type='deposit',
            amount=amount,
            description=description,
            status='pending',
            auto_confirm=True,
            confirmation_delay_hours=1,  # Auto-confirm after 1 hour
            deposit_source='mobile',
            channel='mobile'
        )
        
        # Process immediately for demonstration (in production, this would be handled by a background task)
        deposit_transaction.process_transaction()
    
    # Send notification after successful deposit
    def send_notification_after_commit():
        try:
            from notifications.services import NotificationService
            notification_service = NotificationService()
            notification_service.send_notification(
                user=request.user,
                notification_type='transaction',
                template_type='deposit_received',
                context_data={
                    'user_name': request.user.get_full_name() or request.user.username,
                    'transaction_id': str(deposit_transaction.id),
                    'amount': amount,
                    'currency': 'USD',
                    'description': description or 'Deposit',
                    'date': deposit_transaction.created_at.strftime('%B %d, %Y at %I:%M %p'),
                    'account_number': account.account_number[-4:],
                    'reference': deposit_transaction.reference or 'N/A',
                    'new_balance': float(deposit_transaction.to_balance_after) if deposit_transaction.to_balance_after else float(account.balance)
                }
            )
        except Exception as e:
            # Don't fail the deposit if notification fails
            print(f"WARNING: Failed to send deposit notification: {e}")
    
    # Use transaction.on_commit to ensure notification is sent only after successful DB commit
    transaction.on_commit(send_notification_after_commit)
    
    return Response({
        'message': 'Deposit completed successfully',
        'status_message': deposit_transaction.get_status_message(),
        'transaction': TransactionSerializer(deposit_transaction).data,
        'account_balance': {
            'before': float(deposit_transaction.to_balance_before) if deposit_transaction.to_balance_before else None,
            'after': float(deposit_transaction.to_balance_after) if deposit_transaction.to_balance_after else float(account.balance)
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def withdraw_funds(request):
    """Withdraw funds from user's account - creates pending transaction with automatic processing"""
    serializer = WithdrawalSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Get user's primary account
    try:
        account = BankAccount.objects.filter(
            user=request.user, 
            status='active'
        ).first()
        
        if not account:
            return Response({
                'error': 'No active account found'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except BankAccount.DoesNotExist:
        return Response({
            'error': 'Account not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    amount = serializer.validated_data['amount']
    description = serializer.validated_data.get('description', 'Withdrawal')
    
    # Check if user has sufficient balance (including pending transactions)
    from django.db import models
    pending_debits = Transaction.objects.filter(
        from_account=account,
        status__in=['pending', 'processing']
    ).aggregate(total=models.Sum('total_amount'))['total'] or Decimal('0')
    
    available_balance = account.balance - pending_debits
    
    if available_balance < amount:
        return Response({
            'error': f'Insufficient balance. Available: ${available_balance}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create pending withdrawal transaction
    with transaction.atomic():
        # Create transaction record as pending
        withdrawal_transaction = Transaction.objects.create(
            from_account=account,
            transaction_type='withdrawal',
            amount=amount,
            description=description,
            status='pending',
            auto_confirm=True,
            confirmation_delay_hours=1,  # Auto-confirm after 1 hour
            channel='mobile'
        )
        
        # Process immediately for demonstration (in production, this would be handled by a background task)
        withdrawal_transaction.process_transaction()
    
    # Send notification after successful withdrawal
    def send_notification_after_commit():
        try:
            from notifications.services import NotificationService
            notification_service = NotificationService()
            notification_service.send_notification(
                user=request.user,
                notification_type='transaction',
                template_type='withdrawal_completed',
                context_data={
                    'user_name': request.user.get_full_name() or request.user.username,
                    'transaction_id': str(withdrawal_transaction.id),
                    'amount': amount,
                    'currency': 'USD',
                    'description': description or 'Withdrawal',
                    'date': withdrawal_transaction.created_at.strftime('%B %d, %Y at %I:%M %p'),
                    'account_number': account.account_number[-4:],
                    'reference': withdrawal_transaction.reference or 'N/A',
                    'new_balance': float(withdrawal_transaction.from_balance_after) if withdrawal_transaction.from_balance_after else float(account.balance)
                }
            )
        except Exception as e:
            # Don't fail the withdrawal if notification fails
            print(f"WARNING: Failed to send withdrawal notification: {e}")
    
    # Use transaction.on_commit to ensure notification is sent only after successful DB commit
    transaction.on_commit(send_notification_after_commit)
    
    return Response({
        'message': 'Withdrawal completed successfully',
        'status_message': withdrawal_transaction.get_status_message(),
        'transaction': TransactionSerializer(withdrawal_transaction).data,
        'account_balance': {
            'before': float(withdrawal_transaction.from_balance_before) if withdrawal_transaction.from_balance_before else None,
            'after': float(withdrawal_transaction.from_balance_after) if withdrawal_transaction.from_balance_after else float(account.balance)
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def transaction_status(request, transaction_id):
    """Get detailed status of a specific transaction"""
    try:
        user_accounts = BankAccount.objects.filter(user=request.user)
        transaction_obj = Transaction.objects.filter(
            id=transaction_id
        ).filter(
            Q(from_account__in=user_accounts) | Q(to_account__in=user_accounts)
        ).first()
        
        if not transaction_obj:
            raise Transaction.DoesNotExist()
    except Transaction.DoesNotExist:
        return Response({
            'error': 'Transaction not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    return Response({
        'transaction': TransactionSerializer(transaction_obj).data,
        'status_message': transaction_obj.get_estimated_completion_message(),
        'can_be_confirmed': transaction_obj.can_be_confirmed(),
        'business_days_remaining': transaction_obj.calculate_business_days_remaining(),
        'expected_completion_date': transaction_obj.expected_completion_date,
        'confirmation_logs': [
            {
                'confirmed_by': log.confirmed_by,
                'confirmation_method': log.confirmation_method,
                'confirmed_at': log.confirmed_at,
                'previous_status': log.previous_status,
                'new_status': log.new_status
            }
            for log in transaction_obj.confirmation_logs.all()
        ]
    })


class CardListView(generics.ListCreateAPIView):
    """List user's cards or create new card"""
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_accounts = BankAccount.objects.filter(user=self.request.user)
        return Card.objects.filter(account__in=user_accounts)
    
    def create(self, request, *args, **kwargs):
        create_serializer = CreateCardSerializer(data=request.data)
        
        if not create_serializer.is_valid():
            return Response(create_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the specified account or default to primary account
        account_id = request.data.get('account_id')
        
        try:
            if account_id:
                # Use the specified account
                account = BankAccount.objects.get(
                    account_number=account_id,
                    user=request.user, 
                    status='active'
                )
            else:
                # Fallback to first active account
                account = BankAccount.objects.filter(
                    user=request.user, 
                    status='active'
                ).first()
            
            if not account:
                return Response({
                    'error': 'No active account found' if not account_id else f'Account {account_id} not found or inactive'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except BankAccount.DoesNotExist:
            return Response({
                'error': f'Account {account_id} not found or not accessible'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Define card creation fees
        card_fees = {
            'visa': Decimal('25.00'),
            'mastercard': Decimal('35.00'),  # More expensive
            'verve': Decimal('15.00')
        }
        
        card_brand = create_serializer.validated_data['card_brand']
        card_fee = card_fees.get(card_brand, Decimal('25.00'))
        
        # Check if account has sufficient balance
        if account.available_balance < card_fee:
            return Response({
                'error': f'Insufficient balance in account {account.account_number}. Card creation fee is ${card_fee}. Available balance: ${account.available_balance}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                # Create the card
                from datetime import date, timedelta
                card = Card.objects.create(
                    account=account,
                    card_type=create_serializer.validated_data['card_type'],
                    card_brand=create_serializer.validated_data['card_brand'],
                    card_name=create_serializer.validated_data.get('card_name', ''),
                    expiry_date=date.today() + timedelta(days=1825),  # 5 years
                    daily_limit=create_serializer.validated_data.get('daily_limit', 100000.00)
                )
                
                # Create fee transaction
                fee_transaction = Transaction.objects.create(
                    from_account=account,
                    transaction_type='fee',
                    amount=card_fee,
                    description=f'Card creation fee - {card_brand.upper()} {create_serializer.validated_data["card_type"]} card',
                    reference=f'CARD-FEE-{card.id}',
                    status='completed',
                    card_last_four=card.card_number[-4:] if card.card_number else None,
                    card_brand=card_brand,
                    status_message=f'Card creation fee for {card_brand.upper()} {create_serializer.validated_data["card_type"]} card',
                    channel='online'
                )
                
                # Process the fee transaction to update balances
                fee_transaction.process_transaction()
                
                # Send notification after successful card creation
                def send_notification_after_commit():
                    try:
                        from notifications.services import NotificationService
                        notification_service = NotificationService()
                        notification_service.send_notification(
                            user=request.user,
                            notification_type='transaction',
                            template_type='card_created',
                            context_data={
                                'user_name': request.user.get_full_name() or request.user.username,
                                'transaction_id': str(fee_transaction.id),
                                'card_type': create_serializer.validated_data["card_type"],
                                'card_brand': card_brand.upper(),
                                'card_number': f"****-****-****-{card.card_number[-4:]}" if card.card_number else "****-****-****-****",
                                'fee_amount': card_fee,
                                'currency': 'USD',
                                'date': fee_transaction.created_at.strftime('%B %d, %Y at %I:%M %p'),
                                'account_number': account.account_number[-4:],
                                'reference': fee_transaction.reference or 'N/A',
                                'remaining_balance': float(account.available_balance)
                            }
                        )
                    except Exception as e:
                        # Don't fail the card creation if notification fails
                        print(f"WARNING: Failed to send card creation notification: {e}")
                
                # Use transaction.on_commit to ensure notification is sent only after successful DB commit
                transaction.on_commit(send_notification_after_commit)
                
                return Response({
                    'message': f'Card created successfully. ${card_fee} fee charged from account {account.account_number}.',
                    'card': CardSerializer(card).data,
                    'fee_charged': str(card_fee),
                    'charged_from_account': account.account_number,
                    'remaining_balance': str(account.available_balance)
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'error': f'Failed to create card: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CardDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete specific card"""
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_accounts = BankAccount.objects.filter(user=self.request.user)
        return Card.objects.filter(account__in=user_accounts)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_card_fees(request):
    """Get card creation fees for different card brands"""
    card_fees = {
        'visa': '25.00',
        'mastercard': '35.00',
        'verve': '15.00'
    }
    
    return Response({
        'fees': card_fees,
        'currency': 'USD'
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def external_transfer(request):
    """External bank transfer to other banks (ACH/SWIFT)"""
    serializer = ExternalTransferSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Get user's primary account
    try:
        from_account = BankAccount.objects.filter(
            user=request.user, 
            status='active'
        ).first()
        
        if not from_account:
            return Response({
                'error': 'No active account found'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except BankAccount.DoesNotExist:
        return Response({
            'error': 'Account not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Extract validated data
    data = serializer.validated_data
    amount = data['amount']
    transfer_type = data['transfer_type']
    beneficiary_name = data['beneficiary_name']
    description = data.get('description', f'External transfer to {beneficiary_name}')
    
    # Check if user has sufficient balance (including pending transactions)
    from django.db import models
    pending_debits = Transaction.objects.filter(
        from_account=from_account,
        status__in=['pending', 'confirmed', 'processing']
    ).aggregate(total=models.Sum('total_amount'))['total'] or 0
    
    available_balance = from_account.balance - pending_debits
    
    # Estimate total cost with fees
    estimated_fee = Decimal('15.00') if transfer_type == 'domestic_external' else Decimal('45.00')
    total_estimated_cost = amount + estimated_fee
    
    if available_balance < total_estimated_cost:
        return Response({
            'error': f'Insufficient balance. Available: {available_balance}, Required: {total_estimated_cost} (including estimated fees)'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Run compliance checks
    compliance_checker = get_compliance_checker()
    
    # OFAC sanctions screening
    ofac_result = compliance_checker.screen_ofac_sanctions(
        beneficiary_name, 
        data.get('beneficiary_country')
    )
    
    if ofac_result['status'] == 'blocked':
        return Response({
            'error': 'Transfer blocked due to sanctions screening',
            'reason': ofac_result['match_reason'],
            'compliance_reference': 'OFAC_BLOCKED'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # AML risk assessment
    user_profile = getattr(request.user, 'userprofile', None)
    aml_result = compliance_checker.calculate_aml_risk_score(
        type('obj', (), {
            'amount': amount,
            'beneficiary_country': data.get('beneficiary_country', 'US')
        })(),
        user_profile
    )
    
    # Set processing delay based on transfer type and risk
    if transfer_type == 'domestic_external':
        processing_delay = 2  # ACH takes 1-3 days
    else:  # international
        processing_delay = 4  # SWIFT takes 3-5 days
    
    # Add extra delay for high-risk transactions
    if aml_result['risk_level'] == 'HIGH':
        processing_delay += 1
    
    # Create external transfer with compliance data
    with transaction.atomic():
        # Create transaction record as pending
        transfer_transaction = Transaction.objects.create(
            from_account=from_account,
            to_account=None,  # External transfer - no local to_account
            transaction_type='transfer',
            amount=amount,
            description=description,
            status='pending',
            from_balance_before=from_account.balance,
            
            # External transfer details - save ALL transfer information
            recipient_account_number=data['to_account_number'],
            routing_number=data.get('to_routing_number', ''),
            swift_code=data.get('to_swift_code', ''),
            recipient_bank_name=data.get('to_bank_name', ''),
            recipient_name=beneficiary_name,
            channel='online',
            status_message=f'External transfer to {beneficiary_name} is being processed',
            
            # Transaction purpose and compliance
            purpose_code=data.get('purpose_code', ''),
            external_reference=data.get('external_reference', '')
        )
        
        # Create enhanced transfer request with external details
        transfer_request = TransferRequest.objects.create(
            from_account=from_account,
            to_account_number=data['to_account_number'],
            to_account=None,  # External transfer
            
            # External transfer fields
            to_routing_number=data.get('to_routing_number', ''),
            to_swift_code=data.get('to_swift_code', ''),
            to_bank_name=data.get('to_bank_name', ''),
            beneficiary_address=data.get('beneficiary_address', ''),
            beneficiary_name=beneficiary_name,
            
            # Transfer details
            amount=amount,
            description=description,
            transfer_type=transfer_type,
            transaction=transfer_transaction
        )
    
    # Get payment processor for validation
    processor = get_payment_processor(transfer_type)
    if processor:
        # Pre-validate routing/SWIFT codes
        if transfer_type == 'domestic_external':
            is_valid, validation_message = processor.validate_routing_number(data.get('to_routing_number'))
            if not is_valid:
                transfer_request.status = 'rejected'
                transfer_request.rejection_reason = validation_message
                transfer_request.save()
                
                transfer_transaction.status = 'failed'
                transfer_transaction.save()
                
                return Response({
                    'error': f'Transfer validation failed: {validation_message}',
                    'transaction': TransactionSerializer(transfer_transaction).data
                }, status=status.HTTP_400_BAD_REQUEST)
        
        elif transfer_type == 'international' and data.get('to_swift_code'):
            is_valid, validation_message = processor.validate_swift_code(data.get('to_swift_code'))
            if not is_valid:
                transfer_request.status = 'rejected'
                transfer_request.rejection_reason = validation_message
                transfer_request.save()
                
                transfer_transaction.status = 'failed'
                transfer_transaction.save()
                
                return Response({
                    'error': f'Transfer validation failed: {validation_message}',
                    'transaction': TransactionSerializer(transfer_transaction).data
                }, status=status.HTTP_400_BAD_REQUEST)
    
    # Calculate and update fees
    transfer_request.transfer_fee = transfer_request.get_transfer_fee()
    transfer_request.save()
    
    # Update transaction with fees
    transfer_transaction.fee = transfer_request.transfer_fee
    transfer_transaction.total_amount = amount + transfer_request.transfer_fee
    transfer_transaction.save()
    
    # DEDUCT TOTAL AMOUNT (transfer + fees) FROM BALANCE
    total_deduction = amount + transfer_request.transfer_fee
    from_account.balance -= total_deduction
    from_account.save()
    
    # Send notification after successful external transfer
    def send_notification_after_commit():
        try:
            from notifications.services import NotificationService
            notification_service = NotificationService()
            notification_service.send_notification(
                user=request.user,
                notification_type='transaction',
                template_type='transfer_sent',
                context_data={
                    'user_name': request.user.get_full_name() or request.user.username,
                    'transaction_id': str(transfer_transaction.id),
                    'amount': amount,
                    'currency': 'USD',
                    'description': description or 'External Transfer',
                    'date': transfer_transaction.created_at.strftime('%B %d, %Y at %I:%M %p'),
                    'account_number': from_account.account_number[-4:],
                    'reference': transfer_transaction.reference or 'N/A',
                    'recipient_name': beneficiary_name or 'External Account',
                    'recipient_bank': data.get('to_bank_name', 'External Bank'),
                    'transfer_type': transfer_type
                }
            )
        except Exception as e:
            # Don't fail the transfer if notification fails
            print(f"WARNING: Failed to send external transfer notification: {e}")
    
    # Use transaction.on_commit to ensure notification is sent only after successful DB commit
    transaction.on_commit(send_notification_after_commit)
    
    # Prepare response
    response_data = {
        'message': 'External transfer initiated successfully',
        'status_message': transfer_transaction.get_estimated_completion_message(),
        'transaction': TransactionSerializer(transfer_transaction).data,
        'transfer_request': TransferRequestSerializer(transfer_request).data,
        'expected_completion': transfer_request.expected_completion_date,
        'processing_info': {
            'transfer_type': transfer_type,
            'business_days_delay': processing_delay,
            'can_be_confirmed_after': transfer_transaction.confirmation_required_date,
            'estimated_fee': float(transfer_request.transfer_fee),
            'total_cost': float(transfer_transaction.total_amount)
        },
        'compliance_info': {
            'ofac_status': ofac_result['status'],
            'aml_risk_level': aml_result['risk_level'],
            'risk_score': aml_result['aml_risk_score'],
            'requires_manual_review': ofac_result.get('requires_manual_review', False) or aml_result.get('requires_enhanced_due_diligence', False)
        }
    }
    
    # Add warnings for high-risk transactions
    if aml_result['risk_level'] in ['MEDIUM', 'HIGH']:
        response_data['warnings'] = [
            f"Transaction flagged for {aml_result['risk_level']} risk - additional processing time may be required"
        ]
        if aml_result.get('requires_enhanced_due_diligence'):
            response_data['warnings'].append("Enhanced due diligence required - manual review initiated")
    
    return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def transfer_with_pin(request):
    """Transfer funds with PIN verification"""
    from accounts.models import UserProfile
    from django.contrib.auth.hashers import check_password
    
    # Extract transfer data and PIN
    transfer_data = request.data.get('transfer', {})
    pin = request.data.get('pin')
    
    if not pin:
        return Response({
            'error': 'Transfer PIN is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify user has transfer PIN and it matches
    try:
        profile = UserProfile.objects.get(user=request.user)
        if not profile.transfer_pin_hash:
            return Response({
                'error': 'Transfer PIN not set. Please set your PIN first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not check_password(pin, profile.transfer_pin_hash):
            return Response({
                'error': 'Invalid transfer PIN'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except UserProfile.DoesNotExist:
        return Response({
            'error': 'User profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check KYC status
    if not profile.is_verified or profile.kyc_status != 'approved':
        return Response({
            'error': 'KYC verification required. Please complete your KYC verification to make transfers.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Proceed with transfer logic (similar to existing transfer_funds but with PIN verification)
    from .serializers import CreateTransferSerializer
    
    serializer = CreateTransferSerializer(data=transfer_data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Get user's from account - either specified or primary account
    from_account_id = transfer_data.get('from_account_id')
    
    # Debug logging
    print(f"DEBUG: Received from_account_id: {from_account_id}")
    print(f"DEBUG: Transfer data: {transfer_data}")
    
    try:
        if from_account_id and str(from_account_id).strip():
            # Use specified account (handle both UUID strings and integers)
            from_account = BankAccount.objects.get(
                id=from_account_id,
                user=request.user, 
                status='active'
            )
            print(f"DEBUG: Selected account: {from_account.account_number} with balance: {from_account.balance}")
        else:
            # Fallback to first active account for backward compatibility
            from_account = BankAccount.objects.filter(
                user=request.user, 
                status='active'
            ).first()
            print(f"DEBUG: Using fallback account: {from_account.account_number if from_account else 'None'}")
        
        if not from_account:
            return Response({
                'error': 'No active account found' if not from_account_id else 'Specified account not found or inactive'
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except BankAccount.DoesNotExist:
        return Response({
            'error': 'Account not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get destination account info - NO VALIDATION, just save the account number
    to_account_number = transfer_data['to_account_number']
    to_account = None  # Most transfers will be external
    
    # Try to find if recipient account exists in our system (for domestic transfers)
    try:
        potential_internal_account = BankAccount.objects.get(
            account_number=to_account_number,
            status='active'
        )
        to_account = potential_internal_account
        print(f"DEBUG: Found internal account: {to_account.account_number}")
    except BankAccount.DoesNotExist:
        print(f"DEBUG: External account: {to_account_number}")
        pass  # External account - this is fine
    
    # Determine transfer type based on account patterns and data
    transfer_type = determine_transfer_type(transfer_data, to_account_number, to_account)
    
    amount = Decimal(str(transfer_data['amount']))
    description = transfer_data.get('description', '')
    
    # Get beneficiary name early to avoid UnboundLocalError
    beneficiary_name = transfer_data.get('beneficiary_name', '')
    if to_account:
        beneficiary_name = to_account.account_name or to_account.user.get_full_name()
    
    # Check balance
    from django.db import models
    pending_debits = Transaction.objects.filter(
        from_account=from_account,
        status__in=['pending', 'confirmed', 'processing']
    ).aggregate(total=models.Sum('total_amount'))['total'] or 0
    
    available_balance = from_account.balance - pending_debits
    
    if available_balance < amount:
        return Response({
            'error': f'Insufficient balance. Available: {available_balance}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create transaction with PIN verification - ALWAYS PENDING until approval
    try:
        with transaction.atomic():
            # Calculate processing delay based on transfer type
            if transfer_type == 'domestic':
                processing_delay = 1 if to_account and from_account.user == to_account.user else 2
            elif transfer_type == 'external':
                processing_delay = 3  # External bank transfers take longer
            else:  # international
                processing_delay = 5  # International transfers take the longest
            
            # Create transaction as PROCESSING (funds deducted but being processed)
            transfer_transaction = Transaction.objects.create(
                from_account=from_account,
                to_account=to_account,  # Will be None for external/international
                transaction_type='transfer',
                amount=amount,
                description=description,
                status='processing',  # Processing status indicates funds are deducted
                approval_required=True,
                confirmation_method='pin_verified',
                business_days_delay=processing_delay,
                from_balance_before=from_account.balance,
                to_balance_before=to_account.balance if to_account else Decimal('0.00'),
                
                # External transfer details - save ALL transfer information
                to_account_number=to_account_number,
                to_routing_number=transfer_data.get('to_routing_number', ''),
                to_swift_code=transfer_data.get('to_swift_code', ''),
                to_iban=transfer_data.get('to_iban', ''),
                to_bank_name=transfer_data.get('to_bank_name', ''),
                to_bank_code=transfer_data.get('to_bank_code', ''),
                beneficiary_name=beneficiary_name,
                beneficiary_address=transfer_data.get('beneficiary_address', ''),
                beneficiary_country=transfer_data.get('beneficiary_country', 'US'),
                
                # Transaction purpose and compliance
                purpose_code=transfer_data.get('purpose_code', ''),
                external_reference=transfer_data.get('external_reference', ''),
                network_status='pending',
                
                # Compliance fields
                ofac_screening_status='pending',
                aml_risk_score=transfer_data.get('aml_risk_score'),
                compliance_notes=transfer_data.get('compliance_notes', ''),
                
                # International transfer fields
                exchange_rate=Decimal(str(transfer_data.get('exchange_rate', '1.0000'))),
                network_fee=Decimal(str(transfer_data.get('network_fee', '0.00')))
            )
            print(f"DEBUG: Transaction created as pending: {transfer_transaction.reference}")
            
            # Create transfer request to calculate fees
            transfer_request = TransferRequest.objects.create(
                from_account=from_account,
                to_account_number=to_account_number,  # Always save the number
                to_account=to_account,  # Will be None for external
                amount=amount,
                description=description,
                status='processing',  # Processing status indicates funds are deducted
                transfer_type=transfer_type,
                processing_delay_days=processing_delay,
                beneficiary_name=beneficiary_name,
                transaction=transfer_transaction,
                
                # External transfer fields (if provided)
                to_routing_number=transfer_data.get('to_routing_number', ''),
                to_swift_code=transfer_data.get('to_swift_code', ''),
                to_iban=transfer_data.get('to_iban', ''),
                to_bank_name=transfer_data.get('to_bank_name', ''),
                beneficiary_address=transfer_data.get('beneficiary_address', ''),
                beneficiary_country=transfer_data.get('beneficiary_country', 'US')
            )
            print(f"DEBUG: Transfer request created: {transfer_request.id}")
            
            # Calculate and set fees
            transfer_request.transfer_fee = transfer_request.get_transfer_fee()
            transfer_request.save()
            
            # Update transaction with fees
            transfer_transaction.fee = transfer_request.transfer_fee
            transfer_transaction.total_amount = amount + transfer_request.transfer_fee
            transfer_transaction.save()
            
            # DEDUCT TOTAL AMOUNT (transfer + fees) FROM BALANCE
            total_deduction = amount + transfer_request.transfer_fee
            from_account.balance -= total_deduction
            from_account.save()
            print(f"DEBUG: Total funds deducted (amount + fees): {total_deduction}. New balance: {from_account.balance}")
            
            # Schedule notification to be sent after transaction commits successfully
            def send_notification_after_commit():
                try:
                    from notifications.services import NotificationService
                    notification_service = NotificationService()
                    notification_service.send_notification(
                        user=request.user,
                        notification_type='transaction',
                        template_type='transfer_sent',
                        context_data={
                            'user_name': request.user.get_full_name() or request.user.username,
                            'transaction_id': str(transfer_transaction.id),
                            'amount': amount,
                            'currency': 'USD',
                            'description': description or 'Transfer',
                            'date': transfer_transaction.created_at.strftime('%B %d, %Y at %I:%M %p'),
                            'account_number': from_account.account_number[-4:],
                            'reference': transfer_transaction.reference or 'N/A'
                        }
                    )
                    print("DEBUG: Notification sent successfully")
                except Exception as e:
                    # Don't fail the transfer if notification fails
                    print(f"WARNING: Failed to send notification: {e}")
            
            # Use transaction.on_commit to ensure notification is sent only after successful DB commit
            transaction.on_commit(send_notification_after_commit)
                
    except Exception as e:
        print(f"ERROR: Transaction failed: {str(e)}")
        print(f"ERROR: Exception type: {type(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': f'Transfer failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'message': 'Transfer is being processed. Funds have been deducted from your account.',
        'reference': transfer_transaction.reference,
        'status': transfer_transaction.status,
        'transfer_type': transfer_type,
        'transaction': TransactionSerializer(transfer_transaction).data,
        'estimated_completion': transfer_request.expected_completion_date.strftime('%Y-%m-%d') if transfer_request.expected_completion_date else None,
        'processing_info': {
            'business_days_delay': processing_delay,
            'transfer_type': transfer_type,
            'funds_deducted': True,
            'status': 'processing',
            'estimated_fee': float(transfer_request.transfer_fee) if transfer_request.transfer_fee else 0.00
        }
    }, status=status.HTTP_201_CREATED)
