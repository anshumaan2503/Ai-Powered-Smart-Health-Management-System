#!/usr/bin/env python3
"""
Seed Indian sample data for Hospital Management System
This script populates the database with realistic Indian sample data for university presentation
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

# Initialize Faker with Indian locale
fake = Faker(['hi_IN', 'en_IN'])

# Indian names lists
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
    "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
    "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
    "Meerut", "Rajkot", "Kalyan", "Vasai", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad"
]

INDIAN_STATES = [
    "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "Uttar Pradesh",
    "West Bengal", "Madhya Pradesh", "Bihar", "Andhra Pradesh", "Telangana", "Kerala",
    "Punjab", "Haryana", "Odisha", "Jharkhand", "Assam", "Chhattisgarh", "Uttarakhand", "Himachal Pradesh"
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
    street_types = ["Road", "Street", "Lane", "Nagar", "Colony", "Vihar", "Enclave", "Block"]
    area_names = [
        "MG Road", "Gandhi Nagar", "Nehru Place", "Rajouri Garden", "Lajpat Nagar",
        "Karol Bagh", "Connaught Place", "Saket", "Vasant Kunj", "Dwarka",
        "Bandra", "Andheri", "Juhu", "Powai", "Thane", "Malad", "Borivali",
        "Koramangala", "Indiranagar", "Whitefield", "Electronic City", "Marathahalli",
        "Anna Nagar", "T Nagar", "Adyar", "Velachery", "Tambaram"
    ]
    
    city = random.choice(INDIAN_CITIES)
    state = random.choice(INDIAN_STATES)
    pincode = random.randint(100000, 999999)
    
    area = random.choice(area_names)
    street_type = random.choice(street_types)
    
    return f"{house_no}, {area} {street_type}, {city}, {state} - {pincode}"

def generate_indian_phone():
    """Generate Indian mobile numbers"""
    # Indian mobile numbers start with 6, 7, 8, or 9
    first_digit = random.choice(['6', '7', '8', '9'])
    remaining_digits = ''.join([str(random.randint(0, 9)) for _ in range(9)])
    return first_digit + remaining_digits

def create_indian_hospital():
    """Create a sample Indian hospital"""
    hospital_names = [
        "All India Institute of Medical Sciences (AIIMS)",
        "Apollo Hospital",
        "Fortis Healthcare",
        "Max Super Speciality Hospital",
        "Medanta - The Medicity",
        "Kokilaben Dhirubhai Ambani Hospital",
        "Narayana Health",
        "Manipal Hospital",
        "Columbia Asia Hospital",
        "Jaslok Hospital"
    ]
    
    hospital = Hospital(
        name=random.choice(hospital_names),
        address=generate_indian_address(),
        phone=generate_indian_phone(),
        email="info@hospital.co.in",
        license_number=f"MH-{random.randint(1000, 9999)}-{random.randint(2020, 2024)}",
        is_active=True
    )
    db.session.add(hospital)
    db.session.commit()
    return hospital

def create_admin_user(hospital_id):
    """Create admin user for the hospital"""
    first_name, last_name = generate_indian_name()
    admin = User(
        first_name=first_name,
        last_name=last_name,
        email="admin@hospital.co.in",
        phone=generate_indian_phone(),
        role="admin",
        hospital_id=hospital_id
    )
    admin.set_password("admin123")
    db.session.add(admin)
    db.session.commit()
    return admin

def create_indian_doctors(hospital_id, count=20):
    """Create sample Indian doctors"""
    indian_specializations = [
        "General Medicine", "Cardiology", "Orthopedics", "Pediatrics", "Gynecology",
        "Dermatology", "ENT", "Ophthalmology", "Neurology", "Psychiatry",
        "Emergency Medicine", "Anesthesiology", "Radiology", "Pathology",
        "Ayurveda", "Homeopathy", "Physiotherapy", "Dentistry"
    ]
    
    indian_qualifications = [
        "MBBS, MD", "MBBS, MS", "MBBS, DNB", "MBBS, DM", "MBBS, MCh",
        "MBBS, MD, DM", "MBBS, MS, MCh", "BDS, MDS", "BAMS", "BHMS",
        "BPT, MPT", "MBBS, Diploma", "MBBS, Fellowship"
    ]
    
    doctors = []
    for i in range(count):
        gender = random.choice(['Male', 'Female'])
        first_name, last_name = generate_indian_name(gender)
        
        # Create user for doctor
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=f"dr.{first_name.lower()}.{last_name.lower()}@hospital.co.in",
            phone=generate_indian_phone(),
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
            specialization=random.choice(indian_specializations),
            qualification=random.choice(indian_qualifications),
            experience_years=random.randint(2, 30),
            license_number=f"MCI{fake.numerify('######')}",
            consultation_fee=random.randint(300, 1500),  # Indian consultation fees
            available_days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
            available_hours="09:00-17:00",
            is_available=True,
            rating=round(random.uniform(4.0, 5.0), 1),
            total_patients=random.randint(50, 500),
            hospital_id=hospital_id
        )
        db.session.add(doctor)
        doctors.append(doctor)
    
    db.session.commit()
    return doctors

def create_indian_patients(hospital_id, count=150):
    """Create sample Indian patients"""
    blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    genders = ['Male', 'Female']
    
    # Common Indian allergies and conditions
    indian_allergies = [
        None, "Dust", "Pollen", "Peanuts", "Milk", "Wheat", "Prawns", "Eggs"
    ]
    
    indian_conditions = [
        None, "Diabetes", "Hypertension", "Asthma", "Thyroid", "Heart Disease",
        "Arthritis", "Kidney Stones", "Migraine", "PCOD", "Gastritis"
    ]
    
    patients = []
    for i in range(count):
        gender = random.choice(genders)
        first_name, last_name = generate_indian_name(gender)
        
        # Generate realistic age distribution for India
        age = random.choices(
            range(0, 85),
            weights=[8]*18 + [20]*17 + [25]*15 + [20]*15 + [15]*20,  # Young population bias
            k=1
        )[0]
        
        birth_date = date.today() - timedelta(days=age*365 + random.randint(0, 365))
        
        patient = Patient(
            patient_id=f"PAT{str(fake.uuid4())[:8].upper()}",
            first_name=first_name,
            last_name=last_name,
            email=f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}@gmail.com" if random.random() > 0.3 else None,
            phone=generate_indian_phone(),
            date_of_birth=birth_date,
            gender=gender,
            address=generate_indian_address(),
            emergency_contact_name=f"{random.choice(INDIAN_FIRST_NAMES_MALE + INDIAN_FIRST_NAMES_FEMALE)} {random.choice(INDIAN_LAST_NAMES)}",
            emergency_contact_phone=generate_indian_phone(),
            blood_group=random.choice(blood_groups) if random.random() > 0.2 else None,
            allergies=random.choice(indian_allergies),
            medical_history=random.choice(indian_conditions),
            insurance_number=f"INS{fake.numerify('########')}" if random.random() > 0.4 else None,
            created_at=fake.date_time_between(start_date='-2y', end_date='now'),
            hospital_id=hospital_id
        )
        db.session.add(patient)
        patients.append(patient)
    
    db.session.commit()
    return patients

def create_indian_appointments(hospital_id, doctors, patients, count=300):
    """Create sample Indian appointments"""
    statuses = ['scheduled', 'completed', 'cancelled', 'no-show']
    appointment_types = ['consultation', 'follow-up', 'emergency', 'routine-checkup']
    priorities = ['low', 'normal', 'high', 'emergency']
    payment_statuses = ['pending', 'paid', 'cancelled']
    
    # Common Indian symptoms
    indian_symptoms = [
        "बुखार और सिरदर्द (Fever and headache)", "सीने में दर्द (Chest pain)",
        "पीठ दर्द (Back pain)", "खांसी और जुकाम (Cough and cold)",
        "पेट दर्द (Stomach ache)", "जोड़ों का दर्द (Joint pain)",
        "त्वचा पर चकत्ते (Skin rash)", "चक्कर आना (Dizziness)",
        "सांस लेने में तकलीफ (Breathing difficulty)", "नींद न आना (Insomnia)",
        "Routine checkup", "Follow-up visit", "Vaccination", "Health screening"
    ]
    
    appointments = []
    
    # Create appointments over the last 4 months
    start_date = datetime.now() - timedelta(days=120)
    end_date = datetime.now() + timedelta(days=30)
    
    for i in range(count):
        doctor = random.choice(doctors)
        patient = random.choice(patients)
        
        # Generate appointment date
        appointment_date = fake.date_time_between(start_date=start_date, end_date=end_date)
        
        # Determine status based on date
        if appointment_date < datetime.now() - timedelta(days=1):
            status = random.choices(
                statuses, 
                weights=[5, 75, 15, 5]  # Most past appointments are completed
            )[0]
        elif appointment_date < datetime.now():
            status = random.choices(
                statuses,
                weights=[10, 65, 20, 5]
            )[0]
        else:
            status = 'scheduled'
        
        # Set payment status
        if status == 'completed':
            payment_status = random.choices(['paid', 'pending'], weights=[80, 20])[0]
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
            symptoms=random.choice(indian_symptoms),
            notes=fake.text(max_nb_chars=150) if random.random() > 0.6 else None,
            priority=random.choices(priorities, weights=[25, 55, 15, 5])[0],
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

def create_indian_medical_records(hospital_id, appointments, count=200):
    """Create sample Indian medical records"""
    completed_appointments = [apt for apt in appointments if apt.status == 'completed']
    
    if not completed_appointments:
        return []
    
    selected_appointments = random.sample(
        completed_appointments, 
        min(count, len(completed_appointments))
    )
    
    # Common Indian diagnoses
    indian_diagnoses = [
        "उच्च रक्तचाप (Hypertension)", "मधुमेह टाइप 2 (Type 2 Diabetes)",
        "सामान्य सर्दी (Common Cold)", "माइग्रेन (Migraine)",
        "गैस्ट्राइटिस (Gastritis)", "गठिया (Arthritis)",
        "चिंता (Anxiety)", "ब्रोंकाइटिस (Bronchitis)",
        "एलर्जिक राइनाइटिस (Allergic Rhinitis)", "कमर दर्द (Lower Back Pain)",
        "त्वचा संक्रमण (Skin Infection)", "मूत्र पथ संक्रमण (UTI)",
        "थायराइड (Thyroid)", "एनीमिया (Anemia)", "विटामिन डी की कमी (Vitamin D Deficiency)"
    ]
    
    indian_treatments = [
        "दवा निर्धारित (Medication prescribed)", "आराम और हाइड्रेशन (Rest and hydration)",
        "फिजियोथेरेपी की सलाह (Physiotherapy recommended)", "जीवनशैली में बदलाव (Lifestyle changes)",
        "2 सप्ताह में फॉलो-अप (Follow-up in 2 weeks)", "विशेषज्ञ को रेफर (Specialist referral)",
        "लैब टेस्ट का आदेश (Laboratory tests ordered)", "इमेजिंग स्टडी (Imaging studies recommended)",
        "योग और व्यायाम (Yoga and exercise)", "आहार परामर्श (Dietary counseling)"
    ]
    
    indian_medications = [
        [{"name": "पैरासिटामोल (Paracetamol)", "dosage": "500mg", "frequency": "दिन में दो बार"}],
        [{"name": "एमोक्सिसिलिन (Amoxicillin)", "dosage": "250mg", "frequency": "दिन में तीन बार"}],
        [{"name": "आइबुप्रोफेन (Ibuprofen)", "dosage": "400mg", "frequency": "आवश्यकतानुसार"}],
        [{"name": "मेटफॉर्मिन (Metformin)", "dosage": "500mg", "frequency": "दिन में दो बार"}],
        [{"name": "लिसिनोप्रिल (Lisinopril)", "dosage": "10mg", "frequency": "दिन में एक बार"}],
        [{"name": "आयरन टैबलेट (Iron tablets)", "dosage": "100mg", "frequency": "दिन में एक बार"}],
        [{"name": "कैल्शियम (Calcium)", "dosage": "500mg", "frequency": "दिन में दो बार"}]
    ]
    
    records = []
    for appointment in selected_appointments:
        record = MedicalRecord(
            patient_id=appointment.patient_id,
            doctor_id=appointment.doctor_id,
            appointment_id=appointment.id,
            visit_date=appointment.appointment_date,
            chief_complaint=appointment.symptoms,
            symptoms=fake.text(max_nb_chars=100),
            diagnosis=random.choice(indian_diagnoses),
            treatment=random.choice(indian_treatments),
            medications=random.choice(indian_medications),
            lab_results=None,
            vital_signs={
                "blood_pressure": f"{random.randint(110, 140)}/{random.randint(70, 90)} mmHg",
                "temperature": f"{random.uniform(98.0, 99.5):.1f}°F",
                "heart_rate": f"{random.randint(60, 100)} bpm",
                "weight": f"{random.randint(45, 90)} kg",
                "height": f"{random.randint(150, 180)} cm"
            },
            notes=fake.text(max_nb_chars=150),
            follow_up_date=appointment.appointment_date + timedelta(days=random.randint(7, 30)) if random.random() > 0.5 else None,
            hospital_id=hospital_id
        )
        db.session.add(record)
        records.append(record)
    
    db.session.commit()
    return records

def main():
    """Main function to seed Indian data"""
    print("🇮🇳 भारतीय अस्पताल प्रबंधन प्रणाली - डेटा सीडिंग")
    print("🏥 Indian Hospital Management System - Data Seeding")
    print("=" * 60)
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        print("📊 Creating database tables...")
        db.create_all()
        
        # Clear existing data
        if Hospital.query.first():
            print("🗑️  Clearing existing data...")
            MedicalRecord.query.delete()
            Appointment.query.delete()
            Doctor.query.delete()
            Patient.query.delete()
            User.query.delete()
            Hospital.query.delete()
            db.session.commit()
        
        print("🏥 Creating Indian hospital...")
        hospital = create_indian_hospital()
        
        print("👤 Creating admin user...")
        admin = create_admin_user(hospital.id)
        
        print("👨‍⚕️ Creating Indian doctors...")
        doctors = create_indian_doctors(hospital.id, 20)
        
        print("👥 Creating Indian patients...")
        patients = create_indian_patients(hospital.id, 150)
        
        print("📅 Creating appointments...")
        appointments = create_indian_appointments(hospital.id, doctors, patients, 300)
        
        print("📋 Creating medical records...")
        records = create_indian_medical_records(hospital.id, appointments, 200)
        
        print("\n✅ भारतीय नमूना डेटा सफलतापूर्वक बनाया गया!")
        print("✅ Indian sample data created successfully!")
        print(f"📊 Summary:")
        print(f"   • Hospital: {hospital.name}")
        print(f"   • Admin User: {admin.email} (password: admin123)")
        print(f"   • Doctors: {len(doctors)} (Indian names & qualifications)")
        print(f"   • Patients: {len(patients)} (Indian demographics)")
        print(f"   • Appointments: {len(appointments)} (with Hindi symptoms)")
        print(f"   • Medical Records: {len(records)} (bilingual)")
        
        print(f"\n🔑 Login Credentials:")
        print(f"   Email: admin@hospital.co.in")
        print(f"   Password: admin123")
        
        print(f"\n🎓 Perfect for university presentation!")
        print(f"🇮🇳 Your analytics will show authentic Indian healthcare data!")

if __name__ == '__main__':
    main()