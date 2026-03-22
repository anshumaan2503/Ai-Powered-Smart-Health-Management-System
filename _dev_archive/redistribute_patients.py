#!/usr/bin/env python3
"""
Redistribute existing patients across all hospitals
"""

from hospital import create_app, db
from hospital.models.patient import Patient
from hospital.models.hospital import Hospital
import random

def redistribute_patients():
    app = create_app()
    
    with app.app_context():
        # Get all hospitals and patients
        hospitals = Hospital.query.all()
        patients = Patient.query.all()
        
        print(f"Redistributing {len(patients)} patients across {len(hospitals)} hospitals...")
        
        for patient in patients:
            # Assign patient to random hospital
            new_hospital = random.choice(hospitals)
            patient.hospital_id = new_hospital.id
            print(f"✅ Assigned {patient.user.first_name} {patient.user.last_name} to {new_hospital.name}")
        
        db.session.commit()
        
        # Show distribution
        print(f"\n📊 Patient Distribution:")
        for hospital in hospitals:
            patient_count = Patient.query.filter_by(hospital_id=hospital.id).count()
            print(f"   {hospital.name}: {patient_count} patients")
        
        print(f"\n🎉 Redistribution complete!")

if __name__ == '__main__':
    redistribute_patients()