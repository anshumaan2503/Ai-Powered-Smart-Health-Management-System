#!/usr/bin/env python3
"""
Test script to verify AI services are working correctly
"""

import requests
import json

def test_ai_chatbot():
    """Test the AI chatbot endpoint"""
    base_url = "http://localhost:5000"
    
    print("🤖 Testing AI Chatbot")
    print("=" * 50)
    
    # Test 1: Simple health question
    print("\n1. Testing simple health question...")
    try:
        test_data = {
            "message": "I have a headache, what should I do?",
            "context": []
        }
        
        response = requests.post(
            f"{base_url}/api/public/chatbot",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ AI chatbot working!")
            print(f"   Provider: {data.get('response', {}).get('provider', 'unknown')}")
            print(f"   Model: {data.get('response', {}).get('model', 'unknown')}")
            print(f"   Response: {data.get('response', {}).get('reply', 'No response')[:100]}...")
            
            # Check if it's a proper response (not an error object)
            if isinstance(data.get('response'), dict) and 'reply' in data.get('response', {}):
                print("   ✅ Response format is correct")
            else:
                print("   ⚠️  Response format might be incorrect")
                print(f"   Raw response: {data}")
        else:
            print(f"   ❌ API failed: {response.json()}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Emergency detection
    print("\n2. Testing emergency detection...")
    try:
        test_data = {
            "message": "I'm having chest pain",
            "context": []
        }
        
        response = requests.post(
            f"{base_url}/api/public/chatbot",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            response_text = data.get('response', {}).get('reply', '')
            
            if 'emergency' in response_text.lower() or '911' in response_text:
                print("   ✅ Emergency detection working!")
            else:
                print("   ⚠️  Emergency detection might not be working")
                print(f"   Response: {response_text[:100]}...")
        else:
            print(f"   ❌ Emergency test failed: {response.json()}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

def test_ai_services():
    """Test AI service initialization"""
    print("\n🧠 Testing AI Service Initialization")
    print("=" * 50)
    
    try:
        from hospital.services.gemini_ai import MultiAIHealthChatbot
        
        # Test initialization
        chatbot = MultiAIHealthChatbot()
        
        print(f"   AI Available: {chatbot.is_available()}")
        print(f"   Active Provider: {chatbot.active_provider}")
        print(f"   Init Error: {chatbot.init_error}")
        
        if chatbot.is_available():
            # Test response
            test_response = chatbot.respond("Hello, I have a question about health")
            print(f"   Test Response Type: {test_response.get('type')}")
            print(f"   Provider Used: {test_response.get('provider')}")
            print(f"   Model Used: {test_response.get('model')}")
            print("   ✅ AI service working correctly!")
        else:
            print("   ❌ AI service not available")
            print("   💡 Check your API keys:")
            print("      - GROQ_API_KEY for GROQ")
            print("      - GEMINI_API_KEY for Gemini")
            
    except Exception as e:
        print(f"   ❌ AI service test failed: {e}")

def test_frontend_integration():
    """Test if frontend can access the chatbot"""
    print("\n🌐 Testing Frontend Integration")
    print("=" * 50)
    
    try:
        response = requests.get("http://localhost:3000/aichatbot")
        print(f"   Frontend Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Frontend accessible")
            print("   📍 Visit: http://localhost:3000/aichatbot")
        else:
            print(f"   ❌ Frontend not accessible: {response.status_code}")
            
    except Exception as e:
        print(f"   ⚠️  Frontend test failed: {e}")

def provide_troubleshooting():
    """Provide troubleshooting steps"""
    print("\n🔧 Troubleshooting Guide")
    print("=" * 50)
    
    print("If AI is not working:")
    print()
    print("1. 🔑 Check API Keys:")
    print("   - Add GROQ_API_KEY to your .env file")
    print("   - Or add GEMINI_API_KEY to your .env file")
    print("   - Get GROQ key: https://console.groq.com/")
    print("   - Get Gemini key: https://makersuite.google.com/")
    print()
    print("2. 📦 Install Dependencies:")
    print("   pip install groq google-generativeai")
    print()
    print("3. 🔄 Restart Services:")
    print("   - Stop backend (Ctrl+C)")
    print("   - Run: python start.py")
    print()
    print("4. 🧪 Test Again:")
    print("   python test_ai_fix.py")

def main():
    """Main test function"""
    print("🤖 AI Service Fix Test Suite")
    print("=" * 60)
    
    # Test AI services
    test_ai_services()
    
    # Test API endpoints
    test_ai_chatbot()
    
    # Test frontend
    test_frontend_integration()
    
    # Troubleshooting guide
    provide_troubleshooting()
    
    print("\n" + "=" * 60)
    print("🎯 Test Summary:")
    print("- AI service initialization tested")
    print("- API endpoints tested")
    print("- Emergency detection tested")
    print("- Frontend integration tested")
    
    print("\n💡 Expected Results:")
    print("✅ AI should use GROQ (faster) or Gemini (fallback)")
    print("✅ Emergency keywords should trigger immediate response")
    print("✅ Responses should be properly formatted strings")
    print("✅ Frontend should display responses correctly")

if __name__ == "__main__":
    main()