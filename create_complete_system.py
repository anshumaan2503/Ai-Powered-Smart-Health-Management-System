#!/usr/bin/env python3
"""
Create a complete, consistent hospital management system with ALL data
This script ensures hospitals, admins, doctors, patients, and subscriptions are all created together
"""

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User
from hospital.models.patient import Patient
from hospital.models.doctor import Doctor
from hospital.models.hospital_subscription import HospitalSubscription
from datetime import date, timedelta
import random
import uuid

def create_complete_system():
    app = create_app()
    
    with app.app_context():
        print("🏥 Creating Complete Hospital Management System...")
        
        # Clear existing data
        Patient.query.delete()
        Doctor.query.delete()
        HospitalSubscription.query.delete()
        User.query.delete()
        Hospital.query.delete()
        
        print("✅ Cleared existing data")
        
        # 1. Create Hospitals
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
        
        hospitals = []
        for hospital_data in hospitals_data:
            hospital = Hospital(
                name=hospital_data["name"],
                email=hospital_data["email"],
                address=hospital_data["address"],
                phone=hospital_data["phone"],
                license_number=hospital_data["license_number"]
            )
            db.session.add(hospital)
            hospitals.append(hospital)
            print(f"✅ Created hospital: {hospital_data['name']}")
        
        db.session.flush()  # Get hospital IDs
        
        # 2. Create Hospital Admins
        admins = []
        for hospital in hospitals:
            admin = User(
                email=hospital.email,
                first_name=hospital.name.split()[0],  # "City" or "Apollo"
                last_name="Admin",
                role="admin",
                hospital_id=hospital.id
            )
            admin.set_password("123")
            db.session.add(admin)
            admins.append(admin)
            print(f"✅ Created admin: {hospital.email}")
        
        db.session.flush()  # Get admin IDs
        
        # 3. Create Hospital Subscriptions
        for hospital in hospitals:
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
        
        db.session.flush()  # Get subscription IDs
        
        # 4. Create Doctors for each hospital
        doctor_names = [
            {"first_name": "Rajesh", "last_name": "Sharma", "specialization": "Cardiology", "qualification": "MD Cardiology", "experience": 15},
            {"first_name": "Priya", "last_name": "Patel", "specialization": "Neurology", "qualification": "DM Neurology", "experience": 12},
            {"first_name": "Amit", "last_name": "Singh", "specialization": "Orthopedics", "qualification": "MS Orthopedics", "experience": 10},
            {"first_name": "Sunita", "last_name": "Gupta", "specialization": "Pediatrics", "qualification": "MD Pediatrics", "experience": 8},
            {"first_name": "Vikram", "last_name": "Kumar", "specialization": "General Medicine", "qualification": "MBBS, MD", "experience": 20},
            {"first_name": "Kavya", "last_name": "Reddy", "specialization": "Gynecology", "qualification": "MS Gynecology", "experience": 14},
            {"first_name": "Arjun", "last_name": "Nair", "specialization": "Dermatology", "qualification": "MD Dermatology", "experience": 9},
            {"first_name": "Meera", "last_name": "Iyer", "specialization": "Psychiatry", "qualification": "MD Psychiatry", "experience": 11}
        ]
        
        doctors = []
        doctor_index = 0
        for hospital in hospitals:
            # Create 4 doctors per hospital
            for i in range(4):
                doctor_data = doctor_names[doctor_index % len(doctor_names)]
                doctor_index += 1
                
                # Create user account for doctor
                doctor_user = User(
                    email=f"dr.{doctor_data['first_name'].lower()}.{doctor_data['last_name'].lower()}@{hospital.name.lower().replace(' ', '').replace('hospital', '')}.com",
                    first_name=doctor_data['first_name'],
                    last_name=doctor_data['last_name'],
                    phone=f"98765432{random.randint(10, 99)}",
                    role="doctor",
                    hospital_id=hospital.id
                )
                doctor_user.set_password("123")
                db.session.add(doctor_user)
                db.session.flush()  # Get user ID
                
                # Create doctor profile
                doctor = Doctor(
                    doctor_id=f"DOC{str(uuid.uuid4())[:8].upper()}",
                    user_id=doctor_user.id,
                    specialization=doctor_data['specialization'],
                    qualification=doctor_data['qualification'],
                    experience_years=doctor_data['experience'],
                    license_number=f"LIC{str(uuid.uuid4())[:8].upper()}",
                    consultation_fee=random.randint(300, 1000),
                    hospital_id=hospital.id,
                    is_available=True
                )
                db.session.add(doctor)
                doctors.append(doctor)
                print(f"✅ Created doctor: Dr. {doctor_data['first_name']} {doctor_data['last_name']} ({doctor_data['specialization']}) at {hospital.name}")
        
        db.session.flush()  # Get doctor IDs
        
        # 5. Create Patients
        patient_names = [
            {"first_name": "Arjun", "last_name": "Sharma", "phone": "9876543210", "gender": "Male"},
            {"first_name": "Priya", "last_name": "Patel", "phone": "9876543211", "gender": "Female"},
            {"first_name": "Rahul", "last_name": "Singh", "phone": "9876543212", "gender": "Male"},
            {"first_name": "Sneha", "last_name": "Gupta", "phone": "9876543213", "gender": "Female"},
            {"first_name": "Vikram", "last_name": "Kumar", "phone": "9876543214", "gender": "Male"},
            {"first_name": "Anita", "last_name": "Reddy", "phone": "9876543215", "gender": "Female"},
            {"first_name": "Suresh", "last_name": "Nair", "phone": "9876543216", "gender": "Male"},
            {"first_name": "Kavya", "last_name": "Iyer", "phone": "9876543217", "gender": "Female"},
            {"first_name": "Amit", "last_name": "Joshi", "phone": "9876543218", "gender": "Male"},
            {"first_name": "Deepika", "last_name": "Mehta", "phone": "9876543219", "gender": "Female"},
            {"first_name": "Rajesh", "last_name": "Agarwal", "phone": "9876543220", "gender": "Male"},
            {"first_name": "Pooja", "last_name": "Bansal", "phone": "9876543221", "gender": "Female"},
            {"first_name": "Karan", "last_name": "Malhotra", "phone": "9876543222", "gender": "Male"},
            {"first_name": "Ritu", "last_name": "Chopra", "phone": "9876543223", "gender": "Female"},
            {"first_name": "Manish", "last_name": "Verma", "phone": "9876543224", "gender": "Male"},
        ]
        
        patients = []
        for i, patient_data in enumerate(patient_names):
            # Distribute patients across hospitals
            hospital = hospitals[i % len(hospitals)]
            
            # Create user account for patient
            patient_user = User(
                email=f"{patient_data['first_name'].lower()}@patient.com",
                first_name=patient_data['first_name'],
                last_name=patient_data['last_name'],
                phone=patient_data['phone'],
                role="patient",
                is_active=True
            )
            patient_user.set_password("123")
            db.session.add(patient_user)
            db.session.flush()  # Get user ID
            
            # Create patient profile
            patient = Patient(
                user_id=patient_user.id,
                patient_id=f"PAT{str(patient_user.id).zfill(4)}",
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
                hospital_id=hospital.id
            )
            db.session.add(patient)
            patients.append(patient)
            print(f"✅ Created patient: {patient_data['first_name']} {patient_data['last_name']} at {hospital.name}")
        
        # Commit all changes
        db.session.commit()
        
        print("\n🎉 COMPLETE SYSTEM CREATED SUCCESSFULLY!")
        print("\n📊 Summary:")
        print(f"   🏥 Hospitals: {len(hospitals)}")
        print(f"   👨‍💼 Hospital Admins: {len(admins)}")
        print(f"   👨‍⚕️ Doctors: {len(doctors)}")
        print(f"   👤 Patients: {len(patients)}")
        print(f"   💳 Subscriptions: {len(hospitals)}")
        
        print("\n🔑 Login Credentials:")
        print("   Hospital Admins (password: 123):")
        for hospital in hospitals:
            print(f"     - {hospital.email}")
        
        print("\n   Patients (password: 123):")
        for patient_data in patient_names[:6]:  # Show first 6
            print(f"     - {patient_data['first_name'].lower()}@patient.com")
        print(f"     ... and {len(patient_names)-6} more patients")
        
        print("\n✅ ALL DATA IS NOW CONSISTENT AND COMPLETE!")
        
        return {
            'hospitals': hospitals,
            'admins': admins,
            'doctors': doctors,
            'patients': patients
        }

if __name__ == '__main__':
    create_complete_system()