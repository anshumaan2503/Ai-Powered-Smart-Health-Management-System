import os
import sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User

def fix_city_hospital():
    app = create_app()
    with app.app_context():
        hospital = Hospital.query.get(1)
        if not hospital:
            print("Hospital #1 not found")
            return
            
        print(f"Hospital #1: {hospital.name} | Current Email: {hospital.email}")
        
        # List all users for this hospital
        users = User.query.filter_by(hospital_id=1).all()
        print(f"Found {len(users)} total users for this hospital.")
        
        for u in users:
            print(f" - User {u.id}: Email: {u.email} | Role: {u.role}")
            
            # If this user has an email that looks like a hospital admin/contact email 
            # and is different from the hospital email, update it.
            # OR as the user requested, change everything that was Igntu-related.
            
            if "igntu" in u.email.lower() or u.role == "admin":
                print(f"   -> Updating user {u.id} email from {u.email} to {hospital.email}")
                u.email = hospital.email
                
        db.session.commit()
        print("Done.")

if __name__ == '__main__':
    fix_city_hospital()
