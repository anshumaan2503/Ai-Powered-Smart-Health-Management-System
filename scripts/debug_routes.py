#!/usr/bin/env python3
"""
Debug script to test routes and identify redirect issues
"""

import requests
import time

def test_backend_routes():
    """Test backend routes"""
    base_url = "http://localhost:5000"
    
    print("🔍 Testing Backend Routes")
    print("=" * 50)
    
    routes_to_test = [
        ("/api/public/chatbot", "POST", {"message": "test"}),
        ("/api/ai/test-gemini", "GET", None),
        ("/", "GET", None),
    ]
    
    for route, method, data in routes_to_test:
        try:
            print(f"\n{method} {route}")
            if method == "GET":
                response = requests.get(f"{base_url}{route}")
            else:
                response = requests.post(
                    f"{base_url}{route}", 
                    json=data,
                    headers={"Content-Type": "application/json"}
                )
            
            print(f"   Status: {response.status_code}")
            if response.status_code != 200:
                print(f"   Error: {response.text[:200]}")
            else:
                print("   ✅ Working")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")

def test_frontend_routes():
    """Test frontend routes"""
    base_url = "http://localhost:3000"
    
    print("\n🌐 Testing Frontend Routes")
    print("=" * 50)
    
    routes_to_test = [
        "/simple-test",
        "/test-public", 
        "/aichatbot",
        "/",
    ]
    
    for route in routes_to_test:
        try:
            print(f"\nGET {route}")
            response = requests.get(f"{base_url}{route}", allow_redirects=False)
            print(f"   Status: {response.status_code}")
            
            if response.status_code in [301, 302, 307, 308]:
                print(f"   🔄 Redirect to: {response.headers.get('Location', 'Unknown')}")
            elif response.status_code == 200:
                print("   ✅ Working")
            else:
                print(f"   ❌ Error: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")

def check_browser_storage():
    """Instructions to check browser storage"""
    print("\n🧹 Browser Storage Check")
    print("=" * 50)
    print("To debug authentication issues:")
    print("1. Open browser DevTools (F12)")
    print("2. Go to Application/Storage tab")
    print("3. Check Local Storage and Session Storage")
    print("4. Look for these keys:")
    print("   - access_token")
    print("   - refresh_token") 
    print("   - user")
    print("   - hospital_access_token")
    print("5. Clear all storage if found")
    print("6. Try accessing /aichatbot again")

def main():
    """Main debug function"""
    print("🔍 Route Debug Script")
    print("=" * 60)
    
    # Test backend
    test_backend_routes()
    
    # Test frontend
    test_frontend_routes()
    
    # Browser storage instructions
    check_browser_storage()
    
    print("\n" + "=" * 60)
    print("🎯 Debug Summary:")
    print("- Backend routes tested")
    print("- Frontend routes tested") 
    print("- Redirect detection enabled")
    
    print("\n💡 Common Issues:")
    print("- Browser cache/storage causing redirects")
    print("- Authentication tokens triggering redirects")
    print("- Client-side JavaScript redirects")
    print("- Next.js routing issues")
    
    print("\n🔧 Quick Fixes:")
    print("1. Clear browser storage completely")
    print("2. Use incognito/private mode")
    print("3. Check browser console for errors")
    print("4. Restart both frontend and backend")

if __name__ == "__main__":
    main()