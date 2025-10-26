#!/usr/bin/env python3
"""
Test dashboard API endpoints
"""

import sys
import os
import requests

def test_api_endpoints():
    """Test the API endpoints used by dashboard"""
    
    base_url = "http://localhost:5000"
    
    # You'll need to get a valid JWT token
    token = input("Enter your JWT token (from browser localStorage): ").strip()
    
    if not token:
        print("❌ No token provided. Please log in to the hospital dashboard first.")
        return
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    endpoints = [
        '/api/hospital/staff',
        '/api/hospital/patients?per_page=1',
        '/api/hospital/appointments?per_page=1',
        '/api/hospital/analytics/overview?period=30d'
    ]
    
    print("🔍 Testing Dashboard API Endpoints")
    print("=" * 40)
    
    for endpoint in endpoints:
        try:
            print(f"\n📡 Testing: {endpoint}")
            response = requests.get(f"{base_url}{endpoint}", headers=headers)
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Success!")
                
                # Show relevant data
                if 'staff' in endpoint:
                    staff_count = len(data.get('staff', []))
                    doctors = len([s for s in data.get('staff', []) if s.get('role') == 'doctor'])
                    print(f"   📊 Staff: {staff_count}, Doctors: {doctors}")
                
                elif 'patients' in endpoint:
                    total = data.get('total', 0)
                    patients = len(data.get('patients', []))
                    print(f"   📊 Total Patients: {total}, Returned: {patients}")
                
                elif 'appointments' in endpoint:
                    total = data.get('total', 0)
                    appointments = len(data.get('appointments', []))
                    print(f"   📊 Total Appointments: {total}, Returned: {appointments}")
                
                elif 'analytics' in endpoint:
                    overview = data.get('overview', {})
                    print(f"   📊 Patients: {overview.get('totalPatients', 0)}")
                    print(f"   📊 Doctors: {overview.get('totalDoctors', 0)}")
                    print(f"   📊 Appointments: {overview.get('totalAppointments', 0)}")
                    print(f"   📊 Revenue: ₹{overview.get('totalRevenue', 0)}")
                
            else:
                print(f"   ❌ Error: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   📝 Error: {error_data.get('error', 'Unknown error')}")
                except:
                    print(f"   📝 Response: {response.text[:100]}...")
                    
        except Exception as e:
            print(f"   💥 Exception: {e}")

if __name__ == '__main__':
    test_api_endpoints()