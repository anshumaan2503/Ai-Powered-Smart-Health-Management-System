#!/usr/bin/env python3
"""
Transfer Indian data to City Hospital (if it exists)
"""

import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.user import User
from hospital.models.hospital import Hospital
from hospital.models.patient import Patient
from hospital.models.doctor import Doctor
from hospital.models.appointment import Appointment
from hospital.models.medical_record import MedicalRecord

def main():
    """Transfer data to City Hospital"""
    app = create_app()
    
    with app.app_context():
        print("🔄 Transferring Indian Data to City Hospital")
        print("=" * 50)
        
        # Check if City Hospital exists
        city_hospital = Hospital.query.filter_by(name="City General Hospital").first()
        jaslok_hospital = Hospital.query.filter_by(name="Jaslok Hospital").first()
        
        if not city_hospital:
            print("❌ City General Hospital not found. Creating it...")
            city_hospital = Hospital(
                name="City General Hospital",
                address="123 Healthcare Avenue, Medical District, Mumbai 400001",
                phone="02212345678",
                email="info@citygeneralhospital.com",
                license_number="MH-1234-2024",
                is_active=True
            )
            db.session.add(city_hospital)
            db.session.commit()
            print("✅ City General Hospital created!")
        
        if not jaslok_hospital:
            print("❌ No Indian data found to transfer!")
            return
        
        print(f"🏥 Transferring data from {jaslok_hospital.name} to {city_hospital.name}")
        
        # Transfer patients
        patients = Patient.query.filter_by(hospital_id=jaslok_hospital.id).all()
        for patient in patients:
            patient.hospital_id = city_hospital.id
        print(f"✅ Transferred {len(patients)} patients")
        
        # Transfer doctors
        doctors = Doctor.query.filter_by(hospital_id=jaslok_hospital.id).all()
        for doctor in doctors:
            doctor.hospital_id = city_hospital.id
            # Also update the user's hospital_id
            user = User.query.get(doctor.user_id)
            if user:
                user.hospital_id = city_hospital.id
        print(f"✅ Transferred {len(doctors)} doctors")
        
        # Transfer appointments
        appointments = Appointment.query.filter_by(hospital_id=jaslok_hospital.id).all()
        for appointment in appointments:
            appointment.hospital_id = city_hospital.id
        print(f"✅ Transferred {len(appointments)} appointments")
        
        # Transfer medical records
        records = MedicalRecord.query.filter_by(hospital_id=jaslok_hospital.id).all()
        for record in records:
            record.hospital_id = city_hospital.id
        print(f"✅ Transferred {len(records)} medical records")
        
        # Update admin user
        admin = User.query.filter_by(email="admin@hospital.co.in").first()
        if admin:
            admin.hospital_id = city_hospital.id
            print("✅ Updated admin user")
        
        # Commit all changes
        db.session.commit()
        
        # Delete Jaslok Hospital
        db.session.delete(jaslok_hospital)
        db.session.commit()
        
        print(f"\n🎉 Transfer completed successfully!")
        print(f"Now your City General Hospital has all the Indian data!")
        print(f"Refresh your browser to see the updated data.")

if __name__ == '__main__':
    main()