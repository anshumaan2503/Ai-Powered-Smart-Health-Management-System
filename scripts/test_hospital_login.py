#!/usr/bin/env python3
"""
Test hospital login credentials to verify they work
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models import User, Hospital

def test_login():
    """Test login for all fake hospitals"""
    app = create_app()
    
    with app.app_context():
        print("🔐 Testing Hospital Login Credentials...")
        print("=" * 50)
        
        # Test hospital emails
        test_emails = [
            'apollo2@hospital.com',
            'fortis2@hospital.com',
            'max2@hospital.com',
            'manipal2@hospital.com',
            'aiims2@hospital.com',
            'narayana2@hospital.com',
            'ruby2@hospital.com',
            'medanta2@hospital.com',
            'kokilabendhirubhaiambani@hospital.com',
            'sankaranethralaya@hospital.com'
        ]
        
        successful_logins = 0
        
        for email in test_emails:
            try:
                user = User.query.filter_by(email=email).first()
                if user:
                    # Test password
                    if user.check_password('123'):
                        hospital = Hospital.query.get(user.hospital_id)
                        print(f"✅ {hospital.name}: {email} - Login OK")
                        successful_logins += 1
                    else:
                        print(f"❌ {email} - Password check failed")
                else:
                    print(f"❌ {email} - User not found")
            except Exception as e:
                print(f"❌ {email} - Error: {e}")
        
        print(f"\n📊 Results:")
        print(f"   - Successful logins: {successful_logins}/{len(test_emails)}")
        print(f"   - Password for all: 123")
        
        if successful_logins == len(test_emails):
            print("\n🎉 All hospital logins are working perfectly!")
        else:
            print(f"\n⚠️  {len(test_emails) - successful_logins} hospitals need fixing")

if __name__ == '__main__':
    test_login()