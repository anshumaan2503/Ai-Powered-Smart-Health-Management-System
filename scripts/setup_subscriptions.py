#!/usr/bin/env python3
"""
Setup subscriptions for existing hospitals
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models import Hospital
from hospital.models.hospital_subscription import HospitalSubscription
from datetime import datetime, timedelta

def setup_subscriptions():
    """Create default subscriptions for hospitals that don't have one"""
    
    app = create_app()
    
    with app.app_context():
        print("🏥 Setting up subscriptions for existing hospitals...")
        
        # Get all hospitals
        hospitals = Hospital.query.all()
        
        if not hospitals:
            print("❌ No hospitals found in database")
            return
            
        created_count = 0
        
        for hospital in hospitals:
            # Check if hospital already has a subscription
            existing_subscription = HospitalSubscription.query.filter_by(
                hospital_id=hospital.id,
                is_active=True
            ).first()
            
            if existing_subscription:
                print(f"✅ {hospital.name} already has an active subscription ({existing_subscription.plan_name})")
                continue
                
            # Create default subscription (Standard plan for demo)
            subscription = HospitalSubscription(
                hospital_id=hospital.id,
                plan_name='standard',
                max_patients=100,
                max_doctors=10,
                max_staff=20,
                features=[
                    'appointments', 'billing', 'records', 'email_support', 'mobile_app',
                    'analytics', 'whatsapp_notifications', 'data_export', 'priority_support',
                    'patient_portal', 'inventory'
                ],
                subscription_start=datetime.utcnow().date(),
                subscription_end=(datetime.utcnow() + timedelta(days=365)).date(),  # 1 year
                monthly_fee=7499.0,
                is_active=True
            )
            
            db.session.add(subscription)
            created_count += 1
            
            print(f"✅ Created Standard subscription for {hospital.name}")
        
        if created_count > 0:
            db.session.commit()
            print(f"\n🎉 Successfully created {created_count} subscriptions!")
        else:
            print("\n✅ All hospitals already have active subscriptions")
            
        # Display summary
        print("\n📊 Subscription Summary:")
        print("-" * 50)
        
        all_subscriptions = HospitalSubscription.query.filter_by(is_active=True).all()
        plan_counts = {}
        
        for sub in all_subscriptions:
            plan_counts[sub.plan_name] = plan_counts.get(sub.plan_name, 0) + 1
            
        for plan, count in plan_counts.items():
            print(f"{plan.title()}: {count} hospitals")
            
        print(f"\nTotal active subscriptions: {len(all_subscriptions)}")

if __name__ == '__main__':
    setup_subscriptions()