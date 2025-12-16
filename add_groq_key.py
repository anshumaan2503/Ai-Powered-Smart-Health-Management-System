"""
Add GROQ API Key to .env file
"""
import os

print("="*60)
print("ADD GROQ API KEY")
print("="*60)
print()
print("Paste your GROQ API key here:")
print("(Should start with 'gsk_')")
print()

groq_key = input("> ").strip()

if not groq_key:
    print("\n❌ No key entered!")
    exit(1)

if not groq_key.startswith("gsk_"):
    print("\n⚠️  Warning: GROQ keys usually start with 'gsk_'")
    confirm = input("Continue anyway? (y/n): ").strip().lower()
    if confirm != 'y':
        print("Cancelled.")
        exit(1)

# Update .env file
env_file = '.env'
if not os.path.exists(env_file):
    print(f"\n❌ .env file not found!")
    exit(1)

with open(env_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check if GROQ_API_KEY already exists
found = False
new_lines = []

for line in lines:
    if line.startswith('GROQ_API_KEY='):
        new_lines.append(f'GROQ_API_KEY={groq_key}\n')
        found = True
        print(f"\n✅ Updated existing GROQ_API_KEY")
    else:
        new_lines.append(line)

# If not found, add it
if not found:
    new_lines.append(f'\n# GROQ AI Configuration\nGROQ_API_KEY={groq_key}\n')
    print(f"\n✅ Added GROQ_API_KEY to .env")

# Write back
with open(env_file, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("\n" + "="*60)
print("✅ SUCCESS! GROQ API key added!")
print("="*60)
print()
print("Now testing GROQ integration...")
print()

# Test immediately
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv(override=True)

from hospital.services.gemini_ai import MultiAIHealthChatbot

bot = MultiAIHealthChatbot()

if bot.is_available():
    print(f"✅ AI Provider: {bot.active_provider.upper()}")
    print("\nTesting with a message...")
    response = bot.respond("Hello, I have a headache. What should I do?")
    
    if response.get('type') == 'ai_response':
        print("\n" + "="*60)
        print(f"🎉 SUCCESS! {response.get('provider').upper()} IS WORKING!")
        print("="*60)
        print(f"\nProvider: {response.get('provider')}")
        print(f"Model: {response.get('model')}")
        print(f"\nAI Response:\n{response.get('reply')}")
        print(f"\nSuggestions:")
        for i, s in enumerate(response.get('suggestions', []), 1):
            print(f"  {i}. {s}")
    else:
        print(f"\n⚠️  Got response type: {response.get('type')}")
else:
    print(f"\n❌ AI not available. Error: {bot.init_error}")
