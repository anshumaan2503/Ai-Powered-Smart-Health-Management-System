#!/usr/bin/env python3
"""
Sync hospital emails with their login user emails for consistency
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User

def sync_emails():
    app = create_app()
    
    with app.app_context():
        print("📧 Syncing Hospital Emails with Login Emails...")
        print("=" * 55)
        
        # Get all hospitals with their admin users
        hospitals = Hospital.query.all()
        
        for hospital in hospitals:
            # Find the admin user for this hospital
            admin_user = User.query.filter_by(
                hospital_id=hospital.id,
                role='hospital_admin'
            ).first()
            
            if admin_user:
                old_email = hospital.email
                hospital.email = admin_user.email
                
                print(f"🏥 {hospital.name}")
                print(f"   📧 Updated: {old_email} → {admin_user.email}")
                print(f"   🔑 Login: {admin_user.email} / 123")
            else:
                print(f"⚠️  {hospital.name}: No admin user found")
        
        # Commit changes
        db.session.commit()
        
        print(f"\n✅ Updated {len(hospitals)} hospital emails")
        print("\n📋 Now hospital.email = user.email for easy management!")
        
        # Show some examples
        print("\n🔑 Example Login Credentials:")
        sample_hospitals = hospitals[:5]
        for hospital in sample_hospitals:
            admin_user = User.query.filter_by(
                hospital_id=hospital.id,
                role='hospital_admin'
            ).first()
            if admin_user:
                print(f"   • {hospital.name}: {admin_user.email} / 123")

if __name__ == "__main__":
    sync_emails()