from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import UserProfile, BankAccount
from banking.models import Transaction, Card
from decimal import Decimal
import uuid
from datetime import datetime, timezone

class Command(BaseCommand):
    help = 'Creates a test user with sample data for testing the frontend'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username for the test user', default='testuser')
        parser.add_argument('--email', type=str, help='Email for the test user', default='test@example.com')
        parser.add_argument('--password', type=str, help='Password for the test user', default='testpass123')
        parser.add_argument('--first_name', type=str, help='First name', default='John')
        parser.add_argument('--last_name', type=str, help='Last name', default='Doe')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        # Delete existing test user if exists
        try:
            existing_user = User.objects.get(username=username)
            self.stdout.write(self.style.WARNING(f'Deleting existing user: {username}'))
            existing_user.delete()
        except User.DoesNotExist:
            pass

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        # Create user profile
        profile = UserProfile.objects.create(
            user=user,
            middle_name='',
            phone_number='+1234567890',
            date_of_birth='1990-01-01',
            gender='male',
            address='123 Test Street',
            city='Test City',
            state='Test State',
            postal_code='12345',
            country='United States',
            kyc_status='approved',
            is_verified=True,
            customer_tier='standard'
        )

        # Create bank accounts
        checking_account = BankAccount.objects.create(
            user=user,
            account_name='Test Checking Account',
            account_type='current',
            balance=Decimal('5000.00'),
            available_balance=Decimal('4500.00'),
            currency='USD',
            status='active'
        )

        savings_account = BankAccount.objects.create(
            user=user,
            account_name='Test Savings Account',
            account_type='savings',
            balance=Decimal('15000.00'),
            available_balance=Decimal('15000.00'),
            currency='USD',
            status='active'
        )

        # Create sample transactions
        transactions_data = [
            {
                'transaction_type': 'deposit',
                'amount': Decimal('2000.00'),
                'fee': Decimal('0.00'),
                'description': 'Direct Deposit - Salary',
                'status': 'completed',
                'to_account': checking_account,
            },
            {
                'transaction_type': 'withdrawal',
                'amount': Decimal('500.00'),
                'fee': Decimal('2.50'),
                'description': 'ATM Withdrawal',
                'status': 'completed',
                'from_account': checking_account,
            },
            {
                'transaction_type': 'transfer',
                'amount': Decimal('1000.00'),
                'fee': Decimal('0.00'),
                'description': 'Transfer to Savings',
                'status': 'completed',
                'from_account': checking_account,
                'to_account': savings_account,
            },
            {
                'transaction_type': 'payment',
                'amount': Decimal('150.00'),
                'fee': Decimal('0.00'),
                'description': 'Online Purchase',
                'status': 'completed',
                'from_account': checking_account,
            },
            {
                'transaction_type': 'deposit',
                'amount': Decimal('500.00'),
                'fee': Decimal('0.00'),
                'description': 'Cash Deposit',
                'status': 'pending',
                'to_account': savings_account,
            },
        ]

        for transaction_data in transactions_data:
            Transaction.objects.create(**transaction_data)

        # Create a sample card
        Card.objects.create(
            account=checking_account,
            card_number='1234567890123456',
            card_name=f'{first_name} {last_name}',
            card_type='debit',
            expiry_date='2027-12-31',
            cvv='123',
            status='active',
            daily_limit=Decimal('1000.00'),
            monthly_limit=Decimal('5000.00')
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created test user: {username}\n'
                f'Email: {email}\n'
                f'Password: {password}\n'
                f'Created {BankAccount.objects.filter(user=user).count()} bank accounts\n'
                f'Created {Transaction.objects.filter(from_account__user=user).count() + Transaction.objects.filter(to_account__user=user).count()} transactions\n'
                f'Created {Card.objects.filter(account__user=user).count()} cards\n'
                f'User profile KYC status: {profile.kyc_status}\n'
                f'User is verified: {profile.is_verified}'
            )
        )

        # Display login instructions
        self.stdout.write(
            self.style.SUCCESS(
                '\n=== LOGIN INSTRUCTIONS ===\n'
                f'1. Go to http://localhost:3001/signin (or your frontend URL)\n'
                f'2. Username: {username}\n'
                f'3. Password: {password}\n'
                f'4. Click "Sign in" to access the dashboard\n'
                '=========================='
            )
        ) 
 