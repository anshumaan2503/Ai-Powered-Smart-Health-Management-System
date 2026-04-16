import os, sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.hospital import Hospital
app = create_app()
with app.app_context():
    h = Hospital.query.get(1)
    if h:
        print(f"Hosp 1: {h.name} | is_active: {h.is_active} | Email: {h.email}")
    else:
        print("Hosp 1 not found")
