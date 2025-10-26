#!/usr/bin/env python3
"""
Fix admin page hospital emails to match working login credentials
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User

def fix_admin_emails():
    app = create_app()
    
    with app.app_context():
        print("🔧 Fixing Admin Page Hospital Emails...")
        print("=" * 50)
        
        # Mapping of old emails to new working emails
        email_mapping = {
            'fortis@hospital.com': 'fortis2@hospital.com',
            'max@hospital.com': 'max2@hospital.com',
            'manipal@hospital.com': 'manipal2@hospital.com',
            'apollo@hospital.com': 'apollo2@hospital.com',
            'aiimssatellite@hospital.com': 'aiims2@hospital.com',
            'narayanahealth@hospital.com': 'narayana2@hospital.com',
            'rubyhall@hospital.com': 'ruby2@hospital.com',
            'medanta@hospital.com': 'medanta2@hospital.com'
        }
        
        hospitals = Hospital.query.all()
        
        for hospital in hospitals:
            if hospital.email in email_mapping:
                old_email = hospital.email
                new_email = email_mapping[old_email]
                hospital.email = new_email
                
                print(f"🏥 {hospital.name}")
                print(f"   📧 Updated: {old_email} → {new_email}")
                
                # Also check if there's a user with the new email to link
                user_with_new_email = User.query.filter_by(email=new_email).first()
                if user_with_new_email and not user_with_new_email.hospital_id:
                    user_with_new_email.hospital_id = hospital.id
                    print(f"   🔗 Linked user to hospital")
        
        # Commit changes
        db.session.commit()
        
        print(f"\n✅ Admin page emails updated!")
        print("\n🔑 Now all hospitals in admin page have correct login emails:")
        
        # Show updated hospitals
        updated_hospitals = Hospital.query.filter(Hospital.email.in_(email_mapping.values())).all()
        for hospital in updated_hospitals:
            print(f"   • {hospital.name}: {hospital.email}")

if __name__ == "__main__":
    fix_admin_emails()