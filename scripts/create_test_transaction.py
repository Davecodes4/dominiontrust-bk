#!/usr/bin/env python3
"""
Test script to create sample transactions for testing cron job
Run this script to create pending transactions that the cron job can process
"""

import os
import sys
import django
from datetime import datetime

# Setup Django environment
project_root = '/Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend'
sys.path.append(project_root)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import BankAccount
from banking.models import Transaction
from decimal import Decimal

def create_test_transactions():
    """Create test transactions for cron job testing"""
    
    # Find or create test users and accounts
    try:
        user1 = User.objects.first()
        if not user1:
            print("No users found. Please create a user first.")
            return
        
        account1 = BankAccount.objects.filter(user=user1).first()
        if not account1:
            print("No accounts found. Please create an account first.")
            return
        
        # Ensure account has sufficient balance
        if account1.balance < 1000:
            account1.balance = 5000.00
            account1.save()
            print(f"Added balance to account {account1.account_number}")
        
        # Create test transactions
        transactions_created = []
        
        # Test transfer (if we have multiple accounts)
        other_accounts = BankAccount.objects.exclude(id=account1.id)[:1]
        if other_accounts:
            to_account = other_accounts[0]
            
            transfer = Transaction.objects.create(
                from_account=account1,
                to_account=to_account,
                transaction_type='transfer',
                amount=Decimal('100.00'),
                description='Test transfer for cron job',
                status='pending',
                confirmation_method='auto',
                business_days_delay=1
            )
            transactions_created.append(transfer)
            print(f"Created test transfer: {transfer.reference}")
        
        # Test deposit
        deposit = Transaction.objects.create(
            to_account=account1,
            transaction_type='deposit',
            amount=Decimal('250.00'),
            description='Test deposit for cron job',
            status='pending',
            confirmation_method='auto',
            business_days_delay=1
        )
        transactions_created.append(deposit)
        print(f"Created test deposit: {deposit.reference}")
        
        # Test withdrawal
        withdrawal = Transaction.objects.create(
            from_account=account1,
            transaction_type='withdrawal',
            amount=Decimal('75.00'),
            description='Test withdrawal for cron job',
            status='pending',
            confirmation_method='auto',
            business_days_delay=1
        )
        transactions_created.append(withdrawal)
        print(f"Created test withdrawal: {withdrawal.reference}")
        
        print(f"\n✅ Created {len(transactions_created)} test transactions")
        print("These transactions will be processed by the cron job.")
        print("\nTo check status:")
        for txn in transactions_created:
            print(f"  {txn.reference}: {txn.status} - {txn.get_estimated_completion_message()}")
        
        return transactions_created
        
    except Exception as e:
        print(f"Error creating test transactions: {e}")
        return []

def check_pending_transactions():
    """Check current pending transactions"""
    pending = Transaction.objects.filter(status='pending').order_by('-created_at')
    confirmed = Transaction.objects.filter(status='confirmed').order_by('-created_at')
    
    print(f"\n📊 Transaction Status:")
    print(f"Pending transactions: {pending.count()}")
    print(f"Confirmed transactions: {confirmed.count()}")
    
    if pending.exists():
        print("\n⏳ Pending Transactions:")
        for txn in pending[:5]:
            print(f"  {txn.reference}: {txn.amount} - Created: {txn.created_at}")
    
    if confirmed.exists():
        print("\n✅ Confirmed Transactions:")
        for txn in confirmed[:5]:
            print(f"  {txn.reference}: {txn.amount} - Confirmed: {txn.confirmed_at}")

if __name__ == '__main__':
    print("🏦 Dominion Trust Bank - Test Transaction Creator")
    print("=" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == 'status':
        check_pending_transactions()
    else:
        create_test_transactions()
        check_pending_transactions()
        
        print("\n💡 Tips:")
        print("  - Run the cron job manually: ./scripts/process_transactions.sh")
        print("  - Check logs: tail -f logs/transaction_processing.log")
        print("  - Check status: python scripts/create_test_transaction.py status") 