from django.core.management.base import BaseCommand, CommandError
from django.db import transaction as db_transaction
from django.utils import timezone
from django.db.models import Q
from banking.models import Transaction, get_next_business_day
from banking.external_processors import get_payment_processor, get_compliance_checker
from accounts.models import BankAccount
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Process pending transactions - confirm eligible transactions and complete confirmed ones'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without making actual changes',
        )
        parser.add_argument(
            '--confirm-only',
            action='store_true',
            help='Only confirm eligible transactions, do not complete them',
        )
        parser.add_argument(
            '--complete-only',
            action='store_true',
            help='Only complete confirmed transactions, do not confirm new ones',
        )
        parser.add_argument(
            '--process-external',
            action='store_true',
            help='Process external transfers through mock payment networks',
        )
        parser.add_argument(
            '--max-transactions',
            type=int,
            default=100,
            help='Maximum number of transactions to process in one run',
        )
    
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        confirm_only = options['confirm_only']
        complete_only = options['complete_only']
        process_external = options['process_external']
        max_transactions = options['max_transactions']
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Starting transaction processing (dry-run: {dry_run})'
            )
        )
        
        if not complete_only:
            # Step 1: Confirm eligible pending transactions
            confirmed_count = self.confirm_eligible_transactions(dry_run, max_transactions)
            self.stdout.write(
                self.style.SUCCESS(f'Confirmed {confirmed_count} transactions')
            )
        
        if process_external:
            # Step 1.5: Submit eligible external transfers to payment networks
            submitted_count = self.submit_external_transfers(dry_run, max_transactions)
            self.stdout.write(
                self.style.SUCCESS(f'Submitted {submitted_count} external transfers')
            )
        
        if not confirm_only:
            # Step 2: Complete confirmed transactions
            completed_count = self.complete_confirmed_transactions(dry_run, max_transactions)
            self.stdout.write(
                self.style.SUCCESS(f'Completed {completed_count} transactions')
            )
        
        self.stdout.write(
            self.style.SUCCESS('Transaction processing completed successfully')
        )
    
    def confirm_eligible_transactions(self, dry_run=False, max_count=100):
        """Confirm transactions that are eligible for confirmation"""
        # Find pending transactions that can be confirmed
        eligible_transactions = Transaction.objects.filter(
            status='pending',
            confirmation_method='auto',
            confirmation_required_date__lte=timezone.now()
        ).order_by('created_at')[:max_count]
        
        confirmed_count = 0
        
        for transaction in eligible_transactions:
            try:
                if transaction.can_be_confirmed():
                    self.stdout.write(
                        f'Confirming transaction {transaction.reference} - {transaction.amount}'
                    )
                    
                    if not dry_run:
                        # Confirm the transaction
                        success = transaction.confirm_transaction(confirmed_by="System Cron")
                        
                        if success:
                            confirmed_count += 1
                        else:
                            self.stdout.write(
                                self.style.ERROR(
                                    f'Failed to confirm transaction {transaction.reference}'
                                )
                            )
                    else:
                        confirmed_count += 1
                        self.stdout.write(
                            self.style.WARNING(f'[DRY RUN] Would confirm {transaction.reference}')
                        )
                        
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Error confirming transaction {transaction.reference}: {str(e)}'
                    )
                )
                logger.error(f'Error confirming transaction {transaction.reference}: {str(e)}')
        
        return confirmed_count
    
    def submit_external_transfers(self, dry_run=False, max_count=100):
        """Submit confirmed external transfers to payment networks"""
        # Find confirmed external transfers that haven't been submitted yet
        external_transfers = Transaction.objects.filter(
            status='confirmed',
            to_account__isnull=True,  # External transfers have no local to_account
            transfer_request__transfer_type__in=['domestic_external', 'international'],
            transfer_request__external_reference__isnull=True  # Not yet submitted
        ).select_related('transfer_request').order_by('confirmed_at')[:max_count]
        
        submitted_count = 0
        
        for transaction in external_transfers:
            try:
                transfer_request = transaction.transfer_request
                
                self.stdout.write(
                    f'Submitting external transfer {transaction.reference} to {transfer_request.transfer_type} network'
                )
                
                if not dry_run:
                    # Get appropriate payment processor
                    processor = get_payment_processor(transfer_request.transfer_type)
                    
                    if processor:
                        # Submit to external network
                        result = processor.submit_transfer(transfer_request)
                        
                        # Update transfer request with network response
                        transfer_request.network_response = result
                        transfer_request.external_reference = result.get('reference_id', '')
                        transfer_request.network_status = result.get('status', 'unknown')
                        
                        if result.get('success'):
                            # Add network fee if provided
                            if 'network_fee' in result:
                                transfer_request.network_fee = result['network_fee']
                                transfer_request.total_cost = transfer_request.amount + transfer_request.transfer_fee + transfer_request.network_fee
                            
                            # Update transaction status
                            transaction.status = 'processing'
                            transaction.narration = f"Submitted to {processor.name}"
                            
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f'Successfully submitted {transaction.reference} - Network Ref: {result.get("reference_id")}'
                                )
                            )
                            submitted_count += 1
                        else:
                            # Network rejected the transfer
                            transaction.status = 'failed'
                            transfer_request.status = 'failed'
                            transfer_request.rejection_reason = result.get('error', 'External network error')
                            
                            self.stdout.write(
                                self.style.ERROR(
                                    f'External network rejected {transaction.reference}: {result.get("error")}'
                                )
                            )
                        
                        # Save updates
                        transfer_request.save()
                        transaction.save()
                    else:
                        self.stdout.write(
                            self.style.ERROR(
                                f'No processor available for transfer type: {transfer_request.transfer_type}'
                            )
                        )
                else:
                    submitted_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'[DRY RUN] Would submit {transaction.reference}')
                    )
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Error submitting external transfer {transaction.reference}: {str(e)}'
                    )
                )
                logger.error(f'Error submitting external transfer {transaction.reference}: {str(e)}')
        
        return submitted_count
    
    def complete_confirmed_transactions(self, dry_run=False, max_count=100):
        """Complete confirmed transactions by actually moving the money"""
        # Find confirmed transactions that are ready for completion
        ready_transactions = Transaction.objects.filter(
            status__in=['confirmed', 'processing'],
            expected_completion_date__lte=date.today()
        ).order_by('confirmed_at')[:max_count]
        
        completed_count = 0
        
        for transaction in ready_transactions:
            try:
                # Check if it's an external transfer in processing
                if transaction.status == 'processing' and hasattr(transaction, 'transfer_request'):
                    transfer_request = transaction.transfer_request
                    if transfer_request.transfer_type in ['domestic_external', 'international']:
                        # Check external network status
                        completion_result = self.check_external_transfer_completion(transaction, dry_run)
                        if completion_result:
                            completed_count += 1
                        continue
                
                # Regular internal transaction processing
                self.stdout.write(
                    f'Completing transaction {transaction.reference} - {transaction.amount}'
                )
                
                if not dry_run:
                    success = self.process_transaction(transaction)
                    if success:
                        completed_count += 1
                    else:
                        self.stdout.write(
                            self.style.ERROR(
                                f'Failed to complete transaction {transaction.reference}'
                            )
                        )
                else:
                    completed_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'[DRY RUN] Would complete {transaction.reference}')
                    )
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Error completing transaction {transaction.reference}: {str(e)}'
                    )
                )
                logger.error(f'Error completing transaction {transaction.reference}: {str(e)}')
        
        return completed_count
    
    def check_external_transfer_completion(self, transaction, dry_run=False):
        """Check if external transfer has completed"""
        transfer_request = transaction.transfer_request
        
        if not transfer_request.external_reference:
            return False
        
        try:
            # Get payment processor and check status
            processor = get_payment_processor(transfer_request.transfer_type)
            if processor:
                status_result = processor.check_transfer_status(transfer_request.external_reference)
                
                self.stdout.write(
                    f'External transfer {transaction.reference} status: {status_result.get("status")}'
                )
                
                if status_result.get('status') == 'completed':
                    if not dry_run:
                        # Mark as completed and debit the sender's account
                        with db_transaction.atomic():
                            # Debit from sender's account (external transfers only debit, no credit locally)
                            from_account = transaction.from_account
                            if from_account and from_account.can_debit(transaction.total_amount):
                                from_account.balance -= transaction.total_amount
                                from_account.save()
                                
                                # Update transaction
                                transaction.status = 'completed'
                                transaction.processed_at = timezone.now()
                                transaction.completed_at = timezone.now()
                                transaction.from_account_balance_after = from_account.balance
                                transaction.narration = f"External transfer completed via {processor.name}"
                                transaction.save()
                                
                                # Update transfer request
                                transfer_request.status = 'completed'
                                transfer_request.network_status = 'completed'
                                transfer_request.save()
                                
                                self.stdout.write(
                                    self.style.SUCCESS(
                                        f'External transfer {transaction.reference} completed successfully'
                                    )
                                )
                                return True
                            else:
                                # Insufficient funds - this shouldn't happen but handle gracefully
                                transaction.status = 'failed'
                                transaction.save()
                                transfer_request.status = 'failed'
                                transfer_request.rejection_reason = 'Insufficient funds at completion'
                                transfer_request.save()
                                
                                self.stdout.write(
                                    self.style.ERROR(
                                        f'External transfer {transaction.reference} failed - insufficient funds'
                                    )
                                )
                                return False
                    else:
                        self.stdout.write(
                            self.style.WARNING(f'[DRY RUN] Would complete external transfer {transaction.reference}')
                        )
                        return True
                        
                elif status_result.get('status') == 'failed':
                    if not dry_run:
                        # Mark as failed
                        transaction.status = 'failed'
                        transaction.save()
                        transfer_request.status = 'failed'
                        transfer_request.rejection_reason = 'External network failure'
                        transfer_request.save()
                        
                        self.stdout.write(
                            self.style.ERROR(
                                f'External transfer {transaction.reference} failed in external network'
                            )
                        )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(
                    f'Error checking external transfer status {transaction.reference}: {str(e)}'
                )
            )
            logger.error(f'Error checking external transfer status {transaction.reference}: {str(e)}')
        
        return False
    
    def process_transaction(self, transaction):
        """Actually process the transaction by moving money"""
        try:
            with db_transaction.atomic():
                if transaction.transaction_type == 'transfer':
                    return self.process_transfer(transaction)
                elif transaction.transaction_type == 'deposit':
                    return self.process_deposit(transaction)
                elif transaction.transaction_type == 'withdrawal':
                    return self.process_withdrawal(transaction)
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Unknown transaction type: {transaction.transaction_type}'
                        )
                    )
                    return False
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Database error processing {transaction.reference}: {str(e)}')
            )
            return False
    
    def process_transfer(self, transaction):
        """Process a transfer transaction"""
        from_account = transaction.from_account
        to_account = transaction.to_account
        amount = transaction.total_amount
        
        # Verify accounts still exist and are active
        if not from_account or not to_account:
            transaction.status = 'failed'
            transaction.save()
            return False
        
        if from_account.status != 'active' or to_account.status != 'active':
            transaction.status = 'failed'
            transaction.save()
            return False
        
        # Check if from_account still has sufficient balance
        if not from_account.can_debit(amount):
            transaction.status = 'failed'
            transaction.save()
            self.stdout.write(
                self.style.ERROR(
                    f'Insufficient balance for transfer {transaction.reference}'
                )
            )
            return False
        
        # Perform the transfer
        from_account.balance -= amount
        from_account.save()
        
        to_account.balance += transaction.amount  # Don't include fee in credit
        to_account.save()
        
        # Update transaction
        transaction.status = 'completed'
        transaction.processed_at = timezone.now()
        transaction.completed_at = timezone.now()
        transaction.from_account_balance_after = from_account.balance
        transaction.to_account_balance_after = to_account.balance
        transaction.save()
        
        return True
    
    def process_deposit(self, transaction):
        """Process a deposit transaction"""
        to_account = transaction.to_account
        amount = transaction.amount
        
        # Verify account still exists and is active
        if not to_account or to_account.status != 'active':
            transaction.status = 'failed'
            transaction.save()
            return False
        
        # Perform the deposit
        to_account.balance += amount
        to_account.save()
        
        # Update transaction
        transaction.status = 'completed'
        transaction.processed_at = timezone.now()
        transaction.completed_at = timezone.now()
        transaction.to_account_balance_after = to_account.balance
        transaction.save()
        
        return True
    
    def process_withdrawal(self, transaction):
        """Process a withdrawal transaction"""
        from_account = transaction.from_account
        amount = transaction.total_amount
        
        # Verify account still exists and is active
        if not from_account or from_account.status != 'active':
            transaction.status = 'failed'
            transaction.save()
            return False
        
        # Check if account still has sufficient balance
        if not from_account.can_debit(amount):
            transaction.status = 'failed'
            transaction.save()
            self.stdout.write(
                self.style.ERROR(
                    f'Insufficient balance for withdrawal {transaction.reference}'
                )
            )
            return False
        
        # Perform the withdrawal
        from_account.balance -= amount
        from_account.save()
        
        # Update transaction
        transaction.status = 'completed'
        transaction.processed_at = timezone.now()
        transaction.completed_at = timezone.now()
        transaction.from_account_balance_after = from_account.balance
        transaction.save()
        
        return True 