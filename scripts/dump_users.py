import os, sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.user import User
app = create_app()
with app.app_context():
    users = User.query.all()
    with open('full_user_list.txt', 'w') as f:
        for u in users:
            f.write(f"User {u.id}: Email: {u.email} | Role: {u.role} | HospID: {u.hospital_id}\n")
