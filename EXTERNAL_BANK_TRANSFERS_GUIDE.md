# External Bank Transfers Implementation Guide

## Current Status

DominionTrust Bank currently supports **internal transfers only** (between accounts within the same bank). External bank transfers require additional implementation.

## Infrastructure Already Built

### ✅ Database Models Ready
```python
# TransferRequest model has external transfer fields:
- to_bank_code          # Routing numbers, SWIFT codes
- to_bank_name          # Destination bank name  
- transfer_type         # 'domestic', 'international'
- transfer_fee          # External transfer fees
- exchange_rate         # For currency conversion
```

### ✅ Processing Framework
```python
# Transaction processing supports:
- Multi-day processing delays
- Business day calculations  
- Holiday-aware scheduling
- Admin confirmation workflows
- Complete audit trails
```

## What Needs Implementation

### 1. External Transfer API Endpoint

**New endpoint needed**: `POST /api/banking/external-transfer/`

```python
# Payload for domestic external transfer
{
    "to_account_number": "1234567890",
    "to_routing_number": "021000021",
    "to_bank_name": "JPMorgan Chase Bank",
    "beneficiary_name": "John Doe",
    "amount": 500.00,
    "transfer_type": "domestic_external",
    "description": "Payment for services"
}

# Payload for international transfer  
{
    "to_account_number": "GB82WEST12345698765432",  # IBAN
    "to_swift_code": "DEUTDEFF", 
    "to_bank_name": "Deutsche Bank AG",
    "to_bank_country": "Germany",
    "beneficiary_name": "Hans Mueller",
    "amount": 1000.00,
    "currency": "EUR", 
    "transfer_type": "international",
    "purpose_code": "GSD",  # Goods and Services
    "description": "Invoice payment"
}
```

### 2. Enhanced Transfer Processing

**Processing Delays by Type**:
- Internal (same bank): 1 business day
- Domestic External (ACH): 1-3 business days  
- International (SWIFT): 3-5 business days

**Fee Structure**:
```python
TRANSFER_FEES = {
    'internal': 0.00,
    'domestic_external': 15.00,    # ACH fee
    'international': 45.00,        # SWIFT fee
    'international_express': 75.00  # Same day international
}
```

### 3. External Payment Network Integration

**ACH Integration (Domestic)**:
```python
# Would integrate with ACH processors like:
- Dwolla API
- Plaid Transfer API  
- Federal Reserve FedNow
- Nacha Direct API
```

**SWIFT Integration (International)**:
```python  
# Would integrate with SWIFT networks:
- SWIFT Alliance Access
- Banking APIs (Wells Fargo, JPMorgan)
- Fintech providers (Wise, Remitly)
- ISO 20022 messaging
```

### 4. Compliance & Security Features

**Required for External Transfers**:

```python
# AML/KYC Screening
- OFAC sanctions screening
- PEP (Politically Exposed Person) checks
- High-value transaction alerts
- Source of funds verification

# Regulatory Compliance  
- BSA reporting (>$10,000 USD)
- FBAR requirements for international
- CTR (Currency Transaction Reports)
- SAR (Suspicious Activity Reports)

# Enhanced Security
- Two-factor authentication required
- Transaction verification via email/SMS
- Daily/monthly limits for external transfers
- Beneficiary verification requirements
```

## Implementation Example

### Enhanced Transfer Model

```python
class ExternalTransferRequest(models.Model):
    # Inherits from TransferRequest
    
    # Routing Information
    to_routing_number = models.CharField(max_length=20, blank=True)  # ACH routing
    to_swift_code = models.CharField(max_length=11, blank=True)      # SWIFT BIC
    to_iban = models.CharField(max_length=34, blank=True)            # International
    
    # Beneficiary Details
    beneficiary_address = models.TextField(blank=True)
    beneficiary_country = models.CharField(max_length=3, blank=True)  # ISO country
    intermediary_bank = models.CharField(max_length=200, blank=True)
    
    # Compliance
    purpose_code = models.CharField(max_length=10, blank=True)       # ISO purpose codes
    regulatory_info = models.JSONField(default=dict, blank=True)     # Additional data
    
    # Processing
    external_reference = models.CharField(max_length=50, blank=True)  # External system ref
    network_status = models.CharField(max_length=50, blank=True)      # ACH/SWIFT status
    
    # Fees and Exchange
    fx_rate_applied = models.DecimalField(max_digits=10, decimal_places=6, null=True)
    network_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    correspondent_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
```

### Enhanced Processing Flow

```python
def process_external_transfer(transaction):
    """Process external bank transfer through appropriate network"""
    
    transfer_request = transaction.transfer_request
    
    if transfer_request.transfer_type == 'domestic_external':
        # Route through ACH network
        result = submit_to_ach_network(transfer_request)
        
    elif transfer_request.transfer_type == 'international':
        # Route through SWIFT network  
        result = submit_to_swift_network(transfer_request)
        
    # Update transaction with external reference
    transaction.external_reference = result.get('reference_id')
    transaction.network_status = result.get('status')
    transaction.save()
    
    return result.get('success', False)

def submit_to_ach_network(transfer):
    """Submit domestic transfer to ACH processor"""
    # Integration with ACH processor API
    # Returns: {'success': True, 'reference_id': 'ACH123', 'status': 'submitted'}
    pass
    
def submit_to_swift_network(transfer):
    """Submit international transfer to SWIFT network"""
    # Integration with SWIFT messaging
    # Returns: {'success': True, 'reference_id': 'FT21001234', 'status': 'pending'}
    pass
```

## User Experience

### External Transfer Flow

**Step 1: User Initiates Transfer**
```json
{
    "message": "External transfer initiated successfully",
    "status_message": "Your transfer to JPMorgan Chase Bank is on the way and may take 1 to 3 business days",
    "total_fees": 15.00,
    "expected_completion": "2024-07-15",
    "compliance_notice": "Transfers over $3,000 may require additional verification"
}
```

**Step 2: Processing Updates**
```json
{
    "status": "processing", 
    "network_status": "submitted_to_ach",
    "status_message": "Your transfer has been submitted to the ACH network and is being processed",
    "tracking_reference": "ACH2024071501234"
}
```

**Step 3: Completion**
```json
{
    "status": "completed",
    "status_message": "Transfer completed successfully - funds delivered to JPMorgan Chase Bank",
    "completed_at": "2024-07-15T14:30:00Z"
}
```

## Next Steps to Implement

### 1. **Choose Integration Partners**
- **ACH**: Dwolla, Plaid, or direct Fed connection
- **SWIFT**: Banking partner or fintech provider
- **Compliance**: Chainalysis, Elliptic for screening

### 2. **Enhance Data Models**
```bash
# Create migration for external transfer fields
python manage.py makemigrations banking
python manage.py migrate
```

### 3. **Build External Transfer API**
```python
# Add to banking/views.py
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def external_transfer(request):
    # Validate external transfer request
    # Apply compliance checks
    # Calculate fees and exchange rates
    # Create pending external transfer
    pass
```

### 4. **Integrate Payment Networks**
```python
# Add to banking/external_processors.py
class ACHProcessor:
    def submit_transfer(self, transfer_request):
        # ACH submission logic
        pass
        
class SWIFTProcessor:
    def submit_transfer(self, transfer_request):
        # SWIFT submission logic  
        pass
```

## Summary

**Current State**: Internal transfers only ✅  
**Required for External**: API integration + compliance + enhanced models  
**Timeline**: 2-4 weeks development + regulatory approval  
**Cost**: $10K-50K setup + ongoing transaction fees

The foundation is solid - you just need to add the external network integrations and compliance layer on top of your existing pending transaction workflow. 