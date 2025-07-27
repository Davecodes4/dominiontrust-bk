#!/bin/bash

# Production Deployment Script for Dominion Trust Capital Backend
# PythonAnywhere deployment automation

set -e  # Exit on any error

echo "🚀 Deploying Dominion Trust Capital Backend to PythonAnywhere..."
echo "=================================================="

# Configuration
PROJECT_NAME="dominiontrustcapital"
PYTHON_VERSION="3.10"
DOMAIN_NAME="dominiontrustcapital.pythonanywhere.com"

# Get PythonAnywhere username
read -p "Enter your PythonAnywhere username: " PA_USERNAME
if [ -z "$PA_USERNAME" ]; then
    echo "❌ Username is required"
    exit 1
fi

PROJECT_PATH="/home/$PA_USERNAME/$PROJECT_NAME"
VENV_PATH="/home/$PA_USERNAME/.virtualenvs/$PROJECT_NAME"

echo "📋 Deployment Configuration:"
echo "   Username: $PA_USERNAME"
echo "   Project Path: $PROJECT_PATH"
echo "   Virtual Environment: $VENV_PATH"
echo "   Domain: $DOMAIN_NAME"
echo ""

# Check if we're in the backend directory
if [ ! -f "manage.py" ]; then
    echo "❌ Error: manage.py not found. Make sure you're in the backend directory."
    exit 1
fi

echo "📦 Step 1: Preparing deployment files..."

# Create production environment file if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "⚠️  Creating .env.production from template..."
    cp .env.example .env.production
    echo "📝 Please edit .env.production with your production settings before deployment"
fi

# Generate a random secret key
SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
echo "🔑 Generated new SECRET_KEY for production"

# Update .env.production with actual values
sed -i.bak "s/your-production-secret-key-here-change-this-immediately/$SECRET_KEY/" .env.production
sed -i.bak "s/username/$PA_USERNAME/g" .env.production
rm .env.production.bak

echo "✅ Production environment configured"

echo "📁 Step 2: Creating deployment package..."

# Create deployment directory structure
DEPLOY_DIR="deployment_package"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy application files
cp -r accounts banking dominion_bank notifications scripts templates staticfiles $DEPLOY_DIR/
cp manage.py requirements_production.txt .env.production wsgi_production.py $DEPLOY_DIR/
cp -r logs media $DEPLOY_DIR/ 2>/dev/null || echo "📝 Note: logs and media directories will be created on server"

# Create directories that might not exist
mkdir -p $DEPLOY_DIR/logs $DEPLOY_DIR/media $DEPLOY_DIR/staticfiles

echo "✅ Deployment package created in $DEPLOY_DIR/"

echo "📋 Step 3: Creating deployment instructions..."

# Create deployment instructions
cat > $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md << EOF
# PythonAnywhere Deployment Instructions

## Pre-deployment Setup

1. **Upload files to PythonAnywhere:**
   - Upload the contents of this deployment package to: \`$PROJECT_PATH\`
   - You can use the Files tab in PythonAnywhere dashboard
   - Or use git to clone your repository

2. **Create Virtual Environment:**
   \`\`\`bash
   mkvirtualenv $PROJECT_NAME --python=python$PYTHON_VERSION
   \`\`\`

3. **Install Dependencies:**
   \`\`\`bash
   cd $PROJECT_PATH
   pip install -r requirements_production.txt
   \`\`\`

## Database Setup

1. **Create MySQL Database:**
   - Go to Databases tab in PythonAnywhere dashboard
   - Create a new database: \`${PA_USERNAME}\$dominiontrustcapital\`
   - Note the connection details

2. **Update Database URL in .env.production:**
   \`\`\`
   DATABASE_URL=mysql://${PA_USERNAME}:your_mysql_password@${PA_USERNAME}.mysql.pythonanywhere-services.com/${PA_USERNAME}\$dominiontrustcapital
   \`\`\`

3. **Run Migrations:**
   \`\`\`bash
   cd $PROJECT_PATH
   python manage.py migrate --settings=dominion_bank.settings_production
   \`\`\`

4. **Create Superuser:**
   \`\`\`bash
   python manage.py createsuperuser --settings=dominion_bank.settings_production
   \`\`\`

5. **Collect Static Files:**
   \`\`\`bash
   python manage.py collectstatic --noinput --settings=dominion_bank.settings_production
   \`\`\`

## Web App Configuration

1. **Create Web App:**
   - Go to Web tab in PythonAnywhere dashboard
   - Click "Add a new web app"
   - Choose "Manual configuration"
   - Select Python $PYTHON_VERSION

2. **Configure WSGI:**
   - Edit the WSGI configuration file
   - Replace content with the code from \`wsgi_production.py\`
   - Update the paths with your username

3. **Configure Static Files:**
   - URL: \`/static/\`
   - Directory: \`$PROJECT_PATH/staticfiles/\`

4. **Configure Media Files:**
   - URL: \`/media/\`
   - Directory: \`$PROJECT_PATH/media/\`

5. **Set Virtual Environment:**
   - Virtual environment path: \`$VENV_PATH\`

## Final Steps

1. **Test the Application:**
   - Visit: https://$DOMAIN_NAME
   - Check admin: https://$DOMAIN_NAME/admin/

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
EOF

echo "✅ Deployment instructions created"

echo "🔗 Step 4: Creating management scripts..."

# Create production management script
cat > $DEPLOY_DIR/manage_production.py << 'EOF'
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks in production."""
import os
import sys

if __name__ == '__main__':
    """Run administrative tasks with production settings."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings_production')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
EOF

# Create update script
cat > $DEPLOY_DIR/update_production.sh << 'EOF'
#!/bin/bash
# Production update script
# Run this script to update the production deployment

echo "🔄 Updating production deployment..."

# Pull latest code (if using git)
# git pull origin main

# Install/update dependencies
pip install -r requirements_production.txt

# Run migrations
python manage_production.py migrate

# Collect static files
python manage_production.py collectstatic --noinput

# Restart web app (you'll need to do this manually in PythonAnywhere dashboard)
echo "✅ Update complete. Remember to restart your web app in PythonAnywhere dashboard!"
EOF

chmod +x $DEPLOY_DIR/manage_production.py $DEPLOY_DIR/update_production.sh

echo "✅ Management scripts created"

echo "📊 Step 5: Deployment summary..."

echo ""
echo "🎉 Deployment package ready!"
echo "=========================="
echo "📁 Package location: $DEPLOY_DIR/"
echo "📋 Instructions: $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo "📋 Next steps:"
echo "1. Upload $DEPLOY_DIR/ contents to PythonAnywhere"
echo "2. Follow instructions in DEPLOYMENT_INSTRUCTIONS.md"
echo "3. Configure your database and domain"
echo "4. Test the deployment"
echo ""
echo "🌐 Your app will be available at: https://$DOMAIN_NAME"
echo ""
echo "⚠️  Important: Review and update .env.production before deployment!"

# Open deployment directory
if command -v open &> /dev/null; then
    open $DEPLOY_DIR
fi
