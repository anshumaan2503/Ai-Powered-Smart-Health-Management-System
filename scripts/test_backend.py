#!/usr/bin/env python3
"""
Backend Testing Script
Test if all the backend routes and functionality are working
"""

import requests
import json
import sys

# Configuration
API_BASE_URL = "http://localhost:5000/api"
TEST_EMAIL = "admin@test.com"
TEST_PASSWORD = "admin123"

def test_login():
    """Test login functionality"""
    try:
        print("🔐 Testing login...")
        response = requests.post(f"{API_BASE_URL}/hospital-auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful")
            return data.get('access_token')
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_doctors_endpoint(token):
    """Test doctors endpoint"""
    try:
        print("👨‍⚕️ Testing doctors endpoint...")
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE_URL}/hospital/staff?role=doctor", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Doctors endpoint working - Found {len(data.get('staff', []))} doctors")
            return True
        else:
            print(f"❌ Doctors endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Doctors endpoint error: {e}")
        return False

def test_patients_endpoint(token):
    """Test patients endpoint"""
    try:
        print("👥 Testing patients endpoint...")
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE_URL}/patients/", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Patients endpoint working - Found {len(data.get('patients', []))} patients")
            return True
        else:
            print(f"❌ Patients endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Patients endpoint error: {e}")
        return False

def test_add_doctor(token):
    """Test adding a doctor"""
    try:
        print("➕ Testing add doctor...")
        headers = {"Authorization": f"Bearer {token}"}
        doctor_data = {
            "first_name": "Test",
            "last_name": "Doctor",
            "role": "doctor",
            "specialization": "General Medicine",
            "qualification": "MBBS",
            "experience_years": 5,
            "consultation_fee": 500
        }
        
        response = requests.post(f"{API_BASE_URL}/hospital/staff", 
                               json=doctor_data, headers=headers)
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Add doctor successful")
            return data.get('staff_member', {}).get('id')
        else:
            print(f"❌ Add doctor failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Add doctor error: {e}")
        return None

def test_server_running():
    """Test if server is running"""
    try:
        print("🌐 Testing if server is running...")
        response = requests.get(f"{API_BASE_URL}/auth/profile")
        
        if response.status_code in [401, 422]:  # Unauthorized is expected without token
            print("✅ Server is running")
            return True
        else:
            print(f"⚠️ Server responded with unexpected status: {response.status_code}")
            return True  # Server is still running
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running or not accessible")
        return False
    except Exception as e:
        print(f"❌ Server test error: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 Backend Testing Suite")
    print("=" * 50)
    
    # Test if server is running
    if not test_server_running():
        print("\n💡 Start the server with: python start.py")
        sys.exit(1)
    
    # Test login
    token = test_login()
    if not token:
        print("\n💡 Make sure you have a hospital admin account created")
        print("💡 Or check if the database is properly initialized")
        sys.exit(1)
    
    # Test endpoints
    doctors_ok = test_doctors_endpoint(token)
    patients_ok = test_patients_endpoint(token)
    
    # Test adding a doctor
    doctor_id = test_add_doctor(token)
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"🌐 Server Running: ✅")
    print(f"🔐 Login: ✅")
    print(f"👨‍⚕️ Doctors Endpoint: {'✅' if doctors_ok else '❌'}")
    print(f"👥 Patients Endpoint: {'✅' if patients_ok else '❌'}")
    print(f"➕ Add Doctor: {'✅' if doctor_id else '❌'}")
    
    if all([doctors_ok, patients_ok, doctor_id]):
        print("\n🎉 All tests passed! Backend is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the error messages above.")

if __name__ == "__main__":
    main()