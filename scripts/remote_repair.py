import os, sys
sys.path.append(os.getcwd())
# Ensure .env is loaded (if create_app doesn't already do it)
from dotenv import load_dotenv
load_dotenv()

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User

def remote_repair():
    app = create_app()
    with app.app_context():
        print(f"DATABASE_URL: {os.environ.get('DATABASE_URL')}")
        
        # Check Hospital 1
        h = Hospital.query.get(1)
        if not h:
            print("Hospital #1 NOT FOUND in Postgres!")
            return
            
        print(f"Postgres Hosp 1: {h.name} | Email: {h.email}")
        
        # Check User 1
        u = User.query.filter_by(id=1).first()
        if u:
            print(f"Postgres User 1: {u.email} | Role: {u.role}")
            
            # The user says 'igntu@hospital.com' works but 'city@hospital.com' doesn't.
            # If User 1 is currently 'igntu@hospital.com', that explains it!
            
            if u.email != 'city@hospital.com':
                print(f"Syncing User 1 email to city@hospital.com and password to 123")
                u.email = 'city@hospital.com'
                u.set_password('123')
                db.session.commit()
                print("Successfully updated Postgres User 1.")
            else:
                print("User 1 is ALREADY city@hospital.com in Postgres. Password reset to 123.")
                u.set_password('123')
                db.session.commit()
        else:
           print("User #1 NOT FOUND in Postgres!")

if __name__ == '__main__':
    remote_repair()
