#!/usr/bin/env python3
"""
Test script for patient import functionality
"""

import requests
import json
import os

def test_patient_import():
    """Test the patient import API endpoint"""
    
    # API endpoint
    url = "http://localhost:5000/api/hospital/patients/import"
    
    # You'll need to get a valid JWT token first
    # For testing, you can get this from the browser's localStorage after logging in
    token = input("Enter your JWT token (from browser localStorage): ").strip()
    
    if not token:
        print("❌ No token provided. Please log in to the hospital dashboard first.")
        return
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    # Test with the corrected CSV file
    csv_file = 'corrected_patients_import.csv'
    
    if not os.path.exists(csv_file):
        print(f"❌ CSV file {csv_file} not found")
        return
    
    try:
        with open(csv_file, 'rb') as f:
            files = {'file': (csv_file, f, 'text/csv')}
            
            print(f"🔄 Testing import with {csv_file}...")
            response = requests.post(url, headers=headers, files=files)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            
            if response.status_code == 200:
                print("✅ Import test successful!")
            else:
                print("❌ Import test failed!")
                
    except Exception as e:
        print(f"❌ Error during test: {e}")

if __name__ == '__main__':
    test_patient_import()