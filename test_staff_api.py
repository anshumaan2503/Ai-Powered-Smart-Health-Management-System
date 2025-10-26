#!/usr/bin/env python3

import requests
import json

def test_staff_api():
    # You'll need to replace this with a valid token
    token = "your_token_here"  # Get this from browser localStorage
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print("Testing staff API endpoint...")
    
    try:
        response = requests.get('http://localhost:5000/api/hospital/staff', headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Total staff returned: {len(data.get('staff', []))}")
            
            # Filter non-doctors
            non_doctors = [s for s in data.get('staff', []) if s.get('role') != 'doctor']
            print(f"Non-doctor staff: {len(non_doctors)}")
            
            print("\nFirst few non-doctor staff:")
            for staff in non_doctors[:5]:
                print(f"- {staff.get('first_name')} {staff.get('last_name')} ({staff.get('role')})")
                
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_staff_api()