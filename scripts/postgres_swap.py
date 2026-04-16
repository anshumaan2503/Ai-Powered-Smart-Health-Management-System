import os, sys
sys.path.append(os.getcwd())
from dotenv import load_dotenv
load_dotenv()
from hospital import create_app, db
from hospital.models.user import User

def swap_users():
    app = create_app()
    with app.app_context():
        # Target: User 1 (patient) and User 2 (admin)
        u1 = User.query.get(1)
        u2 = User.query.get(2)
        
        if not u1 or not u2:
            print("Users not found in Postgres!")
            return
            
        print(f"Postgres Pre-swap: U1={u1.email}({u1.role}), U2={u2.email}({u2.role})")
        
        # Temporary email for u1 to avoid unique constraint
        u1.email = "temp_patient@hospital.com"
        db.session.flush()
        
        # Set u2 (the actual admin) to the desired city@hospital.com email
        u2.email = "city@hospital.com"
        u2.set_password("123")
        
        # Set u1 to something else or back to igntu if desired
        u1.email = "city_patient@hospital.com"
        
        db.session.commit()
        print(f"Postgres Post-swap: U1={u1.email}({u1.role}), U2={u2.email}({u2.role})")

if __name__ == '__main__':
    swap_users()
