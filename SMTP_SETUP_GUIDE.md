# 📧 SMTP Email Setup Guide for DominionTrust Bank

## 🎯 Overview
This guide will help you configure real email sending for DominionTrust Bank using SMTP instead of terminal output.

## 🚀 Quick Setup (Recommended Providers)

### Option 1: Gmail SMTP (Free & Reliable)
**Best for:** Development and small-scale production

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password

3. **Configure Environment Variables:**
```bash
# Create .env file from template
cp env.example .env

# Edit .env with your Gmail credentials
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-character-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

### Option 2: SendGrid (Professional)
**Best for:** Production with high volume

```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@dominiontrust.com
```

### Option 3: Amazon SES (Enterprise)
**Best for:** Large-scale production

```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-ses-smtp-username
EMAIL_HOST_PASSWORD=your-ses-smtp-password
DEFAULT_FROM_EMAIL=noreply@dominiontrust.com
```

### Option 4: Outlook/Hotmail SMTP
**Best for:** Microsoft ecosystem

```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@outlook.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@outlook.com
```

## 🔧 Step-by-Step Setup

### Step 1: Create Environment File
```bash
cd /Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend
cp env.example .env
```

### Step 2: Configure Email Settings
Edit the `.env` file with your chosen provider's settings:

```bash
# Change from console to SMTP backend
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend

# Configure your SMTP provider
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=DominionTrust Bank <your-email@gmail.com>
```

### Step 3: Update Email Service (Automatic)
The system will automatically switch from terminal output to real email sending once SMTP is configured.

### Step 4: Test Email Configuration
```bash
# Run the email test
python manage.py shell

# In the Django shell:
from django.core.mail import send_mail
send_mail(
    'Test Email',
    'This is a test email from DominionTrust Bank.',
    'your-email@gmail.com',
    ['recipient@example.com'],
    fail_silently=False,
)
```

## 🧪 Testing Your Setup

### Test Script
Create a test script to verify email functionality:

```python
# test_email.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from notifications.services import NotificationService
from django.contrib.auth.models import User

# Get a test user
user = User.objects.first()
if user:
    service = NotificationService()
    notifications = service.send_notification(
        user=user,
        notification_type='account',
        template_type='welcome_message',
        context_data={
            'user_name': user.get_full_name() or user.username,
            'created_at': 'January 1, 2025'
        },
        channels=['email']
    )
    print(f"Sent {len(notifications)} notifications")
else:
    print("No users found for testing")
```

## 🔒 Security Best Practices

### 1. App Passwords (Gmail/Outlook)
- **Never use your main password** for SMTP
- Always use app-specific passwords
- Store passwords securely in environment variables

### 2. Environment Variables
- **Never commit passwords** to version control
- Use `.env` files that are in `.gitignore`
- Use different credentials for development/production

### 3. Rate Limiting
```python
# Gmail limits: 500 emails/day for free accounts
# SendGrid: 100 emails/day for free tier
# Consider upgrading for production use
```

### 4. From Address Configuration
```bash
# Use a professional from address
DEFAULT_FROM_EMAIL=DominionTrust Bank <noreply@dominiontrust.com>

# Or use your verified email
DEFAULT_FROM_EMAIL=DominionTrust Bank <your-email@gmail.com>
```

## 📊 Email Provider Comparison

| Provider | Free Tier | Setup Difficulty | Reliability | Best For |
|----------|-----------|------------------|-------------|----------|
| Gmail | 500/day | Easy | High | Development |
| SendGrid | 100/day | Medium | Very High | Production |
| AWS SES | 200/day | Hard | Very High | Enterprise |
| Outlook | 300/day | Easy | High | Microsoft Users |

## 🐛 Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check username/password
   - Ensure 2FA is enabled and app password is used
   - Verify SMTP host and port

2. **"Connection refused"**
   - Check EMAIL_HOST and EMAIL_PORT
   - Verify TLS/SSL settings
   - Check firewall settings

3. **"Sender not authorized"**
   - Verify email address is authorized with provider
   - Check SPF/DKIM records for custom domains

4. **Rate limiting**
   - Check provider's sending limits
   - Implement delays between emails if needed

### Debug Mode:
```python
# Add to settings.py for debugging
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🔄 Switching Back to Development
To disable email sending and return to terminal output:

```bash
# In .env file:
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

## 📈 Production Considerations

### 1. Custom Domain
- Set up SPF, DKIM, and DMARC records
- Use a professional domain (e.g., @dominiontrust.com)

### 2. Monitoring
- Monitor email delivery rates
- Set up bounce/complaint handling
- Track email opens and clicks

### 3. Templates
- Use responsive email templates
- Test across different email clients
- Include plain text alternatives

### 4. Compliance
- Include unsubscribe links
- Follow CAN-SPAM regulations
- Implement proper consent mechanisms

## ✅ Verification Checklist

- [ ] Environment file created and configured
- [ ] SMTP credentials added to .env
- [ ] Test email sent successfully
- [ ] Email templates rendering correctly
- [ ] From address properly configured
- [ ] Rate limiting considered
- [ ] Security best practices followed
- [ ] Monitoring set up (production)

## 🆘 Support Resources

- **Gmail SMTP Guide:** https://support.google.com/mail/answer/7126229
- **SendGrid Documentation:** https://docs.sendgrid.com/
- **AWS SES Guide:** https://docs.aws.amazon.com/ses/
- **Django Email Documentation:** https://docs.djangoproject.com/en/4.2/topics/email/

---

Once configured, all 12 email notification types will be sent as real emails instead of terminal output!
