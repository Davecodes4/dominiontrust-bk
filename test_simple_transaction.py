#!/usr/bin/env python3
"""
Simple test for transaction processing
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import BankAccount
from banking.models import Transaction
from decimal import Decimal

def test_transaction():
    """Test basic transaction processing"""
    print("=== Testing Transaction Processing ===")
    
    # Get or create test user
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    print(f"User: {user.username} ({'created' if created else 'existing'})")
    
    # Get or create test account
    account, created = BankAccount.objects.get_or_create(
        user=user,
        defaults={
            'account_number': '1234567890',
            'account_type': 'savings',
            'balance': Decimal('1000.00'),
            'status': 'active'
        }
    )
    print(f"Account: {account.account_number} ({'created' if created else 'existing'})")
    print(f"Initial Balance: ${account.balance}")
    
    # Create a deposit transaction
    deposit = Transaction.objects.create(
        to_account=account,
        transaction_type='deposit',
        amount=Decimal('250.00'),
        description='Test deposit from Django shell',
        status='pending',
        auto_confirm=True,
        confirmation_delay_hours=0,
        deposit_source='mobile',
        channel='mobile'
    )
    
    print(f"\nCreated deposit transaction:")
    print(f"  Reference: {deposit.reference}")
    print(f"  Amount: ${deposit.amount}")
    print(f"  Status: {deposit.status}")
    
    # Process the transaction
    print(f"\nProcessing transaction...")
    success = deposit.process_transaction()
    
    # Refresh account from database
    account.refresh_from_db()
    
    print(f"Processing success: {success}")
    print(f"Transaction status: {deposit.status}")
    print(f"Account balance before: ${deposit.to_balance_before}")
    print(f"Account balance after: ${deposit.to_balance_after}")
    print(f"Current account balance: ${account.balance}")
    
    # Verify the balance was updated correctly
    expected_balance = Decimal('1000.00') + Decimal('250.00')
    if account.balance == expected_balance:
        print(f"✅ SUCCESS: Balance updated correctly to ${account.balance}")
    else:
        print(f"❌ FAILED: Expected balance ${expected_balance}, got ${account.balance}")
    
    # Test withdrawal
    print(f"\n=== Testing Withdrawal ===")
    withdrawal = Transaction.objects.create(
        from_account=account,
        transaction_type='withdrawal',
        amount=Decimal('100.00'),
        description='Test withdrawal',
        status='pending',
        auto_confirm=True,
        confirmation_delay_hours=0,
        channel='mobile'
    )
    
    print(f"Created withdrawal: {withdrawal.reference} for ${withdrawal.amount}")
    balance_before_withdrawal = account.balance
    
    success = withdrawal.process_transaction()
    account.refresh_from_db()
    
    print(f"Processing success: {success}")
    print(f"Balance before withdrawal: ${balance_before_withdrawal}")
    print(f"Balance after withdrawal: ${account.balance}")
    
    expected_balance_after_withdrawal = balance_before_withdrawal - Decimal('100.00')
    if account.balance == expected_balance_after_withdrawal:
        print(f"✅ SUCCESS: Withdrawal processed correctly")
    else:
        print(f"❌ FAILED: Expected balance ${expected_balance_after_withdrawal}, got ${account.balance}")
    
    print(f"\n=== Transaction Summary ===")
    transactions = Transaction.objects.filter(
        models.Q(from_account=account) | models.Q(to_account=account)
    ).order_by('-created_at')
    
    for txn in transactions[:5]:  # Show last 5 transactions
        direction = "+" if txn.to_account == account else "-"
        print(f"  {txn.reference}: {direction}${txn.amount} ({txn.transaction_type}) - {txn.status}")

if __name__ == '__main__':
    from django.db import models
    test_transaction()
