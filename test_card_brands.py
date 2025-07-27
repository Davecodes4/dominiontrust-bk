#!/usr/bin/env python
"""
Quick test to verify card creation with different brands
"""
import requests
import json

# Test configuration
BASE_URL = 'http://localhost:8000'
API_URL = f'{BASE_URL}/api'

def test_card_creation():
    """Test creating cards with different brands"""
    print("🧪 Testing Card Brand Creation")
    print("=" * 40)
    
    # You'll need to replace this with a valid token from your frontend
    # Get this from localStorage.getItem('token') in browser console
    token = "YOUR_AUTH_TOKEN_HERE"  # Replace with actual token
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Token {token}'
    }
    
    test_cards = [
        {
            'card_type': 'debit',
            'card_brand': 'visa',
            'card_name': 'Test Visa Card',
            'daily_limit': 5000
        },
        {
            'card_type': 'credit',
            'card_brand': 'mastercard',
            'card_name': 'Test Mastercard',
            'daily_limit': 10000
        },
        {
            'card_type': 'prepaid',
            'card_brand': 'verve',
            'card_name': 'Test Verve Card',
            'daily_limit': 2000
        }
    ]
    
    for i, card_data in enumerate(test_cards, 1):
        print(f"\n{i}. Testing {card_data['card_brand'].upper()} {card_data['card_type']} card:")
        print(f"   Data: {json.dumps(card_data, indent=2)}")
        
        if token == "YOUR_AUTH_TOKEN_HERE":
            print("   ⚠️  Please replace 'YOUR_AUTH_TOKEN_HERE' with actual token")
            print("   💡 Get token from: localStorage.getItem('token') in browser console")
            continue
            
        try:
            response = requests.post(
                f'{API_URL}/banking/cards/',
                headers=headers,
                json=card_data
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 201:
                result = response.json()
                created_card = result.get('card', {})
                print(f"   ✅ Success! Created {created_card.get('card_brand', 'unknown')} card")
                print(f"   Card ID: {created_card.get('id', 'N/A')}")
                print(f"   Brand: {created_card.get('card_brand_display', 'N/A')}")
                print(f"   Type: {created_card.get('card_type_display', 'N/A')}")
            else:
                print(f"   ❌ Failed: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n🎯 Test Instructions:")
    print("1. Login to your frontend")
    print("2. Open browser console (F12)")
    print("3. Run: localStorage.getItem('token')")
    print("4. Copy the token and replace 'YOUR_AUTH_TOKEN_HERE' in this script")
    print("5. Run this script again to test card creation")

if __name__ == '__main__':
    test_card_creation()
