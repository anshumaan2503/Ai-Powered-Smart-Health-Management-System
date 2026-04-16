import os
import sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User

def list_users():
    app = create_app()
    with app.app_context():
        hospital = Hospital.query.get(1)
        if not hospital:
            return
            
        print(f"Hospital #1: {hospital.name} | Current Email: {hospital.email}")
        
        users = User.query.filter_by(hospital_id=1).all()
        for u in users:
            print(f"User {u.id}: Email: {u.email} | Role: {u.role}")

if __name__ == '__main__':
    list_users()
