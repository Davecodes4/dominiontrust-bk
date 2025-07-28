#!/usr/bin/env python3
"""
Environment Setup Script for DominionTrust Bank
===============================================

This script helps you set up your environment variables for the Django backend.
"""

import os
import shutil
from pathlib import Path
from django.core.management.utils import get_random_secret_key

def main():
    """Main setup function"""
    print("🔧 DominionTrust Bank - Environment Setup")
    print("=" * 50)
    
    # Get the backend directory
    backend_dir = Path(__file__).parent
    env_file = backend_dir / '.env'
    example_file = backend_dir / 'env.example'
    
    # Check if .env already exists
    if env_file.exists():
        print("⚠️  .env file already exists!")
        response = input("Do you want to overwrite it? (y/N): ")
        if response.lower() != 'y':
            print("❌ Setup cancelled.")
            return
    
    # Check if example file exists
    if not example_file.exists():
        print("❌ env.example file not found!")
        print("Please make sure you're running this from the backend directory.")
        return
    
    # Copy example file to .env
    print("📋 Copying env.example to .env...")
    shutil.copy(example_file, env_file)
    
    # Generate a new secret key
    print("🔑 Generating a new SECRET_KEY...")
    secret_key = get_random_secret_key()
    
    # Read the .env file
    with open(env_file, 'r') as f:
        content = f.read()
    
    # Replace the secret key
    content = content.replace(
        'SECRET_KEY=your-secret-key-here-change-this-in-production',
        f'SECRET_KEY={secret_key}'
    )
    
    # Write back to .env
    with open(env_file, 'w') as f:
        f.write(content)
    
    print("✅ Environment file created successfully!")
    print()
    print("📝 Next steps:")
    print("1. Edit the .env file with your specific values:")
    print("   - Twilio credentials (if you want SMS)")
    print("   - Email settings (if you want production email)")
    print("   - Database URL (if you want to use PostgreSQL/MySQL)")
    print()
    print("2. To edit the file:")
    print("   nano .env")
    print("   # or")
    print("   code .env")
    print()
    print("3. Test your configuration:")
    print("   python manage.py runserver")
    print()
    print("🎉 Setup complete! Your Django backend is ready to use.")
    
    # Set file permissions (Unix-like systems)
    try:
        os.chmod(env_file, 0o600)
        print("🔒 Set secure file permissions (600) for .env file.")
    except:
        print("⚠️  Could not set file permissions. Please run 'chmod 600 .env' manually.")


if __name__ == '__main__':
    main() 
 