# 🔧 Environment Variables Setup Guide

This guide explains how to set up environment variables for the DominionTrust Bank backend using `.env` files.

## 🎯 **What's Been Changed**

✅ **Django Settings Updated** - Now uses `python-dotenv` for environment variables
✅ **Security Improved** - Sensitive data moved to environment variables
✅ **Configuration Centralized** - All settings in one place
✅ **Production Ready** - Easy deployment with different environments

## 📋 **Setup Instructions**

### Step 1: Create Your .env File

1. **Copy the example file**:
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Edit the .env file** with your actual values:
   ```bash
   nano .env
   # or
   code .env
   ```

### Step 2: Configure Your Settings

Here's what each setting does:

#### **🔐 Django Core Settings**
```env
# Generate a new secret key for production
SECRET_KEY=your-secret-key-here-change-this-in-production

# Set to False in production
DEBUG=True

# Add your domain in production
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,yourdomain.com
```

#### **🗄️ Database Configuration**
```env
# For SQLite (development)
DATABASE_URL=sqlite:///db.sqlite3

# For PostgreSQL (production)
# DATABASE_URL=postgresql://user:password@localhost:5432/dominion_bank

# For MySQL (production)
# DATABASE_URL=mysql://user:password@localhost:3306/dominion_bank
```

#### **🌐 Frontend Configuration**
```env
# Your frontend URL
FRONTEND_URL=http://localhost:3001

# CORS allowed origins
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

#### **📧 Email Configuration**
```env
# For development (shows emails in console)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@dominiontrust.com

# For production with Gmail
# EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USE_TLS=True
# EMAIL_HOST_USER=your-email@gmail.com
# EMAIL_HOST_PASSWORD=your-app-password
```

#### **📱 Twilio SMS Configuration**
```env
# Get these from https://console.twilio.com
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

#### **🔒 Security Settings**
```env
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
X_FRAME_OPTIONS=DENY
```

#### **🏦 Banking Configuration**
```env
ACCOUNT_NUMBER_LENGTH=10
TRANSACTION_REFERENCE_LENGTH=12
KYC_DOCUMENT_RETENTION_DAYS=2555
```

#### **📁 File Upload Settings**
```env
MEDIA_URL=/media/
MEDIA_ROOT=media/
```

#### **📊 Logging Configuration**
```env
LOG_LEVEL=INFO
```

#### **🍪 Session & CSRF Settings**
```env
SESSION_COOKIE_SECURE=False
SESSION_COOKIE_HTTPONLY=True
SESSION_COOKIE_AGE=86400
CSRF_COOKIE_SECURE=False
CSRF_COOKIE_HTTPONLY=True
```

## 🚀 **Environment-Specific Configurations**

### **Development (.env)**
```env
SECRET_KEY=django-insecure-dev-key-change-this
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
DATABASE_URL=sqlite:///db.sqlite3
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
FRONTEND_URL=http://localhost:3001
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
```

### **Production (.env)**
```env
SECRET_KEY=super-secure-production-key-50-chars-long
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@localhost:5432/dominion_bank
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@yourdomain.com
EMAIL_HOST_PASSWORD=your-app-password
FRONTEND_URL=https://yourdomain.com
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_real_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🔧 **Advanced Configuration**

### **Redis Cache (Optional)**
```env
# For Redis caching
REDIS_URL=redis://localhost:6379/0
```

### **Third-Party APIs**
```env
# Stripe for payments
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Plaid for bank connections
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
```

## 🛡️ **Security Best Practices**

### **Secret Key Generation**
```python
# Generate a new secret key
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### **Environment-Specific Files**
- `.env` - Local development
- `.env.production` - Production environment
- `.env.staging` - Staging environment
- `.env.test` - Testing environment

### **File Permissions**
```bash
# Secure your .env file
chmod 600 .env
```

### **Git Ignore**
Make sure `.env` is in your `.gitignore`:
```gitignore
# Environment variables
.env
.env.local
.env.production
.env.staging
```

## 🧪 **Testing Your Configuration**

### **Check Environment Variables**
```bash
# Test if settings are loaded correctly
python manage.py shell
```

```python
from django.conf import settings
print(settings.SECRET_KEY)
print(settings.DEBUG)
print(settings.TWILIO_ACCOUNT_SID)
```

### **Test Email Configuration**
```bash
python manage.py setup_notification_templates --test-user testuser --test-activation
```

### **Test Twilio Configuration**
```bash
python manage.py test_twilio_sms --check-setup
```

## 🚀 **Deployment Considerations**

### **Production Checklist**
- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure production database
- [ ] Set up real email backend
- [ ] Configure Twilio credentials
- [ ] Enable HTTPS settings
- [ ] Set proper `ALLOWED_HOSTS`
- [ ] Configure logging
- [ ] Set up monitoring

### **Environment Variables in Production**
Different platforms handle environment variables differently:

#### **Heroku**
```bash
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False
heroku config:set DATABASE_URL=postgresql://...
```

#### **Docker**
```yaml
# docker-compose.yml
environment:
  - SECRET_KEY=your-secret-key
  - DEBUG=False
  - DATABASE_URL=postgresql://...
```

#### **AWS/Azure/GCP**
Set environment variables in your cloud platform's configuration panel.

## 📊 **Configuration Summary**

### **What's Configured**
✅ **Django Core** - Secret key, debug, allowed hosts
✅ **Database** - SQLite for dev, PostgreSQL/MySQL for production
✅ **Email** - Console for dev, SMTP for production
✅ **SMS** - Twilio integration
✅ **Security** - CSRF, sessions, XSS protection
✅ **Banking** - Account numbers, transaction settings
✅ **Logging** - File and console logging
✅ **Caching** - Local memory and Redis support
✅ **Third-Party APIs** - Stripe, Plaid ready

### **Benefits**
- 🔐 **Security** - Sensitive data not in code
- 🚀 **Deployment** - Easy environment switching
- 🔧 **Maintenance** - Centralized configuration
- 👥 **Team** - Different settings per developer
- 🧪 **Testing** - Separate test configurations

## 🎯 **Quick Start**

1. **Copy example file**:
   ```bash
   cp env.example .env
   ```

2. **Edit your values**:
   ```bash
   nano .env
   ```

3. **Test configuration**:
   ```bash
   python manage.py runserver
   ```

4. **Test notifications**:
   ```bash
   python manage.py setup_notification_templates --test-user testuser
   ```

**Your environment variables are now properly configured!** 🎉

The Django backend will automatically load settings from your `.env` file, making it easy to manage different environments and keep sensitive information secure. 
 