#!/usr/bin/env python3
"""
Seed sample data for Hospital Management System
This script populates the database with realistic sample data for demonstration
"""

import sys
import os
import random
from datetime import datetime, timedelta, date
from faker import Faker

# Add the parent directory to the path so we can import hospital modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.user import User
from hospital.models.hospital import Hospital
from hospital.models.patient import Patient
from hospital.models.doctor import Doctor
from hospital.models.appointment import Appointment
from hospital.models.medical_record import MedicalRecord

fake = Faker()

def create_sample_hospital():
    """Create a sample hospital"""
    hospital = Hospital(
        name="City General Hospital",
        address="123 Healthcare Avenue, Medical District, City 12345",
        phone="555-0123",
        email="info@citygeneralhospital.com",
        license_number="HOSP-2024-001",
        is_active=True
    )
    db.session.add(hospital)
    db.session.commit()
    return hospital

def create_admin_user(hospital_id):
    """Create admin user for the hospital"""
    admin = User(
        first_name="Admin",
        last_name="User",
        email="admin@citygeneralhospital.com",
        phone="5550123",
        role="admin",
        hospital_id=hospital_id
    )
    admin.set_password("admin123")
    db.session.add(admin)
    db.session.commit()
    return admin

def create_sample_doctors(hospital_id, count=15):
    """Create sample doctors"""
    specializations = [
        "Cardiology", "Orthopedics", "Pediatrics", "General Medicine", 
        "Emergency Medicine", "Surgery", "Dermatology", "Neurology",
        "Gynecology", "Psychiatry", "Radiology", "Anesthesiology"
    ]
    
    doctors = []
    for i in range(count):
        # Create user for doctor
        user = User(
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            email=fake.email(),
            phone=fake.numerify('##########'),
            role="doctor",
            hospital_id=hospital_id
        )
        user.set_password("doctor123")
        db.session.add(user)
        db.session.flush()  # Get the user ID
        
        # Create doctor profile
        doctor = Doctor(
            doctor_id=f"DOC{str(fake.uuid4())[:8].upper()}",
            user_id=user.id,
            specialization=random.choice(specializations),
            qualification=fake.random_element([
                "MBBS, MD", "MBBS, MS", "MBBS, DNB", "MBBS, DM", 
                "MBBS, MCh", "MBBS, MD, DM"
            ]),
            experience_years=random.randint(2, 25),
            license_number=f"MED{fake.numerify('######')}",
            consultation_fee=random.randint(500, 2000),
            available_days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
            available_hours="09:00-17:00",
            is_available=True,
            rating=round(random.uniform(4.0, 5.0), 1),
            total_patients=random.randint(50, 300),
            hospital_id=hospital_id
        )
        db.session.add(doctor)
        doctors.append(doctor)
    
    db.session.commit()
    return doctors

def create_sample_patients(hospital_id, count=100):
    """Create sample patients"""
    blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    genders = ['Male', 'Female', 'Other']
    
    patients = []
    for i in range(count):
        # Generate realistic age distribution
        age = random.choices(
            range(0, 90),
            weights=[5]*18 + [15]*17 + [20]*15 + [15]*15 + [10]*25,  # More young adults and middle-aged
            k=1
        )[0]
        
        birth_date = date.today() - timedelta(days=age*365 + random.randint(0, 365))
        
        patient = Patient(
            patient_id=f"PAT{str(fake.uuid4())[:8].upper()}",
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            email=fake.email() if random.random() > 0.2 else None,  # 80% have email
            phone=fake.numerify('##########'),
            date_of_birth=birth_date,
            gender=random.choices(genders, weights=[48, 50, 2])[0],  # Realistic gender distribution
            address=fake.address(),
            emergency_contact_name=fake.name(),
            emergency_contact_phone=fake.numerify('##########'),
            blood_group=random.choice(blood_groups) if random.random() > 0.3 else None,  # 70% have blood group
            allergies=fake.random_element([
                None, "Penicillin", "Peanuts", "Shellfish", "Latex", "Dust mites"
            ]),
            medical_history=fake.random_element([
                None, "Hypertension", "Diabetes", "Asthma", "Heart Disease", "Arthritis"
            ]),
            insurance_number=fake.numerify('INS########') if random.random() > 0.4 else None,
            created_at=fake.date_time_between(start_date='-2y', end_date='now'),
            hospital_id=hospital_id
        )
        db.session.add(patient)
        patients.append(patient)
    
    db.session.commit()
    return patients

def create_sample_appointments(hospital_id, doctors, patients, count=200):
    """Create sample appointments"""
    statuses = ['scheduled', 'completed', 'cancelled', 'no-show']
    appointment_types = ['consultation', 'follow-up', 'emergency', 'routine-checkup']
    priorities = ['low', 'normal', 'high', 'emergency']
    payment_statuses = ['pending', 'paid', 'cancelled']
    
    appointments = []
    
    # Create appointments over the last 3 months
    start_date = datetime.now() - timedelta(days=90)
    end_date = datetime.now() + timedelta(days=30)  # Some future appointments
    
    for i in range(count):
        doctor = random.choice(doctors)
        patient = random.choice(patients)
        
        # Generate appointment date
        appointment_date = fake.date_time_between(start_date=start_date, end_date=end_date)
        
        # Determine status based on date
        if appointment_date < datetime.now() - timedelta(days=1):
            status = random.choices(
                statuses, 
                weights=[5, 70, 20, 5]  # Most past appointments are completed
            )[0]
        elif appointment_date < datetime.now():
            status = random.choices(
                statuses,
                weights=[10, 60, 25, 5]  # Recent appointments
            )[0]
        else:
            status = 'scheduled'  # Future appointments
        
        # Set payment status based on appointment status
        if status == 'completed':
            payment_status = random.choices(['paid', 'pending'], weights=[85, 15])[0]
        elif status == 'cancelled':
            payment_status = 'cancelled'
        else:
            payment_status = 'pending'
        
        appointment = Appointment(
            appointment_id=f"APT{str(fake.uuid4())[:8].upper()}",
            patient_id=patient.id,
            doctor_id=doctor.id,
            appointment_date=appointment_date,
            appointment_type=random.choice(appointment_types),
            status=status,
            symptoms=fake.random_element([
                "Fever and headache", "Chest pain", "Back pain", "Cough and cold",
                "Stomach ache", "Joint pain", "Skin rash", "Dizziness",
                "Routine checkup", "Follow-up visit"
            ]),
            notes=fake.text(max_nb_chars=200) if random.random() > 0.5 else None,
            priority=random.choices(priorities, weights=[20, 60, 15, 5])[0],
            estimated_duration=random.choice([30, 45, 60]),
            actual_duration=random.randint(20, 90) if status == 'completed' else None,
            consultation_fee=doctor.consultation_fee,
            payment_status=payment_status,
            created_at=appointment_date - timedelta(days=random.randint(1, 7)),
            hospital_id=hospital_id
        )
        db.session.add(appointment)
        appointments.append(appointment)
    
    db.session.commit()
    return appointments

def create_sample_medical_records(hospital_id, appointments, count=150):
    """Create sample medical records for completed appointments"""
    completed_appointments = [apt for apt in appointments if apt.status == 'completed']
    
    if not completed_appointments:
        return []
    
    # Create records for most completed appointments
    selected_appointments = random.sample(
        completed_appointments, 
        min(count, len(completed_appointments))
    )
    
    diagnoses = [
        "Hypertension", "Type 2 Diabetes", "Common Cold", "Migraine",
        "Gastritis", "Arthritis", "Anxiety", "Bronchitis", "Allergic Rhinitis",
        "Lower Back Pain", "Skin Infection", "Urinary Tract Infection"
    ]
    
    treatments = [
        "Medication prescribed", "Rest and hydration", "Physical therapy recommended",
        "Lifestyle changes advised", "Follow-up in 2 weeks", "Specialist referral",
        "Laboratory tests ordered", "Imaging studies recommended"
    ]
    
    medications = [
        [{"name": "Paracetamol", "dosage": "500mg", "frequency": "Twice daily"}],
        [{"name": "Amoxicillin", "dosage": "250mg", "frequency": "Three times daily"}],
        [{"name": "Ibuprofen", "dosage": "400mg", "frequency": "As needed"}],
        [{"name": "Metformin", "dosage": "500mg", "frequency": "Twice daily"}],
        [{"name": "Lisinopril", "dosage": "10mg", "frequency": "Once daily"}]
    ]
    
    records = []
    for appointment in selected_appointments:
        record = MedicalRecord(
            patient_id=appointment.patient_id,
            doctor_id=appointment.doctor_id,
            appointment_id=appointment.id,
            visit_date=appointment.appointment_date,
            chief_complaint=appointment.symptoms,
            symptoms=fake.text(max_nb_chars=150),
            diagnosis=random.choice(diagnoses),
            treatment=random.choice(treatments),
            medications=random.choice(medications),
            lab_results=None,  # Can be added later
            vital_signs={
                "blood_pressure": f"{random.randint(110, 140)}/{random.randint(70, 90)}",
                "temperature": f"{random.uniform(98.0, 99.5):.1f}°F",
                "heart_rate": f"{random.randint(60, 100)} bpm",
                "weight": f"{random.randint(50, 100)} kg"
            },
            notes=fake.text(max_nb_chars=200),
            follow_up_date=appointment.appointment_date + timedelta(days=random.randint(7, 30)) if random.random() > 0.6 else None,
            hospital_id=hospital_id
        )
        db.session.add(record)
        records.append(record)
    
    db.session.commit()
    return records

def main():
    """Main function to seed the database"""
    print("🏥 Hospital Management System - Data Seeding")
    print("=" * 50)
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        print("📊 Creating database tables...")
        db.create_all()
        
        # Check if data already exists
        if Hospital.query.first():
            print("⚠️  Data already exists. Clearing and reseeding...")
            
            print("🗑️  Clearing existing data...")
            # Clear in reverse order of dependencies
            MedicalRecord.query.delete()
            Appointment.query.delete()
            Doctor.query.delete()
            Patient.query.delete()
            User.query.delete()
            Hospital.query.delete()
            db.session.commit()
        
        print("🏥 Creating sample hospital...")
        hospital = create_sample_hospital()
        
        print("👤 Creating admin user...")
        admin = create_admin_user(hospital.id)
        
        print("👨‍⚕️ Creating sample doctors...")
        doctors = create_sample_doctors(hospital.id, 15)
        
        print("👥 Creating sample patients...")
        patients = create_sample_patients(hospital.id, 100)
        
        print("📅 Creating sample appointments...")
        appointments = create_sample_appointments(hospital.id, doctors, patients, 200)
        
        print("📋 Creating sample medical records...")
        records = create_sample_medical_records(hospital.id, appointments, 150)
        
        print("\n✅ Sample data created successfully!")
        print(f"📊 Summary:")
        print(f"   • Hospital: {hospital.name}")
        print(f"   • Admin User: {admin.email} (password: admin123)")
        print(f"   • Doctors: {len(doctors)}")
        print(f"   • Patients: {len(patients)}")
        print(f"   • Appointments: {len(appointments)}")
        print(f"   • Medical Records: {len(records)}")
        
        print(f"\n🔑 Login Credentials:")
        print(f"   Email: admin@citygeneralhospital.com")
        print(f"   Password: admin123")
        
        print(f"\n🚀 Your analytics dashboard will now show meaningful data!")

if __name__ == '__main__':
    main()