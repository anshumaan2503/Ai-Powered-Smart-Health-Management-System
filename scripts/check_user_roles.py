#!/usr/bin/env python3
"""
Check user roles and fix hospital email sync
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User

def check_and_fix():
    app = create_app()
    
    with app.app_context():
        print("🔍 Checking User Roles and Hospital Emails...")
        print("=" * 50)
        
        # Check what roles exist
        all_roles = db.session.query(User.role).distinct().all()
        print(f"📋 Available roles: {[role[0] for role in all_roles]}")
        
        # Get sample users to see their structure
        sample_users = User.query.limit(5).all()
        print(f"\n👥 Sample Users:")
        for user in sample_users:
            print(f"   • {user.email} - Role: {user.role} - Hospital ID: {user.hospital_id}")
        
        # Now let's sync emails using any user from each hospital
        print(f"\n📧 Syncing Hospital Emails...")
        hospitals = Hospital.query.all()
        
        for hospital in hospitals:
            # Find ANY user for this hospital (not just admin)
            hospital_user = User.query.filter_by(hospital_id=hospital.id).first()
            
            if hospital_user:
                old_email = hospital.email
                hospital.email = hospital_user.email
                
                print(f"🏥 {hospital.name}")
                print(f"   📧 Updated: {old_email} → {hospital_user.email}")
                print(f"   🔑 Login: {hospital_user.email} / 123")
            else:
                print(f"⚠️  {hospital.name}: No users found")
        
        # Commit changes
        db.session.commit()
        print(f"\n✅ Hospital emails synced with login emails!")

if __name__ == "__main__":
    check_and_fix()