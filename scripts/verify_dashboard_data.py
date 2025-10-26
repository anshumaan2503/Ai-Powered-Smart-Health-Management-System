#!/usr/bin/env python3
"""
Verify dashboard data is accessible
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
    """Verify dashboard data"""
    app = create_app()
    
    with app.app_context():
        print("🔍 Verifying Dashboard Data")
        print("=" * 40)
        
        # Find City Hospital
        city_hospital = Hospital.query.filter(
            Hospital.name.like('%City%')
        ).first()
        
        if not city_hospital:
            print("❌ City Hospital not found!")
            return
        
        print(f"🏥 Hospital: {city_hospital.name} (ID: {city_hospital.id})")
        
        # Count data
        patients_count = Patient.query.filter_by(hospital_id=city_hospital.id).count()
        doctors_count = Doctor.query.filter_by(hospital_id=city_hospital.id).count()
        appointments_count = Appointment.query.filter_by(hospital_id=city_hospital.id).count()
        
        print(f"👥 Patients: {patients_count}")
        print(f"👨‍⚕️ Doctors: {doctors_count}")
        print(f"📅 Appointments: {appointments_count}")
        
        # Show some sample data
        if patients_count > 0:
            sample_patients = Patient.query.filter_by(hospital_id=city_hospital.id).limit(5).all()
            print(f"\n📋 Sample Patients:")
            for patient in sample_patients:
                print(f"   • {patient.first_name} {patient.last_name} ({patient.patient_id})")
        
        if doctors_count > 0:
            sample_doctors = Doctor.query.filter_by(hospital_id=city_hospital.id).limit(5).all()
            print(f"\n📋 Sample Doctors:")
            for doctor in sample_doctors:
                user = User.query.get(doctor.user_id)
                if user:
                    print(f"   • Dr. {user.first_name} {user.last_name} ({doctor.specialization})")
        
        if appointments_count > 0:
            sample_appointments = Appointment.query.filter_by(hospital_id=city_hospital.id).limit(5).all()
            print(f"\n📋 Sample Appointments:")
            for apt in sample_appointments:
                print(f"   • {apt.appointment_id} - {apt.status}")
        
        # Check admin user
        admin_users = User.query.filter_by(hospital_id=city_hospital.id, role='admin').all()
        print(f"\n👤 Admin Users:")
        for admin in admin_users:
            print(f"   • {admin.first_name} {admin.last_name} ({admin.email})")

if __name__ == '__main__':
    main()