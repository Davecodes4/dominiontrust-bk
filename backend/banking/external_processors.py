"""
Mock External Payment Processors for Testing
Simulates ACH and SWIFT networks without real API calls
"""

import random
import string
import time
from datetime import datetime, timedelta
from decimal import Decimal
import requests
import json


class MockACHProcessor:
    """Mock ACH processor for domestic external transfers"""
    
    def __init__(self):
        self.name = "Mock ACH Network"
        self.base_fee = Decimal('15.00')
        
    def validate_routing_number(self, routing_number):
        """Validate ACH routing number format"""
        if not routing_number or len(routing_number) != 9:
            return False, "Routing number must be 9 digits"
        
        if not routing_number.isdigit():
            return False, "Routing number must contain only digits"
        
        # Mock validation - some known test routing numbers
        valid_test_routing = [
            '021000021',  # JPMorgan Chase
            '026009593',  # Bank of America  
            '111000025',  # Wells Fargo
            '121000248',  # Wells Fargo California
            '122000661',  # CitiBank
            '123456789',  # Test routing number
        ]
        
        if routing_number not in valid_test_routing:
            return False, f"Routing number {routing_number} not found in test database"
        
        return True, "Valid routing number"
    
    def submit_transfer(self, transfer_request):
        """Submit transfer to mock ACH network"""
        
        # Validate routing number
        is_valid, message = self.validate_routing_number(transfer_request.to_routing_number)
        if not is_valid:
            return {
                'success': False,
                'error': message,
                'reference_id': None,
                'status': 'rejected'
            }
        
        # Generate mock reference ID
        reference_id = 'ACH' + ''.join(random.choices(string.digits, k=8))
        
        # Simulate processing delay
        processing_statuses = ['submitted', 'pending', 'processing']
        network_status = random.choice(processing_statuses)
        
        # Mock success rate (95% success)
        success = random.random() > 0.05
        
        response = {
            'success': success,
            'reference_id': reference_id,
            'status': network_status,
            'network_fee': float(self.base_fee),
            'estimated_completion': (datetime.now() + timedelta(days=random.randint(1, 3))).isoformat(),
            'processor': 'Mock ACH Network',
            'routing_validated': True,
            'submission_time': datetime.now().isoformat()
        }
        
        if not success:
            response.update({
                'error': 'Simulated ACH network error',
                'error_code': 'ACH_001',
                'status': 'failed'
            })
        
        return response
    
    def check_transfer_status(self, reference_id):
        """Check status of ACH transfer"""
        # Mock status progression
        statuses = ['submitted', 'processing', 'completed']
        current_status = random.choice(statuses)
        
        return {
            'reference_id': reference_id,
            'status': current_status,
            'last_updated': datetime.now().isoformat(),
            'processor': 'Mock ACH Network'
        }


class MockSWIFTProcessor:
    """Mock SWIFT processor for international transfers"""
    
    def __init__(self):
        self.name = "Mock SWIFT Network"
        self.base_fee = Decimal('45.00')
        
    def validate_swift_code(self, swift_code):
        """Validate SWIFT/BIC code format"""
        if not swift_code or len(swift_code) not in [8, 11]:
            return False, "SWIFT code must be 8 or 11 characters"
        
        if not swift_code.isalnum():
            return False, "SWIFT code must contain only letters and numbers"
        
        # Mock validation - some known test SWIFT codes
        valid_test_swift = [
            'DEUTDEFF',     # Deutsche Bank
            'CHASUS33',     # JPMorgan Chase
            'BOFAUS3N',     # Bank of America
            'WFBIUS6S',     # Wells Fargo
            'CITIUS33',     # CitiBank
            'HBUKGB4B',     # HSBC UK
            'TESTSWIFT',    # Test SWIFT code
        ]
        
        swift_base = swift_code[:8] if len(swift_code) == 11 else swift_code
        if swift_base not in valid_test_swift:
            return False, f"SWIFT code {swift_code} not found in test database"
        
        return True, "Valid SWIFT code"
    
    def validate_iban(self, iban):
        """Basic IBAN format validation"""
        if not iban or len(iban) < 15 or len(iban) > 34:
            return False, "IBAN must be 15-34 characters"
        
        # Remove spaces and convert to uppercase
        iban = iban.replace(' ', '').upper()
        
        # Basic format check (country code + check digits + account identifier)
        if not iban[:2].isalpha() or not iban[2:4].isdigit():
            return False, "Invalid IBAN format"
        
        return True, "Valid IBAN format"
    
    def get_exchange_rate(self, from_currency, to_currency):
        """Mock exchange rate lookup"""
        if from_currency == to_currency:
            return Decimal('1.0000')
        
        # Mock exchange rates (in real implementation, call external API)
        mock_rates = {
            ('USD', 'EUR'): Decimal('0.8500'),
            ('USD', 'GBP'): Decimal('0.7800'),
            ('USD', 'CAD'): Decimal('1.2500'),
            ('EUR', 'USD'): Decimal('1.1765'),
            ('GBP', 'USD'): Decimal('1.2821'),
        }
        
        rate = mock_rates.get((from_currency, to_currency))
        if not rate:
            # Default mock rate
            return Decimal('1.0000')
        
        # Add some random variation (+/- 2%)
        variation = Decimal(random.uniform(-0.02, 0.02))
        return rate * (1 + variation)
    
    def submit_transfer(self, transfer_request):
        """Submit transfer to mock SWIFT network"""
        
        # Validate SWIFT code
        if transfer_request.to_swift_code:
            is_valid, message = self.validate_swift_code(transfer_request.to_swift_code)
            if not is_valid:
                return {
                    'success': False,
                    'error': message,
                    'reference_id': None,
                    'status': 'rejected'
                }
        
        # Validate IBAN
        if transfer_request.to_iban:
            is_valid, message = self.validate_iban(transfer_request.to_iban)
            if not is_valid:
                return {
                    'success': False,
                    'error': message,
                    'reference_id': None,
                    'status': 'rejected'
                }
        
        # Generate mock reference ID
        reference_id = 'FT' + ''.join(random.choices(string.digits, k=8))
        
        # Get exchange rate if different currencies
        from_currency = 'USD'  # Assuming USD as base
        to_currency = getattr(transfer_request.transaction, 'currency', 'USD')
        exchange_rate = self.get_exchange_rate(from_currency, to_currency)
        
        # Mock success rate (90% success for international)
        success = random.random() > 0.10
        
        response = {
            'success': success,
            'reference_id': reference_id,
            'status': 'pending_compliance',
            'network_fee': float(self.base_fee),
            'exchange_rate': float(exchange_rate),
            'estimated_completion': (datetime.now() + timedelta(days=random.randint(3, 5))).isoformat(),
            'processor': 'Mock SWIFT Network',
            'swift_validated': True,
            'iban_validated': True,
            'submission_time': datetime.now().isoformat(),
            'correspondent_bank_fee': random.uniform(10, 25)  # Random correspondent fee
        }
        
        if not success:
            response.update({
                'error': 'Simulated SWIFT network error',
                'error_code': 'MT103_ERROR',
                'status': 'failed'
            })
        
        return response
    
    def check_transfer_status(self, reference_id):
        """Check status of SWIFT transfer"""
        # Mock status progression
        statuses = ['pending_compliance', 'processing', 'completed']
        current_status = random.choice(statuses)
        
        return {
            'reference_id': reference_id,
            'status': current_status,
            'last_updated': datetime.now().isoformat(),
            'processor': 'Mock SWIFT Network'
        }


class MockComplianceChecker:
    """Mock compliance and AML screening"""
    
    def __init__(self):
        self.name = "Mock Compliance Engine"
        
    def screen_ofac_sanctions(self, beneficiary_name, beneficiary_country=None):
        """Mock OFAC sanctions screening"""
        
        # Mock sanctions list (these are NOT real sanctioned entities)
        mock_sanctions_list = [
            'BLOCKED PERSON',
            'SANCTIONED ENTITY',
            'TEST SANCTIONS',
            'DENIED PARTY'
        ]
        
        # Check if name matches mock sanctions
        name_upper = beneficiary_name.upper()
        is_sanctioned = any(sanctioned in name_upper for sanctioned in mock_sanctions_list)
        
        if is_sanctioned:
            return {
                'status': 'blocked',
                'risk_score': 100,
                'match_reason': 'Name matches sanctions list',
                'requires_manual_review': True,
                'screening_provider': 'Mock OFAC Database'
            }
        
        # Mock screening with random low risk score
        risk_score = random.randint(0, 15)  # Low risk for most transactions
        
        return {
            'status': 'cleared',
            'risk_score': risk_score,
            'match_reason': None,
            'requires_manual_review': risk_score > 10,
            'screening_provider': 'Mock OFAC Database',
            'screened_at': datetime.now().isoformat()
        }
    
    def calculate_aml_risk_score(self, transfer_request, user_profile):
        """Calculate Anti-Money Laundering risk score"""
        
        risk_factors = []
        base_score = 0
        
        # Amount-based risk
        if transfer_request.amount > 10000:
            base_score += 20
            risk_factors.append('High value transaction')
        elif transfer_request.amount > 5000:
            base_score += 10
            risk_factors.append('Medium value transaction')
        
        # Destination country risk (mock)
        high_risk_countries = ['AF', 'IR', 'KP', 'SY']  # Example high-risk ISO codes
        if transfer_request.beneficiary_country in high_risk_countries:
            base_score += 30
            risk_factors.append('High-risk destination country')
        
        # Transaction frequency (mock - in real system, check user's history)
        if random.random() > 0.8:  # 20% chance of high frequency flag
            base_score += 15
            risk_factors.append('High transaction frequency')
        
        # Random additional factors
        if random.random() > 0.9:  # 10% chance
            base_score += 25
            risk_factors.append('Unusual transaction pattern')
        
        # Cap at 100
        final_score = min(base_score, 100)
        
        return {
            'aml_risk_score': final_score,
            'risk_factors': risk_factors,
            'risk_level': 'HIGH' if final_score > 70 else 'MEDIUM' if final_score > 30 else 'LOW',
            'requires_enhanced_due_diligence': final_score > 50,
            'requires_sar_filing': final_score > 80,  # Suspicious Activity Report
            'calculated_at': datetime.now().isoformat()
        }
    
    def get_exchange_rate_live(self, from_currency, to_currency):
        """Get live exchange rates from free API"""
        try:
            # Using free ExchangeRate-API (no API key required for basic usage)
            url = f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                rate = data.get('rates', {}).get(to_currency)
                if rate:
                    return {
                        'success': True,
                        'rate': Decimal(str(rate)),
                        'provider': 'ExchangeRate-API',
                        'timestamp': datetime.now().isoformat()
                    }
        except Exception as e:
            pass  # Fall back to mock rates
        
        # Fallback to mock rates
        mock_swift = MockSWIFTProcessor()
        rate = mock_swift.get_exchange_rate(from_currency, to_currency)
        
        return {
            'success': True,
            'rate': rate,
            'provider': 'Mock Exchange Rates',
            'timestamp': datetime.now().isoformat()
        }


# Factory function to get appropriate processor
def get_payment_processor(transfer_type):
    """Get the appropriate payment processor for transfer type"""
    if transfer_type == 'domestic_external':
        return MockACHProcessor()
    elif transfer_type == 'international':
        return MockSWIFTProcessor()
    else:
        return None

# Factory function for compliance
def get_compliance_checker():
    """Get compliance checking service"""
    return MockComplianceChecker() 