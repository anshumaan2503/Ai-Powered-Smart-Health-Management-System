#!/usr/bin/env python3
"""
Create dummy Indian patients for testing
"""

from hospital import create_app, db
from hospital.models.user import User
from hospital.models.patient import Patient
from hospital.models.hospital import Hospital
from datetime import datetime, date
import random

def create_dummy_patients():
    app = create_app()
    
    with app.app_context():
        # Indian patient names
        indian_patients = [
            {"first_name": "Arjun", "last_name": "Sharma", "phone": "9876543210", "age": 28, "gender": "Male"},
            {"first_name": "Priya", "last_name": "Patel", "phone": "9876543211", "age": 32, "gender": "Female"},
            {"first_name": "Rahul", "last_name": "Singh", "phone": "9876543212", "age": 25, "gender": "Male"},
            {"first_name": "Sneha", "last_name": "Gupta", "phone": "9876543213", "age": 29, "gender": "Female"},
            {"first_name": "Vikram", "last_name": "Kumar", "phone": "9876543214", "age": 35, "gender": "Male"},
            {"first_name": "Anita", "last_name": "Reddy", "phone": "9876543215", "age": 27, "gender": "Female"},
            {"first_name": "Suresh", "last_name": "Nair", "phone": "9876543216", "age": 42, "gender": "Male"},
            {"first_name": "Kavya", "last_name": "Iyer", "phone": "9876543217", "age": 24, "gender": "Female"},
            {"first_name": "Amit", "last_name": "Joshi", "phone": "9876543218", "age": 38, "gender": "Male"},
            {"first_name": "Deepika", "last_name": "Mehta", "phone": "9876543219", "age": 31, "gender": "Female"},
            {"first_name": "Rajesh", "last_name": "Agarwal", "phone": "9876543220", "age": 45, "gender": "Male"},
            {"first_name": "Pooja", "last_name": "Bansal", "phone": "9876543221", "age": 26, "gender": "Female"},
            {"first_name": "Karan", "last_name": "Malhotra", "phone": "9876543222", "age": 33, "gender": "Male"},
            {"first_name": "Ritu", "last_name": "Chopra", "phone": "9876543223", "age": 30, "gender": "Female"},
            {"first_name": "Manish", "last_name": "Verma", "phone": "9876543224", "age": 37, "gender": "Male"},
        ]
        
        # Get some hospitals to assign patients to
        hospitals = Hospital.query.limit(5).all()
        if not hospitals:
            print("❌ No hospitals found. Please create hospitals first.")
            return
        
        print(f"Creating {len(indian_patients)} dummy patients...")
        
        for i, patient_data in enumerate(indian_patients):
            # Create email
            email = f"{patient_data['first_name'].lower()}@patient.com"
            
            # Check if patient already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                print(f"⚠️  Patient {email} already exists, skipping...")
                continue
            
            # Create user account for patient
            user = User(
                email=email,
                first_name=patient_data['first_name'],
                last_name=patient_data['last_name'],
                phone=patient_data['phone'],
                role='patient',
                is_active=True
            )
            user.set_password('123')
            
            db.session.add(user)
            db.session.flush()  # Get user ID
            
            # Create patient profile
            patient = Patient(
                user_id=user.id,
                patient_id=f"PAT{str(user.id).zfill(4)}",
                date_of_birth=date(1990 + random.randint(-15, 15), random.randint(1, 12), random.randint(1, 28)),
                gender=patient_data['gender'],
                blood_group=random.choice(['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-']),
                address=f"{random.randint(1, 999)}, {random.choice(['MG Road', 'Park Street', 'Brigade Road', 'Commercial Street', 'Residency Road'])}, {random.choice(['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad'])}",
                emergency_contact_name=f"{random.choice(['Father', 'Mother', 'Spouse', 'Brother', 'Sister'])} - {random.choice(['Ramesh', 'Sunita', 'Prakash', 'Meera', 'Sunil'])}",
                emergency_contact_phone=f"98765432{random.randint(25, 99)}",
                medical_history=random.choice([
                    'No significant medical history',
                    'Hypertension, controlled with medication',
                    'Diabetes Type 2, on insulin',
                    'Asthma, uses inhaler',
                    'Previous surgery: Appendectomy (2018)'
                ]),
                allergies=random.choice([
                    'No known allergies',
                    'Penicillin allergy',
                    'Dust and pollen allergies',
                    'Shellfish allergy',
                    'Lactose intolerant'
                ]),
                # Assign to random hospital
                hospital_id=random.choice(hospitals).id
            )
            
            db.session.add(patient)
            print(f"✅ Created patient: {email} (Password: 123)")
        
        db.session.commit()
        print(f"\n🎉 Successfully created {len(indian_patients)} dummy patients!")
        print("\n📋 Patient Login Credentials:")
        for patient_data in indian_patients:
            email = f"{patient_data['first_name'].lower()}@patient.com"
            print(f"   Email: {email}, Password: 123")
        
        print(f"\n🏥 Patients distributed across {len(hospitals)} hospitals")
        print("✅ Patients will be visible in both patient dashboard and hospital management system")

if __name__ == '__main__':
    create_dummy_patients()