# PythonAnywhere Deployment Instructions

## Pre-deployment Setup

1. **Upload files to PythonAnywhere:**
   - Upload the contents of this deployment package to: `/home/test/dominiontrustcapital`
   - You can use the Files tab in PythonAnywhere dashboard
   - Or use git to clone your repository

2. **Create Virtual Environment:**
   ```bash
   mkvirtualenv dominiontrustcapital --python=python3.10
   ```

3. **Install Dependencies:**
   ```bash
   cd /home/test/dominiontrustcapital
   pip install -r requirements_production.txt
   ```

## Database Setup

1. **Create MySQL Database:**
   - Go to Databases tab in PythonAnywhere dashboard
   - Create a new database: `test$dominiontrustcapital`
   - Note the connection details

2. **Update Database URL in .env.production:**
   ```
   DATABASE_URL=mysql://test:your_mysql_password@test.mysql.pythonanywhere-services.com/test$dominiontrustcapital
   ```

3. **Run Migrations:**
   ```bash
   cd /home/test/dominiontrustcapital
   python manage.py migrate --settings=dominion_bank.settings_production
   ```

4. **Create Superuser:**
   ```bash
   python manage.py createsuperuser --settings=dominion_bank.settings_production
   ```

5. **Collect Static Files:**
   ```bash
   python manage.py collectstatic --noinput --settings=dominion_bank.settings_production
   ```

## Web App Configuration

1. **Create Web App:**
   - Go to Web tab in PythonAnywhere dashboard
   - Click "Add a new web app"
   - Choose "Manual configuration"
   - Select Python 3.10

2. **Configure WSGI:**
   - Edit the WSGI configuration file
   - Replace content with the code from `wsgi_production.py`
   - Update the paths with your username

3. **Configure Static Files:**
   - URL: `/static/`
   - Directory: `/home/test/dominiontrustcapital/staticfiles/`

4. **Configure Media Files:**
   - URL: `/media/`
   - Directory: `/home/test/dominiontrustcapital/media/`

5. **Set Virtual Environment:**
   - Virtual environment path: `/home/test/.virtualenvs/dominiontrustcapital`

## Final Steps

1. **Test the Application:**
   - Visit: https://dominiontrustcapital.pythonanywhere.com
   - Check admin: https://dominiontrustcapital.pythonanywhere.com/admin/

2. **Setup Custom Domain (Optional):**
   - Configure DNS to point to PythonAnywhere
   - Add domain in Web tab

3. **Configure Email (Production):**
   - Update email settings in .env.production
   - Test email functionality

## Troubleshooting

- **Error logs:** Check /var/log/ directory or Web tab error log
- **Database issues:** Check connection string and permissions
- **Static files:** Run collectstatic command
- **Permissions:** Check file/directory permissions

## Security Checklist

- [ ] SECRET_KEY is unique and secure
- [ ] DEBUG=False in production
- [ ] Database credentials are secure
- [ ] Email credentials are configured
- [ ] HTTPS is configured
- [ ] CORS origins are restricted
- [ ] Error logging is working

## Support

For issues, check:
- PythonAnywhere help pages
- Django documentation
- Project documentation
