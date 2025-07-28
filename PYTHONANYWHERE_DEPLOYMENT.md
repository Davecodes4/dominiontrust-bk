# 🐍 PythonAnywhere Deployment Guide - Dominion Trust Capital Backend

This guide covers deploying the Dominion Trust Capital Django backend to PythonAnywhere hosting.

## 🏗️ Pre-Deployment Checklist

- [ ] PythonAnywhere account created
- [ ] Domain name configured (optional)
- [ ] Email hosting configured
- [ ] Database credentials ready
- [ ] SSL certificate planned

## 📦 Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
cd backend
./deploy_pythonanywhere.sh
```

This will create a deployment package with all necessary files and instructions.

### Option 2: Manual Deployment

Follow the step-by-step guide below.

## 🔧 Manual Deployment Steps

### Step 1: Prepare Local Environment

1. **Create production environment file:**
   ```bash
   cp .env.example .env.production
   ```

2. **Edit .env.production with production values:**
   ```env
   SECRET_KEY=your-unique-secret-key-here
   DEBUG=False
   ALLOWED_HOSTS=yourusername.pythonanywhere.com,dominiontrustcapital.com
   DATABASE_URL=mysql://username:password@username.mysql.pythonanywhere-services.com/username$dominiontrustcapital
   FRONTEND_URL=https://dominiontrustcapital.com
   CORS_ALLOWED_ORIGINS=https://dominiontrustcapital.com
   ```

### Step 2: Upload to PythonAnywhere

1. **Upload files via Files tab or Git:**
   ```bash
   # Option A: Git (recommended)
   git clone https://github.com/yourusername/DominionTrust_Bank.git
   cd DominionTrust_Bank/backend
   
   # Option B: File upload
   # Upload files manually through PythonAnywhere Files interface
   ```

2. **Set up project structure:**
   ```
   /home/yourusername/
   └── dominiontrustcapital/
       ├── accounts/
       ├── banking/
       ├── dominion_bank/
       ├── notifications/
       ├── manage.py
       ├── requirements_production.txt
       ├── .env.production
       └── wsgi_production.py
   ```

### Step 3: Create Virtual Environment

1. **Open a Bash console in PythonAnywhere**

2. **Create virtual environment:**
   ```bash
   mkvirtualenv dominiontrustcapital --python=python3.10
   ```

3. **Activate environment and install dependencies:**
   ```bash
   cd dominiontrustcapital
   pip install -r requirements_production.txt
   ```

### Step 4: Database Configuration

1. **Create MySQL database:**
   - Go to **Databases** tab in PythonAnywhere dashboard
   - Create database: `yourusername$dominiontrustcapital`
   - Note the connection details

2. **Update database URL in .env.production:**
   ```env
   DATABASE_URL=mysql://yourusername:your_mysql_password@yourusername.mysql.pythonanywhere-services.com/yourusername$dominiontrustcapital
   ```

3. **Run database migrations:**
   ```bash
   python manage.py migrate --settings=dominion_bank.settings_production
   ```

4. **Create superuser:**
   ```bash
   python manage.py createsuperuser --settings=dominion_bank.settings_production
   ```

5. **Collect static files:**
   ```bash
   python manage.py collectstatic --noinput --settings=dominion_bank.settings_production
   ```

### Step 5: Web App Configuration

1. **Create new web app:**
   - Go to **Web** tab in PythonAnywhere dashboard
   - Click "Add a new web app"
   - Choose "Manual configuration"
   - Select Python 3.10

2. **Configure WSGI file:**
   - Edit the WSGI configuration file (`/var/www/yourusername_pythonanywhere_com_wsgi.py`)
   - Replace with content from `wsgi_production.py`
   - Update paths with your username:

   ```python
   import os
   import sys

   path = '/home/yourusername/dominiontrustcapital'
   if path not in sys.path:
       sys.path.insert(0, path)

   os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings_production')

   from django.core.wsgi import get_wsgi_application
   application = get_wsgi_application()
   ```

3. **Configure virtual environment:**
   - Set virtual environment path: `/home/yourusername/.virtualenvs/dominiontrustcapital`

4. **Configure static files:**
   - URL: `/static/`
   - Directory: `/home/yourusername/dominiontrustcapital/staticfiles/`

5. **Configure media files:**
   - URL: `/media/`
   - Directory: `/home/yourusername/dominiontrustcapital/media/`

### Step 6: Security Configuration

1. **SSL Certificate:**
   - PythonAnywhere provides free SSL for `.pythonanywhere.com` domains
   - For custom domains, configure SSL in the Web tab

2. **Environment variables verification:**
   ```bash
   python -c "
   import os
   from dotenv import load_dotenv
   load_dotenv('.env.production')
   print('DEBUG:', os.getenv('DEBUG'))
   print('ALLOWED_HOSTS:', os.getenv('ALLOWED_HOSTS'))
   "
   ```

### Step 7: Test Deployment

1. **Start the web app:**
   - Click "Reload" in the Web tab

2. **Test endpoints:**
   - Visit: `https://yourusername.pythonanywhere.com`
   - Admin: `https://yourusername.pythonanywhere.com/admin/`
   - API: `https://yourusername.pythonanywhere.com/api/`

3. **Check logs:**
   - Error log: Available in Web tab
   - Server log: Available in Web tab

## 🌐 Custom Domain Setup

### Step 1: DNS Configuration

1. **Point your domain to PythonAnywhere:**
   ```
   Type: CNAME
   Name: www
   Value: webapp-5432.pythonanywhere.com
   
   Type: A
   Name: @
   Value: 52.214.218.138
   ```

2. **Update ALLOWED_HOSTS:**
   ```env
   ALLOWED_HOSTS=yourusername.pythonanywhere.com,dominiontrustcapital.com,www.dominiontrustcapital.com
   ```

### Step 2: SSL Certificate

1. **Configure SSL in PythonAnywhere:**
   - Go to Web tab
   - Add your custom domain
   - Enable "Force HTTPS"

## 📊 Monitoring & Maintenance

### Regular Tasks

1. **Update dependencies:**
   ```bash
   pip install -r requirements_production.txt --upgrade
   ```

2. **Database backup:**
   ```bash
   python manage.py dbbackup --settings=dominion_bank.settings_production
   ```

3. **Check logs:**
   ```bash
   tail -f /var/log/yourusername.pythonanywhere.com.error.log
   ```

### Performance Optimization

1. **Database optimization:**
   ```bash
   python manage.py optimize_db --settings=dominion_bank.settings_production
   ```

2. **Static file compression:**
   ```bash
   python manage.py compress --settings=dominion_bank.settings_production
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Import errors:**
   - Check virtual environment activation
   - Verify Python path in WSGI file

2. **Database connection errors:**
   - Verify database credentials
   - Check MySQL service status

3. **Static files not loading:**
   - Run `collectstatic` command
   - Check static files mapping

4. **CORS errors:**
   - Update `CORS_ALLOWED_ORIGINS` in settings
   - Verify frontend domain

### Debug Mode

**Never enable DEBUG=True in production!**

For troubleshooting, check:
- Error logs in Web tab
- Django logs in `/home/yourusername/dominiontrustcapital/logs/`
- Console output

## 📋 Production Checklist

Before going live:

- [ ] `DEBUG=False` in production settings
- [ ] Unique `SECRET_KEY` generated
- [ ] Database properly configured and migrated
- [ ] Static files collected
- [ ] SSL certificate configured
- [ ] Custom domain configured (if applicable)
- [ ] Email settings tested
- [ ] CORS origins restricted to production domains
- [ ] Error logging configured
- [ ] Backup strategy implemented
- [ ] Monitoring setup completed

## 🆘 Support Resources

- **PythonAnywhere Help:** [help.pythonanywhere.com](https://help.pythonanywhere.com)
- **Django Documentation:** [docs.djangoproject.com](https://docs.djangoproject.com)
- **Project Issues:** GitHub repository issues

## 📞 Contact Information

- **Technical Support:** support@dominiontrustcapital.com
- **Deployment Issues:** Create GitHub issue
- **PythonAnywhere Support:** Use their help system

---

**Last Updated:** July 27, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
