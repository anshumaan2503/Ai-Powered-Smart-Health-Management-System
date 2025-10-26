#!/usr/bin/env python3
"""
Test hospital subscription access
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.hospital_subscription import HospitalSubscription
from hospital.models.user import User

def test_subscriptions():
    app = create_app()
    
    with app.app_context():
        print("🔍 Testing Hospital Subscription Access...")
        print("=" * 50)
        
        # Test a few key hospitals
        test_hospitals = ['apollo2@hospital.com', 'fortis2@hospital.com', 'max2@hospital.com']
        
        for email in test_hospitals:
            user = User.query.filter_by(email=email).first()
            if user and user.hospital_id:
                hospital = Hospital.query.get(user.hospital_id)
                subscription = HospitalSubscription.query.filter_by(hospital_id=hospital.id).first()
                
                print(f"\n🏥 {hospital.name}")
                print(f"   📧 Email: {email}")
                if subscription:
                    print(f"   📋 Plan: {subscription.plan_name}")
                    print(f"   ✅ Active: {subscription.is_active}")
                    print(f"   📅 Valid Until: {subscription.subscription_end}")
                    print(f"   👥 Max Doctors: {subscription.max_doctors}")
                    print(f"   🏥 Max Patients: {subscription.max_patients}")
                else:
                    print("   ❌ No subscription found!")
        
        print(f"\n📊 Total Active Subscriptions: {HospitalSubscription.query.filter_by(is_active=True).count()}")
        print("✅ All hospitals should now have dashboard access!")

if __name__ == "__main__":
    test_subscriptions()