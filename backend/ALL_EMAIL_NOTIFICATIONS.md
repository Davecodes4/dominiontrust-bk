# 📧 DominionTrust Bank - All Email Notifications (Text Format)

## Overview
DominionTrust Bank sends email notifications for various banking activities and security events. All emails are professionally designed with HTML templates and include security notices. Below are all the email scenarios currently being sent:

---

## 🏦 TRANSACTION NOTIFICATIONS

### 1. 💳 TRANSACTION CREATED
**Subject:** Transaction Notification
**When Sent:** When any transaction (transfer, deposit, withdrawal) is initiated
**Content:**
```
Transaction Initiated
Hello [User Name], your [transaction type] has been successfully initiated.

Transaction Details:
- Amount: [+/-]$[amount]
- Type: [Transfer/Deposit/Withdrawal]
- Status: Pending
- Reference: TXN[reference_number]
- Date: [date]
- From Account: ****[last_4_digits]
- To Account: ****[last_4_digits]
- Expected Completion: [completion_date]
- Description: [transaction_description]

What happens next?
• Your transaction is being processed and will be confirmed within 24 hours
• You'll receive another email once the transaction is confirmed
• Processing typically takes 1-2 business days depending on the transaction type

Important Notice:
If you did not initiate this transaction, please contact our security team immediately at security@dominiontrust.com or call our 24/7 hotline.
```

### 2. ✅ TRANSACTION COMPLETED
**Subject:** Transaction Completed
**When Sent:** When a transaction is successfully completed
**Content:**
```
Transaction Successful! ✅
Hello [User Name], your [transaction type] has been successfully completed.

Transaction Details:
- Amount: [+/-]$[amount]
- Type: [Transfer/Deposit/Withdrawal]
- Status: Completed
- Reference: TXN[reference_number]
- Completed: [completion_date_time]
- From Account: ****[last_4_digits]
- To Account: ****[last_4_digits]
- Description: [transaction_description]

Your account balance has been updated to reflect this transaction.
```

### 3. ❌ TRANSACTION FAILED
**Subject:** Transaction Failed
**When Sent:** When a transaction fails to process
**Content:**
```
Transaction Failed
Hello [User Name], your [transaction type] could not be completed.

Transaction Details:
- Amount: $[amount]
- Type: [Transfer/Deposit/Withdrawal]
- Reference: TXN[reference_number]
- Date: [date]
- Failure Reason: [reason]

What to do next:
• Check your account balance and try again
• Contact customer support if the issue persists
• Ensure all account details are correct

No funds have been deducted from your account.
```

---

## 🔐 SECURITY NOTIFICATIONS

### 4. 🚨 SECURITY ALERT
**Subject:** Security Alert - Suspicious Activity
**When Sent:** When suspicious login attempts or security events are detected
**Content:**
```
🚨 Security Alert: [Alert Type]
Hello [User Name], we detected [alert_description] on your account.

Alert Details:
- Alert Type: [Suspicious Login Attempt/Unauthorized Access/etc.]
- Date & Time: [event_time]
- IP Address: [ip_address]
- Location: [location]
- Device: [device_info]
- Risk Level: [Low/Medium/High]

🔒 If This Wasn't You:
Take immediate action to secure your account:
• Change your password immediately
• Enable two-factor authentication if not already active
• Review your trusted devices and remove unknown ones
• Contact our security team immediately

🛡️ Security Recommendations:
• Use strong, unique passwords for your banking account
• Enable two-factor authentication for additional security
• Only access your account from trusted devices and networks
• Be cautious of phishing attempts and suspicious emails
• Regularly review your account activity and statements
```

### 5. 🔐 LOGIN ALERT
**Subject:** New Login Detected
**When Sent:** When user logs in from a new device or suspicious location
**Content:**
```
New Login to Your Account
Hello [User Name], we detected a new login to your DominionTrust Bank account.

Login Details:
- Date & Time: [login_time]
- IP Address: [ip_address]
- Location: [location]
- Device: [device_info]
- New Device: [Yes/No]

If this was you, no action is needed. If you don't recognize this login, please secure your account immediately by changing your password and contacting our security team.
```

### 6. 🔐 TWO-FACTOR AUTHENTICATION CODE
**Subject:** Your 2FA Verification Code
**When Sent:** When user requests 2FA code for login or sensitive actions
**Content:**
```
Your Two-Factor Authentication Code
Hello [User Name], here's your verification code for secure access to your account.

Your Verification Code: [6-digit-code]

Code Details:
- Purpose: [Login/Transaction Verification/etc.]
- Valid Until: [expiry_time]
- IP Address: [ip_address]
- Location: [location]

⏰ Time Sensitive:
This code will expire in 10 minutes for your security. Please use it immediately.
If you didn't request this code, please secure your account immediately by changing your password.

🔐 Security Tips:
• Never share your 2FA codes with anyone, including bank staff
• DominionTrust Bank will never ask for your 2FA code via phone or email
• Always verify the website URL before entering your code
• Contact us immediately if you suspect unauthorized access
```

---

## 👤 ACCOUNT MANAGEMENT

### 7. 🎉 ACCOUNT ACTIVATION
**Subject:** Activate Your Account
**When Sent:** When a new user registers and needs to activate their account
**Content:**
```
Welcome to DominionTrust Bank!
Hello [User Name], your account has been created successfully.

Account Details:
- Email: [email_address]
- Created: [creation_date]

To complete your registration and activate your account, please click the activation link below:
[Activation Link]

This link will expire in 24 hours for security purposes.

Next Steps:
• Activate your account using the link above
• Complete your profile information
• Set up security features like 2FA
• Start banking with confidence
```

### 8. 👋 WELCOME MESSAGE
**Subject:** Welcome to DominionTrust Bank
**When Sent:** After user account is successfully activated
**Content:**
```
Welcome to DominionTrust Bank!
Hello [User Name], welcome to the DominionTrust Bank family!

Your Account:
- Account Number: ****[last_4_digits]
- Created: [creation_date]
- Status: Active

Getting Started:
• Log in to your account at [login_url]
• Set up additional security features
• Explore our mobile banking app
• Contact us if you need any assistance

We're here to help you achieve your financial goals.
```

### 9. 📧 EMAIL VERIFICATION
**Subject:** Verify Your Email Address
**When Sent:** When user changes email or needs to verify email address
**Content:**
```
Verify Your Email Address
Hello [User Name], please verify your email address to continue using your DominionTrust Bank account.

To verify your email, click the link below:
[Verification Link]

Important:
• This verification link will expire in 24 hours
• You must verify your email before you can access certain features
• If you didn't request this verification, please ignore this email

If you have any questions, please contact our customer support team.
```

---

## 💳 CARD NOTIFICATIONS

### 10. 💳 CARD CREATED
**Subject:** New Card Issued
**When Sent:** When a new debit/credit card is issued to the user
**Content:**
```
Your New Card Has Been Issued
Hello [User Name], your new [card_type] has been created and is ready for activation.

Card Details:
- Card Type: [Debit/Credit]
- Card Number: ****[last_4_digits]
- Brand: [Visa/Mastercard/Verve]
- Expiry Date: [MM/YY]
- Linked Account: ****[account_last_4_digits]

Next Steps:
• Activate your card when you receive it
• Set up your PIN at any of our ATMs
• Enable notifications for card transactions
• Contact us if you don't receive your card within 7-10 business days

Activation Required: Yes
Your card will arrive by mail within 7-10 business days.
```

---

## ⚠️ ACCOUNT ALERTS

### 11. ⚠️ LOW BALANCE ALERT
**Subject:** Low Balance Alert
**When Sent:** When account balance falls below user-defined threshold
**Content:**
```
Low Balance Alert
Hello [User Name], your account balance is below your alert threshold.

Account Details:
- Account: [account_name]
- Account Number: ****[last_4_digits]
- Current Balance: $[current_balance]
- Alert Threshold: $[threshold_amount]
- Date: [alert_date]

Consider:
• Making a deposit to avoid overdraft fees
• Setting up automatic transfers from another account
• Reviewing your spending patterns
• Adjusting your alert threshold if needed

You can manage your alerts and thresholds in your online banking settings.
```

---

## 🔑 PASSWORD & SECURITY

### 12. 🔑 PASSWORD RESET REQUEST
**Subject:** Password Reset Request
**When Sent:** When user requests to reset their password
**Content:**
```
Password Reset Request
Hello [User Name], we received a request to reset your password for your DominionTrust Bank account.

Reset Details:
- Request Time: [request_time]
- IP Address: [ip_address]

To reset your password, click the link below:
[Reset Link]

This link will expire in 1 hour for security purposes.

If you didn't request this reset:
• Ignore this email - your password will remain unchanged
• Consider enabling two-factor authentication for added security
• Contact our security team if you suspect unauthorized access

Never share your password with anyone. DominionTrust Bank will never ask for your password via email or phone.
```

---

## 📧 EMAIL FEATURES

### Common Elements in All Emails:
- **Professional Design:** All emails use responsive HTML templates with DominionTrust Bank branding
- **Security Notice:** Every email includes a footer warning about phishing and security
- **Contact Information:** Support contact details are provided in all emails
- **Unsubscribe Options:** Users can manage notification preferences
- **Timestamp:** All emails include clear date/time information
- **Reference Numbers:** Transaction-related emails include unique reference numbers for tracking

### Security Features:
- **Anti-Phishing Warning:** All emails remind users that the bank never asks for sensitive information via email
- **Secure Links:** All action links are properly formatted and lead to secure banking portals
- **Expiration Times:** Time-sensitive links (verification, reset) have clear expiration times
- **IP Tracking:** Security-related emails include IP address information for user verification

### Accessibility:
- **Plain Text Alternative:** All emails include plain text versions for accessibility
- **Clear Formatting:** Important information is highlighted and easy to read
- **Mobile Responsive:** Templates are optimized for mobile devices

---

## 🚨 IMPORTANT NOTES

1. **Email Delivery:** Currently configured for terminal output in development. Production would use SMTP.
2. **User Preferences:** Users can customize which notifications they receive via their account settings.
3. **Quiet Hours:** System respects user-defined quiet hours for non-urgent notifications.
4. **Multi-Channel:** Many notifications are also sent via SMS and in-app notifications based on user preferences.
5. **Templates:** All emails use Django templates for consistent formatting and easy updates.

---

*This document represents all email notifications currently implemented in the DominionTrust Bank system as of July 2025.*
