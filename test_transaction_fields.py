#!/usr/bin/env python
"""
Test script to verify that transaction records are saving the new external transfer data
"""
import os
import sys
import django

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from banking.models import Transaction, TransferRequest
from accounts.models import BankAccount, User
from decimal import Decimal

def test_transaction_fields():
    """Test that transaction fields are being populated from transfer requests"""
    print("🔍 Testing Transaction Field Population")
    print("=" * 50)
    
    try:
        # Get a test user and account
        user = User.objects.filter(is_active=True).first()
        if not user:
            print("❌ No test user found. Create a user first.")
            return
        
        account = BankAccount.objects.filter(user=user, status='active').first()
        if not account:
            print("❌ No active account found. Create an account first.")
            return
        
        print(f"✅ Using test user: {user.username}")
        print(f"✅ Using test account: {account.account_number}")
        
        # Create a test external transfer request
        transfer_request = TransferRequest.objects.create(
            from_account=account,
            to_account_number="1234567890",
            to_bank_name="Test External Bank",
            to_routing_number="123456789",
            beneficiary_name="John Test Recipient",
            beneficiary_address="123 Test Street, Test City, TC 12345",
            amount=Decimal('100.00'),
            transfer_type='domestic_external',
            description="Test external transfer"
        )
        
        print(f"✅ Created transfer request: {transfer_request.id}")
        
        # Create the transaction
        transaction = transfer_request.create_transaction()
        
        print(f"✅ Created transaction: {transaction.reference}")
        
        # Check that new fields are populated
        print("\n📋 Checking Transaction Fields:")
        print(f"   Recipient Name: {transaction.recipient_name}")
        print(f"   Recipient Account: {transaction.recipient_account_number}")
        print(f"   Recipient Bank: {transaction.recipient_bank_name}")
        print(f"   Routing Number: {transaction.routing_number}")
        print(f"   Status Message: {transaction.status_message}")
        print(f"   Channel: {transaction.channel}")
        
        # Verify fields are populated
        assert transaction.recipient_name == "John Test Recipient", "Recipient name not saved"
        assert transaction.recipient_account_number == "1234567890", "Recipient account not saved"
        assert transaction.recipient_bank_name == "Test External Bank", "Recipient bank not saved"
        assert transaction.routing_number == "123456789", "Routing number not saved"
        assert transaction.status_message is not None, "Status message not saved"
        assert transaction.channel == "online", "Channel not saved"
        
        print("\n✅ All new transaction fields are properly populated!")
        
        # Clean up test data
        transaction.delete()
        transfer_request.delete()
        
        print("✅ Test data cleaned up")
        
    except Exception as e:
        print(f"❌ Error during test: {e}")
        import traceback
        traceback.print_exc()

def check_existing_transactions():
    """Check existing transactions to see field population"""
    print("\n🔍 Checking Existing Transactions")
    print("=" * 50)
    
    try:
        recent_transactions = Transaction.objects.filter(
            transaction_type='transfer'
        ).order_by('-created_at')[:5]
        
        if not recent_transactions:
            print("No transfer transactions found")
            return
        
        for tx in recent_transactions:
            print(f"\nTransaction: {tx.reference}")
            print(f"  Type: {tx.transaction_type}")
            print(f"  Amount: {tx.amount}")
            print(f"  Recipient Name: {tx.recipient_name or 'Not set'}")
            print(f"  Recipient Bank: {tx.recipient_bank_name or 'Not set'}")
            print(f"  Routing Number: {tx.routing_number or 'Not set'}")
            print(f"  Status Message: {tx.status_message or 'Not set'}")
            print(f"  External Reference: {tx.external_reference or 'Not set'}")
            print(f"  Card Brand: {tx.card_brand or 'Not set'}")
            
    except Exception as e:
        print(f"❌ Error checking transactions: {e}")

if __name__ == '__main__':
    test_transaction_fields()
    check_existing_transactions()
