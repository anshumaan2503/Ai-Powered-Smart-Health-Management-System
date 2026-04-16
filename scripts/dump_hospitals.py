import os, sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.hospital import Hospital
app = create_app()
with app.app_context():
    hospitals = Hospital.query.all()
    with open('full_hospital_list.txt', 'w') as f:
        for h in hospitals:
            f.write(f"Hosp {h.id}: {h.name} | Email: {h.email}\n")
