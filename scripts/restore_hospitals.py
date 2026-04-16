#!/usr/bin/env python3
"""
Restore all the hospitals that were deleted when we recreated the database
"""

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User
from hospital.models.hospital_subscription import HospitalSubscription
from datetime import date, timedelta
import random

def restore_hospitals():
    app = create_app()
    
    with app.app_context():
        # List of hospitals that were there before (from the earlier output)
        hospitals_data = [
            {"name": "City General Hospital", "email": "city@hospital.com", "phone": "02212345678", "address": "123 Healthcare Avenue, Medical District, Mumbai 400001", "license": "MH-1234-2024"},
            {"name": "Apollo Multispecialty Hospital", "email": "apollo@hospital.com", "phone": "00358718703", "address": "00, Doshi, Mumbai, Maharashtra - 227766", "license": "LIC489673"},
            {"name": "Fortis Healthcare Center", "email": "fortis@hospital.com", "phone": "6932211596", "address": "H.No. 80, Thakkar, Delhi, Delhi - 306925", "license": "LIC165086"},
            {"name": "Max Super Specialty Hospital", "email": "max@hospital.com", "phone": "6145250511", "address": "73, Kothari Road, Bangalore, Karnataka - 941683", "license": "LIC185729"},
            {"name": "Manipal Medical Center", "email": "manipal@hospital.com", "phone": "03435387500", "address": "H.No. 077, Oommen Road, Pune, Maharashtra - 699326", "license": "LIC852458"},
            {"name": "AIIMS Satellite Hospital", "email": "aiimssatellite@hospital.com", "phone": "4044129341", "address": "H.No. 32, Shanker Marg, Chennai, Tamil Nadu - 105051", "license": "LIC709665"},
            {"name": "Narayana Health Hospital", "email": "narayanahealth@hospital.com", "phone": "8882677185", "address": "229, Bhakta Nagar, Hyderabad, Telangana - 125235", "license": "LIC586258"},
            {"name": "Kokilaben Dhirubhai Ambani Hospital", "email": "kokilaben@hospital.com", "phone": "01748150364", "address": "73, Soni Street, Ahmedabad, Gujarat - 107813", "license": "LIC971792"},
            {"name": "Ruby Hall Clinic", "email": "rubyhall@hospital.com", "phone": "09440939671", "address": "H.No. 09, Bawa Road, Kolkata, West Bengal - 273544", "license": "LIC843122"},
            {"name": "Medanta Healthcare", "email": "medanta@hospital.com", "phone": "08969176341", "address": "93/93, Palla Street, Jaipur, Rajasthan - 525550", "license": "LIC590585"},
            {"name": "Sankara Nethralaya Hospital", "email": "sankaranethralaya@hospital.com", "phone": "4558867073", "address": "34, Krishnan Street, Kochi, Kerala - 893130", "license": "LIC489714"},
            {"name": "Apollo Multispecialty Hospital - Branch 2", "email": "apollo2@hospital.com", "phone": "02771303235", "address": "13, Seshadri Path, Mumbai, Maharashtra - 608463", "license": "LIC708309"},
            {"name": "Fortis Healthcare Center - Branch 2", "email": "fortis2@hospital.com", "phone": "0992272814", "address": "833, Modi, Delhi, Delhi - 367665", "license": "LIC753110"},
            {"name": "Max Super Specialty Hospital - Branch 2", "email": "max2@hospital.com", "phone": "+911238912886", "address": "H.No. 61, Apte Road, Bangalore, Karnataka - 098883", "license": "LIC521033"},
            {"name": "Manipal Medical Center - Branch 2", "email": "manipal2@hospital.com", "phone": "3196286303", "address": "H.No. 166, Rajagopal Ganj, Pune, Maharashtra - 583670", "license": "LIC499193"},
            {"name": "AIIMS Satellite Hospital - Branch 2", "email": "aiims2@hospital.com", "phone": "5498495510", "address": "19/043, Minhas Zila, Chennai, Tamil Nadu - 968096", "license": "LIC812989"},
            {"name": "Narayana Health Hospital - Branch 2", "email": "narayana2@hospital.com", "phone": "6837143873", "address": "08/091, Iyer Nagar, Hyderabad, Telangana - 327254", "license": "LIC556458"},
            {"name": "Ruby Hall Clinic - Branch 2", "email": "ruby2@hospital.com", "phone": "7850905917", "address": "63/42, Toor Zila, Kolkata, West Bengal - 292800", "license": "LIC964760"},
            {"name": "Medanta Healthcare - Branch 2", "email": "medanta2@hospital.com", "phone": "+911949093040", "address": "892, Suresh, Jaipur, Rajasthan - 179041", "license": "LIC622639"},
        ]
        
        print(f"Restoring {len(hospitals_data)} hospitals...")
        
        for i, hospital_data in enumerate(hospitals_data):
            # Check if hospital already exists
            existing_hospital = Hospital.query.filter_by(email=hospital_data['email']).first()
            if existing_hospital:
                print(f"⚠️  Hospital {hospital_data['email']} already exists, skipping...")
                continue
            
            # Create hospital
            hospital = Hospital(
                name=hospital_data['name'],
                address=hospital_data['address'],
                phone=hospital_data['phone'],
                email=hospital_data['email'],
                license_number=hospital_data['license']
            )
            
            db.session.add(hospital)
            db.session.flush()  # Get hospital ID
            
            # Create admin user for hospital
            admin_user = User(
                email=hospital_data['email'],
                first_name=hospital_data['name'].split()[0],  # First word of hospital name
                last_name='Admin',
                role='admin',
                hospital_id=hospital.id
            )
            admin_user.set_password('123')
            
            db.session.add(admin_user)
            
            # Create subscription for hospital
            subscription = HospitalSubscription(
                hospital_id=hospital.id,
                plan_name=random.choice(['basic', 'premium', 'enterprise']),
                max_patients=-1,  # Unlimited
                max_doctors=-1,   # Unlimited
                max_staff=-1,     # Unlimited
                features=['appointments', 'billing', 'records', 'analytics'],
                subscription_start=date.today(),
                subscription_end=date.today() + timedelta(days=365),
                monthly_fee=random.choice([99.99, 199.99, 299.99])
            )
            
            db.session.add(subscription)
            print(f"✅ Created hospital: {hospital_data['name']} ({hospital_data['email']})")
        
        db.session.commit()
        
        # Update existing hospitals to have subscriptions if they don't
        existing_hospitals = Hospital.query.all()
        for hospital in existing_hospitals:
            existing_sub = HospitalSubscription.query.filter_by(hospital_id=hospital.id).first()
            if not existing_sub:
                subscription = HospitalSubscription(
                    hospital_id=hospital.id,
                    plan_name='premium',
                    max_patients=-1,
                    max_doctors=-1,
                    max_staff=-1,
                    features=['all'],
                    subscription_start=date.today(),
                    subscription_end=date.today() + timedelta(days=365),
                    monthly_fee=199.99
                )
                db.session.add(subscription)
        
        db.session.commit()
        
        # Final count
        total_hospitals = Hospital.query.count()
        total_admins = User.query.filter_by(role='admin').count()
        
        print(f"\n🎉 Hospital restoration complete!")
        print(f"📊 Total hospitals: {total_hospitals}")
        print(f"👥 Total hospital admins: {total_admins}")
        print(f"🔑 All admins can login with password: 123")

if __name__ == '__main__':
    restore_hospitals()