import os
import sys

# Add the parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Now test Gemini
from hospital.services.gemini_ai import GeminiHealthChatbot

print("="*50)
print("GEMINI AI TEST")
print("="*50)

bot = GeminiHealthChatbot()
print(f"\nAPI Key Present: {bool(bot.api_key)}")
print(f"Model Initialized: {bot.model is not None}")
print(f"Gemini Available: {bot.is_available()}")
print(f"Init Error: {bot.init_error}")

if bot.is_available():
    print("\n✅ Testing Gemini response...")
    response = bot.respond("I have a headache")
    print(f"Response type: {response.get('type')}")
    print(f"Response: {response.get('reply')[:100]}...")
else:
    print("\n❌ Gemini is NOT available")
    print(f"Reason: {bot.init_error}")
