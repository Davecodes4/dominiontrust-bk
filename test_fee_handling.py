#!/usr/bin/env python3
"""
Test script to verify transaction processing, especially fee handling in transfers
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

def test_transfer_with_fees():
    """Test that transfer fees are properly deducted from the sender's account"""
    print("=== Testing Transfer Fee Handling ===\n")
    
    try:
        # Get two different accounts for transfer
        accounts = BankAccount.objects.filter(status='active')[:2]
        
        if len(accounts) < 2:
            print("❌ Need at least 2 active accounts for transfer testing")
            print("Please create more accounts first")
            return False
        
        from_account, to_account = accounts[0], accounts[1]
        
        print(f"From Account: {from_account.account_number} ({from_account.account_name})")
        print(f"Initial balance: ${from_account.balance}")
        print(f"To Account: {to_account.account_number} ({to_account.account_name})")
        print(f"Initial balance: ${to_account.balance}")
        
        # Test parameters
        transfer_amount = Decimal('100.00')
        transfer_fee = Decimal('5.00')
        total_charge = transfer_amount + transfer_fee
        
        print(f"\nTransfer details:")
        print(f"Transfer amount: ${transfer_amount}")
        print(f"Transfer fee: ${transfer_fee}")
        print(f"Total deduction: ${total_charge}")
        
        # Verify sender has sufficient funds
        if from_account.balance < total_charge:
            print(f"❌ Insufficient funds. Account has ${from_account.balance}, needs ${total_charge}")
            return False
        
        # Record initial balances
        initial_from_balance = from_account.balance
        initial_to_balance = to_account.balance
        
        # Create transfer transaction with fee
        transfer = Transaction.objects.create(
            from_account=from_account,
            to_account=to_account,
            transaction_type='transfer',
            amount=transfer_amount,
            fee=transfer_fee,
            description='Test transfer with fee',
            status='pending',
            auto_confirm=True,
            confirmation_delay_hours=0,
            channel='admin'
        )
        
        print(f"\nCreated transfer: {transfer.reference}")
        print(f"Total amount: ${transfer.total_amount}")
        
        # Process the transaction
        success = transfer.process_transaction()
        
        # Refresh accounts from database
        from_account.refresh_from_db()
        to_account.refresh_from_db()
        
        print(f"\nTransaction processing: {'✅ Success' if success else '❌ Failed'}")
        print(f"Transaction status: {transfer.status}")
        
        # Check balances
        print(f"\nBalance changes:")
        print(f"From account: ${initial_from_balance} → ${from_account.balance} (change: ${from_account.balance - initial_from_balance})")
        print(f"To account: ${initial_to_balance} → ${to_account.balance} (change: ${to_account.balance - initial_to_balance})")
        
        # Verify correct fee handling
        expected_from_balance = initial_from_balance - total_charge
        expected_to_balance = initial_to_balance + transfer_amount  # Only amount, not fee
        
        from_balance_correct = from_account.balance == expected_from_balance
        to_balance_correct = to_account.balance == expected_to_balance
        
        print(f"\nVerification:")
        print(f"From account balance correct: {'✅' if from_balance_correct else '❌'} (expected ${expected_from_balance})")
        print(f"To account balance correct: {'✅' if to_balance_correct else '❌'} (expected ${expected_to_balance})")
        
        # Check recorded balance snapshots
        print(f"\nBalance snapshots:")
        print(f"From - Before: ${transfer.from_balance_before}, After: ${transfer.from_balance_after}")
        print(f"To - Before: ${transfer.to_balance_before}, After: ${transfer.to_balance_after}")
        
        # Verify fee is properly separated
        fee_properly_handled = (
            (initial_from_balance - from_account.balance) == total_charge and
            (to_account.balance - initial_to_balance) == transfer_amount
        )
        
        if success and from_balance_correct and to_balance_correct and fee_properly_handled:
            print("\n✅ Transfer fee handling test PASSED!")
            print(f"✅ Fee of ${transfer_fee} was correctly deducted from sender")
            print(f"✅ Recipient received exactly ${transfer_amount} (without fee)")
            return True
        else:
            print("\n❌ Transfer fee handling test FAILED!")
            if not success:
                print(f"- Transaction processing failed: {transfer.failure_reason}")
            if not from_balance_correct:
                print(f"- From account balance incorrect")
            if not to_balance_correct:
                print(f"- To account balance incorrect")
            if not fee_properly_handled:
                print(f"- Fee handling incorrect")
            return False
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_withdrawal_with_fees():
    """Test that withdrawal fees are properly handled"""
    print("\n=== Testing Withdrawal Fee Handling ===\n")
    
    try:
        # Get an account
        account = BankAccount.objects.filter(status='active').first()
        
        if not account:
            print("❌ No active accounts found")
            return False
        
        print(f"Account: {account.account_number} ({account.account_name})")
        print(f"Initial balance: ${account.balance}")
        
        # Test parameters
        withdrawal_amount = Decimal('50.00')
        withdrawal_fee = Decimal('2.50')
        total_charge = withdrawal_amount + withdrawal_fee
        
        print(f"\nWithdrawal details:")
        print(f"Withdrawal amount: ${withdrawal_amount}")
        print(f"Withdrawal fee: ${withdrawal_fee}")
        print(f"Total deduction: ${total_charge}")
        
        # Verify sufficient funds
        if account.balance < total_charge:
            print(f"❌ Insufficient funds. Account has ${account.balance}, needs ${total_charge}")
            return False
        
        initial_balance = account.balance
        
        # Create withdrawal transaction with fee
        withdrawal = Transaction.objects.create(
            from_account=account,
            transaction_type='withdrawal',
            amount=withdrawal_amount,
            fee=withdrawal_fee,
            description='Test withdrawal with fee',
            status='pending',
            auto_confirm=True,
            confirmation_delay_hours=0,
            channel='admin'
        )
        
        print(f"\nCreated withdrawal: {withdrawal.reference}")
        print(f"Total amount: ${withdrawal.total_amount}")
        
        # Process the transaction
        success = withdrawal.process_transaction()
        
        # Refresh account from database
        account.refresh_from_db()
        
        print(f"\nTransaction processing: {'✅ Success' if success else '❌ Failed'}")
        print(f"Transaction status: {withdrawal.status}")
        
        print(f"\nBalance change:")
        print(f"Account: ${initial_balance} → ${account.balance} (change: ${account.balance - initial_balance})")
        
        # Verify correct total deduction
        expected_balance = initial_balance - total_charge
        balance_correct = account.balance == expected_balance
        
        print(f"\nVerification:")
        print(f"Account balance correct: {'✅' if balance_correct else '❌'} (expected ${expected_balance})")
        
        if success and balance_correct:
            print("\n✅ Withdrawal fee handling test PASSED!")
            print(f"✅ Total of ${total_charge} (${withdrawal_amount} + ${withdrawal_fee} fee) was correctly deducted")
            return True
        else:
            print("\n❌ Withdrawal fee handling test FAILED!")
            return False
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all fee handling tests"""
    print("=== Transaction Fee Handling Test Suite ===\n")
    
    transfer_passed = test_transfer_with_fees()
    withdrawal_passed = test_withdrawal_with_fees()
    
    print(f"\n=== Test Summary ===")
    print(f"Transfer fee handling: {'✅ PASSED' if transfer_passed else '❌ FAILED'}")
    print(f"Withdrawal fee handling: {'✅ PASSED' if withdrawal_passed else '❌ FAILED'}")
    
    if transfer_passed and withdrawal_passed:
        print(f"\n🎉 All fee handling tests PASSED!")
        print(f"✅ Fees are properly separated from transaction amounts")
        print(f"✅ Sender accounts are charged the full amount including fees")
        print(f"✅ Recipient accounts receive only the transfer amount (no fees)")
        return True
    else:
        print(f"\n❌ Some tests FAILED!")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
