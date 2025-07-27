#!/usr/bin/env python
"""
Production Django management utility for Dominion Trust Capital
Use this script for production database operations and management tasks
"""
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
    
    # Add production-specific management commands if needed
    execute_from_command_line(sys.argv)
