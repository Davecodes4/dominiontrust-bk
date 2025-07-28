"""
Production settings for Dominion Trust Capital
PythonAnywhere deployment configuration
"""

from .settings import *
import os
from dotenv import load_dotenv

# Load production environment variables
load_dotenv(BASE_DIR / '.env.production')

# Override settings for production
DEBUG = False

# Secret key from environment
SECRET_KEY = os.getenv('SECRET_KEY')

# Production security settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Session and CSRF security
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = [
    'https://dominiontrustcapital.com',
    'https://api.dominiontrustcapital.com',
    'https://dominiontrustcapital.pythonanywhere.com',
]

# Production logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {asctime} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django_errors.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'WARNING',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'error_file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'accounts': {
            'handlers': ['file', 'error_file'],
            'level': 'INFO',
            'propagate': True,
        },
        'banking': {
            'handlers': ['file', 'error_file'],
            'level': 'INFO',
            'propagate': True,
        },
        'notifications': {
            'handlers': ['file', 'error_file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# Database connection pooling for production
if 'mysql' in os.getenv('DATABASE_URL', ''):
    DATABASES['default']['OPTIONS'] = {
        'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        'charset': 'utf8mb4',
    }
    DATABASES['default']['CONN_MAX_AGE'] = 60

# Email configuration validation
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
if not EMAIL_HOST_USER or not EMAIL_HOST_PASSWORD:
    print("WARNING: Email credentials not configured for production")

# Cache configuration for production
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
        'TIMEOUT': 300,
        'OPTIONS': {
            'MAX_ENTRIES': 1000
        }
    }
}

# Static files configuration for PythonAnywhere
STATIC_ROOT = os.getenv('STATIC_ROOT', BASE_DIR / 'staticfiles')
MEDIA_ROOT = os.getenv('MEDIA_ROOT', BASE_DIR / 'media')

# Ensure log directory exists
os.makedirs(BASE_DIR / 'logs', exist_ok=True)
