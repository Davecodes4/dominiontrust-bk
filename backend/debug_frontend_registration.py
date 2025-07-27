#!/usr/bin/env python
"""
Frontend Registration Debug Guide for DominionTrust Bank
Helps debug frontend 400 Bad Request errors
"""

import os
import sys
import django
import json
from datetime import datetime

# Add the project root to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dominion_bank.settings')
django.setup()

from django.conf import settings
from django.test import Client
from django.contrib.auth.models import User

def print_api_requirements():
    """Print the exact API requirements for frontend developers"""
    
    print("=" * 80)
    print("🏦 DOMINIONTRUST BANK - FRONTEND REGISTRATION GUIDE")
    print("=" * 80)
    
    print("📋 EXACT REQUEST FORMAT FOR FRONTEND:")
    print("-" * 80)
    
    print("🌐 ENDPOINT: POST /api/auth/register/")
    print("📦 CONTENT-TYPE: application/json")
    print("🔧 CORS: Enabled for localhost:3000, 3001, 3002")
    print()
    
    print("📄 REQUIRED JSON PAYLOAD:")
    print("-" * 40)
    
    correct_payload = {
        "username": "unique_username_here",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        
        # CRITICAL: These fields are REQUIRED
        "phone_number": "+1234567890",  # Must be unique
        "date_of_birth": "1990-01-01",  # YYYY-MM-DD format only
        "gender": "M",                  # M, F, or O (NOT male/female)
        "marital_status": "single",     # single, married, divorced, widowed
        "address": "123 Main Street",
        "city": "New York",
        "state": "NY", 
        "postal_code": "10001",
        
        # OPTIONAL: These have defaults
        "account_type": "savings",      # savings, checking, business
        "email_notifications": True,
        "sms_notifications": True,
        "statement_delivery": "email"   # email, postal, both
    }
    
    print(json.dumps(correct_payload, indent=2))
    
    print("\n🚨 COMMON FRONTEND MISTAKES:")
    print("-" * 40)
    print("❌ Using 'male'/'female' instead of 'M'/'F'/'O'")
    print("❌ Wrong date format (MM/DD/YYYY vs YYYY-MM-DD)")
    print("❌ Missing required fields (phone_number, address, etc.)")
    print("❌ Duplicate phone numbers/emails")
    print("❌ Password and password_confirm don't match")
    print("❌ User under 18 years old")
    print("❌ Invalid Content-Type header")
    print("❌ CSRF issues (should be disabled for API)")
    
    print("\n✅ SUCCESS RESPONSE (201):")
    print("-" * 40)
    success_response = {
        "message": "Registration successful! Please check your email to verify your account.",
        "email": "user@example.com",
        "verification_required": True,
        "next_step": "email_verification"
    }
    print(json.dumps(success_response, indent=2))
    
    print("\n❌ ERROR RESPONSE (400):")
    print("-" * 40)
    error_response = {
        "gender": ["\"male\" is not a valid choice."],
        "phone_number": ["This field is required."],
        "date_of_birth": ["Date has wrong format. Use one of these formats instead: YYYY-MM-DD."]
    }
    print(json.dumps(error_response, indent=2))

def test_common_frontend_mistakes():
    """Test common frontend mistakes"""
    
    print("\n" + "=" * 80)
    print("🧪 TESTING COMMON FRONTEND MISTAKES")
    print("=" * 80)
    
    client = Client()
    
    mistakes = [
        {
            "name": "Wrong Gender Format",
            "data": {
                "username": "mistake1",
                "email": "mistake1@example.com",
                "first_name": "Test",
                "last_name": "User",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
                "phone_number": "+1234567001",
                "date_of_birth": "1990-01-01",
                "gender": "male",  # ❌ Should be "M"
                "marital_status": "single",
                "address": "123 Main St",
                "city": "New York",
                "state": "NY",
                "postal_code": "10001"
            }
        },
        {
            "name": "Wrong Date Format", 
            "data": {
                "username": "mistake2",
                "email": "mistake2@example.com",
                "first_name": "Test",
                "last_name": "User",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
                "phone_number": "+1234567002",
                "date_of_birth": "01/01/1990",  # ❌ Should be "1990-01-01"
                "gender": "M",
                "marital_status": "single",
                "address": "123 Main St",
                "city": "New York",
                "state": "NY",
                "postal_code": "10001"
            }
        },
        {
            "name": "Missing Required Fields",
            "data": {
                "username": "mistake3",
                "email": "mistake3@example.com",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!"
                # ❌ Missing phone_number, date_of_birth, etc.
            }
        },
        {
            "name": "Password Mismatch",
            "data": {
                "username": "mistake4",
                "email": "mistake4@example.com",
                "first_name": "Test",
                "last_name": "User",
                "password": "SecurePass123!",
                "password_confirm": "DifferentPass456!",  # ❌ Doesn't match
                "phone_number": "+1234567004",
                "date_of_birth": "1990-01-01",
                "gender": "M",
                "marital_status": "single",
                "address": "123 Main St",
                "city": "New York",
                "state": "NY",
                "postal_code": "10001"
            }
        }
    ]
    
    for mistake in mistakes:
        print(f"\n🧪 Testing: {mistake['name']}")
        print("-" * 40)
        
        try:
            response = client.post(
                '/api/auth/register/',
                data=json.dumps(mistake['data']),
                content_type='application/json'
            )
            
            print(f"Status: {response.status_code}")
            
            if response.content:
                try:
                    response_data = json.loads(response.content.decode())
                    print(f"Errors: {json.dumps(response_data, indent=2)}")
                except:
                    print(f"Raw Response: {response.content.decode()}")
                    
        except Exception as e:
            print(f"Error: {str(e)}")

def generate_frontend_examples():
    """Generate frontend code examples"""
    
    print("\n" + "=" * 80)
    print("💻 FRONTEND CODE EXAMPLES")
    print("=" * 80)
    
    print("🟡 JAVASCRIPT/FETCH EXAMPLE:")
    print("-" * 40)
    
    js_example = '''
const registerUser = async (formData) => {
  try {
    const response = await fetch('http://localhost:8000/api/auth/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // CORS headers handled automatically
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        
        // CRITICAL: Use exact field names and formats
        phone_number: formData.phoneNumber,     // e.g., "+1234567890"
        date_of_birth: formData.dateOfBirth,   // e.g., "1990-01-01" 
        gender: formData.gender,               // "M", "F", or "O"
        marital_status: formData.maritalStatus, // "single", "married", etc.
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        
        // Optional fields
        account_type: "savings",
        email_notifications: true,
        sms_notifications: true,
        statement_delivery: "email"
      })
    });
    
    const data = await response.json();
    
    if (response.status === 201) {
      console.log('Registration successful:', data);
      // Redirect to email verification page
    } else if (response.status === 400) {
      console.log('Validation errors:', data);
      // Display field-specific errors to user
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
};
'''
    
    print(js_example)
    
    print("\n🟢 REACT FORM EXAMPLE:")
    print("-" * 40)
    
    react_example = '''
const [formData, setFormData] = useState({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  dateOfBirth: '',     // Use HTML date input for YYYY-MM-DD
  gender: 'M',         // Dropdown with M/F/O options
  maritalStatus: 'single',
  address: '',
  city: '',
  state: '',
  postalCode: ''
});

// Gender options for dropdown
const genderOptions = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' }
];

// Marital status options
const maritalOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' }
];

// Date input should use type="date" for proper format
<input
  type="date"
  value={formData.dateOfBirth}
  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
  required
/>
'''
    
    print(react_example)

def debug_current_request():
    """Help debug current 400 errors"""
    
    print("\n" + "=" * 80)
    print("🔍 DEBUGGING YOUR CURRENT 400 ERRORS")
    print("=" * 80)
    
    print("📊 WHAT TO CHECK IN YOUR FRONTEND:")
    print("-" * 40)
    print("1. 🔍 Open Browser Developer Tools (F12)")
    print("2. 📡 Go to Network tab")
    print("3. 🧪 Try registering a user")
    print("4. 🔍 Click on the failed /api/auth/register/ request")
    print("5. 📄 Check the 'Request' tab to see what data you're sending")
    print("6. 📄 Check the 'Response' tab to see the exact error")
    print()
    
    print("🚨 MOST LIKELY CAUSES:")
    print("-" * 40)
    print("• Gender field: Sending 'male' instead of 'M'")
    print("• Date format: Sending MM/DD/YYYY instead of YYYY-MM-DD")
    print("• Missing required fields: phone_number, address, etc.")
    print("• Wrong Content-Type: Not set to 'application/json'")
    print("• Duplicate phone/email: Already exists in database")
    print()
    
    print("🛠️ QUICK FIXES:")
    print("-" * 40)
    print("• Use <input type='date'> for date_of_birth")
    print("• Use dropdown with values M/F/O for gender")
    print("• Ensure all required fields are included")
    print("• Check for unique phone numbers and emails")
    print("• Verify password and password_confirm match")
    print()
    
    print("🧪 TEST WITH CURL COMMAND:")
    print("-" * 40)
    print("curl -X POST http://localhost:8000/api/auth/register/ \\")
    print("  -H 'Content-Type: application/json' \\")
    print("  -d '{")
    print('    "username": "testuser' + str(datetime.now().microsecond) + '",')
    print('    "email": "test' + str(datetime.now().microsecond) + '@example.com",')
    print('    "first_name": "Test",')
    print('    "last_name": "User",')
    print('    "password": "SecurePass123!",')
    print('    "password_confirm": "SecurePass123!",')
    print('    "phone_number": "+123456' + str(datetime.now().microsecond)[-4:] + '",')
    print('    "date_of_birth": "1990-01-01",')
    print('    "gender": "M",')
    print('    "marital_status": "single",')
    print('    "address": "123 Main St",')
    print('    "city": "New York",')
    print('    "state": "NY",')
    print('    "postal_code": "10001"')
    print("  }'")

def main():
    """Main debug function"""
    
    # Print API requirements
    print_api_requirements()
    
    # Test common mistakes
    test_common_frontend_mistakes()
    
    # Generate frontend examples
    generate_frontend_examples()
    
    # Debug current issues
    debug_current_request()
    
    print("\n" + "=" * 80)
    print("🎯 FRONTEND DEBUG GUIDE COMPLETED")
    print("=" * 80)
    print("\n💡 NEXT STEPS:")
    print("1. Check your frontend request format using browser dev tools")
    print("2. Compare with the examples above")  
    print("3. Test with the provided curl command")
    print("4. Fix the most likely issues: gender format and date format")

if __name__ == "__main__":
    main()
