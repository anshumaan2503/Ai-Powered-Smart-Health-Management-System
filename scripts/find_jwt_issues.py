"""
Script to find all uses of get_jwt_identity() that need int() conversion
"""

import os
import re

def find_jwt_identity_usage():
    """Find all files using get_jwt_identity() and check if they need fixes"""
    
    hospital_dir = r"C:\Users\HP\OneDrive\Desktop\PROJECTS\AI SMART Health MANAGEMENT SYSTEM\hospital\routes"
    
    issues = []
    
    for filename in os.listdir(hospital_dir):
        if not filename.endswith('.py') or filename.startswith('__'):
            continue
        
        filepath = os.path.join(hospital_dir, filename)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
        
        # Find lines with get_jwt_identity()
        for i, line in enumerate(lines, 1):
            if 'get_jwt_identity()' in line:
                # Check next few lines for User.query.get() or similar patterns
                context = '\n'.join(lines[max(0, i-1):min(len(lines), i+5)])
                
                # Pattern: User.query.get(current_user_id) without int()
                # or patient_id = current_user_id without conversion
                if re.search(r'User\.query\.get\(current_user_id\)', context) and 'int(current_user_id)' not in context:
                    issues.append({
                        'file': filename,
                        'line': i,
                        'issue': 'User.query.get(current_user_id) needs int() conversion',
                        'context': line.strip()
                    })
                elif re.search(r'\.query\.get\(\w*user_id\)', context) and 'int(' not in context:
                    issues.append({
                        'file': filename,
                        'line': i,
                        'issue': 'Query using user_id variable may need int() conversion',
                        'context': line.strip()
                    })
    
    return issues

if __name__ == '__main__':
    print("Searching for get_jwt_identity() usage that needs fixes...")
    print("=" * 70)
    
    issues = find_jwt_identity_usage()
    
    if not issues:
        print("✅ No issues found! All routes handle string identities correctly.")
    else:
        print(f"Found {len(issues)} potential issues:\n")
        for issue in issues:
            print(f"File: {issue['file']}")
            print(f"Line: {issue['line']}")
            print(f"Issue: {issue['issue']}")
            print(f"Context: {issue['context']}")
            print("-" * 70)
