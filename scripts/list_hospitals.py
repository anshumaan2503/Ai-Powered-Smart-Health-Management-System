import os, sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.hospital import Hospital
app = create_app()
with app.app_context():
    hospitals = Hospital.query.all()
    for h in hospitals:
        print(f"Hosp {h.id}: {h.name} | Email: {h.email}")
