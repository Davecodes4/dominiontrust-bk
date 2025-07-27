# 🕐 Quick Cron Setup Guide

## ✅ Your Cron Job is Ready to Use!

### 🚀 **Step 1: Add to Crontab**

Open your crontab:
```bash
crontab -e
```

Add one of these lines (choose based on your preference):

#### Option A: Every Hour (Recommended)
```bash
0 * * * * /Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend/scripts/process_transactions.sh
```

#### Option B: Business Hours (9 AM & 3 PM, Mon-Fri)
```bash
0 9,15 * * 1-5 /Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend/scripts/process_transactions.sh
```

#### Option C: Four Times Daily
```bash
0 8,12,16,20 * * * /Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend/scripts/process_transactions.sh
```

### 🔍 **Step 2: Verify Setup**

Check your cron jobs:
```bash
crontab -l
```

### 🧪 **Step 3: Test the System**

#### Create Test Transactions:
```bash
cd /Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend
source venv/bin/activate
python scripts/create_test_transaction.py
```

#### Run Cron Job Manually:
```bash
./scripts/process_transactions.sh
```

#### Check Logs:
```bash
tail -f logs/transaction_processing.log
```

#### Check Transaction Status:
```bash
python scripts/create_test_transaction.py status
```

### 📊 **Monitoring Commands**

#### Watch logs in real-time:
```bash
tail -f /Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend/logs/transaction_processing.log
```

#### Check pending transactions:
```bash
cd /Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend
source venv/bin/activate
python manage.py shell -c "from banking.models import Transaction; print(f'Pending: {Transaction.objects.filter(status=\"pending\").count()}')"
```

#### Manual processing (for testing):
```bash
cd /Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend
source venv/bin/activate
python manage.py process_pending_transactions --dry-run  # Test run
python manage.py process_pending_transactions            # Real run
```

### 🎯 **What the Cron Job Does**

1. **Confirms** pending transactions after 24-hour delay
2. **Completes** confirmed transactions after business day delay
3. **Logs** all activities to `logs/transaction_processing.log`
4. **Handles** transfers, deposits, and withdrawals automatically

### 🔄 **Transaction Flow**

```
User creates transaction → PENDING (24hr delay)
                           ↓ (cron job)
                        CONFIRMED (1-5 business days)
                           ↓ (cron job)
                        COMPLETED (money moved)
```

### 📱 **Business Day Delays**

- **Internal transfers**: 1 business day
- **External transfers**: 2 business days  
- **Deposits**: 1 business day
- **Withdrawals**: 1 business day

### 🚨 **Troubleshooting**

#### If cron job fails:
1. Check logs: `cat logs/transaction_processing.log`
2. Test script manually: `./scripts/process_transactions.sh`
3. Check permissions: `ls -la scripts/`
4. Verify paths in script are correct

#### If no transactions process:
1. Check if transactions exist: `python scripts/create_test_transaction.py status`
2. Create test transactions: `python scripts/create_test_transaction.py`
3. Check transaction delay times in admin

### 💡 **Pro Tips**

- **Test first**: Always run with `--dry-run` when testing
- **Monitor logs**: Set up log rotation for production
- **Business hours**: Consider running more frequently during business hours
- **Notifications**: Add email alerts for failed processing (optional)

### 🔐 **Security Notes**

- Script runs with your user permissions
- Logs contain transaction details (secure them appropriately)  
- Consider database backups before major processing
- Monitor for unusual transaction patterns

---

## ✨ **You're All Set!**

Your banking system now has automated transaction processing with:
- ✅ Proper business day delays
- ✅ Comprehensive logging  
- ✅ Manual confirmation option
- ✅ User-friendly status messages
- ✅ Professional workflow

The cron job will automatically process transactions according to banking standards! 🏦 