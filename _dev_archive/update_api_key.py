"""
Script to update GEMINI_API_KEY in .env file
"""
import os
import sys

def update_api_key():
    print("="*50)
    print("GEMINI API KEY UPDATER")
    print("="*50)
    print()
    
    # Get new API key from user
    print("Please paste your new Gemini API key:")
    print("(It should start with 'AIzaSy...')")
    print()
    new_key = input("API Key: ").strip()
    
    if not new_key:
        print("\n❌ Error: No API key provided!")
        return
    
    if not new_key.startswith("AIzaSy"):
        print("\n⚠️  Warning: API key doesn't start with 'AIzaSy'")
        confirm = input("Continue anyway? (y/n): ").strip().lower()
        if confirm != 'y':
            print("Cancelled.")
            return
    
    # Path to .env file
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    
    if not os.path.exists(env_file):
        print(f"\n❌ Error: .env file not found at {env_file}")
        return
    
    # Read current .env file
    with open(env_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Update GEMINI_API_KEY
    updated = False
    new_lines = []
    
    for line in lines:
        if line.startswith('GEMINI_API_KEY='):
            new_lines.append(f'GEMINI_API_KEY={new_key}\n')
            updated = True
            print(f"\n✅ Updated GEMINI_API_KEY")
        else:
            new_lines.append(line)
    
    # If key wasn't found, add it
    if not updated:
        new_lines.append(f'\nGEMINI_API_KEY={new_key}\n')
        print(f"\n✅ Added GEMINI_API_KEY to .env")
    
    # Write back to .env
    with open(env_file, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print("\n" + "="*50)
    print("✅ .env file updated successfully!")
    print("="*50)
    print()
    print("Next step: Test the configuration")
    print("Run: python test_gemini_simple.py")
    print()

if __name__ == "__main__":
    try:
        update_api_key()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
