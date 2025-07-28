#!/usr/bin/env python
"""
Test script for the new transfer functionality that:
- Accepts any recipient account number
- Always saves as pending
- Immediately holds funds
- Supports fund restoration on failure
"""

import os
import django
import sys

# Setup Django environment
sys.path.append('/Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import BankAccount, UserProfile
from banking.models import Transaction, TransferRequest
from decimal import Decimal
from django.contrib.auth.hashers import make_password

def test_new_transfer_system():
    """Test the new transfer system"""
    print("🧪 Testing New Transfer System")
    print("=" * 50)
    
    # Create test users if they don't exist
    try:
        user1 = User.objects.get(username='testuser1')
        print(f"✅ Found existing user: {user1.username}")
    except User.DoesNotExist:
        user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User1'
        )
        print(f"✅ Created user: {user1.username}")
    
    # Create user profile and set transfer PIN
    from datetime import date
    import random
    try:
        profile1 = UserProfile.objects.get(user=user1)
        print(f"✅ Found existing profile for user: {user1.username}")
    except UserProfile.DoesNotExist:
        random_phone = f"+123456{random.randint(1000, 9999)}"
        profile1 = UserProfile.objects.create(
            user=user1,
            is_verified=True,
            kyc_status='approved',
            transfer_pin_hash=make_password('1234'),
            date_of_birth=date(1990, 1, 1),
            phone_number=random_phone,
            address='123 Test St',
            city='Test City',
            state='TS',
            postal_code='12345',
            country='US'
        )
        print(f"✅ Created profile for user: {user1.username}")
    
    # Ensure profile has PIN and verification
    if not profile1.transfer_pin_hash:
        profile1.transfer_pin_hash = make_password('1234')
    profile1.is_verified = True
    profile1.kyc_status = 'approved'
    profile1.save()
    
    # Create test bank account
    account1, created = BankAccount.objects.get_or_create(
        user=user1,
        defaults={
            'account_name': 'Test Account 1',
            'account_type': 'savings',
            'balance': Decimal('1000.00'),
            'status': 'active'
        }
    )
    if created:
        print(f"✅ Created account: {account1.account_number} with balance ${account1.balance}")
    else:
        # Reset balance for testing
        account1.balance = Decimal('1000.00')
        account1.save()
        print(f"✅ Reset account balance: {account1.account_number} to ${account1.balance}")
    
    # Test different transfer types
    test_transfers = [
        {
            'name': 'Domestic Transfer (External US Bank)',
            'to_account_number': '123456789',
            'to_routing_number': '021000021',
            'beneficiary_name': 'John Doe',
            'amount': '100.00',
            'expected_type': 'external'
        },
        {
            'name': 'International Transfer (SWIFT)',
            'to_account_number': 'GB82WEST12345698765432',
            'to_swift_code': 'DEUTDEFF',
            'beneficiary_name': 'Jane Smith',
            'beneficiary_country': 'DE',
            'amount': '200.00',
            'expected_type': 'international'
        },
        {
            'name': 'Unknown External Transfer',
            'to_account_number': '9876543210123',
            'beneficiary_name': 'Unknown Bank Customer',
            'amount': '50.00',
            'expected_type': 'external'
        }
    ]
    
    print(f"\n📊 Initial Account Balance: ${account1.balance}")
    print("-" * 50)
    
    created_transactions = []
    
    for i, transfer in enumerate(test_transfers, 1):
        print(f"\n🔄 Test {i}: {transfer['name']}")
        
        # Simulate the transfer_with_pin logic
        from banking.views import determine_transfer_type
        from django.db import transaction as db_transaction
        
        # Test transfer type determination
        transfer_type = determine_transfer_type(transfer, transfer['to_account_number'], None)
        print(f"   🏷️  Transfer Type: {transfer_type} (expected: {transfer['expected_type']})")
        
        # Verify balance before
        account1.refresh_from_db()
        balance_before = account1.balance
        amount = Decimal(transfer['amount'])
        
        print(f"   💰 Balance Before: ${balance_before}")
        print(f"   💸 Transfer Amount: ${amount}")
        
        # Create transaction as pending and hold funds
        try:
            # Disable signals to avoid notification issues during testing
            from django.db.models.signals import post_save
            from banking.models import Transaction
            post_save.disconnect(sender=Transaction)
            
            with db_transaction.atomic():
                # Create pending transaction
                transfer_transaction = Transaction.objects.create(
                    from_account=account1,
                    to_account=None,  # External transfer
                    transaction_type='transfer',
                    amount=amount,
                    description=f"Test {transfer['name']}",
                    status='pending',
                    approval_required=True,
                    confirmation_method='pin_verified',
                    business_days_delay=3,
                    from_account_balance_before=account1.balance,
                    to_account_balance_before=Decimal('0.00')
                )
                
                # IMMEDIATELY DEDUCT FUNDS (put on hold)
                account1.balance -= amount
                account1.save()
                
                # Create transfer request
                transfer_request = TransferRequest.objects.create(
                    from_account=account1,
                    to_account_number=transfer['to_account_number'],
                    to_account=None,
                    amount=amount,
                    description=transfer_transaction.description,
                    status='pending',
                    transfer_type=transfer_type,
                    processing_delay_days=3,
                    beneficiary_name=transfer['beneficiary_name'],
                    transaction=transfer_transaction,
                    to_routing_number=transfer.get('to_routing_number', ''),
                    to_swift_code=transfer.get('to_swift_code', ''),
                    beneficiary_country=transfer.get('beneficiary_country', 'US')
                )
                
                created_transactions.append(transfer_transaction)
            
            # Refresh data after transaction commit
            account1.refresh_from_db()
            print(f"   ✅ Transaction Created: {transfer_transaction.reference}")
            print(f"   💰 Balance After Hold: ${account1.balance}")
            print(f"   📋 Status: {transfer_transaction.status}")
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # Test fund restoration
    print(f"\n🔄 Testing Fund Restoration")
    print("-" * 50)
    
    if created_transactions:
        test_transaction = created_transactions[0]
        account1.refresh_from_db()
        balance_before_restore = account1.balance
        
        print(f"   💰 Balance Before Restore: ${balance_before_restore}")
        print(f"   🔄 Failing transaction: {test_transaction.reference}")
        
        # Test the fail_transaction method
        success = test_transaction.fail_transaction(
            reason="Test failure for fund restoration",
            failed_by="Test Script"
        )
        
        if success:
            account1.refresh_from_db()
            print(f"   ✅ Transaction Failed Successfully")
            print(f"   💰 Balance After Restore: ${account1.balance}")
            print(f"   📋 New Status: {test_transaction.status}")
            print(f"   📝 Failure Reason: {test_transaction.failure_reason}")
        else:
            print(f"   ❌ Failed to fail transaction")
    
    # Summary
    print(f"\n📊 Final Summary")
    print("=" * 50)
    account1.refresh_from_db()
    pending_transactions = Transaction.objects.filter(
        from_account=account1,
        status='pending'
    ).count()
    failed_transactions = Transaction.objects.filter(
        from_account=account1,
        status='failed'
    ).count()
    
    print(f"   💰 Final Account Balance: ${account1.balance}")
    print(f"   📋 Pending Transactions: {pending_transactions}")
    print(f"   ❌ Failed Transactions: {failed_transactions}")
    print(f"   📝 Account Number: {account1.account_number}")

if __name__ == '__main__':
    test_new_transfer_system()
