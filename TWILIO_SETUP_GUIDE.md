# 🚀 Twilio SMS Setup Guide for DominionTrust Bank

This guide will help you set up Twilio SMS notifications for your banking application.

## 📋 Prerequisites

- Python 3.x with Django
- DominionTrust Bank backend running
- Valid phone number for testing

## 🔧 Step-by-Step Setup

### Step 1: Create Twilio Account

1. **Visit Twilio**: Go to [https://www.twilio.com](https://www.twilio.com)
2. **Sign Up**: Click "Sign up for free"
3. **Verify Email**: Check your email and verify your account
4. **Verify Phone**: Enter your phone number and verify with SMS code
5. **Complete Profile**: Fill in your profile information

### Step 2: Get Your Credentials

1. **Login to Console**: Go to [https://console.twilio.com](https://console.twilio.com)
2. **Find Dashboard**: You'll see your account dashboard
3. **Copy Credentials**: Note down these three values:
   - **Account SID**: Starts with "AC..." (e.g., `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token**: Click "Show" to reveal (e.g., `your_auth_token_here`)
   - **Phone Number**: You'll get this in the next step

### Step 3: Get a Phone Number

1. **Navigate to Phone Numbers**: In Twilio Console, go to "Phone Numbers" → "Manage" → "Buy a number"
2. **Choose Country**: Select your country (usually United States)
3. **Select Capabilities**: Make sure "SMS" is checked
4. **Choose Number**: Pick a number you like
5. **Buy Number**: Complete the purchase (free trial includes credits)
6. **Note the Number**: Copy the full number with country code (e.g., `+1234567890`)

### Step 4: Configure Django Settings

1. **Open Settings**: Edit `backend/dominion_bank/settings.py`
2. **Update Credentials**: Replace the placeholder values:

```python
# Twilio SMS Settings
TWILIO_ACCOUNT_SID = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'  # Your actual Account SID
TWILIO_AUTH_TOKEN = 'your_actual_auth_token_here'        # Your actual Auth Token
TWILIO_PHONE_NUMBER = '+1234567890'                      # Your actual Twilio number
```

### Step 5: Test Your Setup

1. **Check Configuration**:
   ```bash
   python manage.py test_twilio_sms --check-setup
   ```

2. **View Account Info**:
   ```bash
   python manage.py test_twilio_sms --account-info
   ```

3. **List Phone Numbers**:
   ```bash
   python manage.py test_twilio_sms --phone-numbers
   ```

4. **Send Test SMS** (replace with your phone number):
   ```bash
   python manage.py test_twilio_sms --phone +1234567890
   ```

### Step 6: Test Banking Features

1. **Test 2FA SMS**:
   ```bash
   python manage.py test_twilio_sms --test-2fa testuser
   ```

2. **Test Notification SMS**:
   ```bash
   python manage.py test_twilio_sms --test-notification testuser
   ```

## 🎯 Expected Results

### ✅ Successful Setup
When everything is configured correctly, you should see:
- ✅ Account information displayed
- ✅ Phone numbers listed
- ✅ Test SMS received on your phone
- ✅ 2FA codes sent via SMS
- ✅ Security notifications sent via SMS

### ❌ Common Issues

**Issue**: "Invalid credentials"
- **Solution**: Double-check your Account SID and Auth Token
- **Check**: Make sure you copied them correctly from Twilio Console

**Issue**: "Phone number not configured"
- **Solution**: Make sure you bought a phone number and added it to settings
- **Format**: Use E.164 format: `+1234567890`

**Issue**: "User has no phone number"
- **Solution**: Add phone number to user profile in Django admin
- **Path**: `/admin/accounts/userprofile/`

## 📱 SMS Features Available

### 🔐 Security Features
- **2FA Codes**: Verification codes for login
- **Security Alerts**: Suspicious activity notifications
- **Login Alerts**: New device login notifications
- **Account Lockout**: Account security notifications

### 💰 Transaction Features
- **Transaction Alerts**: Real-time transaction notifications
- **Low Balance Alerts**: Balance threshold notifications
- **Large Transaction Alerts**: High-value transaction notifications
- **Transfer Confirmations**: Money transfer confirmations

### 🏦 Account Features
- **Account Activation**: Welcome and activation messages
- **Password Changes**: Security change notifications
- **Card Alerts**: Card creation, blocking, expiration
- **KYC Updates**: Verification status changes

## 🔒 Security Best Practices

### 1. Credential Security
- **Never commit credentials to version control**
- **Use environment variables in production**
- **Rotate credentials regularly**
- **Restrict IP access in Twilio Console**

### 2. Phone Number Validation
- **Validate phone numbers before sending**
- **Use E.164 format (+1234567890)**
- **Handle international numbers properly**
- **Verify phone numbers during registration**

### 3. Rate Limiting
- **Implement SMS rate limiting**
- **Track failed delivery attempts**
- **Set daily/hourly SMS limits**
- **Monitor usage and costs**

## 💰 Cost Management

### Free Trial
- **$15 credit** for new accounts
- **SMS costs ~$0.0075 per message**
- **~2000 free SMS messages**

### Production Costs
- **SMS**: $0.0075 per message (US)
- **Phone Number**: $1/month
- **International**: Varies by country

### Cost Optimization
- **Use SMS for critical notifications only**
- **Offer email alternatives**
- **Implement user preferences**
- **Monitor usage regularly**

## 🧪 Testing Commands

```bash
# Check if Twilio is configured
python manage.py test_twilio_sms --check-setup

# Show account information
python manage.py test_twilio_sms --account-info

# List available phone numbers
python manage.py test_twilio_sms --phone-numbers

# Send test SMS to your phone
python manage.py test_twilio_sms --phone +1234567890

# Test 2FA SMS for a user
python manage.py test_twilio_sms --test-2fa testuser

# Test notification SMS for a user
python manage.py test_twilio_sms --test-notification testuser
```

## 🔧 Troubleshooting

### Common Error Messages

**"Authentication Error"**
- Check Account SID and Auth Token
- Make sure credentials are active

**"Invalid Phone Number"**
- Use E.164 format: +1234567890
- Include country code
- Remove spaces and special characters

**"Insufficient Funds"**
- Add credits to your Twilio account
- Check your account balance

**"Message Delivery Failed"**
- Check if recipient phone number is valid
- Verify SMS is enabled for your Twilio number
- Check for carrier restrictions

### Debug Steps

1. **Check Configuration**:
   ```bash
   python manage.py test_twilio_sms --check-setup
   ```

2. **Verify Credentials**:
   ```bash
   python manage.py test_twilio_sms --account-info
   ```

3. **Test Simple SMS**:
   ```bash
   python manage.py test_twilio_sms --phone +1234567890
   ```

4. **Check Django Logs**:
   ```bash
   tail -f logs/django.log
   ```

## 📞 Support

- **Twilio Support**: [https://support.twilio.com](https://support.twilio.com)
- **Twilio Docs**: [https://www.twilio.com/docs](https://www.twilio.com/docs)
- **SMS API Docs**: [https://www.twilio.com/docs/sms](https://www.twilio.com/docs/sms)

## 🎉 Next Steps

Once SMS is working:
1. **Configure user preferences** for SMS notifications
2. **Set up webhook endpoints** for delivery status
3. **Implement SMS templates** for different notification types
4. **Add SMS analytics** and reporting
5. **Configure international SMS** if needed

---

**🏦 You're now ready to send SMS notifications from DominionTrust Bank!** 
 