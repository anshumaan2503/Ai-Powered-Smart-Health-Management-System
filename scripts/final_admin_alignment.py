#!/usr/bin/env python3
"""
Final comprehensive admin alignment - no password checking, just fix everything
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User
from hospital.models.hospital_subscription import HospitalSubscription
from datetime import datetime, timedelta

def final_alignment():
    app = create_app()
    
    with app.app_context():
        print("🎯 FINAL ADMIN PAGE ALIGNMENT")
        print("=" * 50)
        
        hospitals = Hospital.query.all()
        
        for hospital in hospitals:
            print(f"\n🏥 {hospital.name}")
            
            # Get login user
            login_user = User.query.filter_by(hospital_id=hospital.id).first()
            if not login_user:
                print(f"   ⚠️  No login user - skipping")
                continue
            
            # 1. Sync emails (hospital email = login email)
            if hospital.email != login_user.email:
                print(f"   📧 Syncing: {hospital.email} → {login_user.email}")
                hospital.email = login_user.email
            
            # 2. Force reset password to '123' (no checking, just set)
            print(f"   🔑 Setting password to '123'")
            login_user.set_password('123')
            
            # 3. Ensure active subscription
            subscription = HospitalSubscription.query.filter_by(hospital_id=hospital.id).first()
            if not subscription:
                print(f"   📋 Creating subscription")
                subscription = HospitalSubscription(
                    hospital_id=hospital.id,
                    plan_name='premium',
                    is_active=True,
                    subscription_start=datetime.utcnow().date(),
                    subscription_end=(datetime.utcnow() + timedelta(days=365)).date(),
                    max_doctors=-1,
                    max_patients=-1,
                    max_staff=-1,
                    monthly_fee=199.99,
                    features=['analytics', 'appointments', 'patients', 'doctors', 'staff']
                )
                db.session.add(subscription)
            else:
                print(f"   📋 Ensuring subscription is active")
                subscription.is_active = True
                subscription.subscription_end = (datetime.utcnow() + timedelta(days=365)).date()
            
            print(f"   ✅ Aligned: {login_user.email} / 123")
        
        # Commit all changes
        db.session.commit()
        
        print(f"\n🎉 ADMIN PAGE ALIGNMENT COMPLETE!")
        print(f"📋 All hospitals now have:")
        print(f"   • Hospital email = Login email")
        print(f"   • Password = '123'")
        print(f"   • Active subscription")
        
        # Show final list
        print(f"\n🔑 ADMIN PAGE READY HOSPITALS:")
        working_hospitals = []
        for hospital in hospitals:
            login_user = User.query.filter_by(hospital_id=hospital.id).first()
            if login_user:
                working_hospitals.append(hospital)
                print(f"   ✅ {hospital.name}: {hospital.email} / 123")
        
        print(f"\n🚀 {len(working_hospitals)} hospitals ready!")
        print(f"💡 Refresh your admin page to see updated emails!")

if __name__ == "__main__":
    final_alignment()