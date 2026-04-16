from hospital import create_app, db
from hospital.models.user import User
from hospital.models.doctor import Doctor
import uuid

app = create_app('default')
print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

with app.app_context():
    # Find all users with role 'doctor'
    all_doctor_users = User.query.filter_by(role='doctor').all()
    print(f"Total users with role 'doctor': {len(all_doctor_users)}")

    # Find users with role 'doctor' who don't have a record in the 'Doctor' table
    doctors_without_profiles = db.session.query(User).filter(
        User.role == 'doctor'
    ).outerjoin(Doctor, User.id == Doctor.user_id).filter(
        Doctor.id == None
    ).all()

    print(f"Found {len(doctors_without_profiles)} doctors without profiles.")

    for user in doctors_without_profiles:
        print(f"Fixing doctor: {user.full_name} ({user.email}) - ID: {user.id}")
        
        # Create a default doctor profile
        profile = Doctor(
            doctor_id=f"DOC{str(uuid.uuid4())[:8].upper()}",
            user_id=user.id,
            specialization="General Medicine",
            qualification="MBBS",
            experience_years=5,
            license_number=f"LIC{str(uuid.uuid4())[:8].upper()}",
            consultation_fee=500.0,
            hospital_id=user.hospital_id
        )
        db.session.add(profile)
        print(f"Created profile for {user.full_name}")

    if len(doctors_without_profiles) > 0:
        db.session.commit()
        print("Successfully fixed all missing doctor profiles.")
    else:
        print("No missing profiles found.")
