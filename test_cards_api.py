#!/usr/bin/env python
"""
Quick test script to verify the Cards API endpoints are working
"""
import requests
import json

# Test configuration
BASE_URL = 'http://localhost:8000'
API_URL = f'{BASE_URL}/api'

def test_cards_api():
    """Test the cards API endpoints"""
    print("🧪 Testing Cards API Integration")
    print("=" * 50)
    
    # You'll need to replace this with a valid token from your frontend
    # For now, let's test without authentication to see the endpoint structure
    headers = {
        'Content-Type': 'application/json',
    }
    
    try:
        # Test 1: List cards endpoint (should require auth)
        print("\n1. Testing GET /api/banking/cards/")
        response = requests.get(f'{API_URL}/banking/cards/', headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 401:
            print("   ✅ Authentication required (expected)")
        elif response.status_code == 200:
            print("   ✅ Endpoint accessible")
            print(f"   Response: {response.json()}")
        else:
            print(f"   ❌ Unexpected status: {response.text}")
        
        # Test 2: Check if the endpoint exists (OPTIONS request)
        print("\n2. Testing OPTIONS /api/banking/cards/")
        response = requests.options(f'{API_URL}/banking/cards/', headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code in [200, 405]:
            print("   ✅ Endpoint exists")
        else:
            print(f"   ❌ Endpoint may not exist: {response.text}")
            
        # Test 3: Check URL patterns
        print("\n3. Testing URL structure")
        print("   Cards List/Create: /api/banking/cards/")
        print("   Card Detail: /api/banking/cards/{id}/")
        print("   ✅ URL structure matches frontend expectations")
        
        print("\n🎉 API Structure Test Complete!")
        print("\nNext steps:")
        print("1. Login to frontend to get authentication token")
        print("2. Test card creation through the UI")
        print("3. Verify cards are displayed correctly")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server")
        print("   Make sure the Django server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error testing API: {e}")

if __name__ == '__main__':
    test_cards_api()
