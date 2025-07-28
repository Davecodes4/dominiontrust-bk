#!/usr/bin/env python
"""
SMTP Diagnostic Script for DominionTrust Bank
Tests SMTP connectivity and configuration
"""

import smtplib
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def test_smtp_connection():
    """Test basic SMTP connectivity"""
    
    print("=" * 80)
    print("🔍 SMTP DIAGNOSTIC TEST")
    print("=" * 80)
    
    # Current configuration
    smtp_host = "mail.spacemail.com"
    smtp_port = 465
    username = "dominiontrustcapital@dominiontrustcapital.com"
    password = "Dominion1414@"
    
    print(f"📧 Testing SMTP Server: {smtp_host}:{smtp_port}")
    print(f"👤 Username: {username}")
    print("-" * 80)
    
    # Test 1: Check if server is reachable
    print("🔍 Test 1: Server Connectivity")
    try:
        sock = socket.create_connection((smtp_host, smtp_port), timeout=10)
        sock.close()
        print("✅ Server is reachable")
    except Exception as e:
        print(f"❌ Server unreachable: {e}")
        print("💡 This suggests the SMTP server or port is incorrect")
        return False
    
    # Test 2: Try SSL connection (port 465)
    print("\n🔍 Test 2: SSL Connection (Port 465)")
    try:
        server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10)
        server.ehlo()
        print("✅ SSL connection successful")
        
        # Test authentication
        print("\n🔍 Test 3: Authentication")
        try:
            server.login(username, password)
            print("✅ Authentication successful")
            server.quit()
            return True
        except Exception as e:
            print(f"❌ Authentication failed: {e}")
            server.quit()
            return False
            
    except Exception as e:
        print(f"❌ SSL connection failed: {e}")
    
    # Test 3: Try TLS connection (port 587)
    print("\n🔍 Test 4: TLS Connection (Port 587)")
    try:
        server = smtplib.SMTP(smtp_host, 587, timeout=10)
        server.ehlo()
        server.starttls()
        server.ehlo()
        print("✅ TLS connection successful")
        
        # Test authentication
        try:
            server.login(username, password)
            print("✅ Authentication successful")
            server.quit()
            return True
        except Exception as e:
            print(f"❌ Authentication failed: {e}")
            server.quit()
            return False
            
    except Exception as e:
        print(f"❌ TLS connection failed: {e}")
    
    return False

def test_alternative_configs():
    """Test common SMTP configurations"""
    
    print("\n" + "=" * 80)
    print("🔧 TESTING ALTERNATIVE CONFIGURATIONS")
    print("=" * 80)
    
    configs = [
        {
            "name": "SpaceMail SSL (465)",
            "host": "mail.spacemail.com",
            "port": 465,
            "use_ssl": True,
            "use_tls": False
        },
        {
            "name": "SpaceMail TLS (587)",
            "host": "mail.spacemail.com",
            "port": 587,
            "use_ssl": False,
            "use_tls": True
        },
        {
            "name": "SpaceMail Alternative (25)",
            "host": "mail.spacemail.com",
            "port": 25,
            "use_ssl": False,
            "use_tls": True
        },
        {
            "name": "Alternative Host (smtp.spacemail.com)",
            "host": "smtp.spacemail.com",
            "port": 587,
            "use_ssl": False,
            "use_tls": True
        }
    ]
    
    username = "dominiontrustcapital@dominiontrustcapital.com"
    password = "Dominion1414@"
    
    for config in configs:
        print(f"\n🧪 Testing: {config['name']}")
        print(f"   Host: {config['host']}:{config['port']}")
        print(f"   SSL: {config['use_ssl']}, TLS: {config['use_tls']}")
        
        try:
            if config['use_ssl']:
                server = smtplib.SMTP_SSL(config['host'], config['port'], timeout=10)
            else:
                server = smtplib.SMTP(config['host'], config['port'], timeout=10)
                server.ehlo()
                if config['use_tls']:
                    server.starttls()
                    server.ehlo()
            
            # Test authentication
            server.login(username, password)
            print("   ✅ SUCCESS - This configuration works!")
            server.quit()
            
            print(f"\n🎯 WORKING CONFIGURATION FOUND:")
            print(f"   EMAIL_HOST={config['host']}")
            print(f"   EMAIL_PORT={config['port']}")
            if config['use_ssl']:
                print(f"   EMAIL_USE_SSL=True")
                print(f"   EMAIL_USE_TLS=False")
            else:
                print(f"   EMAIL_USE_SSL=False")
                print(f"   EMAIL_USE_TLS={config['use_tls']}")
            
            return config
            
        except Exception as e:
            print(f"   ❌ Failed: {e}")
    
    return None

def send_test_email_to_andrew():
    """Send a test email to andrewmeyers838@gmail.com if SMTP works"""
    
    print("\n" + "=" * 80)
    print("📧 SENDING TEST EMAIL TO ANDREW")
    print("=" * 80)
    
    # Use working config if found
    smtp_host = "mail.spacemail.com"
    smtp_port = 465
    username = "dominiontrustcapital@dominiontrustcapital.com"
    password = "Dominion1414@"
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"DominionTrust Bank <{username}>"
        msg['To'] = "andrewmeyers838@gmail.com"
        msg['Subject'] = "🏦 DominionTrust Bank - SMTP Test Email"
        
        body = """
Hello Andrew!

This is a test email from DominionTrust Bank to verify that our SMTP configuration is working correctly.

✅ If you receive this email, it means:
- SMTP server connection is successful
- Authentication is working
- Email delivery is functional

🔧 Technical Details:
- SMTP Server: mail.spacemail.com
- From: dominiontrustcapital@dominiontrustcapital.com
- Test Time: Current timestamp

Best regards,
DominionTrust Bank Technical Team

---
This is an automated test email. Please do not reply.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10)
        server.login(username, password)
        server.send_message(msg)
        server.quit()
        
        print("✅ Test email sent successfully to andrewmeyers838@gmail.com")
        print("📬 Check Andrew's inbox for the test email")
        
    except Exception as e:
        print(f"❌ Failed to send test email: {e}")

def main():
    """Main diagnostic function"""
    
    # Test current configuration
    if test_smtp_connection():
        print("\n🎉 Current SMTP configuration is working!")
        send_test_email_to_andrew()
    else:
        print("\n🔧 Current configuration failed. Testing alternatives...")
        working_config = test_alternative_configs()
        
        if working_config:
            print("\n💡 Update your .env file with the working configuration above")
        else:
            print("\n❌ No working configuration found")
            print("\n🛠️  RECOMMENDATIONS:")
            print("1. Contact your hosting provider (spacemail.com) for correct SMTP settings")
            print("2. Verify your email credentials are correct")
            print("3. Check if your hosting provider requires different authentication")
            print("4. Try using Gmail SMTP as an alternative for testing")
            
            print("\n📧 Gmail SMTP Alternative:")
            print("   EMAIL_HOST=smtp.gmail.com")
            print("   EMAIL_PORT=587")
            print("   EMAIL_USE_TLS=True")
            print("   EMAIL_HOST_USER=andrewmeyers838@gmail.com")
            print("   EMAIL_HOST_PASSWORD=your-gmail-app-password")

if __name__ == "__main__":
    main()
