#!/usr/bin/env python3
"""
Fix hospital data corruption - clean slate with correct data
"""

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User
from hospital.models.patient import Patient
from hospital.models.hospital_subscription import HospitalSubscription
from datetime import date, timedelta

def fix_hospital_data():
    app = create_app()
    
    with app.app_context():
        print("🗑️ Cleaning up corrupted hospital data...")
        
        # Delete all existing data
        Patient.query.delete()
        HospitalSubscription.query.delete()
        User.query.delete()
        Hospital.query.delete()
        
        print("✅ Cleared all existing data")
        
        # Create clean hospitals
        hospitals_data = [
            {
                "name": "City General Hospital",
                "email": "city@hospital.com",
                "address": "123 Healthcare Avenue, Medical District, Mumbai 400001",
                "phone": "02212345678",
                "license_number": "MH-1234-2024"
            },
            {
                "name": "Apollo Multispecialty Hospital", 
                "email": "apollo@hospital.com",
                "address": "456 Medical District, Apollo Complex, Delhi 110001",
                "phone": "01123456789",
                "license_number": "DL-5678-2024"
            }
        ]
        
        created_hospitals = []
        for hospital_data in hospitals_data:
            hospital = Hospital(
                name=hospital_data["name"],
                email=hospital_data["email"],
                address=hospital_data["address"],
                phone=hospital_data["phone"],
                license_number=hospital_data["license_number"]
            )
            db.session.add(hospital)
            created_hospitals.append(hospital)
            print(f"✅ Created hospital: {hospital_data['name']}")
        
        db.session.flush()  # Get hospital IDs
        
        # Create admin users
        admin_users = []
        for i, hospital in enumerate(created_hospitals):
            admin = User(
                email=hospital.email,
                first_name=hospital.name.split()[0],  # "City" or "Apollo"
                last_name="Admin",
                role="admin",
                hospital_id=hospital.id
            )
            admin.set_password("123")
            db.session.add(admin)
            admin_users.append(admin)
            print(f"✅ Created admin: {hospital.email}")
        
        db.session.flush()  # Get user IDs
        
        # Create subscriptions
        for hospital in created_hospitals:
            subscription = HospitalSubscription(
                hospital_id=hospital.id,
                plan_name="premium",
                max_patients=-1,
                max_doctors=-1,
                max_staff=-1,
                features=["all"],
                subscription_start=date.today(),
                subscription_end=date.today() + timedelta(days=365),
                monthly_fee=199.99
            )
            db.session.add(subscription)
            print(f"✅ Created subscription for: {hospital.name}")
        
        db.session.commit()
        
        print("\n🎉 Hospital data fixed!")
        print("\n📋 Clean Hospital Data:")
        for hospital in created_hospitals:
            print(f"   ID: {hospital.id}, Name: {hospital.name}, Email: {hospital.email}")
        
        return created_hospitals

if __name__ == '__main__':
    fix_hospital_data()