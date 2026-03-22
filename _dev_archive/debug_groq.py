#!/usr/bin/env python3
"""
Debug GROQ connection
"""

import os

print("🔍 Debugging GROQ Connection")
print("=" * 40)

# Check environment
print(f"GROQ_API_KEY present: {bool(os.getenv('GROQ_API_KEY'))}")
if os.getenv('GROQ_API_KEY'):
    key = os.getenv('GROQ_API_KEY')
    print(f"GROQ_API_KEY length: {len(key)}")
    print(f"GROQ_API_KEY preview: {key[:10]}...{key[-5:]}")

# Check GROQ library
try:
    from groq import Groq
    print("✅ GROQ library available")
    
    # Try to create client
    try:
        groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        print("✅ GROQ client created")
        
        # Test simple request
        try:
            response = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": "Hello"}],
                model="llama-3.3-70b-versatile",
                max_tokens=10
            )
            print("✅ GROQ test successful")
            print(f"Response: {response.choices[0].message.content}")
        except Exception as e:
            print(f"❌ GROQ test failed: {e}")
            
    except Exception as e:
        print(f"❌ GROQ client creation failed: {e}")
        
except ImportError as e:
    print(f"❌ GROQ library not available: {e}")
    print("💡 Install with: pip install groq")

print("\n🔧 Checking lab analyzer...")
try:
    from hospital.services.lab_report_analyzer import LabReportAnalyzer
    analyzer = LabReportAnalyzer()
    print(f"Lab analyzer available: {analyzer.is_available()}")
    print(f"Active provider: {analyzer.active_provider}")
except Exception as e:
    print(f"❌ Lab analyzer error: {e}")