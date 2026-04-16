import os, sys
sys.path.append(os.getcwd())
from dotenv import load_dotenv
load_dotenv()
from hospital import create_app, db
from hospital.models.user import User

def list_all_remote_emails():
    app = create_app()
    with app.app_context():
        users = User.query.all()
        print(f"Total remote users: {len(users)}")
        with open('postgres_emails.txt', 'w') as f:
            for u in users:
                f.write(f"ID: {u.id} | Email: {u.email} | Role: {u.role} | Hosp: {u.hospital_id}\n")

if __name__ == '__main__':
    list_all_remote_emails()
