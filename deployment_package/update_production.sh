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
