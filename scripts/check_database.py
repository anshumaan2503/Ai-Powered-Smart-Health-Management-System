#!/usr/bin/env python3
"""
Check what data is currently in the database
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

def main():
    """Check database contents"""
    app = create_app()
    
    with app.app_context():
        print("🔍 Database Contents Check")
        print("=" * 40)
        
        # Check hospitals
        hospitals = Hospital.query.all()
        print(f"\n🏥 Hospitals ({len(hospitals)}):")
        for hospital in hospitals:
            print(f"   • {hospital.name} (ID: {hospital.id})")
        
        # Check users
        users = User.query.all()
        print(f"\n👤 Users ({len(users)}):")
        for user in users:
            print(f"   • {user.first_name} {user.last_name} ({user.email}) - Hospital ID: {user.hospital_id}")
        
        # Check patients
        patients = Patient.query.all()
        print(f"\n👥 Patients ({len(patients)}):")
        for i, patient in enumerate(patients[:10]):  # Show first 10
            print(f"   • {patient.first_name} {patient.last_name} - Hospital ID: {patient.hospital_id}")
        if len(patients) > 10:
            print(f"   ... and {len(patients) - 10} more")
        
        # Check doctors
        doctors = Doctor.query.all()
        print(f"\n👨‍⚕️ Doctors ({len(doctors)}):")
        for doctor in doctors:
            user = User.query.get(doctor.user_id)
            print(f"   • Dr. {user.first_name} {user.last_name} ({doctor.specialization}) - Hospital ID: {doctor.hospital_id}")
        
        # Check appointments
        appointments = Appointment.query.all()
        print(f"\n📅 Appointments ({len(appointments)}):")
        for i, apt in enumerate(appointments[:5]):  # Show first 5
            print(f"   • {apt.appointment_id} - Hospital ID: {apt.hospital_id}")
        if len(appointments) > 5:
            print(f"   ... and {len(appointments) - 5} more")

if __name__ == '__main__':
    main()