#!/usr/bin/env python3
"""
Verify and display current hospital emails in database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User

def verify_emails():
    app = create_app()
    
    with app.app_context():
        print("🔍 Current Hospital Emails in Database...")
        print("=" * 60)
        
        hospitals = Hospital.query.all()
        
        for hospital in hospitals:
            # Get the login user for this hospital
            login_user = User.query.filter_by(hospital_id=hospital.id).first()
            
            print(f"\n🏥 {hospital.name} (ID: {hospital.id})")
            print(f"   📧 Hospital Email: {hospital.email}")
            if login_user:
                print(f"   🔑 Login Email: {login_user.email}")
                if hospital.email != login_user.email:
                    print(f"   ⚠️  MISMATCH! Need to sync")
            else:
                print(f"   ❌ No login user found")
        
        print(f"\n📊 Total hospitals: {len(hospitals)}")

if __name__ == "__main__":
    verify_emails()