"""
WSGI config for Dominion Trust Capital production deployment on PythonAnywhere.

This module contains the WSGI application used by Django's development server
and any production WSGI deployments. It should expose a module-level variable
named ``application``. Django's ``runserver`` and ``runfcgi`` commands discover
this application via the ``WSGI_APPLICATION`` setting.

Usually you will have the standard Django WSGI application here, but it also
might make sense to replace the whole Django WSGI application with a custom one
that later delegates to the Django one. For example, you could introduce WSGI
middleware here, or combine a Django application with an application of another
framework.

For PythonAnywhere deployment, make sure to:
1. Set the correct path to your project
2. Activate your virtual environment
3. Set the correct settings module
"""

import os
import sys

# Add your project directory to sys.path
path = '/home/yourusername/dominiontrustcapital'  # Replace 'yourusername' with your PythonAnywhere username
if path not in sys.path:
    sys.path.insert(0, path)

# Set environment variables
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings_production')

# Activate virtual environment (PythonAnywhere specific)
activate_this = '/home/yourusername/.virtualenvs/dominiontrustcapital/bin/activate_this.py'  # Replace username
try:
    with open(activate_this) as f:
        code = compile(f.read(), activate_this, 'exec')
        exec(code)
except FileNotFoundError:
    # If virtual environment activation file doesn't exist, continue without it
    # PythonAnywhere will handle the virtual environment
    pass

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
