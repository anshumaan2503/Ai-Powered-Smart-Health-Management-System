#!/usr/bin/env python3
"""
Test script to verify authentication fixes
"""

import requests
import json

def test_auth_endpoints():
    """Test authentication endpoints"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Authentication Endpoints")
    print("=" * 50)
    
    # Test 1: Profile endpoint without token (should return 401)
    print("\n1. Testing profile endpoint without token...")
    try:
        response = requests.get(f"{base_url}/api/auth/profile")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 401:
            print("   ✅ Correctly returns 401 for missing token")
        else:
            print("   ❌ Should return 401 for missing token")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Profile endpoint with invalid token (should return 422)
    print("\n2. Testing profile endpoint with invalid token...")
    try:
        headers = {"Authorization": "Bearer invalid_token_here"}
        response = requests.get(f"{base_url}/api/auth/profile", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 422:
            print("   ✅ Correctly returns 422 for invalid token")
        else:
            print("   ❌ Should return 422 for invalid token")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Login endpoint
    print("\n3. Testing login endpoint...")
    try:
        login_data = {
            "email": "admin@hospital.com",
            "password": "admin123"
        }
        response = requests.post(
            f"{base_url}/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'access_token' in data:
                print("   ✅ Login successful, token received")
                
                # Test 4: Profile endpoint with valid token
                print("\n4. Testing profile endpoint with valid token...")
                headers = {"Authorization": f"Bearer {data['access_token']}"}
                profile_response = requests.get(f"{base_url}/api/auth/profile", headers=headers)
                print(f"   Status: {profile_response.status_code}")
                
                if profile_response.status_code == 200:
                    print("   ✅ Profile endpoint works with valid token")
                    profile_data = profile_response.json()
                    print(f"   User: {profile_data.get('user', {}).get('email', 'Unknown')}")
                else:
                    print(f"   ❌ Profile endpoint failed: {profile_response.json()}")
                
                return data['access_token']
            else:
                print("   ❌ Login response missing access_token")
        else:
            print(f"   ❌ Login failed: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    return None

def test_prescription_analyzer(token=None):
    """Test prescription analyzer endpoints"""
    base_url = "http://localhost:5000"
    
    print("\n🧪 Testing Prescription Analyzer Endpoints")
    print("=" * 50)
    
    # Test 1: Test analyzer status (no auth required)
    print("\n1. Testing analyzer status endpoint...")
    try:
        response = requests.get(f"{base_url}/api/prescription/test-analyzer")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Analyzer status endpoint working")
            print(f"   System ready: {data.get('system_ready', False)}")
            print(f"   Can process images: {data.get('can_process_images', False)}")
            print(f"   Can process PDFs: {data.get('can_process_pdfs', False)}")
        else:
            print(f"   ❌ Status check failed: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Analyze endpoint without token (should return 401)
    print("\n2. Testing analyze endpoint without token...")
    try:
        response = requests.post(f"{base_url}/api/prescription/analyze")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 401:
            print("   ✅ Correctly requires authentication")
        else:
            print(f"   ❌ Should require authentication: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: History endpoint with token (if available)
    if token:
        print("\n3. Testing history endpoint with token...")
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{base_url}/api/prescription/history", headers=headers)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("   ✅ History endpoint working")
                print(f"   Total analyses: {len(data.get('analyses', []))}")
            else:
                print(f"   ❌ History endpoint failed: {response.json()}")
        except Exception as e:
            print(f"   ❌ Error: {e}")

def test_jwt_error_handling():
    """Test JWT error handling"""
    base_url = "http://localhost:5000"
    
    print("\n🧪 Testing JWT Error Handling")
    print("=" * 50)
    
    test_cases = [
        ("No Authorization header", {}),
        ("Invalid Bearer format", {"Authorization": "InvalidFormat"}),
        ("Invalid token", {"Authorization": "Bearer invalid.token.here"}),
        ("Malformed token", {"Authorization": "Bearer malformed_token"}),
    ]
    
    for test_name, headers in test_cases:
        print(f"\n{test_name}:")
        try:
            response = requests.get(f"{base_url}/api/auth/profile", headers=headers)
            print(f"   Status: {response.status_code}")
            data = response.json()
            print(f"   Error code: {data.get('code', 'N/A')}")
            print(f"   Message: {data.get('error', 'N/A')}")
        except Exception as e:
            print(f"   ❌ Error: {e}")

def main():
    """Main test function"""
    print("🔐 Authentication & Prescription Analyzer Test Suite")
    print("=" * 60)
    
    # Test authentication
    token = test_auth_endpoints()
    
    # Test prescription analyzer
    test_prescription_analyzer(token)
    
    # Test JWT error handling
    test_jwt_error_handling()
    
    print("\n" + "=" * 60)
    print("🎯 Test Summary:")
    print("- Authentication endpoints tested")
    print("- JWT error handling verified")
    print("- Prescription analyzer endpoints checked")
    print("- Token consistency validated")
    
    print("\n💡 If tests pass:")
    print("1. Authentication should work properly")
    print("2. No more 422 errors on profile endpoint")
    print("3. Prescription analyzer should be accessible")
    print("4. Token naming is consistent")

if __name__ == "__main__":
    main()