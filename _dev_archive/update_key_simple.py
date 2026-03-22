# ========================================
# PASTE YOUR NEW API KEY BELOW
# ========================================

# Replace "PASTE_YOUR_NEW_KEY_HERE" with your actual new API key
# Make sure to keep it between the quotes
NEW_API_KEY = "AIzaSyAURjteqtCUbzvrZ6mhfGqNf4cpi4WhOFY"

# ========================================
# DO NOT EDIT BELOW THIS LINE
# ========================================

import os

if NEW_API_KEY == "PASTE_YOUR_NEW_KEY_HERE":
    print("❌ ERROR: Please edit this file and paste your new API key first!")
    print("Open: update_key_simple.py")
    print("Replace: PASTE_YOUR_NEW_KEY_HERE with your actual key")
    exit(1)

print("="*60)
print("UPDATING .ENV FILE...")
print("="*60)

# Update .env
env_file = '.env'
with open(env_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('GEMINI_API_KEY='):
        new_lines.append(f'GEMINI_API_KEY={NEW_API_KEY}\n')
        print(f"✅ Updated GEMINI_API_KEY")
    else:
        new_lines.append(line)

with open(env_file, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("\n✅ .env file updated successfully!")
print("\nNow testing...")
print("="*60)

# Test
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv(override=True)

from hospital.services.gemini_ai import GeminiHealthChatbot

bot = GeminiHealthChatbot()

if bot.is_available():
    print("\n✅ Gemini initialized successfully!")
    print("\nTesting with a message...")
    response = bot.respond("Hello")
    
    if response.get('type') == 'ai_response':
        print("\n" + "="*60)
        print("🎉 SUCCESS! GEMINI AI IS WORKING!")
        print("="*60)
        print(f"\nAI Response: {response.get('reply')[:200]}...")
    else:
        print(f"\n⚠️  Got response type: {response.get('type')}")
        print(f"Response: {response.get('reply')[:200]}...")
else:
    print(f"\n❌ Not available. Error: {bot.init_error}")
