from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import BankAccount, UserProfile
from decimal import Decimal


class Command(BaseCommand):
    help = 'Create test bank accounts for transfer testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating test accounts...'))
        
        # Test data for accounts
        test_accounts = [
            {
                'username': 'johnsmith',
                'email': 'john@example.com',
                'first_name': 'John',
                'last_name': 'Smith',
                'phone': '+15551234567',
                'account_number': '1234567890',
                'account_name': 'John Smith Checking',
                'account_type': 'checking',
                'balance': Decimal('5000.00')
            },
            {
                'username': 'maryjones',
                'email': 'mary@example.com',
                'first_name': 'Mary',
                'last_name': 'Jones',
                'phone': '+15559876543',
                'account_number': '9876543210',
                'account_name': 'Mary Jones Savings',
                'account_type': 'savings',
                'balance': Decimal('3000.00')
            },
            {
                'username': 'testuser',
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User',
                'phone': '+15555555666',
                'account_number': '5555666677',
                'account_name': 'Test Business Account',
                'account_type': 'business',
                'balance': Decimal('10000.00')
            },
            {
                'username': 'sarahwilson',
                'email': 'sarah@example.com',
                'first_name': 'Sarah',
                'last_name': 'Wilson',
                'phone': '+15551111222',
                'account_number': '1111222233',
                'account_name': 'Sarah Wilson Checking',
                'account_type': 'checking',
                'balance': Decimal('7500.00')
            },
            {
                'username': 'mikebrown',
                'email': 'mike@example.com',
                'first_name': 'Mike',
                'last_name': 'Brown',
                'phone': '+15554444555',
                'account_number': '4444555566',
                'account_name': 'Mike Brown Savings',
                'account_type': 'savings',
                'balance': Decimal('12000.00')
            }
        ]
        
        created_count = 0
        for account_data in test_accounts:
            # Create or get user
            user, user_created = User.objects.get_or_create(
                username=account_data['username'],
                defaults={
                    'email': account_data['email'],
                    'first_name': account_data['first_name'],
                    'last_name': account_data['last_name']
                }
            )
            
            if user_created:
                self.stdout.write(f'Created user: {user.username}')
                
                # Create user profile for new users
                profile, profile_created = UserProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'is_verified': True,
                        'kyc_status': 'approved',
                        'phone_number': account_data['phone'],
                        'date_of_birth': '1990-01-01',
                        'address': '123 Test Street',
                        'city': 'Test City',
                        'state': 'Test State',
                        'postal_code': '12345',
                        'country': 'US'
                    }
                )
                if profile_created:
                    self.stdout.write(f'Created profile for: {user.username}')
            
            # Create bank account
            account, account_created = BankAccount.objects.get_or_create(
                user=user,
                account_number=account_data['account_number'],
                defaults={
                    'account_name': account_data['account_name'],
                    'account_type': account_data['account_type'],
                    'balance': account_data['balance'],
                    'status': 'active',
                    'currency': 'USD',
                    'minimum_balance': Decimal('0.00'),
                    'daily_transaction_limit': Decimal('10000.00'),
                    'monthly_transaction_limit': Decimal('50000.00')
                }
            )
            
            if account_created:
                self.stdout.write(f'Created account: {account.account_number} for {user.username} with balance ${account.balance}')
                created_count += 1
            else:
                self.stdout.write(f'Account {account.account_number} already exists for {user.username}')
        
        self.stdout.write(self.style.SUCCESS(f'Created {created_count} new test accounts'))
        
        # Display all accounts
        self.stdout.write(self.style.SUCCESS('\n=== All Bank Accounts in System ==='))
        accounts = BankAccount.objects.all().order_by('created_at')
        for acc in accounts:
            self.stdout.write(f'{acc.account_number} - {acc.account_name} ({acc.user.username}) - ${acc.balance} [{acc.account_type}]')
        
        self.stdout.write(self.style.SUCCESS(f'\nTotal accounts in system: {accounts.count()}'))
        self.stdout.write(self.style.SUCCESS('\nYou can now use these account numbers for testing transfers!'))
