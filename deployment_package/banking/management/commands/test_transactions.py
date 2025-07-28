from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import BankAccount
from banking.models import Transaction, TransferRequest
from decimal import Decimal
import json


class Command(BaseCommand):
    help = 'Test transaction processing and create sample data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Clean up test data before creating new data',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=== Testing Transaction System ==='))

        # Clean up if requested
        if options['clean']:
            self.stdout.write('Cleaning up test data...')
            Transaction.objects.filter(description__icontains='test').delete()
            TransferRequest.objects.filter(description__icontains='test').delete()
            User.objects.filter(username__startswith='testuser').delete()

        # Create test users
        self.stdout.write('Creating test users and accounts...')
        
        user1, created = User.objects.get_or_create(
            username='testuser1',
            defaults={
                'email': 'test1@example.com',
                'first_name': 'Test',
                'last_name': 'User One'
            }
        )
        
        user2, created = User.objects.get_or_create(
            username='testuser2',
            defaults={
                'email': 'test2@example.com',
                'first_name': 'Test',
                'last_name': 'User Two'
            }
        )

        # Create test accounts
        account1, created = BankAccount.objects.get_or_create(
            user=user1,
            defaults={
                'account_number': '1234567890',
                'account_type': 'savings',
                'balance': Decimal('1000.00'),
                'status': 'active'
            }
        )
        
        account2, created = BankAccount.objects.get_or_create(
            user=user2,
            defaults={
                'account_number': '0987654321',
                'account_type': 'checking',
                'balance': Decimal('500.00'),
                'status': 'active'
            }
        )

        self.stdout.write(f'Account 1: {account1.account_number} - ${account1.balance}')
        self.stdout.write(f'Account 2: {account2.account_number} - ${account2.balance}')

        # Test 1: Deposit
        self.stdout.write('\n=== Test 1: Deposit Transaction ===')
        
        deposit = Transaction.objects.create(
            to_account=account1,
            transaction_type='deposit',
            amount=Decimal('250.00'),
            description='Test deposit transaction',
            status='pending',
            auto_confirm=True,
            confirmation_delay_hours=0,
            deposit_source='mobile',
            channel='mobile'
        )
        
        self.stdout.write(f'Created deposit: {deposit.reference}')
        balance_before = account1.balance
        
        success = deposit.process_transaction()
        account1.refresh_from_db()
        
        self.stdout.write(f'Processing success: {success}')
        self.stdout.write(f'Status: {deposit.status}')
        self.stdout.write(f'Balance before: ${balance_before}')
        self.stdout.write(f'Balance after: ${account1.balance}')
        
        if success and account1.balance == balance_before + Decimal('250.00'):
            self.stdout.write(self.style.SUCCESS('✅ Deposit test PASSED'))
        else:
            self.stdout.write(self.style.ERROR('❌ Deposit test FAILED'))

        # Test 2: Withdrawal
        self.stdout.write('\n=== Test 2: Withdrawal Transaction ===')
        
        withdrawal = Transaction.objects.create(
            from_account=account1,
            transaction_type='withdrawal',
            amount=Decimal('100.00'),
            description='Test withdrawal transaction',
            status='pending',
            auto_confirm=True,
            confirmation_delay_hours=0,
            channel='mobile'
        )
        
        self.stdout.write(f'Created withdrawal: {withdrawal.reference}')
        balance_before = account1.balance
        
        success = withdrawal.process_transaction()
        account1.refresh_from_db()
        
        self.stdout.write(f'Processing success: {success}')
        self.stdout.write(f'Status: {withdrawal.status}')
        self.stdout.write(f'Balance before: ${balance_before}')
        self.stdout.write(f'Balance after: ${account1.balance}')
        
        if success and account1.balance == balance_before - Decimal('100.00'):
            self.stdout.write(self.style.SUCCESS('✅ Withdrawal test PASSED'))
        else:
            self.stdout.write(self.style.ERROR('❌ Withdrawal test FAILED'))

        # Test 3: Transfer
        self.stdout.write('\n=== Test 3: Internal Transfer ===')
        
        transfer = Transaction.objects.create(
            from_account=account1,
            to_account=account2,
            transaction_type='transfer',
            amount=Decimal('150.00'),
            description='Test internal transfer',
            status='pending',
            auto_confirm=True,
            confirmation_delay_hours=0,
            channel='mobile'
        )
        
        self.stdout.write(f'Created transfer: {transfer.reference}')
        balance1_before = account1.balance
        balance2_before = account2.balance
        
        success = transfer.process_transaction()
        account1.refresh_from_db()
        account2.refresh_from_db()
        
        self.stdout.write(f'Processing success: {success}')
        self.stdout.write(f'Status: {transfer.status}')
        self.stdout.write(f'From account balance: ${balance1_before} -> ${account1.balance}')
        self.stdout.write(f'To account balance: ${balance2_before} -> ${account2.balance}')
        
        if (success and 
            account1.balance == balance1_before - Decimal('150.00') and 
            account2.balance == balance2_before + Decimal('150.00')):
            self.stdout.write(self.style.SUCCESS('✅ Transfer test PASSED'))
        else:
            self.stdout.write(self.style.ERROR('❌ Transfer test FAILED'))

        # Test 4: Insufficient funds
        self.stdout.write('\n=== Test 4: Insufficient Funds ===')
        
        overdraft = Transaction.objects.create(
            from_account=account1,
            transaction_type='withdrawal',
            amount=Decimal('10000.00'),  # More than available
            description='Test insufficient funds',
            status='pending',
            auto_confirm=True,
            confirmation_delay_hours=0,
            channel='mobile'
        )
        
        balance_before = account1.balance
        success = overdraft.process_transaction()
        account1.refresh_from_db()
        
        self.stdout.write(f'Processing success: {success}')
        self.stdout.write(f'Status: {overdraft.status}')
        self.stdout.write(f'Failure reason: {overdraft.failure_reason}')
        self.stdout.write(f'Balance unchanged: ${balance_before} -> ${account1.balance}')
        
        if not success and overdraft.status == 'failed' and account1.balance == balance_before:
            self.stdout.write(self.style.SUCCESS('✅ Insufficient funds test PASSED'))
        else:
            self.stdout.write(self.style.ERROR('❌ Insufficient funds test FAILED'))

        # Summary
        self.stdout.write('\n=== Transaction Summary ===')
        
        transactions = Transaction.objects.filter(
            description__icontains='test'
        ).order_by('-created_at')
        
        for txn in transactions:
            direction = "TO" if txn.to_account else "FROM"
            account_num = txn.to_account.account_number if txn.to_account else txn.from_account.account_number
            
            self.stdout.write(
                f'{txn.reference}: {txn.transaction_type.upper()} ${txn.amount} '
                f'{direction} {account_num} - {txn.status}'
            )

        self.stdout.write(f'\nFinal Balances:')
        account1.refresh_from_db()
        account2.refresh_from_db()
        self.stdout.write(f'Account 1 ({account1.account_number}): ${account1.balance}')
        self.stdout.write(f'Account 2 ({account2.account_number}): ${account2.balance}')

        self.stdout.write(self.style.SUCCESS('\n=== Test Complete ==='))
