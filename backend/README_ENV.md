# 🔧 Environment Variables Setup

This document explains how to set up environment variables for the DominionTrust Bank Django backend.

## 🚀 Quick Setup

### Option 1: Automatic Setup (Recommended)
```bash
cd backend
source venv/bin/activate
python setup_env.py
```

### Option 2: Manual Setup
```bash
cd backend
cp env.example .env
nano .env  # Edit with your values
```

## 📋 Required Configuration

### 1. **Basic Settings**
```env
SECRET_KEY=your-generated-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
```

### 2. **Database** (Optional - defaults to SQLite)
```env
DATABASE_URL=sqlite:///db.sqlite3
```

### 3. **Frontend URL**
```env
FRONTEND_URL=http://localhost:3001
```

### 4. **Email** (Optional - defaults to console)
```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@dominiontrust.com
```

### 5. **Twilio SMS** (Optional)
```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## 🧪 Testing Your Setup

### Test Django Configuration
```bash
python manage.py runserver
```

### Test Email System
```bash
python manage.py setup_notification_templates --test-user testuser
```

### Test Twilio SMS
```bash
python manage.py test_twilio_sms --check-setup
```

## 🔒 Security Notes

- The `.env` file contains sensitive information
- Never commit `.env` files to version control
- Use strong, unique secret keys in production
- Set appropriate file permissions: `chmod 600 .env`

## 📊 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SECRET_KEY` | Django secret key | Generated | Yes |
| `DEBUG` | Debug mode | `True` | Yes |
| `ALLOWED_HOSTS` | Allowed hosts | `localhost,127.0.0.1` | Yes |
| `DATABASE_URL` | Database connection | `sqlite:///db.sqlite3` | No |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3001` | Yes |
| `EMAIL_BACKEND` | Email backend | `console` | No |
| `TWILIO_ACCOUNT_SID` | Twilio SID | `your_account_sid_here` | No |
| `TWILIO_AUTH_TOKEN` | Twilio token | `your_auth_token_here` | No |
| `TWILIO_PHONE_NUMBER` | Twilio phone | `+1234567890` | No |

## 🎯 Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure production database
- [ ] Set up real email backend
- [ ] Configure Twilio credentials
- [ ] Set proper `ALLOWED_HOSTS`
- [ ] Enable HTTPS settings

## 🆘 Troubleshooting

### Common Issues

**"No module named 'django'"**
- Activate virtual environment: `source venv/bin/activate`

**"SECRET_KEY setting must not be empty"**
- Run the setup script: `python setup_env.py`

**"ALLOWED_HOSTS validation error"**
- Check your `ALLOWED_HOSTS` setting in `.env`

**"Database connection error"**
- Verify your `DATABASE_URL` setting

### Getting Help

1. Check the `ENV_SETUP_GUIDE.md` for detailed instructions
2. Review the `env.example` file for all available options
3. Test your configuration with the provided commands

## 📚 Related Documentation

- [ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md) - Comprehensive setup guide
- [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md) - Email configuration
- [TWILIO_SETUP_GUIDE.md](TWILIO_SETUP_GUIDE.md) - SMS configuration

---

**Your environment is now configured and ready to use!** 🎉 
 