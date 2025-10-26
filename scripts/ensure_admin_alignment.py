#!/usr/bin/env python3
"""
Master script to ensure ALL changes align with admin page
Run this after any hospital/user modifications
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User
from hospital.models.hospital_subscription import HospitalSubscription
from datetime import datetime, timedelta

def ensure_alignment():
    app = create_app()
    
    with app.app_context():
        print("🔧 ENSURING ADMIN PAGE ALIGNMENT")
        print("=" * 50)
        
        hospitals = Hospital.query.all()
        fixed_count = 0
        
        for hospital in hospitals:
            print(f"\n🏥 {hospital.name}")
            needs_fix = False
            
            # 1. Ensure hospital has a login user
            login_user = User.query.filter_by(hospital_id=hospital.id).first()
            if not login_user:
                print(f"   ⚠️  No login user - skipping hospital")
                continue
            
            # 2. Sync hospital email with login email
            if hospital.email != login_user.email:
                print(f"   📧 Syncing email: {hospital.email} → {login_user.email}")
                hospital.email = login_user.email
                needs_fix = True
            
            # 3. Ensure password is '123'
            if not login_user.check_password('123'):
                print(f"   🔑 Fixing password to '123'")
                login_user.set_password('123')
                needs_fix = True
            
            # 4. Ensure active subscription exists
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
                needs_fix = True
            elif not subscription.is_active:
                print(f"   📋 Activating subscription")
                subscription.is_active = True
                subscription.subscription_end = (datetime.utcnow() + timedelta(days=365)).date()
                needs_fix = True
            
            if needs_fix:
                fixed_count += 1
                print(f"   ✅ Fixed alignment issues")
            else:
                print(f"   ✅ Already aligned")
        
        # Commit all changes
        db.session.commit()
        
        print(f"\n🎉 ALIGNMENT COMPLETE")
        print(f"   • Fixed {fixed_count} hospitals")
        print(f"   • All hospitals now aligned with admin page")
        print(f"   • Email = Login credentials")
        print(f"   • All subscriptions active")
        print(f"   • All passwords = '123'")
        
        # Final validation
        print(f"\n📋 FINAL ADMIN PAGE READY LIST:")
        ready_hospitals = []
        for hospital in hospitals:
            login_user = User.query.filter_by(hospital_id=hospital.id).first()
            subscription = HospitalSubscription.query.filter_by(hospital_id=hospital.id).first()
            
            if (login_user and 
                hospital.email == login_user.email and 
                subscription and subscription.is_active):
                ready_hospitals.append(hospital)
                print(f"   ✅ {hospital.name}: {hospital.email} / 123")
        
        print(f"\n🚀 {len(ready_hospitals)} hospitals ready for admin page!")

if __name__ == "__main__":
    ensure_alignment()