import os, sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.user import User
app = create_app()
with app.app_context():
    admins = User.query.filter_by(role='admin').all()
    for u in admins:
        print(f"Admin {u.id}: {u.email} | HospID: {u.hospital_id}")
