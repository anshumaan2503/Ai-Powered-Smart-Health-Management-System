#!/usr/bin/env python3
"""
Fix hospital subscription issue
"""

import sys
import os
from datetime import datetime, timedelta

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.user import User
from hospital.models.hospital import Hospital
from hospital.models.hospital_subscription import HospitalSubscription

def main():
    """Fix hospital subscription"""
    app = create_app()
    
    with app.app_context():
        print("💳 Fixing Hospital Subscription")
        print("=" * 40)
        
        # Find City Hospital
        city_hospital = Hospital.query.filter(
            Hospital.name.like('%City%')
        ).first()
        
        if not city_hospital:
            print("❌ City Hospital not found!")
            return
        
        print(f"🏥 Hospital: {city_hospital.name} (ID: {city_hospital.id})")
        
        # Check existing subscription
        existing_subscription = HospitalSubscription.query.filter_by(
            hospital_id=city_hospital.id
        ).first()
        
        if existing_subscription:
            print(f"📋 Found existing subscription:")
            print(f"   Plan: {existing_subscription.plan_name}")
            print(f"   Status: {'Active' if existing_subscription.is_active else 'Inactive'}")
            print(f"   Start Date: {existing_subscription.subscription_start}")
            print(f"   End Date: {existing_subscription.subscription_end}")
            
            # Update subscription to be active
            existing_subscription.is_active = True
            existing_subscription.subscription_start = datetime.utcnow().date()
            existing_subscription.subscription_end = (datetime.utcnow() + timedelta(days=365)).date()  # 1 year
            existing_subscription.plan_name = 'premium'
            
            db.session.commit()
            print(f"✅ Updated subscription to active!")
            
        else:
            print(f"❌ No subscription found. Creating new one...")
            
            # Create new active subscription
            subscription = HospitalSubscription(
                hospital_id=city_hospital.id,
                plan_name='premium',
                subscription_start=datetime.utcnow().date(),
                subscription_end=(datetime.utcnow() + timedelta(days=365)).date(),  # 1 year
                max_doctors=100,
                max_patients=10000,
                max_staff=50,
                is_active=True,
                monthly_fee=999.0,
                features=['all_features', 'analytics', 'import_export', 'unlimited_storage']
            )
            
            db.session.add(subscription)
            db.session.commit()
            print(f"✅ Created new active subscription!")
        
        # Verify final subscription status
        final_subscription = HospitalSubscription.query.filter_by(
            hospital_id=city_hospital.id
        ).first()
        
        if final_subscription:
            print(f"\n🎉 Final Subscription Status:")
            print(f"   Plan: {final_subscription.plan_name}")
            print(f"   Status: {'Active' if final_subscription.is_active else 'Inactive'}")
            print(f"   Valid Until: {final_subscription.subscription_end}")
            print(f"   Max Doctors: {final_subscription.max_doctors}")
            print(f"   Max Patients: {final_subscription.max_patients}")
            
            print(f"\n🔑 Your Login Should Work Now:")
            print(f"   Email: city@hospital.com")
            print(f"   Password: Cityhospital123")
            print(f"   Hospital: {city_hospital.name}")
            print(f"   Subscription: Active ✅")

if __name__ == '__main__':
    main()