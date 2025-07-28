#!/usr/bin/env python
"""
Detailed SMTP Connection Test for DominionTrust Bank
Tests the SMTP connection step by step to identify issues
"""

import os
import sys
import smtplib
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import ssl

# Add Django setup
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
import django
django.setup()

from django.conf import settings

def test_smtp_connection():
    """Test SMTP connection step by step"""
    
    print("=" * 80)
    print("🔍 DETAILED SMTP CONNECTION TEST")
    print("=" * 80)
    
    # Get settings
    host = getattr(settings, 'EMAIL_HOST', 'Not set')
    port = getattr(settings, 'EMAIL_PORT', 'Not set')
    use_tls = getattr(settings, 'EMAIL_USE_TLS', False)
    use_ssl = getattr(settings, 'EMAIL_USE_SSL', False)
    username = getattr(settings, 'EMAIL_HOST_USER', 'Not set')
    password = getattr(settings, 'EMAIL_HOST_PASSWORD', 'Not set')
    
    print(f"📧 SMTP Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🔐 Use TLS: {use_tls}")
    print(f"🔒 Use SSL: {use_ssl}")
    print(f"👤 Username: {username}")
    print(f"🔑 Password: {'*' * len(str(password)) if password != 'Not set' else 'Not set'}")
    print("-" * 80)
    
    # Step 1: Test DNS resolution
    print("🔍 Step 1: Testing DNS resolution...")
    try:
        ip = socket.gethostbyname(host)
        print(f"✅ DNS resolved: {host} -> {ip}")
    except socket.gaierror as e:
        print(f"❌ DNS resolution failed: {e}")
        return False
    
    # Step 2: Test basic connectivity
    print("\n🔍 Step 2: Testing basic connectivity...")
    try:
        sock = socket.create_connection((host, port), timeout=10)
        sock.close()
        print(f"✅ Can connect to {host}:{port}")
    except (socket.timeout, socket.error) as e:
        print(f"❌ Connection failed: {e}")
        print(f"💡 This could mean:")
        print(f"   • The SMTP server is down")
        print(f"   • Port {port} is blocked by firewall")
        print(f"   • Incorrect host/port configuration")
        return False
    
    # Step 3: Test SMTP connection
    print("\n🔍 Step 3: Testing SMTP protocol...")
    try:
        if use_ssl:
            # SSL connection
            context = ssl.create_default_context()
            server = smtplib.SMTP_SSL(host, port, context=context, timeout=10)
            print(f"✅ SSL connection established")
        else:
            # Regular connection
            server = smtplib.SMTP(host, port, timeout=10)
            print(f"✅ SMTP connection established")
            
            if use_tls:
                # Start TLS
                context = ssl.create_default_context()
                server.starttls(context=context)
                print(f"✅ TLS enabled")
        
        # Test EHLO
        response = server.ehlo()
        print(f"✅ EHLO response: {response[0]} - {response[1].decode()[:100]}...")
        
    except smtplib.SMTPException as e:
        print(f"❌ SMTP error: {e}")
        return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False
    
    # Step 4: Test authentication
    print("\n🔍 Step 4: Testing authentication...")
    try:
        if username and password and username != 'Not set' and password != 'Not set':
            server.login(username, password)
            print(f"✅ Authentication successful")
        else:
            print(f"⚠️  No credentials provided - skipping auth test")
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ Authentication failed: {e}")
        print(f"💡 Check your username and password")
        server.quit()
        return False
    except Exception as e:
        print(f"❌ Auth error: {e}")
        server.quit()
        return False
    
    # Step 5: Test sending a simple email
    print("\n🔍 Step 5: Testing email sending...")
    try:
        # Create test message
        msg = MIMEMultipart()
        msg['From'] = username
        msg['To'] = username  # Send to self for testing
        msg['Subject'] = "SMTP Test - DominionTrust Bank"
        
        body = """
This is a test email from DominionTrust Bank SMTP configuration.

If you receive this email, your SMTP setup is working correctly!

Test Details:
- Host: {host}
- Port: {port}
- TLS: {use_tls}
- Time: {time}
        """.format(
            host=host,
            port=port,
            use_tls=use_tls,
            time=django.utils.timezone.now() if hasattr(django.utils, 'timezone') else 'Unknown'
        )
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        text = msg.as_string()
        server.sendmail(username, username, text)
        print(f"✅ Test email sent successfully to {username}")
        
    except Exception as e:
        print(f"❌ Failed to send test email: {e}")
        server.quit()
        return False
    
    # Clean up
    server.quit()
    print(f"✅ Connection closed successfully")
    
    print("\n" + "=" * 80)
    print("🎉 SMTP TEST COMPLETED SUCCESSFULLY!")
    print("Your SMTP configuration is working correctly.")
    print("=" * 80)
    
    return True

def test_alternative_ports():
    """Test alternative SMTP ports"""
    
    print("\n" + "=" * 80)
    print("🔍 TESTING ALTERNATIVE SMTP PORTS")
    print("=" * 80)
    
    host = getattr(settings, 'EMAIL_HOST', 'mail.spacemail.com')
    
    # Common SMTP ports
    ports_to_test = [
        (25, "Standard SMTP", False),
        (465, "SMTP over SSL", True),
        (587, "SMTP with STARTTLS", False),
        (2525, "Alternative SMTP", False),
    ]
    
    for port, description, use_ssl in ports_to_test:
        print(f"\n🧪 Testing {description} (Port {port})...")
        try:
            if use_ssl:
                context = ssl.create_default_context()
                server = smtplib.SMTP_SSL(host, port, context=context, timeout=5)
            else:
                server = smtplib.SMTP(host, port, timeout=5)
                if port == 587:  # Try STARTTLS on 587
                    try:
                        context = ssl.create_default_context()
                        server.starttls(context=context)
                        print(f"   ✅ STARTTLS successful on port {port}")
                    except:
                        print(f"   ⚠️  STARTTLS failed on port {port}")
            
            response = server.ehlo()
            print(f"   ✅ Port {port} is accessible ({description})")
            server.quit()
            
        except Exception as e:
            print(f"   ❌ Port {port} failed: {e}")

def main():
    """Main test function"""
    
    print("🏦 DominionTrust Bank - SMTP Diagnostic Tool")
    print("This tool will help diagnose SMTP connection issues.\n")
    
    # Test current configuration
    success = test_smtp_connection()
    
    if not success:
        print("\n💡 TROUBLESHOOTING SUGGESTIONS:")
        print("1. Verify your email provider's SMTP settings")
        print("2. Check if your hosting provider blocks SMTP ports")
        print("3. Try alternative ports (we'll test them now)")
        print("4. Contact your email provider for support")
        
        # Test alternative ports
        test_alternative_ports()
        
        print("\n📧 COMMON SMTP PROVIDERS:")
        print("Gmail: smtp.gmail.com:587 (TLS) or :465 (SSL)")
        print("Outlook: smtp-mail.outlook.com:587")
        print("SendGrid: smtp.sendgrid.net:587")
        print("Yahoo: smtp.mail.yahoo.com:587")

if __name__ == "__main__":
    main()
