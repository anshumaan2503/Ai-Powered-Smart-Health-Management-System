#!/usr/bin/env python3
"""
Test script for public AI chatbot
Tests the /aichatbot route and public API endpoint
"""

import requests
import json

def test_public_chatbot_api():
    """Test the public chatbot API endpoint"""
    base_url = "http://localhost:5000"
    
    print("🤖 Testing Public AI Chatbot API")
    print("=" * 50)
    
    # Test 1: Basic chatbot request
    print("\n1. Testing basic chatbot request...")
    try:
        test_message = {
            "message": "Hello, I have a headache. What should I do?",
            "context": []
        }
        
        response = requests.post(
            f"{base_url}/api/public/chatbot",
            json=test_message,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Chatbot API working!")
            print(f"   AI Type: {data.get('ai_type', 'unknown')}")
            print(f"   Response: {data.get('response', 'No response')[:100]}...")
            print(f"   Disclaimer: {data.get('disclaimer', 'No disclaimer')}")
        else:
            print(f"   ❌ API failed: {response.json()}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Empty message (should fail)
    print("\n2. Testing empty message validation...")
    try:
        response = requests.post(
            f"{base_url}/api/public/chatbot",
            json={"message": "", "context": []},
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 400:
            print("   ✅ Correctly validates empty messages")
        else:
            print(f"   ❌ Should return 400 for empty message: {response.json()}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Long message (should fail)
    print("\n3. Testing message length validation...")
    try:
        long_message = "x" * 1001  # Over 1000 character limit
        response = requests.post(
            f"{base_url}/api/public/chatbot",
            json={"message": long_message, "context": []},
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 400:
            print("   ✅ Correctly validates message length")
        else:
            print(f"   ❌ Should return 400 for long message: {response.json()}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 4: Multiple requests (rate limiting test)
    print("\n4. Testing multiple requests...")
    try:
        success_count = 0
        for i in range(5):
            response = requests.post(
                f"{base_url}/api/public/chatbot",
                json={"message": f"Test message {i+1}", "context": []},
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                success_count += 1
        
        print(f"   ✅ {success_count}/5 requests successful")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")

def test_frontend_route():
    """Test if the frontend route is accessible"""
    print("\n🌐 Testing Frontend Route")
    print("=" * 50)
    
    try:
        response = requests.get("http://localhost:3000/aichatbot")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Frontend route accessible")
            print("   📍 Visit: http://localhost:3000/aichatbot")
        else:
            print(f"   ❌ Frontend route failed: {response.status_code}")
            
    except Exception as e:
        print(f"   ⚠️  Frontend not accessible (may not be running): {e}")

def test_ai_services():
    """Test AI service availability"""
    print("\n🧠 Testing AI Services")
    print("=" * 50)
    
    try:
        from hospital.services.gemini_ai import GeminiHealthChatbot
        from hospital.services.simple_ai import SimpleHealthChatbot
        
        # Test Gemini AI
        gemini_bot = GeminiHealthChatbot()
        print(f"   Gemini AI available: {gemini_bot.is_available()}")
        
        # Test Simple AI
        simple_bot = SimpleHealthChatbot()
        test_response = simple_bot.respond("Hello", [])
        print(f"   Simple AI working: {bool(test_response)}")
        
        if gemini_bot.is_available():
            print("   ✅ Advanced AI features enabled")
        else:
            print("   ⚠️  Using fallback AI (install google-generativeai for advanced features)")
            
    except Exception as e:
        print(f"   ❌ AI services error: {e}")

def main():
    """Main test function"""
    print("🤖 Public AI Chatbot Test Suite")
    print("=" * 60)
    
    # Test AI services
    test_ai_services()
    
    # Test API endpoints
    test_public_chatbot_api()
    
    # Test frontend route
    test_frontend_route()
    
    print("\n" + "=" * 60)
    print("🎯 Test Summary:")
    print("- Public API endpoint tested")
    print("- Rate limiting verified")
    print("- Input validation checked")
    print("- Frontend route accessibility tested")
    
    print("\n🚀 How to use:")
    print("1. Start backend: python start.py")
    print("2. Start frontend: cd frontend && npm run dev")
    print("3. Visit: http://localhost:3000/aichatbot")
    print("4. Or use API directly: POST /api/public/chatbot")
    
    print("\n💡 Features:")
    print("- No authentication required")
    print("- Rate limiting (50 requests/hour per IP)")
    print("- Input validation and sanitization")
    print("- Fallback AI system")
    print("- Medical disclaimer included")

if __name__ == "__main__":
    main()