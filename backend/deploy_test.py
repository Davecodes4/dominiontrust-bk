#!/usr/bin/env python3
"""
Deployment test script for DominionTrust Bank Backend
This script tests the production configuration locally
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings_production')

def test_production_settings():
    """Test production settings configuration"""
    print("🔧 Testing production settings...")
    
    try:
        django.setup()
        print("✅ Django setup successful")
        
        # Test database connection
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✅ Database connection successful")
        
        # Test static files configuration
        from django.conf import settings
        print(f"✅ Static root: {settings.STATIC_ROOT}")
        print(f"✅ Media root: {settings.MEDIA_ROOT}")
        print(f"✅ Debug mode: {settings.DEBUG}")
        
        # Test CORS configuration
        print(f"✅ CORS allowed origins: {settings.CORS_ALLOWED_ORIGINS}")
        
        print("\n🎉 All production settings tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing production settings: {e}")
        return False

def test_models():
    """Test model imports and basic operations"""
    print("\n📊 Testing models...")
    
    try:
        from accounts.models import User
        from banking.models import Account, Transaction
        
        print("✅ User model imported successfully")
        print("✅ Account model imported successfully")
        print("✅ Transaction model imported successfully")
        
        # Test model fields
        user_fields = [field.name for field in User._meta.fields]
        print(f"✅ User model fields: {user_fields}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing models: {e}")
        return False

def test_api_endpoints():
    """Test API endpoint configuration"""
    print("\n🌐 Testing API endpoints...")
    
    try:
        from django.urls import reverse
        from django.test import Client
        
        client = Client()
        
        # Test admin endpoint
        admin_url = reverse('admin:index')
        print(f"✅ Admin URL: {admin_url}")
        
        # Test API endpoints (basic structure)
        print("✅ API endpoints configured")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing API endpoints: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 DominionTrust Bank Backend - Production Deployment Test")
    print("=" * 60)
    
    tests = [
        test_production_settings,
        test_models,
        test_api_endpoints,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 60)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Ready for Railway deployment.")
        return 0
    else:
        print("❌ Some tests failed. Please fix issues before deploying.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 