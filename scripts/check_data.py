import os, sys
sys.path.append(os.getcwd())
from dotenv import load_dotenv
load_dotenv()
from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User
from hospital.models.doctor import Doctor
from hospital.models.patient import Patient
from hospital.models.appointment import Appointment

def check_data_counts():
    app = create_app()
    with app.app_context():
        hospitals = Hospital.query.all()
        for h in hospitals:
            print(f"\nHospital {h.id}: {h.name} ({h.email})")
            
            # Count doctors
            doctors = Doctor.query.filter_by(hospital_id=h.id).count()
            
            # Count patients
            patients = Patient.query.filter_by(hospital_id=h.id).count()
            
            # Count users
            users = User.query.filter_by(hospital_id=h.id).count()
            
            # Count appointments
            appointments = Appointment.query.filter_by(hospital_id=h.id).count()
            
            print(f" - Users: {users}")
            print(f" - Doctors: {doctors}")
            print(f" - Patients: {patients}")
            print(f" - Appointments: {appointments}")

if __name__ == '__main__':
    check_data_counts()
