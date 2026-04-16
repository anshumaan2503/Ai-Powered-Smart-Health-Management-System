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
        with open('postgres_data_full.txt', 'w') as f:
            for h in hospitals:
                f.write(f"\nHospital {h.id}: {h.name} ({h.email})\n")
                
                # Count doctors
                doctors = Doctor.query.filter_by(hospital_id=h.id).count()
                
                # Count patients
                patients = Patient.query.filter_by(hospital_id=h.id).count()
                
                # Count users
                users = User.query.filter_by(hospital_id=h.id).count()
                
                # Count appointments
                appointments = Appointment.query.filter_by(hospital_id=h.id).count()
                
                f.write(f" - Users: {users}\n")
                f.write(f" - Doctors: {doctors}\n")
                f.write(f" - Patients: {patients}\n")
                f.write(f" - Appointments: {appointments}\n")
        print("Done. Check postgres_data_full.txt")

if __name__ == '__main__':
    check_data_counts()
