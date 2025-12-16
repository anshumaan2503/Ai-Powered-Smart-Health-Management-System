import os
import sys

# Set UTF-8 encoding for console
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from hospital.services.gemini_ai import GeminiHealthChatbot

print("="*50)
print("GEMINI AI TEST")
print("="*50)
print()

bot = GeminiHealthChatbot()
print(f"\nAPI Key Present: {bool(bot.api_key)}")
print(f"Model Initialized: {bot.model is not None}")
print(f"Gemini Available: {bot.is_available()}")
print(f"Init Error: {bot.init_error}")
print()

if bot.is_available():
    print("Testing Gemini response...")
    print("-" * 50)
    response = bot.respond("I have a headache")
    print(f"\nResponse type: {response.get('type')}")
    print(f"\nResponse:\n{response.get('reply')}")
    print("\nSuggestions:")
    for i, suggestion in enumerate(response.get('suggestions', []), 1):
        print(f"  {i}. {suggestion}")
    print(f"\nDisclaimer: {response.get('disclaimer')}")
    print("\n" + "="*50)
    print("SUCCESS - Gemini AI is working!")
    print("="*50)
else:
    print("FAILED - Gemini is NOT available")
    print(f"Reason: {bot.init_error}")
