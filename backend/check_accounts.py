#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append('/Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from accounts.models import BankAccount
from django.contrib.auth.models import User

# Get the andrewmeyers838 user
try:
    user = User.objects.get(username='andrewmeyers838')
    accounts = BankAccount.objects.filter(user=user)

    print('=== andrewmeyers838 Accounts ===')
    for acc in accounts:
        print(f'ID: {acc.id}')
        print(f'Account Number: {acc.account_number}')
        print(f'Account Name: {acc.account_name}')
        print(f'Balance: ${acc.balance}')
        print(f'Status: {acc.status}')
        print('---')
        
    # Show which account has funds
    funded_accounts = accounts.filter(balance__gt=0)
    print('\n=== Accounts with Funds ===')
    for acc in funded_accounts:
        print(f'{acc.account_number} - {acc.account_name} - ${acc.balance}')
        
except User.DoesNotExist:
    print('User andrewmeyers838 not found')
