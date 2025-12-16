"""
Quick API Key Checker and Updater
Shows current key and helps update it
"""
import os
from dotenv import load_dotenv

print("="*60)
print("GEMINI API KEY CHECKER")
print("="*60)
print()

# Check .env file directly
env_path = '.env'
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Find GEMINI_API_KEY line
    for line in content.split('\n'):
        if line.startswith('GEMINI_API_KEY='):
            current_key = line.replace('GEMINI_API_KEY=', '').strip()
            print(f"Current API key in .env file:")
            print(f"  First 15 chars: {current_key[:15]}...")
            print(f"  Last 10 chars: ...{current_key[-10:]}")
            print(f"  Total length: {len(current_key)} characters")
            print()
            
            # Check if it's valid format
            if not current_key.startswith('AIzaSy'):
                print("⚠️  WARNING: Key doesn't start with 'AIzaSy'")
                print()
            
            if len(current_key) != 39:
                print(f"⚠️  WARNING: Key length is {len(current_key)}, should be 39")
                print()
            
            break
    else:
        print("❌ GEMINI_API_KEY not found in .env file!")
        print()

# Load and check with dotenv
load_dotenv()
loaded_key = os.getenv('GEMINI_API_KEY')

if loaded_key:
    print(f"Key loaded by Python:")
    print(f"  First 15 chars: {loaded_key[:15]}...")
    print(f"  Length: {len(loaded_key)}")
    print()
else:
    print("❌ GEMINI_API_KEY not loaded by dotenv!")
    print()

print("="*60)
print("Do you want to update the API key? (y/n)")
choice = input("> ").strip().lower()

if choice == 'y':
    print()
    print("Paste your NEW API key:")
    new_key = input("> ").strip()
    
    if new_key and len(new_key) > 30:
        # Update .env file
        with open(env_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        updated = False
        new_lines = []
        for line in lines:
            if line.startswith('GEMINI_API_KEY='):
                new_lines.append(f'GEMINI_API_KEY={new_key}\n')
                updated = True
            else:
                new_lines.append(line)
        
        if not updated:
            new_lines.append(f'\nGEMINI_API_KEY={new_key}\n')
        
        with open(env_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        
        print()
        print("✅ API key updated successfully!")
        print("Run: python test_gemini_simple.py")
    else:
        print("❌ Invalid key. Not updated.")
else:
    print("Cancelled.")
