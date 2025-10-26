#!/usr/bin/env python3
"""
Add Indian data directly to your existing City Hospital
"""

import sys
import os
import random
from datetime import datetime, timedelta, date
from faker import Faker

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.user import User
from hospital.models.hospital import Hospital
from hospital.models.patient import Patient
from hospital.models.doctor import Doctor
from hospital.models.appointment import Appointment
from hospital.models.medical_record import MedicalRecord

# Initialize Faker with Indian locale
fake = Faker(['hi_IN', 'en_IN'])

# Indian names lists (same as before)
INDIAN_FIRST_NAMES_MALE = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
    "Shaurya", "Atharv", "Advik", "Pranav", "Vedant", "Kabir", "Shivansh", "Abhinav", "Yash", "Dhruv",
    "Aryan", "Karthik", "Rohan", "Ansh", "Harsh", "Rudra", "Samarth", "Tanish", "Arnav", "Parth",
    "Rajesh", "Suresh", "Ramesh", "Mahesh", "Dinesh", "Naresh", "Mukesh", "Ritesh", "Umesh", "Ganesh",
    "Amit", "Rohit", "Sumit", "Ajit", "Lalit", "Mohit", "Ravi", "Kiran", "Nitin", "Sachin"
]

INDIAN_FIRST_NAMES_FEMALE = [
    "Saanvi", "Aadya", "Kiara", "Diya", "Pihu", "Prisha", "Ananya", "Fatima", "Anika", "Myra",
    "Sara", "Pari", "Kavya", "Aadhya", "Arya", "Khushi", "Mishti", "Avni", "Riya", "Shanaya",
    "Ishita", "Tanvi", "Tara", "Aditi", "Ahana", "Zara", "Alisha", "Amara", "Navya", "Siya",
    "Priya", "Pooja", "Neha", "Sneha", "Rekha", "Geeta", "Seeta", "Meera", "Deepa", "Kavita",
    "Sunita", "Anita", "Mamta", "Shanti", "Bharti", "Shakti", "Preeti", "Kriti", "Shruti", "Smriti"
]

INDIAN_LAST_NAMES = [
    "Sharma", "Verma", "Singh", "Kumar", "Gupta", "Agarwal", "Jain", "Bansal", "Goel", "Mittal",
    "Chopra", "Malhotra", "Arora", "Kapoor", "Khanna", "Bhatia", "Sethi", "Aggarwal", "Jindal", "Singhal",
    "Patel", "Shah", "Mehta", "Desai", "Modi", "Joshi", "Trivedi", "Pandya", "Vyas", "Shukla",
    "Reddy", "Rao", "Nair", "Menon", "Pillai", "Kumar", "Prasad", "Murthy", "Sastry", "Chandra",
    "Das", "Roy", "Ghosh", "Mukherjee", "Banerjee", "Chatterjee", "Sengupta", "Bose", "Dutta", "Mitra"
]

INDIAN_CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
    "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal"
]

def generate_indian_name(gender=None):
    """Generate authentic Indian names"""
    if gender == 'Male':
        first_name = random.choice(INDIAN_FIRST_NAMES_MALE)
    elif gender == 'Female':
        first_name = random.choice(INDIAN_FIRST_NAMES_FEMALE)
    else:
        first_name = random.choice(INDIAN_FIRST_NAMES_MALE + INDIAN_FIRST_NAMES_FEMALE)
    
    last_name = random.choice(INDIAN_LAST_NAMES)
    return first_name, last_name

def generate_indian_address():
    """Generate Indian-style addresses"""
    house_no = random.randint(1, 999)
    area_names = [
        "MG Road", "Gandhi Nagar", "Nehru Place", "Rajouri Garden", "Lajpat Nagar",
        "Karol Bagh", "Connaught Place", "Saket", "Vasant Kunj", "Dwarka",
        "Bandra", "Andheri", "Juhu", "Powai", "Thane", "Malad", "Borivali",
        "Koramangala", "Indiranagar", "Whitefield", "Electronic City", "Marathahalli"
    ]
    
    city = random.choice(INDIAN_CITIES)
    pincode = random.randint(100000, 999999)
    area = random.choice(area_names)
    
    return f"{house_no}, {area}, {city} - {pincode}"

def generate_indian_phone():
    """Generate Indian mobile numbers"""
    first_digit = random.choice(['6', '7', '8', '9'])
    remaining_digits = ''.join([str(random.randint(0, 9)) for _ in range(9)])
    return first_digit + remaining_digits

def main():
    """Add Indian data to existing City Hospital"""
    app = create_app()
    
    with app.app_context():
        print("🇮🇳 Adding Indian Data to Your City Hospital")
        print("=" * 50)
        
        # Find your existing City Hospital
        city_hospital = Hospital.query.filter(
            Hospital.name.like('%City%')
        ).first()
        
        if not city_hospital:
            print("❌ City Hospital not found!")
            return
        
        print(f"🏥 Found hospital: {city_hospital.name}")
        hospital_id = city_hospital.id
        
        # Clear existing data first
        print("🗑️ Clearing existing data...")
        MedicalRecord.query.filter_by(hospital_id=hospital_id).delete()
        Appointment.query.filter_by(hospital_id=hospital_id).delete()
        Doctor.query.filter_by(hospital_id=hospital_id).delete()
        Patient.query.filter_by(hospital_id=hospital_id).delete()
        # Don't delete admin users
        User.query.filter(User.hospital_id == hospital_id, User.role == 'doctor').delete()
        db.session.commit()
        
        # Add Indian doctors
        print("👨‍⚕️ Adding Indian doctors...")
        indian_specializations = [
            "General Medicine", "Cardiology", "Orthopedics", "Pediatrics", "Gynecology",
            "Dermatology", "ENT", "Ophthalmology", "Neurology", "Psychiatry",
            "Emergency Medicine", "Anesthesiology", "Radiology", "Pathology",
            "Ayurveda", "Homeopathy", "Physiotherapy", "Dentistry"
        ]
        
        doctors = []
        for i in range(20):
            gender = random.choice(['Male', 'Female'])
            first_name, last_name = generate_indian_name(gender)
            
            # Create user for doctor
            user = User(
                first_name=first_name,
                last_name=last_name,
                email=f"dr.{first_name.lower()}.{last_name.lower()}{i}@hospital.co.in",
                phone=generate_indian_phone(),
                role="doctor",
                hospital_id=hospital_id
            )
            user.set_password("doctor123")
            db.session.add(user)
            db.session.flush()
            
            # Create doctor profile
            doctor = Doctor(
                doctor_id=f"DOC{str(fake.uuid4())[:8].upper()}",
                user_id=user.id,
                specialization=random.choice(indian_specializations),
                qualification=random.choice(["MBBS, MD", "MBBS, MS", "MBBS, DNB", "BAMS", "BHMS"]),
                experience_years=random.randint(2, 25),
                license_number=f"MCI{fake.numerify('######')}",
                consultation_fee=random.randint(300, 1500),
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
        print(f"✅ Added {len(doctors)} Indian doctors")
        
        # Add Indian patients
        print("👥 Adding Indian patients...")
        patients = []
        for i in range(150):
            gender = random.choice(['Male', 'Female'])
            first_name, last_name = generate_indian_name(gender)
            
            age = random.choices(
                range(0, 85),
                weights=[8]*18 + [20]*17 + [25]*15 + [20]*15 + [15]*20,
                k=1
            )[0]
            
            birth_date = date.today() - timedelta(days=age*365 + random.randint(0, 365))
            
            patient = Patient(
                patient_id=f"PAT{str(fake.uuid4())[:8].upper()}",
                first_name=first_name,
                last_name=last_name,
                email=f"{first_name.lower()}.{last_name.lower()}{i}@gmail.com" if random.random() > 0.3 else None,
                phone=generate_indian_phone(),
                date_of_birth=birth_date,
                gender=gender,
                address=generate_indian_address(),
                emergency_contact_name=f"{random.choice(INDIAN_FIRST_NAMES_MALE + INDIAN_FIRST_NAMES_FEMALE)} {random.choice(INDIAN_LAST_NAMES)}",
                emergency_contact_phone=generate_indian_phone(),
                blood_group=random.choice(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']) if random.random() > 0.2 else None,
                allergies=random.choice([None, "Dust", "Pollen", "Peanuts", "Milk"]),
                medical_history=random.choice([None, "Diabetes", "Hypertension", "Asthma", "Thyroid"]),
                insurance_number=f"INS{fake.numerify('########')}" if random.random() > 0.4 else None,
                created_at=fake.date_time_between(start_date='-2y', end_date='now'),
                hospital_id=hospital_id
            )
            db.session.add(patient)
            patients.append(patient)
        
        db.session.commit()
        print(f"✅ Added {len(patients)} Indian patients")
        
        # Add appointments
        print("📅 Adding appointments...")
        indian_symptoms = [
            "बुखार और सिरदर्द (Fever and headache)", "सीने में दर्द (Chest pain)",
            "पीठ दर्द (Back pain)", "खांसी और जुकाम (Cough and cold)",
            "पेट दर्द (Stomach ache)", "जोड़ों का दर्द (Joint pain)",
            "Routine checkup", "Follow-up visit", "Vaccination"
        ]
        
        appointments = []
        start_date = datetime.now() - timedelta(days=120)
        end_date = datetime.now() + timedelta(days=30)
        
        for i in range(300):
            doctor = random.choice(doctors)
            patient = random.choice(patients)
            appointment_date = fake.date_time_between(start_date=start_date, end_date=end_date)
            
            if appointment_date < datetime.now() - timedelta(days=1):
                status = random.choices(['scheduled', 'completed', 'cancelled', 'no-show'], weights=[5, 75, 15, 5])[0]
            else:
                status = 'scheduled'
            
            payment_status = 'paid' if status == 'completed' and random.random() > 0.2 else 'pending'
            if status == 'cancelled':
                payment_status = 'cancelled'
            
            appointment = Appointment(
                appointment_id=f"APT{str(fake.uuid4())[:8].upper()}",
                patient_id=patient.id,
                doctor_id=doctor.id,
                appointment_date=appointment_date,
                appointment_type=random.choice(['consultation', 'follow-up', 'emergency']),
                status=status,
                symptoms=random.choice(indian_symptoms),
                priority=random.choices(['low', 'normal', 'high'], weights=[25, 60, 15])[0],
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
        print(f"✅ Added {len(appointments)} appointments")
        
        # Add medical records
        print("📋 Adding medical records...")
        completed_appointments = [apt for apt in appointments if apt.status == 'completed']
        records = []
        
        for appointment in completed_appointments[:150]:  # Add records for first 150 completed appointments
            record = MedicalRecord(
                patient_id=appointment.patient_id,
                doctor_id=appointment.doctor_id,
                appointment_id=appointment.id,
                visit_date=appointment.appointment_date,
                chief_complaint=appointment.symptoms,
                symptoms=fake.text(max_nb_chars=100),
                diagnosis=random.choice([
                    "उच्च रक्तचाप (Hypertension)", "मधुमेह (Diabetes)", "सामान्य सर्दी (Common Cold)",
                    "गैस्ट्राइटिस (Gastritis)", "गठिया (Arthritis)", "माइग्रेन (Migraine)"
                ]),
                treatment=random.choice([
                    "दवा निर्धारित (Medication prescribed)", "आराम की सलाह (Rest advised)",
                    "फिजियोथेरेपी (Physiotherapy)", "जीवनशैली में बदलाव (Lifestyle changes)"
                ]),
                medications=[{"name": "पैरासिटामोल (Paracetamol)", "dosage": "500mg", "frequency": "दिन में दो बार"}],
                vital_signs={
                    "blood_pressure": f"{random.randint(110, 140)}/{random.randint(70, 90)} mmHg",
                    "temperature": f"{random.uniform(98.0, 99.5):.1f}°F",
                    "heart_rate": f"{random.randint(60, 100)} bpm",
                    "weight": f"{random.randint(45, 90)} kg"
                },
                notes=fake.text(max_nb_chars=100),
                hospital_id=hospital_id
            )
            db.session.add(record)
            records.append(record)
        
        db.session.commit()
        print(f"✅ Added {len(records)} medical records")
        
        print(f"\n🎉 Successfully added Indian data to {city_hospital.name}!")
        print(f"📊 Summary:")
        print(f"   • Doctors: {len(doctors)} (with Indian names & specializations)")
        print(f"   • Patients: {len(patients)} (authentic Indian demographics)")
        print(f"   • Appointments: {len(appointments)} (with Hindi symptoms)")
        print(f"   • Medical Records: {len(records)} (bilingual content)")
        print(f"\n🔄 Refresh your browser to see the updated data!")
        print(f"🇮🇳 Perfect for your university presentation!")

if __name__ == '__main__':
    main()