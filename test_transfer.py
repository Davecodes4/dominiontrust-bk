#!/usr/bin/env python3

import os
import sys
import django
import requests
import json

# Add the backend directory to Python path
sys.path.append('/Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import BankAccount

def test_transfer_backend():
    # Get user accounts
    user = User.objects.get(username='andrewmeyers838')
    accounts = BankAccount.objects.filter(user=user, status='active')
    
    print("=== User Accounts ===")
    for acc in accounts:
        print(f"ID: {acc.id}")
        print(f"Account Number: {acc.account_number}")
        print(f"Account Name: {acc.account_name}")
        print(f"Balance: ${acc.balance}")
        print(f"Status: {acc.status}")
        print("---")
    
    # Find account with funds
    account_with_funds = accounts.filter(balance__gt=0).first()
    if account_with_funds:
        print(f"\n✅ Account with funds found:")
        print(f"ID: {account_with_funds.id}")
        print(f"Account Number: {account_with_funds.account_number}")
        print(f"Balance: ${account_with_funds.balance}")
        
        # Test transfer payload
        transfer_payload = {
            "transfer": {
                "from_account_id": str(account_with_funds.id),
                "to_account_number": "1234567890",  # John Smith's account
                "amount": 100.00,
                "description": "Test transfer"
            },
            "pin": "1234"  # Replace with actual PIN
        }
        
        print(f"\n🧪 Test payload:")
        print(json.dumps(transfer_payload, indent=2))
        
        # Make API call (you'll need to replace with actual auth token)
        headers = {
            'Content-Type': 'application/json',
            # 'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
        
        print(f"\n📡 You can test this with curl:")
        print(f"curl -X POST http://localhost:8000/api/banking/transfer-with-pin/ \\")
        print(f"  -H 'Content-Type: application/json' \\")
        print(f"  -H 'Authorization: Bearer YOUR_TOKEN' \\")
        print(f"  -d '{json.dumps(transfer_payload)}'")
        
    else:
        print("❌ No accounts with funds found!")

if __name__ == "__main__":
    test_transfer_backend()
