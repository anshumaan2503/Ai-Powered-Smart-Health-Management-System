import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from hospital.services.gemini_ai import GeminiHealthChatbot

output_file = "gemini_test_result.txt"

with open(output_file, "w") as f:
    f.write("="*50 + "\n")
    f.write("GEMINI AI TEST\n")
    f.write("="*50 + "\n\n")
    
    bot = GeminiHealthChatbot()
    f.write(f"API Key Present: {bool(bot.api_key)}\n")
    f.write(f"Model Initialized: {bot.model is not None}\n")
    f.write(f"Gemini Available: {bot.is_available()}\n")
    f.write(f"Init Error: {bot.init_error}\n\n")
    
    if bot.is_available():
        f.write("✅ Testing Gemini response...\n")
        response = bot.respond("I have a headache")
        f.write(f"Response type: {response.get('type')}\n")
        f.write(f"Response: {response.get('reply')}\n")
    else:
        f.write("❌ Gemini is NOT available\n")
        f.write(f"Reason: {bot.init_error}\n")

print(f"Results written to {output_file}")
