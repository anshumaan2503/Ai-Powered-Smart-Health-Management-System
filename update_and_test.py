"""
Simple script to update .env with new API key
Just paste your new key when prompted
"""
import os

print("="*60)
print("UPDATE GEMINI API KEY")
print("="*60)
print()
print("Paste your NEW API key here:")
print("(The one that's DIFFERENT from AIzaSyBuQveq...)")
print()

new_key = input("> ").strip()

if not new_key:
    print("\n❌ No key entered!")
    exit(1)

if len(new_key) < 30:
    print("\n❌ Key seems too short!")
    exit(1)

# Check if it's the old key
if new_key == "AIzaSyBuQveq-9yjwR_n21bVS5bx5b2VOdXMNMo":
    print("\n❌ This is the OLD key! Please use the NEW key.")
    exit(1)

# Update .env file
env_file = '.env'
if not os.path.exists(env_file):
    print(f"\n❌ .env file not found!")
    exit(1)

with open(env_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

updated = False
new_lines = []

for line in lines:
    if line.startswith('GEMINI_API_KEY='):
        old_key = line.replace('GEMINI_API_KEY=', '').strip()
        new_lines.append(f'GEMINI_API_KEY={new_key}\n')
        updated = True
        print(f"\n✅ Replaced old key: {old_key[:15]}...")
        print(f"   With new key: {new_key[:15]}...")
    else:
        new_lines.append(line)

if not updated:
    new_lines.append(f'\nGEMINI_API_KEY={new_key}\n')
    print(f"\n✅ Added new key to .env")

with open(env_file, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("\n" + "="*60)
print("✅ SUCCESS! .env file updated!")
print("="*60)
print()
print("Now testing the new configuration...")
print()

# Test immediately
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv(override=True)  # Force reload

from hospital.services.gemini_ai import GeminiHealthChatbot

bot = GeminiHealthChatbot()
print(f"API Key Present: {bool(bot.api_key)}")
print(f"Model Initialized: {bot.model is not None}")
print(f"Gemini Available: {bot.is_available()}")

if bot.is_available():
    print("\nTesting with a quick question...")
    response = bot.respond("Hello, can you help me?")
    if response.get('type') == 'ai_response':
        print("\n" + "="*60)
        print("🎉 SUCCESS! GEMINI IS WORKING!")
        print("="*60)
        print(f"\nResponse preview: {response.get('reply')[:100]}...")
    else:
        print(f"\n⚠️ Got response type: {response.get('type')}")
else:
    print(f"\n❌ Still not available. Error: {bot.init_error}")
