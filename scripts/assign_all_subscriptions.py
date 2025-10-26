#!/usr/bin/env python3
"""
Assign active subscriptions to all hospitals
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.hospital_subscription import HospitalSubscription
from datetime import datetime, timedelta

def assign_subscriptions():
    app = create_app()
    
    with app.app_context():
        print("🏥 Assigning Active Subscriptions to All Hospitals...")
        print("=" * 60)
        
        # Get all hospitals
        hospitals = Hospital.query.all()
        
        subscription_plans = ['basic', 'premium', 'enterprise']
        
        for i, hospital in enumerate(hospitals):
            # Assign different plans cyclically
            plan = subscription_plans[i % len(subscription_plans)]
            
            # Check if subscription exists
            existing_sub = HospitalSubscription.query.filter_by(hospital_id=hospital.id).first()
            
            if existing_sub:
                # Update existing subscription
                existing_sub.plan_name = plan
                existing_sub.is_active = True
                existing_sub.subscription_start = datetime.utcnow().date()
                existing_sub.subscription_end = (datetime.utcnow() + timedelta(days=365)).date()
                existing_sub.max_doctors = -1  # Unlimited
                existing_sub.max_patients = -1  # Unlimited
                existing_sub.max_staff = -1  # Unlimited
                existing_sub.monthly_fee = 99.99 if plan == 'basic' else 199.99 if plan == 'premium' else 299.99
                print(f"✅ Updated {hospital.name}: {plan} plan (Active)")
            else:
                # Create new subscription
                new_sub = HospitalSubscription(
                    hospital_id=hospital.id,
                    plan_name=plan,
                    is_active=True,
                    subscription_start=datetime.utcnow().date(),
                    subscription_end=(datetime.utcnow() + timedelta(days=365)).date(),
                    max_doctors=-1,  # Unlimited
                    max_patients=-1,  # Unlimited
                    max_staff=-1,  # Unlimited
                    monthly_fee=99.99 if plan == 'basic' else 199.99 if plan == 'premium' else 299.99,
                    features=['analytics', 'appointments', 'patients', 'doctors', 'staff']
                )
                db.session.add(new_sub)
                print(f"✅ Created {hospital.name}: {plan} plan (Active)")
        
        # Commit all changes
        db.session.commit()
        
        print("\n🎉 All hospitals now have active subscriptions!")
        print(f"📊 Total hospitals updated: {len(hospitals)}")
        print("\n📋 Subscription Distribution:")
        
        # Show distribution
        basic_count = len([h for i, h in enumerate(hospitals) if i % 3 == 0])
        premium_count = len([h for i, h in enumerate(hospitals) if i % 3 == 1])
        enterprise_count = len([h for i, h in enumerate(hospitals) if i % 3 == 2])
        
        print(f"   - Basic: {basic_count} hospitals")
        print(f"   - Premium: {premium_count} hospitals")
        print(f"   - Enterprise: {enterprise_count} hospitals")
        
        print("\n✅ All hospitals can now access their dashboards!")

if __name__ == "__main__":
    assign_subscriptions()