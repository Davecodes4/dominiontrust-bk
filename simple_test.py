#!/usr/bin/env python3
"""
Simple test script to verify transaction processing with existing accounts
"""

import os
import sys
import django
from decimal import Decimal

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from accounts.models import BankAccount
from banking.models import Transaction

def test_with_existing_account():
    """Test transaction processing with an existing account"""
    print("=== Testing Transaction Processing ===\n")
    
    try:
        # Get an existing active account
        account = BankAccount.objects.filter(status='active').first()
        
        if not account:
            print("❌ No active accounts found in the database")
            print("Please create an account first through the admin or API")
            return False
        
        print(f"✅ Found account: {account.account_number}")
        print(f"Account holder: {account.user.first_name} {account.user.last_name}")
        print(f"Initial balance: ${account.balance}")
        
        # Test 1: Deposit
        print("\n--- Testing Deposit ---")
        deposit_amount = Decimal('50.00')
        
        deposit = Transaction.objects.create(
            to_account=account,
            transaction_type='deposit',
            amount=deposit_amount,
            description='Test deposit transaction',
            status='pending',
            auto_confirm=True,
            confirmation_delay_hours=0,
            deposit_source='mobile',
            channel='mobile'
        )
        
        print(f"Created deposit: {deposit.reference}")
        print(f"Amount: ${deposit.amount}")
        
        # Process the deposit
        success = deposit.process_transaction()
        
        # Refresh the account
        account.refresh_from_db()
        
        print(f"Processing result: {'✅ Success' if success else '❌ Failed'}")
        print(f"Transaction status: {deposit.status}")
        print(f"Balance before: ${deposit.to_balance_before}")
        print(f"Balance after: ${deposit.to_balance_after}")
        print(f"Current account balance: ${account.balance}")
        
        if success and deposit.status == 'completed':
            print("✅ Deposit test PASSED")
        else:
            print("❌ Deposit test FAILED")
            if hasattr(deposit, 'failure_reason'):
                print(f"Failure reason: {deposit.failure_reason}")
            return False
        
        # Test 2: Withdrawal
        print("\n--- Testing Withdrawal ---")
        withdrawal_amount = Decimal('25.00')
        
        withdrawal = Transaction.objects.create(
            from_account=account,
            transaction_type='withdrawal',
            amount=withdrawal_amount,
            description='Test withdrawal transaction',
            status='pending',
            auto_confirm=True,
            confirmation_delay_hours=0,
            channel='mobile'
        )
        
        print(f"Created withdrawal: {withdrawal.reference}")
        print(f"Amount: ${withdrawal.amount}")
        
        # Process the withdrawal
        success = withdrawal.process_transaction()
        
        # Refresh the account
        account.refresh_from_db()
        
        print(f"Processing result: {'✅ Success' if success else '❌ Failed'}")
        print(f"Transaction status: {withdrawal.status}")
        print(f"Balance before: ${withdrawal.from_balance_before}")
        print(f"Balance after: ${withdrawal.from_balance_after}")
        print(f"Current account balance: ${account.balance}")
        
        if success and withdrawal.status == 'completed':
            print("✅ Withdrawal test PASSED")
        else:
            print("❌ Withdrawal test FAILED")
            if hasattr(withdrawal, 'failure_reason'):
                print(f"Failure reason: {withdrawal.failure_reason}")
            return False
        
        # Show recent transactions
        print("\n--- Recent Transactions ---")
        recent_transactions = Transaction.objects.filter(
            to_account=account
        ).union(
            Transaction.objects.filter(from_account=account)
        ).order_by('-created_at')[:5]
        
        for txn in recent_transactions:
            direction = "+" if txn.to_account == account else "-"
            print(f"{txn.reference}: {direction}${txn.amount} ({txn.transaction_type}) - {txn.status}")
        
        print("\n✅ All tests PASSED!")
        print(f"Final account balance: ${account.balance}")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_with_existing_account()
    sys.exit(0 if success else 1)
