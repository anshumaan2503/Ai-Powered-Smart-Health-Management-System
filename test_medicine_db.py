#!/usr/bin/env python3
"""
Test script to check if medicines are in the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models import Medicine, Hospital, User

def test_medicine_data():
    app = create_app()
    
    with app.app_context():
        print("🔍 Checking Medicine Database...")
        
        # Check total medicines
        total_medicines = Medicine.query.count()
        print(f"Total medicines in database: {total_medicines}")
        
        # Check hospitals
        hospitals = Hospital.query.all()
        print(f"Total hospitals: {len(hospitals)}")
        
        for hospital in hospitals:
            medicine_count = Medicine.query.filter_by(hospital_id=hospital.id, is_active=True).count()
            print(f"Hospital '{hospital.name}' (ID: {hospital.id}) has {medicine_count} active medicines")
            
            # Show first 5 medicines for this hospital
            medicines = Medicine.query.filter_by(hospital_id=hospital.id, is_active=True).limit(5).all()
            for med in medicines:
                print(f"  - {med.name} ({med.category}) - Stock: {med.quantity_in_stock}")
        
        # Check users
        users = User.query.all()
        print(f"\nTotal users: {len(users)}")
        for user in users:
            print(f"User: {user.full_name} - Hospital ID: {user.hospital_id}")

if __name__ == '__main__':
    test_medicine_data()