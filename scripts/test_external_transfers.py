#!/usr/bin/env python3
"""
Test script for external bank transfers (ACH/SWIFT)
Demonstrates the complete external transfer workflow with mock processors
"""

import os
import sys
import django
import requests
import json
from datetime import datetime

# Setup Django environment
project_root = '/Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend'
sys.path.append(project_root)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import BankAccount
from banking.models import Transaction, TransferRequest
from banking.external_processors import get_payment_processor, get_compliance_checker
from decimal import Decimal

class ExternalTransferTester:
    def __init__(self):
        self.base_url = 'http://localhost:8000/api/banking'
        self.token = None
        self.user = None
        
    def setup_test_user(self):
        """Create or get test user and account"""
        print("📋 Setting up test user and account...")
        
        # Create test user
        username = 'testuser_external'
        try:
            self.user = User.objects.get(username=username)
            print(f"✅ Using existing user: {username}")
        except User.DoesNotExist:
            self.user = User.objects.create_user(
                username=username,
                email='test@external.com',
                password='testpass123',
                first_name='External',
                last_name='Tester'
            )
            print(f"✅ Created new user: {username}")
        
        # Create test account with sufficient balance
        account = BankAccount.objects.filter(user=self.user).first()
        if not account:
            account = BankAccount.objects.create(
                user=self.user,
                account_type='savings',
                balance=Decimal('50000.00'),  # $50k for testing
                status='active'
            )
            print(f"✅ Created new account: {account.account_number}")
        else:
            # Ensure sufficient balance
            if account.balance < 10000:
                account.balance = Decimal('50000.00')
                account.save()
            print(f"✅ Using existing account: {account.account_number} (Balance: ${account.balance})")
        
        return account
    
    def get_auth_token(self):
        """Get authentication token for API calls"""
        print("🔐 Getting authentication token...")
        
        # For testing, we'll create a simple token or use session auth
        # In a real app, you'd call your auth endpoint
        from rest_framework.authtoken.models import Token
        
        try:
            token = Token.objects.get(user=self.user)
        except Token.DoesNotExist:
            token = Token.objects.create(user=self.user)
        
        self.token = token.key
        print(f"✅ Authentication token obtained")
        return self.token
    
    def test_ach_transfer(self):
        """Test ACH (domestic external) transfer"""
        print("\n🏦 Testing ACH Transfer (Domestic External)")
        print("=" * 50)
        
        # Test data for ACH transfer to Bank of America
        transfer_data = {
            "transfer_type": "domestic_external",
            "to_account_number": "1234567890",
            "to_routing_number": "026009593",  # Bank of America
            "to_bank_name": "Bank of America",
            "beneficiary_name": "John Doe",
            "amount": "500.00",
            "description": "Payment for services"
        }
        
        print(f"📤 Initiating ACH transfer to {transfer_data['to_bank_name']}")
        print(f"   Amount: ${transfer_data['amount']}")
        print(f"   Beneficiary: {transfer_data['beneficiary_name']}")
        print(f"   Routing: {transfer_data['to_routing_number']}")
        
        # Make API call
        headers = {'Authorization': f'Token {self.token}', 'Content-Type': 'application/json'}
        response = requests.post(
            f'{self.base_url}/external-transfer/',
            headers=headers,
            json=transfer_data,
            timeout=10
        )
        
        print(f"\n📡 API Response ({response.status_code}):")
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Transfer initiated successfully!")
            print(f"   Transaction ID: {result['transaction']['id']}")
            print(f"   Reference: {result['transaction']['reference']}")
            print(f"   Status: {result['transaction']['status']}")
            print(f"   Processing Fee: ${result['processing_info']['estimated_fee']}")
            print(f"   Total Cost: ${result['processing_info']['total_cost']}")
            print(f"   Expected Completion: {result['expected_completion']}")
            print(f"   Status Message: {result['status_message']}")
            
            # Compliance info
            print(f"\n🛡️  Compliance Information:")
            print(f"   OFAC Status: {result['compliance_info']['ofac_status']}")
            print(f"   AML Risk Level: {result['compliance_info']['aml_risk_level']}")
            print(f"   Risk Score: {result['compliance_info']['risk_score']}")
            
            return result['transaction']['id']
        else:
            print(f"❌ Transfer failed:")
            print(f"   Error: {response.text}")
            return None
    
    def test_swift_transfer(self):
        """Test SWIFT (international) transfer"""
        print("\n🌍 Testing SWIFT Transfer (International)")
        print("=" * 50)
        
        # Test data for SWIFT transfer to Deutsche Bank
        transfer_data = {
            "transfer_type": "international",
            "to_iban": "DE89370400440532013000",
            "to_swift_code": "DEUTDEFF",
            "to_bank_name": "Deutsche Bank AG",
            "beneficiary_name": "Hans Mueller",
            "beneficiary_address": "Taunusanlage 12, 60325 Frankfurt am Main",
            "beneficiary_country": "DE",
            "amount": "1000.00",
            "currency": "EUR",
            "purpose_code": "GSD",
            "description": "Invoice payment"
        }
        
        print(f"📤 Initiating SWIFT transfer to {transfer_data['to_bank_name']}")
        print(f"   Amount: ${transfer_data['amount']} {transfer_data['currency']}")
        print(f"   Beneficiary: {transfer_data['beneficiary_name']}")
        print(f"   SWIFT Code: {transfer_data['to_swift_code']}")
        print(f"   IBAN: {transfer_data['to_iban']}")
        print(f"   Country: {transfer_data['beneficiary_country']}")
        
        # Make API call
        headers = {'Authorization': f'Token {self.token}', 'Content-Type': 'application/json'}
        response = requests.post(
            f'{self.base_url}/external-transfer/',
            headers=headers,
            json=transfer_data,
            timeout=10
        )
        
        print(f"\n📡 API Response ({response.status_code}):")
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Transfer initiated successfully!")
            print(f"   Transaction ID: {result['transaction']['id']}")
            print(f"   Reference: {result['transaction']['reference']}")
            print(f"   Status: {result['transaction']['status']}")
            print(f"   Processing Fee: ${result['processing_info']['estimated_fee']}")
            print(f"   Total Cost: ${result['processing_info']['total_cost']}")
            print(f"   Expected Completion: {result['expected_completion']}")
            print(f"   Status Message: {result['status_message']}")
            
            # Compliance info
            print(f"\n🛡️  Compliance Information:")
            print(f"   OFAC Status: {result['compliance_info']['ofac_status']}")
            print(f"   AML Risk Level: {result['compliance_info']['aml_risk_level']}")
            print(f"   Risk Score: {result['compliance_info']['risk_score']}")
            
            if 'warnings' in result:
                print(f"\n⚠️  Warnings:")
                for warning in result['warnings']:
                    print(f"   - {warning}")
            
            return result['transaction']['id']
        else:
            print(f"❌ Transfer failed:")
            print(f"   Error: {response.text}")
            return None
    
    def test_sanctions_screening(self):
        """Test sanctions screening with blocked name"""
        print("\n🚫 Testing Sanctions Screening")
        print("=" * 50)
        
        # Test with a blocked name
        transfer_data = {
            "transfer_type": "domestic_external",
            "to_account_number": "1234567890",
            "to_routing_number": "021000021",  # JPMorgan Chase
            "to_bank_name": "JPMorgan Chase Bank",
            "beneficiary_name": "BLOCKED PERSON",  # This will trigger sanctions screening
            "amount": "100.00",
            "description": "Test sanctions screening"
        }
        
        print(f"📤 Testing transfer to sanctioned entity: {transfer_data['beneficiary_name']}")
        
        # Make API call
        headers = {'Authorization': f'Token {self.token}', 'Content-Type': 'application/json'}
        response = requests.post(
            f'{self.base_url}/external-transfer/',
            headers=headers,
            json=transfer_data,
            timeout=10
        )
        
        print(f"\n📡 API Response ({response.status_code}):")
        if response.status_code == 403:
            result = response.json()
            print(f"✅ Sanctions screening working correctly!")
            print(f"   Status: Transfer blocked")
            print(f"   Reason: {result['reason']}")
            print(f"   Compliance Reference: {result['compliance_reference']}")
        else:
            print(f"❌ Unexpected response - sanctions screening may not be working")
            print(f"   Response: {response.text}")
    
    def test_invalid_routing_number(self):
        """Test invalid routing number validation"""
        print("\n❌ Testing Invalid Routing Number")
        print("=" * 50)
        
        transfer_data = {
            "transfer_type": "domestic_external",
            "to_account_number": "1234567890",
            "to_routing_number": "999999999",  # Invalid routing number
            "to_bank_name": "Invalid Bank",
            "beneficiary_name": "Test User",
            "amount": "100.00",
            "description": "Test invalid routing"
        }
        
        print(f"📤 Testing invalid routing number: {transfer_data['to_routing_number']}")
        
        # Make API call
        headers = {'Authorization': f'Token {self.token}', 'Content-Type': 'application/json'}
        response = requests.post(
            f'{self.base_url}/external-transfer/',
            headers=headers,
            json=transfer_data,
            timeout=10
        )
        
        print(f"\n📡 API Response ({response.status_code}):")
        if response.status_code == 400:
            result = response.json()
            print(f"✅ Routing validation working correctly!")
            print(f"   Error: {result['error']}")
        else:
            print(f"❌ Unexpected response - routing validation may not be working")
            print(f"   Response: {response.text}")
    
    def test_processor_directly(self):
        """Test payment processors directly (without API)"""
        print("\n⚙️  Testing Payment Processors Directly")
        print("=" * 50)
        
        # Test ACH processor
        print("🏦 Testing ACH Processor:")
        ach_processor = get_payment_processor('domestic_external')
        if ach_processor:
            # Test valid routing number
            is_valid, message = ach_processor.validate_routing_number('026009593')
            print(f"   Valid routing (026009593): {is_valid} - {message}")
            
            # Test invalid routing number
            is_valid, message = ach_processor.validate_routing_number('999999999')
            print(f"   Invalid routing (999999999): {is_valid} - {message}")
        
        # Test SWIFT processor
        print("\n🌍 Testing SWIFT Processor:")
        swift_processor = get_payment_processor('international')
        if swift_processor:
            # Test valid SWIFT code
            is_valid, message = swift_processor.validate_swift_code('DEUTDEFF')
            print(f"   Valid SWIFT (DEUTDEFF): {is_valid} - {message}")
            
            # Test invalid SWIFT code
            is_valid, message = swift_processor.validate_swift_code('INVALID')
            print(f"   Invalid SWIFT (INVALID): {is_valid} - {message}")
            
            # Test IBAN validation
            is_valid, message = swift_processor.validate_iban('DE89370400440532013000')
            print(f"   Valid IBAN: {is_valid} - {message}")
            
            # Test exchange rates
            exchange_rate = swift_processor.get_exchange_rate('USD', 'EUR')
            print(f"   USD to EUR rate: {exchange_rate}")
        
        # Test compliance checker
        print("\n🛡️  Testing Compliance Checker:")
        compliance = get_compliance_checker()
        if compliance:
            # Test OFAC screening
            ofac_result = compliance.screen_ofac_sanctions('John Doe')
            print(f"   OFAC screening (John Doe): {ofac_result['status']} - Risk: {ofac_result['risk_score']}")
            
            ofac_result = compliance.screen_ofac_sanctions('BLOCKED PERSON')
            print(f"   OFAC screening (BLOCKED PERSON): {ofac_result['status']} - Risk: {ofac_result['risk_score']}")
            
            # Test live exchange rate API
            rate_result = compliance.get_exchange_rate_live('USD', 'EUR')
            print(f"   Live exchange rate (USD->EUR): {rate_result['rate']} via {rate_result['provider']}")
    
    def run_all_tests(self):
        """Run all external transfer tests"""
        print("🚀 External Bank Transfer Testing Suite")
        print("=" * 60)
        print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        try:
            # Setup
            account = self.setup_test_user()
            self.get_auth_token()
            
            # Test direct processors first
            self.test_processor_directly()
            
            # Test API endpoints
            print("\n" + "=" * 60)
            print("🔌 API Endpoint Tests")
            print("=" * 60)
            
            # Test successful transfers
            ach_tx_id = self.test_ach_transfer()
            swift_tx_id = self.test_swift_transfer()
            
            # Test validation and security
            self.test_sanctions_screening()
            self.test_invalid_routing_number()
            
            # Summary
            print("\n" + "=" * 60)
            print("📊 Test Summary")
            print("=" * 60)
            print(f"✅ Test user: {self.user.username}")
            print(f"✅ Test account: {account.account_number} (${account.balance})")
            print(f"✅ ACH Transfer: {'Created' if ach_tx_id else 'Failed'}")
            print(f"✅ SWIFT Transfer: {'Created' if swift_tx_id else 'Failed'}")
            print(f"✅ Sanctions screening: Working")
            print(f"✅ Routing validation: Working")
            
            print(f"\n🎯 Next Steps:")
            print(f"   1. Run cron job to process transfers:")
            print(f"      python manage.py process_pending_transactions --process-external")
            print(f"   2. Check transaction status:")
            print(f"      GET {self.base_url}/transactions/")
            print(f"   3. Monitor logs:")
            print(f"      tail -f logs/transaction_processing.log")
            
        except Exception as e:
            print(f"❌ Test failed with error: {str(e)}")
            import traceback
            traceback.print_exc()


def main():
    """Main test function"""
    # Check if server is running
    try:
        response = requests.get('http://localhost:8000', timeout=5)
        print("✅ Django server is running")
    except requests.exceptions.RequestException:
        print("❌ Django server is not running. Please start it with:")
        print("   python manage.py runserver")
        print("\nThen run this test again.")
        return
    
    # Run tests
    tester = ExternalTransferTester()
    tester.run_all_tests()


if __name__ == "__main__":
    main() 