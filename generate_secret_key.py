#!/usr/bin/env python3
"""
Generate a secure SECRET_KEY for Django production deployment
"""
import secrets
import string

def generate_secret_key(length=50):
    """Generate a cryptographically secure secret key"""
    # Use letters, digits, and some special characters safe for environment variables
    characters = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
    secret_key = ''.join(secrets.choice(characters) for _ in range(length))
    return secret_key

if __name__ == '__main__':
    secret_key = generate_secret_key()
    print("=" * 60)
    print("SECURE SECRET_KEY GENERATED")
    print("=" * 60)
    print(f"SECRET_KEY={secret_key}")
    print()
    print("INSTRUCTIONS:")
    print("1. Copy the SECRET_KEY value above")
    print("2. Update your .env.production file")
    print("3. Never commit this key to version control")
    print("4. Use different keys for development and production")
    print("=" * 60)
