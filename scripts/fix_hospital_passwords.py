#!/usr/bin/env python3
"""
Fix password hashing for all hospital users to use bcrypt instead of werkzeug
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models import User, Hospital

def fix_passwords():
    """Fix all user passwords to use proper bcrypt hashing"""
    app = create_app()
    
    with app.app_context():
        print("🔧 Fixing Hospital User Passwords...")
        print("=" * 50)
        
        # Get all users
        users = User.query.all()
        
        fixed_count = 0
        
        for user in users:
            try:
                # Check if this user belongs to one of our fake hospitals
                if user.hospital_id:
                    hospital = Hospital.query.get(user.hospital_id)
                    if hospital and (
                        'apollo2@hospital.com' in hospital.email or
                        'fortis2@hospital.com' in hospital.email or
                        'max2@hospital.com' in hospital.email or
                        'manipal2@hospital.com' in hospital.email or
                        'aiims2@hospital.com' in hospital.email or
                        'narayana2@hospital.com' in hospital.email or
                        'ruby2@hospital.com' in hospital.email or
                        'medanta2@hospital.com' in hospital.email or
                        'kokilabendhirubhaiambani@hospital.com' in hospital.email or
                        'sankaranethralaya@hospital.com' in hospital.email
                    ):
                        # Reset password to '123' using proper bcrypt method
                        user.set_password('123')
                        fixed_count += 1
                        print(f"✅ Fixed password for {user.email}")
                
            except Exception as e:
                print(f"❌ Error fixing password for user {user.email}: {e}")
                continue
        
        try:
            db.session.commit()
            print(f"\n🎉 Successfully fixed passwords for {fixed_count} users")
            print("All hospital users can now login with password: 123")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error committing changes: {e}")

if __name__ == '__main__':
    fix_passwords()