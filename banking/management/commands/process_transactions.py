from django.core.management.base import BaseCommand
from django.utils import timezone
from banking.models import Transaction
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Process pending transactions that are ready for confirmation'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run in dry-run mode without actually processing transactions',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force process all pending transactions regardless of delay',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=100,
            help='Maximum number of transactions to process in one run',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']
        limit = options['limit']
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Starting transaction processing {"(DRY RUN)" if dry_run else ""}'
            )
        )
        
        # Get pending transactions that are ready to be processed
        queryset = Transaction.objects.filter(status='pending').order_by('created_at')
        
        if not force:
            queryset = queryset.filter(
                auto_confirm=True
            )
        
        transactions_to_process = []
        now = timezone.now()
        
        for transaction in queryset[:limit]:
            if force or transaction.can_be_processed():
                transactions_to_process.append(transaction)
        
        if not transactions_to_process:
            self.stdout.write(
                self.style.WARNING('No transactions ready for processing')
            )
            return
        
        self.stdout.write(
            f'Found {len(transactions_to_process)} transactions ready for processing'
        )
        
        processed_count = 0
        failed_count = 0
        
        for transaction in transactions_to_process:
            if dry_run:
                self.stdout.write(
                    f'[DRY RUN] Would process: {transaction.reference} - '
                    f'{transaction.transaction_type} ${transaction.amount}'
                )
                processed_count += 1
            else:
                try:
                    if transaction.process_transaction():
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'✓ Processed: {transaction.reference} - '
                                f'{transaction.transaction_type} ${transaction.amount}'
                            )
                        )
                        processed_count += 1
                        logger.info(f'Successfully processed transaction {transaction.reference}')
                    else:
                        self.stdout.write(
                            self.style.ERROR(
                                f'✗ Failed: {transaction.reference} - {transaction.failure_reason}'
                            )
                        )
                        failed_count += 1
                        logger.error(f'Failed to process transaction {transaction.reference}: {transaction.failure_reason}')
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f'✗ Error processing {transaction.reference}: {str(e)}'
                        )
                    )
                    failed_count += 1
                    logger.error(f'Exception processing transaction {transaction.reference}: {str(e)}')
        
        # Summary
        total = processed_count + failed_count
        self.stdout.write('\n' + '='*50)
        self.stdout.write(f'PROCESSING SUMMARY:')
        self.stdout.write(f'Total processed: {processed_count}/{total}')
        if failed_count:
            self.stdout.write(self.style.ERROR(f'Failed: {failed_count}/{total}'))
        
        if not dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Transaction processing completed. '
                    f'Success: {processed_count}, Failed: {failed_count}'
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING('DRY RUN completed - no transactions were actually processed')
            )
