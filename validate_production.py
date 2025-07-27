#!/usr/bin/env python
"""
Production Environment Validator for Dominion Trust Capital
Validates production settings and configuration before deployment
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings_production')
django.setup()

from django.conf import settings
from django.core.management import execute_from_command_line
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

def validate_environment():
    """Validate production environment configuration."""
    
    print("🔍 Validating production environment for Dominion Trust Capital...")
    print("=" * 60)
    
    errors = []
    warnings = []
    
    # Load production environment
    env_file = backend_dir / '.env.production'
    if env_file.exists():
        load_dotenv(env_file)
        print("✅ Production environment file found")
    else:
        errors.append("❌ .env.production file not found")
        return errors, warnings
    
    # Check Django settings
    print("\n🔧 Django Configuration:")
    
    # DEBUG setting
    if settings.DEBUG:
        errors.append("❌ DEBUG is True in production (security risk)")
    else:
        print("✅ DEBUG is False")
    
    # Secret key
    if not settings.SECRET_KEY or settings.SECRET_KEY == 'your-production-secret-key-here-change-this-immediately':
        errors.append("❌ SECRET_KEY not configured or using default value")
    elif len(settings.SECRET_KEY) < 50:
        warnings.append("⚠️  SECRET_KEY should be longer for better security")
    else:
        print("✅ SECRET_KEY configured")
    
    # Allowed hosts
    if not settings.ALLOWED_HOSTS or settings.ALLOWED_HOSTS == ['localhost']:
        errors.append("❌ ALLOWED_HOSTS not configured for production")
    else:
        print(f"✅ ALLOWED_HOSTS: {', '.join(settings.ALLOWED_HOSTS)}")
    
    # Database
    print("\n💾 Database Configuration:")
    db_url = os.getenv('DATABASE_URL', '')
    if not db_url or 'sqlite' in db_url.lower():
        warnings.append("⚠️  Using SQLite database (consider MySQL for production)")
    elif 'mysql' in db_url.lower():
        print("✅ MySQL database configured")
    else:
        print(f"✅ Database configured: {db_url.split('://')[0]}")
    
    # Email configuration
    print("\n📧 Email Configuration:")
    email_backend = settings.EMAIL_BACKEND
    if 'console' in email_backend:
        warnings.append("⚠️  Using console email backend (emails won't be sent)")
    elif 'smtp' in email_backend:
        print("✅ SMTP email backend configured")
        
        if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
            errors.append("❌ Email credentials not configured")
        else:
            print("✅ Email credentials configured")
    
    # CORS configuration
    print("\n🌐 CORS Configuration:")
    cors_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
    if 'http://localhost:3000' in cors_origins:
        warnings.append("⚠️  Localhost still in CORS origins (remove for production)")
    
    if not cors_origins:
        errors.append("❌ CORS_ALLOWED_ORIGINS not configured")
    else:
        print(f"✅ CORS origins: {', '.join(cors_origins)}")
    
    # Security settings
    print("\n🛡️  Security Configuration:")
    security_checks = [
        ('SECURE_SSL_REDIRECT', 'SSL redirect'),
        ('SECURE_HSTS_SECONDS', 'HSTS'),
        ('SESSION_COOKIE_SECURE', 'Secure session cookies'),
        ('CSRF_COOKIE_SECURE', 'Secure CSRF cookies'),
    ]
    
    for setting_name, description in security_checks:
        if hasattr(settings, setting_name) and getattr(settings, setting_name):
            print(f"✅ {description} enabled")
        else:
            warnings.append(f"⚠️  {description} not enabled")
    
    # Static files
    print("\n📁 Static Files Configuration:")
    if settings.STATIC_ROOT:
        print(f"✅ STATIC_ROOT: {settings.STATIC_ROOT}")
    else:
        errors.append("❌ STATIC_ROOT not configured")
    
    if settings.MEDIA_ROOT:
        print(f"✅ MEDIA_ROOT: {settings.MEDIA_ROOT}")
    else:
        warnings.append("⚠️  MEDIA_ROOT not configured")
    
    # Third-party services
    print("\n🔌 Third-party Services:")
    
    # Twilio
    twilio_sid = os.getenv('TWILIO_ACCOUNT_SID', '')
    if twilio_sid and twilio_sid != 'your-twilio-account-sid':
        print("✅ Twilio SMS configured")
    else:
        warnings.append("⚠️  Twilio SMS not configured")
    
    # Environment variables check
    print("\n🔧 Environment Variables:")
    required_vars = [
        'SECRET_KEY',
        'DATABASE_URL',
        'FRONTEND_URL',
        'CORS_ALLOWED_ORIGINS',
        'EMAIL_HOST_USER',
        'EMAIL_HOST_PASSWORD',
    ]
    
    for var in required_vars:
        value = os.getenv(var, '')
        if not value or 'your-' in value or 'change-this' in value:
            errors.append(f"❌ {var} not properly configured")
        else:
            print(f"✅ {var} configured")
    
    return errors, warnings

def check_database_connection():
    """Test database connection."""
    print("\n🔌 Testing database connection...")
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            if result:
                print("✅ Database connection successful")
                return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def check_static_files():
    """Check static files configuration."""
    print("\n📁 Checking static files...")
    static_root = Path(settings.STATIC_ROOT) if settings.STATIC_ROOT else None
    
    if static_root and static_root.exists():
        file_count = len(list(static_root.rglob('*')))
        print(f"✅ Static files collected: {file_count} files")
        return True
    else:
        print("⚠️  Static files not collected (run collectstatic)")
        return False

def main():
    """Main validation function."""
    print("🚀 Dominion Trust Capital - Production Environment Validator")
    print("=" * 60)
    
    # Validate environment
    errors, warnings = validate_environment()
    
    # Test database connection
    db_ok = check_database_connection()
    
    # Check static files
    static_ok = check_static_files()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 VALIDATION SUMMARY")
    print("=" * 60)
    
    if errors:
        print("❌ ERRORS FOUND:")
        for error in errors:
            print(f"   {error}")
    
    if warnings:
        print("\n⚠️  WARNINGS:")
        for warning in warnings:
            print(f"   {warning}")
    
    if not errors and not warnings:
        print("✅ ALL CHECKS PASSED!")
    
    # Final status
    print(f"\n🎯 DEPLOYMENT STATUS:")
    if errors:
        print("❌ NOT READY FOR DEPLOYMENT")
        print("   Please fix the errors above before deploying")
        sys.exit(1)
    elif warnings:
        print("⚠️  READY WITH WARNINGS")
        print("   Consider addressing warnings for optimal security")
    else:
        print("✅ READY FOR PRODUCTION DEPLOYMENT")
    
    print(f"\n📋 Next steps:")
    print("1. Fix any errors or warnings above")
    print("2. Run: ./deploy_pythonanywhere.sh")
    print("3. Follow deployment instructions")
    print("4. Test your production deployment")

if __name__ == '__main__':
    main()
