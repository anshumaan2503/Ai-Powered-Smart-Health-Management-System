import os, sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.user import User
app = create_app()
with app.app_context():
    users = User.query.filter_by(hospital_id=1, role='admin').all()
    for u in users:
        print(f"Admin User {u.id}: {u.email}")
