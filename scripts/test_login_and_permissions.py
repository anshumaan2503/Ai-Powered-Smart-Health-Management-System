#!/usr/bin/env python3
"""
Test login and permissions
"""

import requests
import json

def test_login_and_permissions():
    """Test login and then test a protected endpoint"""
    
    base_url = "http://localhost:5000"
    
    # Step 1: Test Login
    print("🔐 Step 1: Testing Login")
    print("=" * 30)
    
    login_url = f"{base_url}/api/hospital-auth/login"
    credentials = {
        "email": "city@hospital.com",
        "password": "Cityhospital123"
    }
    
    try:
        login_response = requests.post(login_url, json=credentials)
        print(f"Login Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            print("✅ Login Successful!")
            
            access_token = login_data.get('access_token')
            user_data = login_data.get('user', {})
            hospital_data = login_data.get('hospital', {})
            
            print(f"User: {user_data.get('first_name')} {user_data.get('last_name')}")
            print(f"Email: {user_data.get('email')}")
            print(f"Role: {user_data.get('role')}")
            print(f"Hospital: {hospital_data.get('name')}")
            print(f"Token: {access_token[:50]}..." if access_token else "No token")
            
            if access_token:
                # Step 2: Test Protected Endpoints
                print(f"\n🛡️ Step 2: Testing Protected Endpoints")
                print("=" * 40)
                
                headers = {
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json'
                }
                
                # Test different endpoints
                test_endpoints = [
                    ('/api/hospital/staff', 'Staff Management'),
                    ('/api/hospital/patients?per_page=1', 'Patients'),
                    ('/api/hospital/appointments?per_page=1', 'Appointments'),
                    ('/api/hospital/analytics/overview', 'Analytics')
                ]
                
                for endpoint, name in test_endpoints:
                    try:
                        response = requests.get(f"{base_url}{endpoint}", headers=headers)
                        print(f"\n📡 {name}: {endpoint}")
                        print(f"   Status: {response.status_code}")
                        
                        if response.status_code == 200:
                            print("   ✅ Success!")
                        elif response.status_code == 403:
                            print("   ❌ Permission Denied!")
                            try:
                                error_data = response.json()
                                print(f"   Error: {error_data.get('error')}")
                            except:
                                pass
                        else:
                            print(f"   ⚠️ Other Error: {response.status_code}")
                            try:
                                error_data = response.json()
                                print(f"   Error: {error_data.get('error')}")
                            except:
                                print(f"   Response: {response.text[:100]}")
                                
                    except Exception as e:
                        print(f"   💥 Exception: {e}")
            
        else:
            print("❌ Login Failed!")
            try:
                error_data = login_response.json()
                print(f"Error: {error_data.get('error')}")
            except:
                print(f"Response: {login_response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Backend server not running on port 5000")
        print("💡 Make sure to run: python app.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_login_and_permissions()