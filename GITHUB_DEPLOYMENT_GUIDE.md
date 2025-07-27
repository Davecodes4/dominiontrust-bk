# 🚀 GitHub Deployment Guide

## 📝 Overview

This guide will help you deploy the Dominion Trust Capital banking platform to GitHub and set up automated deployment to production environments.

## 🛠️ Prerequisites

- Git repository initialized ✅ (Already done)
- GitHub account
- Cloudflare account (for frontend deployment)
- PythonAnywhere account (for backend deployment)

## 🔧 Step 1: Create GitHub Repository

### ✅ GitHub Repository Setup Complete!
Your repository has been successfully created and deployed:

**🔗 Repository URL**: https://github.com/Davecodes4/dominion-trust-bank.git

**📊 Deployment Stats**:
- ✅ 280 objects committed
- ✅ 224 files uploaded (45,934+ lines of code)
- ✅ Repository configured with user: Davecodes4
- ✅ Main branch set up and tracking

**🎯 Next Steps**: 
1. Set up Cloudflare Pages deployment (Step 2 below)
2. Configure production environment variables
3. Deploy backend to PythonAnywhere (Step 3 below)

## 🌐 Step 2: Set up Cloudflare Pages (Frontend)

### 2.1 Connect Repository
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Select **Connect to Git**
4. Choose your GitHub repository: `Davecodes4/dominion-trust-bank`
5. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `cd frontend && npm ci && npm run build`
   - **Build output directory**: `frontend/.next`
   - **Root directory**: `/` (leave empty)
   - **Node.js version**: 18.17.0

**⚠️ Important**: If you see an error about `wrangler.toml`, ignore the file during setup. Cloudflare Pages will use the build settings you specify in the dashboard, not the wrangler.toml file.

### 2.2 Environment Variables
Add these environment variables in Cloudflare Pages:

```env
# Production Environment Variables
NEXT_PUBLIC_API_URL=https://yourdomain.pythonanywhere.com
NEXT_PUBLIC_APP_NAME=Dominion Trust Capital
NEXT_PUBLIC_COMPANY_EMAIL=support@dominiontrustcapital.com
NEXT_PUBLIC_COMPANY_PHONE=+1-800-DOMINION
NEXT_PUBLIC_SUPPORT_EMAIL=support@dominiontrustcapital.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true
NODE_VERSION=18.17.0
```

### 2.3 Custom Domain (Optional)
1. In Cloudflare Pages → Your project → **Custom domains**
2. Add your domain (e.g., `app.dominiontrustcapital.com`)
3. Configure DNS settings as instructed

## 🐍 Step 3: Deploy Backend to PythonAnywhere

### 3.1 Upload Code
```bash
# Create a zip file of the backend
cd backend
zip -r dominion-bank-backend.zip . -x "*.pyc" "__pycache__/*" "venv/*" ".env"

# Upload to PythonAnywhere via their file manager or:
# scp dominion-bank-backend.zip yourusername@ssh.pythonanywhere.com:~/
```

### 3.2 Set up on PythonAnywhere
1. **Extract files**:
   ```bash
   cd ~
   unzip dominion-bank-backend.zip -d dominion-bank/
   cd dominion-bank
   ```

2. **Create virtual environment**:
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements_production.txt
   ```

3. **Configure environment**:
   ```bash
   cp env.example .env.production
   # Edit .env.production with your production values
   ```

4. **Run deployment script**:
   ```bash
   chmod +x deploy_pythonanywhere.sh
   ./deploy_pythonanywhere.sh
   ```

5. **Configure WSGI**:
   - Go to PythonAnywhere **Web** tab
   - Create new web app
   - Choose **Manual configuration** → **Python 3.11**
   - Edit WSGI file to point to `wsgi_production.py`

## 🔒 Step 4: Configure Secrets and Environment Variables

### 4.1 GitHub Secrets (for future CI/CD)
Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:
```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
PYTHONANYWHERE_API_TOKEN=your_pythonanywhere_token
PYTHONANYWHERE_USERNAME=your_username
```

### 4.2 Backend Environment (.env.production)
```env
SECRET_KEY=your-super-secret-production-key
DEBUG=False
DATABASE_URL=mysql://username:password@hostname/database_name
ALLOWED_HOSTS=yourdomain.pythonanywhere.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.pages.dev

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

## 🚀 Step 5: Test Deployment

### 5.1 Frontend Test
1. Visit your Cloudflare Pages URL
2. Test user registration and login
3. Verify API connectivity
4. Check responsive design on mobile

### 5.2 Backend Test
1. Visit your PythonAnywhere domain
2. Test API endpoints: `/api/auth/`, `/api/banking/`
3. Check admin interface: `/admin/`
4. Verify database connectivity

### 5.3 End-to-End Test
```bash
# Test complete user journey
cd frontend
npm run test:e2e  # If you have E2E tests

# Or manual testing:
# 1. Register new user
# 2. Verify email
# 3. Complete KYC
# 4. Create bank account
# 5. Make a transfer
# 6. Check transaction history
```

## 🔄 Step 6: Set up Continuous Deployment

### 6.1 Automatic Frontend Deployment
Cloudflare Pages automatically deploys when you push to the main branch.

### 6.2 Backend Deployment Workflow (Future Enhancement)
Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [ main ]
    paths: [ 'backend/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to PythonAnywhere
        run: |
          # Custom deployment script
          echo "Backend deployment script here"
          # This would typically involve:
          # 1. Creating a deployment package
          # 2. Uploading via PythonAnywhere API
          # 3. Running migration and restart commands
```

## 📊 Step 7: Monitoring and Maintenance

### 7.1 Set up Monitoring
- **Frontend**: Cloudflare Analytics
- **Backend**: PythonAnywhere CPU/memory monitoring
- **Uptime**: Use services like UptimeRobot or Pingdom

### 7.2 Backup Strategy
- **Database**: PythonAnywhere automatic MySQL backups
- **Code**: GitHub repository serves as primary backup
- **Media files**: Regular backup of uploaded KYC documents

### 7.3 Regular Maintenance
```bash
# Weekly maintenance checklist:
# 1. Check error logs
# 2. Update dependencies
# 3. Monitor disk space
# 4. Review security alerts
# 5. Test backup restoration
```

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```python
   # In settings_production.py
   CORS_ALLOWED_ORIGINS = [
       "https://your-frontend-domain.pages.dev",
       "https://your-custom-domain.com",
   ]
   ```

2. **Database Connection Issues**
   ```bash
   # Check MySQL credentials
   mysql -u username -p -h hostname database_name
   
   # Verify Django database settings
   python manage_production.py check --database default
   ```

3. **Static Files Not Loading**
   ```bash
   # Collect static files
   python manage_production.py collectstatic --noinput
   
   # Check STATIC_ROOT setting
   ```

4. **SSL Certificate Issues**
   - Ensure `SECURE_SSL_REDIRECT = True` in production
   - Check Cloudflare SSL/TLS settings
   - Verify domain DNS configuration

## 📚 Additional Resources

- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Django Deployment Guide](https://docs.djangoproject.com/en/5.0/howto/deployment/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [PythonAnywhere Help](https://help.pythonanywhere.com/)

## 🎉 Completion Checklist

- [ ] GitHub repository created and code pushed
- [ ] Cloudflare Pages connected and deployed
- [ ] Backend deployed to PythonAnywhere
- [ ] Environment variables configured
- [ ] Custom domains set up (optional)
- [ ] SSL certificates configured
- [ ] End-to-end testing completed
- [ ] Monitoring set up
- [ ] Documentation updated

---

**🎯 Next Steps**: Your banking platform is now live! Consider setting up analytics, user feedback collection, and performance monitoring to optimize the user experience.

**📞 Support**: If you encounter issues, check the troubleshooting section or create an issue in the GitHub repository.

---

*Last Updated: July 27, 2025*
