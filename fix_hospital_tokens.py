#!/usr/bin/env python3
"""
Fix hospital token references in all hospital dashboard pages
"""

import os
import re

def fix_token_references():
    # Find all TypeScript/TSX files in hospital dashboard
    hospital_dashboard_path = "frontend/app/hospital/dashboard"
    
    for root, dirs, files in os.walk(hospital_dashboard_path):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                file_path = os.path.join(root, file)
                
                # Skip the main dashboard page as we already fixed it
                if 'page.tsx' in file and 'dashboard/page.tsx' in file_path:
                    continue
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Replace access_token with hospital_access_token
                    original_content = content
                    content = content.replace("localStorage.getItem('access_token')", "localStorage.getItem('hospital_access_token')")
                    
                    if content != original_content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"✅ Fixed token references in {file_path}")
                    
                except Exception as e:
                    print(f"❌ Error processing {file_path}: {e}")

if __name__ == '__main__':
    fix_token_references()
    print("\n🎉 All hospital dashboard token references fixed!")