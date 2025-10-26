#!/usr/bin/env python3
"""
Script to create the remaining fake hospitals that don't exist yet
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models import (
    Hospital, User, Patient, Doctor, Appointment, Medicine, StockMovement,
    MedicalRecord, Prescription
)
import bcrypt
from datetime import datetime, date, timedelta, time
import random
from faker import Faker

# Use Indian locale for realistic Indian names and data
fake = Faker('en_IN')

# Remaining hospitals to create
REMAINING_HOSPITALS = [
    {
        'name': 'Apollo Multispecialty Hospital',
        'email': 'apollo2@hospital.com',
        'type': 'Multi-specialty',
        'city': 'Mumbai',
        'state': 'Maharashtra'
    },
    {
        'name': 'Fortis Healthcare Center',
        'email': 'fortis2@hospital.com',
        'type': 'General Hospital',
        'city': 'Delhi',
        'state': 'Delhi'
    },
    {
        'name': 'Max Super Specialty Hospital',
        'email': 'max2@hospital.com',
        'type': 'Super Specialty',
        'city': 'Bangalore',
        'state': 'Karnataka'
    },
    {
        'name': 'Manipal Medical Center',
        'email': 'manipal2@hospital.com',
        'type': 'Medical Center',
        'city': 'Pune',
        'state': 'Maharashtra'
    },
    {
        'name': 'AIIMS Satellite Hospital',
        'email': 'aiims2@hospital.com',
        'type': 'Government Hospital',
        'city': 'Chennai',
        'state': 'Tamil Nadu'
    },
    {
        'name': 'Narayana Health Hospital',
        'email': 'narayana2@hospital.com',
        'type': 'Multi-specialty',
        'city': 'Hyderabad',
        'state': 'Telangana'
    },
    {
        'name': 'Ruby Hall Clinic',
        'email': 'ruby2@hospital.com',
        'type': 'Private Hospital',
        'city': 'Kolkata',
        'state': 'West Bengal'
    },
    {
        'name': 'Medanta Healthcare',
        'email': 'medanta2@hospital.com',
        'type': 'Multi-specialty',
        'city': 'Jaipur',
        'state': 'Rajasthan'
    }
]

# Medical specializations
SPECIALIZATIONS = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology',
    'Dermatology', 'Psychiatry', 'Oncology', 'Gastroenterology', 'Pulmonology',
    'Nephrology', 'Endocrinology', 'Ophthalmology', 'ENT', 'General Medicine',
    'Surgery', 'Anesthesiology', 'Radiology', 'Pathology', 'Emergency Medicine'
]

# Indian medicine data
INDIAN_MEDICINES = [
    {
        'name': 'Paracetamol', 'brand': 'Crocin', 'manufacturer': 'GlaxoSmithKline',
        'category': 'Analgesic', 'strength': '650mg', 'cost': 15, 'mrp': 30
    },
    {
        'name': 'Amoxicillin', 'brand': 'Amoxil', 'manufacturer': 'GlaxoSmithKline',
        'category': 'Antibiotic', 'strength': '500mg', 'cost': 45, 'mrp': 75
    },
    {
        'name': 'Metformin', 'brand': 'Glycomet', 'manufacturer': 'USV',
        'category': 'Antidiabetic', 'strength': '500mg', 'cost': 35, 'mrp': 65
    },
    {
        'name': 'Amlodipine', 'brand': 'Norvasc', 'manufacturer': 'Pfizer',
        'category': 'Antihypertensive', 'strength': '5mg', 'cost': 28, 'mrp': 52
    },
    {
        'name': 'Omeprazole', 'brand': 'Prilosec', 'manufacturer': 'Dr. Reddy\'s',
        'category': 'Antacid', 'strength': '20mg', 'cost': 45, 'mrp': 78
    },
    {
        'name': 'Cetirizine', 'brand': 'Zyrtec', 'manufacturer': 'UCB',
        'category': 'Antihistamine', 'strength': '10mg', 'cost': 18, 'mrp': 38
    },
    {
        'name': 'Azithromycin', 'brand': 'Azithral', 'manufacturer': 'Alembic',
        'category': 'Antibiotic', 'strength': '250mg', 'cost': 85, 'mrp': 135
    },
    {
        'name': 'Vitamin D3', 'brand': 'Calcirol', 'manufacturer': 'Cadila',
        'category': 'Vitamin', 'strength': '60000 IU', 'cost': 45, 'mrp': 78
    },
    {
        'name': 'Insulin', 'brand': 'Humulin', 'manufacturer': 'Eli Lilly',
        'category': 'Injection', 'strength': '100 IU/ml', 'cost': 285, 'mrp': 485
    },
    {
        'name': 'Diclofenac', 'brand': 'Voveran', 'manufacturer': 'Novartis',
        'category': 'Analgesic', 'strength': '50mg', 'cost': 18, 'mrp': 38
    }
]

# Common Indian diseases/conditions
MEDICAL_CONDITIONS = [
    'Hypertension', 'Diabetes Type 2', 'Asthma', 'Arthritis', 'Migraine',
    'Gastritis', 'Thyroid Disorder', 'Heart Disease', 'Kidney Stones',
    'Allergic Rhinitis', 'Depression', 'Anxiety', 'Back Pain', 'Fever',
    'Common Cold', 'Skin Allergy', 'Eye Infection', 'Dental Problems'
]

def create_hospital_with_data(hospital_info):
    """Create a hospital with complete dummy data"""
    print(f"Creating hospital: {hospital_info['name']}")
    
    # Create hospital
    hospital = Hospital(
        name=hospital_info['name'],
        address=f"{fake.building_number()}, {fake.street_name()}, {hospital_info['city']}, {hospital_info['state']} - {fake.postcode()}",
        phone=fake.phone_number(),
        email=hospital_info['email'],
        license_number=f"LIC{random.randint(100000, 999999)}",
        is_active=True
    )
    
    db.session.add(hospital)
    db.session.flush()  # Get hospital ID
    
    # Create admin user for hospital login
    admin_user = User(
        email=hospital.email,
        first_name='Hospital',
        last_name='Admin',
        phone=hospital.phone,
        role='admin',
        is_active=True,
        hospital_id=hospital.id
    )
    admin_user.set_password('123')
    db.session.add(admin_user)
    
    # Create doctors (5-15 per hospital)
    doctors_created = 0
    for _ in range(random.randint(5, 15)):
        try:
            first_name = fake.first_name()
            last_name = fake.last_name()
            
            doctor_user = User(
                email=f"dr.{first_name.lower()}.{last_name.lower()}.{random.randint(1000, 9999)}@hospital.com",
                first_name=first_name,
                last_name=last_name,
                phone=fake.phone_number(),
                role='doctor',
                is_active=True,
                hospital_id=hospital.id
            )
            doctor_user.set_password('123')
            db.session.add(doctor_user)
            db.session.flush()
            
            doctor = Doctor(
                doctor_id=f"DOC{random.randint(100000, 999999)}",
                user_id=doctor_user.id,
                hospital_id=hospital.id,
                specialization=random.choice(SPECIALIZATIONS),
                license_number=f"LIC{random.randint(100000, 999999)}",
                experience_years=random.randint(1, 30),
                qualification=random.choice(['MBBS', 'MBBS, MD', 'MBBS, MS', 'MBBS, DNB']),
                consultation_fee=random.randint(300, 2000),
                available_days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
                available_hours="09:00-17:00",
                is_available=True
            )
            db.session.add(doctor)
            doctors_created += 1
        except Exception as e:
            print(f"Error creating doctor: {e}")
            continue
    
    # Create nurses and staff (10-25 per hospital)
    staff_created = 0
    for _ in range(random.randint(10, 25)):
        try:
            first_name = fake.first_name()
            last_name = fake.last_name()
            role = random.choice(['nurse', 'receptionist', 'technician', 'pharmacist'])
            
            staff_user = User(
                email=f"{first_name.lower()}.{last_name.lower()}.{random.randint(1000, 9999)}@hospital.com",
                first_name=first_name,
                last_name=last_name,
                phone=fake.phone_number(),
                role=role,
                is_active=True,
                hospital_id=hospital.id
            )
            staff_user.set_password('123')
            db.session.add(staff_user)
            staff_created += 1
        except Exception as e:
            print(f"Error creating staff: {e}")
            continue
    
    # Create patients (20-50 per hospital)
    patients_created = 0
    for _ in range(random.randint(20, 50)):
        try:
            first_name = fake.first_name()
            last_name = fake.last_name()
            birth_date = fake.date_of_birth(minimum_age=1, maximum_age=90)
            
            patient = Patient(
                patient_id=f"PAT{random.randint(100000, 999999)}",
                hospital_id=hospital.id,
                first_name=first_name,
                last_name=last_name,
                date_of_birth=birth_date,
                gender=random.choice(['Male', 'Female']),
                phone=fake.phone_number(),
                email=f"{first_name.lower()}.{last_name.lower()}.{random.randint(1000, 9999)}@gmail.com",
                address=fake.address(),
                emergency_contact_name=fake.name(),
                emergency_contact_phone=fake.phone_number(),
                blood_group=random.choice(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
                medical_history=random.choice(MEDICAL_CONDITIONS),
                allergies=random.choice(['None', 'Penicillin', 'Dust', 'Pollen', 'Food allergies'])
            )
            db.session.add(patient)
            patients_created += 1
        except Exception as e:
            print(f"Error creating patient: {e}")
            continue
    
    # Create medicines (15-30 per hospital)
    medicines_created = 0
    selected_medicines = random.sample(INDIAN_MEDICINES, min(len(INDIAN_MEDICINES), random.randint(8, 10)))
    
    for med_data in selected_medicines:
        try:
            medicine = Medicine(
                hospital_id=hospital.id,
                name=med_data['name'],
                generic_name=med_data['name'],
                brand_name=med_data['brand'],
                manufacturer=med_data['manufacturer'],
                category=med_data['category'],
                strength=med_data['strength'],
                dosage_form=random.choice(['Tablet', 'Capsule', 'Syrup', 'Injection']),
                batch_number=f"BT{random.randint(100000, 999999)}",
                quantity_in_stock=random.randint(10, 500),
                unit_of_measurement='pieces',
                reorder_level=random.randint(5, 25),
                max_stock_level=random.randint(200, 1000),
                cost_price=med_data['cost'],
                selling_price=med_data['cost'] + random.randint(10, 30),
                mrp=med_data['mrp'],
                discount_percentage=random.randint(0, 15),
                manufacturing_date=fake.date_between(start_date='-2y', end_date='-6m'),
                expiry_date=fake.date_between(start_date='+6m', end_date='+3y'),
                storage_location=f"Rack {random.choice(['A', 'B', 'C'])}{random.randint(1, 10)}",
                storage_temperature=random.choice(['Room Temperature', 'Cool Place', 'Refrigerate']),
                drug_license_number=f"DL{random.randint(10000, 99999)}",
                schedule=random.choice([None, 'H', 'H1']),
                prescription_required=random.choice([True, False]),
                is_active=True
            )
            db.session.add(medicine)
            db.session.flush()
            
            # Create initial stock movement
            stock_movement = StockMovement(
                medicine_id=medicine.id,
                hospital_id=hospital.id,
                movement_type='IN',
                quantity=medicine.quantity_in_stock,
                unit_cost=medicine.cost_price,
                total_cost=medicine.cost_price * medicine.quantity_in_stock,
                reference_type='INITIAL_STOCK',
                batch_number=medicine.batch_number,
                expiry_date=medicine.expiry_date,
                supplier_name=random.choice(['Apollo Pharmacy', 'MedPlus', 'Netmeds']),
                notes='Initial inventory setup'
            )
            db.session.add(stock_movement)
            medicines_created += 1
        except Exception as e:
            print(f"Error creating medicine: {e}")
            continue
    
    # Commit all data for this hospital
    try:
        db.session.commit()
        print(f"✅ Created {hospital_info['name']} with:")
        print(f"   - {doctors_created} doctors")
        print(f"   - {staff_created} staff members")
        print(f"   - {patients_created} patients")
        print(f"   - {medicines_created} medicines")
        print(f"   - Login: {hospital.email} / Password: 123")
        return hospital
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating hospital {hospital_info['name']}: {e}")
        return None

def create_appointments_and_records(hospital):
    """Create appointments and medical records for the hospital"""
    try:
        # Get doctors and patients for this hospital
        doctors = Doctor.query.filter_by(hospital_id=hospital.id).all()
        patients = Patient.query.filter_by(hospital_id=hospital.id).all()
        
        if not doctors or not patients:
            return
        
        appointments_created = 0
        records_created = 0
        
        # Create 10-30 appointments per hospital
        for _ in range(random.randint(10, 30)):
            try:
                doctor = random.choice(doctors)
                patient = random.choice(patients)
                
                # Create appointment (mix of past, present, and future)
                appointment_date = fake.date_between(start_date='-3m', end_date='+1m')
                # Create a proper time object
                appointment_time = time(
                    hour=random.randint(9, 17),
                    minute=random.choice([0, 15, 30, 45])
                )
                
                # Combine date and time into datetime
                appointment_datetime = datetime.combine(appointment_date, appointment_time)
                
                appointment = Appointment(
                    appointment_id=f"APT{random.randint(100000, 999999)}",
                    hospital_id=hospital.id,
                    patient_id=patient.id,
                    doctor_id=doctor.id,
                    appointment_date=appointment_datetime,
                    appointment_type=random.choice(['consultation', 'follow-up', 'emergency']),
                    status=random.choice(['scheduled', 'completed', 'cancelled']),
                    symptoms=random.choice(['Regular Checkup', 'Follow-up', 'Emergency', 'Consultation']),
                    notes=fake.text(max_nb_chars=200),
                    consultation_fee=doctor.consultation_fee
                )
                db.session.add(appointment)
                db.session.flush()
                appointments_created += 1
                
                # Create medical record for completed appointments
                if appointment.status == 'completed' and random.choice([True, False]):
                    try:
                        record = MedicalRecord(
                            hospital_id=hospital.id,
                            patient_id=patient.id,
                            doctor_id=doctor.id,
                            appointment_id=appointment.id,
                            diagnosis=random.choice(MEDICAL_CONDITIONS),
                            symptoms=fake.text(max_nb_chars=150),
                            treatment=fake.text(max_nb_chars=200),
                            notes=fake.text(max_nb_chars=100),
                            visit_date=appointment_date
                        )
                        db.session.add(record)
                        records_created += 1
                    except Exception as e:
                        print(f"Error creating medical record: {e}")
                        continue
                        
            except Exception as e:
                print(f"Error creating appointment: {e}")
                continue
        
        db.session.commit()
        print(f"   - {appointments_created} appointments")
        print(f"   - {records_created} medical records")
        
    except Exception as e:
        print(f"Error creating appointments/records for {hospital.name}: {e}")
        db.session.rollback()

def main():
    app = create_app()
    
    with app.app_context():
        print("🏥 Creating Remaining Fake Indian Hospitals...")
        print("=" * 60)
        
        hospitals_created = []
        
        # Create hospitals with basic data
        for hospital_info in REMAINING_HOSPITALS:
            hospital = create_hospital_with_data(hospital_info)
            if hospital:
                hospitals_created.append(hospital)
            print("-" * 40)
        
        print("\n📅 Creating appointments and medical records...")
        
        # Create appointments and medical records
        for hospital in hospitals_created:
            create_appointments_and_records(hospital)
        
        print("\n" + "=" * 60)
        print("✅ Hospital Creation Complete!")
        print(f"Created {len(hospitals_created)} new hospitals with complete data")
        
        # Print summary
        total_hospitals = Hospital.query.count()
        total_users = User.query.count()
        total_patients = Patient.query.count()
        total_doctors = Doctor.query.count()
        total_medicines = Medicine.query.count()
        total_appointments = Appointment.query.count()
        
        print(f"\n📊 Database Summary:")
        print(f"   - Total Hospitals: {total_hospitals}")
        print(f"   - Total Users: {total_users}")
        print(f"   - Total Doctors: {total_doctors}")
        print(f"   - Total Patients: {total_patients}")
        print(f"   - Total Medicines: {total_medicines}")
        print(f"   - Total Appointments: {total_appointments}")
        
        print(f"\n🔑 Login Credentials (All passwords: 123):")
        for hospital in hospitals_created:
            print(f"   - {hospital.name}: {hospital.email}")

if __name__ == '__main__':
    main()