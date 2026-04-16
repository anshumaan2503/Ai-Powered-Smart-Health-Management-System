import os, sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.user import User
app = create_app()
with app.app_context():
    users = User.query.filter(User.email.ilike('%igntu%')).all()
    print(f"Found {len(users)} users with 'igntu' in email.")
    for u in users:
        print(f"User {u.id}: Email: {u.email} | Role: {u.role} | HospID: {u.hospital_id}")
