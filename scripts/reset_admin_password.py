import os, sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.user import User
app = create_app()
with app.app_context():
    # Sync Admin 1 for City Hospital
    u = User.query.filter_by(hospital_id=1, role='admin').first()
    if u:
        print(f"Setting Admin {u.id} email to city@hospital.com and password to 123")
        u.email = 'city@hospital.com'
        u.set_password('123')
        db.session.commit()
        print("Success: Password for city@hospital.com is now 123")
    else:
        print("Error: No admin found for Hospital 1")
