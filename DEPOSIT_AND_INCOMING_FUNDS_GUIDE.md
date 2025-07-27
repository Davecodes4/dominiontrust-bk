# Deposit and Incoming Funds Guide

## How Deposits Work in the DominionTrust Banking System

### 1. User-Initiated Deposits

When a user initiates a deposit through the API:

**Endpoint**: `POST /api/banking/deposit/`
**Payload**:
```json
{
    "amount": 1000.00,
    "description": "Cash deposit"
}
```

**Process Flow**:
1. **PENDING Status**: Deposit is created with `status="pending"`
2. **24-Hour Minimum Delay**: Must wait at least 24 hours before confirmation
3. **CONFIRMED Status**: After 24 hours, system can confirm the deposit automatically  
4. **1 Business Day Processing**: Takes 1 additional business day to complete
5. **COMPLETED Status**: Funds are added to user's account balance

**User Experience**:
- User sees: *"Your deposit is on the way and may take 1 to 5 business days"*
- During holidays: *"Your deposit is on the way and may take 1 to 5 business days (excluding Independence Day)"*

### 2. Incoming Transfers from Other Users

When another user sends a transfer to your account:

**Process Flow**:
1. **PENDING Status**: Transfer created with 24-hour minimum delay
2. **Processing Delay**: 1-2 business days depending on transfer type:
   - Internal (same user): 1 business day
   - Domestic (different users): 2 business days  
3. **CONFIRMED Status**: System confirms after minimum delay
4. **COMPLETED Status**: Funds credited to recipient's account

## Security Model

### ⚠️ IMPORTANT: Manual Confirmation Restrictions

**Regular Users CANNOT**:
- ❌ Manually confirm their own deposits
- ❌ Manually confirm their own transfers  
- ❌ Speed up transaction processing
- ❌ Override minimum delay requirements

**Only Admin/Staff Users CAN**:
- ✅ Manually confirm any pending transaction
- ✅ Force confirm transactions before minimum delay (emergency override)
- ✅ View all pending transactions system-wide
- ✅ Add confirmation reasons and audit notes

### Admin Endpoints

**View All Pending Transactions**:
```
GET /api/banking/admin/transactions/pending/
```

**Manually Confirm Transaction**:
```
POST /api/banking/admin/transactions/<transaction_id>/confirm/
{
    "force_confirm": true,  // Optional: override minimum delay
    "reason": "Emergency processing requested by customer"
}
```

## Automated Processing

### Cron Job System

The system runs automated processing every hour via cron:

```bash
# Every hour - process eligible transactions
0 * * * * cd /Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend && ./scripts/process_transactions.sh
```

**What the cron job does**:
1. **Confirms** pending transactions that have passed the 24-hour minimum delay
2. **Completes** confirmed transactions that have reached their business day requirement
3. **Logs** all processing actions for audit compliance

### Business Day Calculations

**Non-Business Days** (no processing):
- Weekends (Saturday, Sunday)
- All 11 US Federal Holidays:
  - New Year's Day
  - Martin Luther King Jr. Day  
  - Presidents' Day
  - Memorial Day
  - Independence Day
  - Labor Day
  - Columbus Day
  - Veterans Day
  - Thanksgiving Day
  - Day after Thanksgiving
  - Christmas Day

## Transaction Statuses Explained

| Status | Description | User Action | Admin Action |
|--------|-------------|-------------|--------------|
| `pending` | Awaiting minimum delay | ❌ Wait | ✅ Can force confirm |
| `confirmed` | Ready for completion | ❌ Wait | ✅ Monitor |
| `completed` | Funds transferred | ✅ Complete | ✅ Complete |
| `failed` | Processing error | ❌ Contact support | ✅ Investigate |

## User Communication

### Sample Messages

**Deposit Initiated**:
```json
{
    "message": "Deposit initiated successfully",
    "status_message": "Your deposit is on the way and may take 1 to 5 business days",
    "expected_completion": "2024-07-12"
}
```

**With Holiday Impact**:
```json
{
    "message": "Deposit initiated successfully", 
    "status_message": "Your deposit is on the way and may take 1 to 5 business days (excluding Independence Day)",
    "expected_completion": "2024-07-15"
}
```

## Compliance Features

### Audit Trail

Every transaction confirmation is logged:
```python
TransactionConfirmationLog.objects.create(
    transaction=transaction_obj,
    confirmed_by="Admin: john.doe",
    confirmation_method="admin_manual",
    confirmation_reason="Emergency processing for customer request",
    previous_status="pending",
    new_status="confirmed"
)
```

### Banking Industry Standards

- ✅ Realistic processing delays (1-5 business days)
- ✅ Holiday-aware processing  
- ✅ Minimum 24-hour fraud prevention delay
- ✅ Complete audit trails
- ✅ Admin-only manual overrides
- ✅ Professional user messaging

This system mirrors real banking industry practices for ACH transfers, wire transfers, and deposit processing, ensuring both security and regulatory compliance. 