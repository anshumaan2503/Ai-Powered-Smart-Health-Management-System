#!/usr/bin/env python3
"""
Test script to check pharmacy API endpoints
"""

import requests
import json

# Test the pharmacy API endpoints
BASE_URL = "http://localhost:5000"

def test_pharmacy_endpoints():
    print("🧪 Testing Pharmacy API Endpoints...")
    
    # You'll need to get a valid token first
    # For now, let's test without authentication to see if the endpoint exists
    
    try:
        # Test dashboard stats endpoint
        print("\n1. Testing dashboard stats endpoint...")
        response = requests.get(f"{BASE_URL}/api/hospital/pharmacy/dashboard-stats")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        # Test medicines endpoint
        print("\n2. Testing medicines endpoint...")
        response = requests.get(f"{BASE_URL}/api/hospital/pharmacy/medicines")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server. Make sure it's running on port 5000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_pharmacy_endpoints()