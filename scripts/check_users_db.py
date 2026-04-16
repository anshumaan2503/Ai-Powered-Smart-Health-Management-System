import os
from dotenv import load_dotenv
load_dotenv()
from hospital import create_app
from hospital.models.user import User
from hospital.models.hospital import Hospital

app = create_app()
with app.app_context():
    print("--- Hospital List ---")
    hospitals = Hospital.query.all()
    if hospitals:
        for h in hospitals:
            print(f"ID: {h.id} | Name: {h.name} | Email: {h.email}")
    else:
        print("NO HOSPITALS FOUND in the database.")
    print("-------------------")
