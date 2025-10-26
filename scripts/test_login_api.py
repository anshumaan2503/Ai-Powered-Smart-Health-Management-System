#!/usr/bin/env python3
"""
Test login API endpoint
"""

import requests
import json

def test_login():
    """Test the login API"""
    
    url = "http://localhost:5000/api/hospital-auth/login"
    
    credentials = {
        "email": "admin@cityhospital.com",
        "password": "admin123"
    }
    
    print("🔍 Testing Login API")
    print("=" * 30)
    print(f"URL: {url}")
    print(f"Email: {credentials['email']}")
    print(f"Password: {credentials['password']}")
    
    try:
        response = requests.post(url, json=credentials)
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login Successful!")
            print(f"Access Token: {data.get('access_token', 'Not found')[:50]}...")
            print(f"User: {data.get('user', {}).get('first_name', 'Unknown')} {data.get('user', {}).get('last_name', '')}")
            print(f"Hospital: {data.get('hospital', {}).get('name', 'Unknown')}")
        else:
            print("❌ Login Failed!")
            try:
                error_data = response.json()
                print(f"Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"Response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Backend server not running on port 5000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_login()