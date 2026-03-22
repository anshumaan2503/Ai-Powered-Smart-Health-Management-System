"""
Add Patient Profile for Existing Patient Users
This script creates Patient records for users with role='patient' who don't have a patient profile yet
"""

from hospital import db, create_app
from hospital.models.user import User
from hospital.models.patient import Patient
import uuid

def create_missing_patient_profiles():
    """Create patient profiles for users who don't have one"""
    app = create_app()
    
    with app.app_context():
        try:
            # Find all users with role='patient' who don't have a patient profile
            users_without_profile = User.query.filter(
                User.role == 'patient',
                ~User.id.in_(db.session.query(Patient.user_id))
            ).all()
            
            if not users_without_profile:
                print("✓ All patient users already have profiles!")
                return
            
            print(f"Found {len(users_without_profile)} patient users without profiles")
            
            created_count = 0
            for user in users_without_profile:
                # Generate unique patient ID
                patient_id = f"PAT{str(uuid.uuid4())[:8].upper()}"
                
                # Create patient profile
                patient = Patient(
                    user_id=user.id,
                    patient_id=patient_id
                )
                db.session.add(patient)
                created_count += 1
                print(f"Created patient profile for: {user.email} (ID: {patient_id})")
            
            db.session.commit()
            print(f"\n✅ Successfully created {created_count} patient profiles!")
            
        except Exception as e:
            db.session.rollback()
            print(f"\n❌ Error: {str(e)}")
            raise e

if __name__ == '__main__':
    create_missing_patient_profiles()
