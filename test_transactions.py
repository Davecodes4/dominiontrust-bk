#!/usr/bin/env python3
"""
Test script to verify transaction processing and balance handling
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

from django.contrib.auth.models import User
from accounts.models import BankAccount
from banking.models import Transaction

def test_deposit_processing():
    """Test that deposits properly credit account balances"""
    print("Testing deposit processing...")
    
    # Get or create a test user with unique identifier
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    username = f'testuser_{unique_id}'
    
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': f'test_{unique_id}@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    # Generate unique account number
    account_number = f'TEST{unique_id.replace("-", "").upper()[:8]}'
    
    # Get or create a test account
    account, created = BankAccount.objects.get_or_create(
        user=user,
        defaults={
            'account_number': account_number,
            'account_type': 'savings',
            'balance': Decimal('1000.00'),
            'status': 'active'
        }
    )
    
    # Record initial balance
    initial_balance = account.balance
    deposit_amount = Decimal('250.00')
    
    print(f"Initial account balance: ${initial_balance}")
    print(f"Deposit amount: ${deposit_amount}")
    
    # Create and process a deposit transaction
    deposit = Transaction.objects.create(
        to_account=account,
        transaction_type='deposit',
        amount=deposit_amount,
        description='Test deposit',
        status='pending',
        auto_confirm=True,
        confirmation_delay_hours=0,  # Process immediately
        deposit_source='mobile',
        channel='mobile'
    )
    
    print(f"Created deposit transaction: {deposit.reference}")
    print(f"Transaction status before processing: {deposit.status}")
    
    # Process the transaction
    success = deposit.process_transaction()
    
    # Refresh account from database
    account.refresh_from_db()
    
    print(f"Transaction processing success: {success}")
    print(f"Transaction status after processing: {deposit.status}")
    print(f"Account balance before: ${deposit.to_balance_before}")
    print(f"Account balance after: ${deposit.to_balance_after}")
    print(f"Current account balance: ${account.balance}")
    
    expected_balance = initial_balance + deposit_amount
    assert account.balance == expected_balance, f"Expected ${expected_balance}, got ${account.balance}"
    assert deposit.status == 'completed', f"Expected 'completed', got '{deposit.status}'"
    
    print("✅ Deposit test passed!")
    return account, deposit

def test_withdrawal_processing(account):
    """Test that withdrawals properly debit account balances"""
    print("\nTesting withdrawal processing...")
    
    # Record balance before withdrawal
    balance_before = account.balance
    withdrawal_amount = Decimal('100.00')
    
    print(f"Balance before withdrawal: ${balance_before}")
    print(f"Withdrawal amount: ${withdrawal_amount}")
    
    # Create and process a withdrawal transaction
    withdrawal = Transaction.objects.create(
        from_account=account,
        transaction_type='withdrawal',
        amount=withdrawal_amount,
        description='Test withdrawal',
        status='pending',
        auto_confirm=True,
        confirmation_delay_hours=0,  # Process immediately
        channel='mobile'
    )
    
    print(f"Created withdrawal transaction: {withdrawal.reference}")
    
    # Process the transaction
    success = withdrawal.process_transaction()
    
    # Refresh account from database
    account.refresh_from_db()
    
    print(f"Transaction processing success: {success}")
    print(f"Transaction status after processing: {withdrawal.status}")
    print(f"Account balance before: ${withdrawal.from_balance_before}")
    print(f"Account balance after: ${withdrawal.from_balance_after}")
    print(f"Current account balance: ${account.balance}")
    
    expected_balance = balance_before - withdrawal_amount
    assert account.balance == expected_balance, f"Expected ${expected_balance}, got ${account.balance}"
    assert withdrawal.status == 'completed', f"Expected 'completed', got '{withdrawal.status}'"
    
    print("✅ Withdrawal test passed!")
    return withdrawal

def test_insufficient_funds(account):
    """Test that withdrawals fail when there are insufficient funds"""
    print("\nTesting insufficient funds handling...")
    
    balance_before = account.balance
    excessive_amount = balance_before + Decimal('1000.00')
    
    print(f"Current balance: ${balance_before}")
    print(f"Attempting to withdraw: ${excessive_amount}")
    
    # Create a withdrawal transaction with insufficient funds
    withdrawal = Transaction.objects.create(
        from_account=account,
        transaction_type='withdrawal',
        amount=excessive_amount,
        description='Test insufficient funds withdrawal',
        status='pending',
        auto_confirm=True,
        confirmation_delay_hours=0,
        channel='mobile'
    )
    
    # Process the transaction (should fail)
    success = withdrawal.process_transaction()
    
    # Refresh account from database
    account.refresh_from_db()
    
    print(f"Transaction processing success: {success}")
    print(f"Transaction status: {withdrawal.status}")
    print(f"Failure reason: {withdrawal.failure_reason}")
    print(f"Account balance after failed transaction: ${account.balance}")
    
    assert not success, "Transaction should have failed"
    assert withdrawal.status == 'failed', f"Expected 'failed', got '{withdrawal.status}'"
    assert account.balance == balance_before, f"Balance should remain ${balance_before}, got ${account.balance}"
    
    print("✅ Insufficient funds test passed!")

def main():
    """Run all transaction tests"""
    print("=== Transaction Processing Test Suite ===\n")
    
    try:
        # Test deposit
        account, deposit = test_deposit_processing()
        
        # Test withdrawal
        withdrawal = test_withdrawal_processing(account)
        
        # Test insufficient funds
        test_insufficient_funds(account)
        
        print("\n=== All Tests Passed! ===")
        print(f"Final account balance: ${account.balance}")
        
        # Show transaction history
        print(f"\nTransaction History for {account.account_number}:")
        transactions = Transaction.objects.filter(
            models.Q(from_account=account) | models.Q(to_account=account)
        ).order_by('-created_at')
        
        for txn in transactions:
            direction = "+" if txn.to_account == account else "-"
            print(f"  {txn.reference}: {direction}${txn.amount} ({txn.transaction_type}) - {txn.status}")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == '__main__':
    from django.db import models
    success = main()
    sys.exit(0 if success else 1)
