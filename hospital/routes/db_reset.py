"""
Database reset endpoint for production
Call this endpoint to reset and populate the database with demo data
"""

from flask import Blueprint, request, jsonify
from hospital import db
from hospital.models.hospital import Hospital
from hospital.models.user import User
from hospital.models.patient import Patient
from hospital.models.doctor import Doctor
from hospital.models.hospital_subscription import HospitalSubscription
from datetime import date, timedelta
import random
import uuid

# Create a simple blueprint for database management
db_reset_bp = Blueprint('db_reset', __name__)

@db_reset_bp.route('/init-demo-data', methods=['POST'])
def init_demo_data():
    """Initialize database with demo data - PUBLIC endpoint for first-time setup"""
    
    try:
        # Check if data already exists
        existing_hospitals = Hospital.query.count()
        
        if existing_hospitals > 0:
            return jsonify({
                'success': False,
                'message': 'Database already initialized. Use different endpoint to reset.',
                'existing_hospitals': existing_hospitals
            }), 400
        
        # Clear existing data (just to be safe)
        Patient.query.delete()
        Doctor.query.delete()
        HospitalSubscription.query.delete()
        User.query.delete()
        Hospital.query.delete()
        
        # Create 2 hospitals
        hospitals_data = [
            {
                "name": "City General Hospital",
                "email": "city@hospital.com",
                "address": "123 Healthcare Avenue, Medical District, Mumbai 400001",
                "phone": "02212345678",
                "license_number": "MH-1234-2024"
            },
            {
                "name": "Apollo Multispecialty Hospital", 
                "email": "apollo@hospital.com",
                "address": "456 Medical District, Apollo Complex, Delhi 110001",
                "phone": "01123456789",
                "license_number": "DL-5678-2024"
            }
        ]
        
        hospitals = []
        for hospital_data in hospitals_data:
            hospital = Hospital(
                name=hospital_data["name"],
                email=hospital_data["email"],
                address=hospital_data["address"],
                phone=hospital_data["phone"],
                license_number=hospital_data["license_number"]
            )
            db.session.add(hospital)
            hospitals.append(hospital)
        
        db.session.flush()
        
        # Create hospital admins (password: 123)
        for hospital in hospitals:
            admin = User(
                email=hospital.email,
                first_name=hospital.name.split()[0],
                last_name="Admin",
                role="admin",
                hospital_id=hospital.id
            )
            admin.set_password("123")
            db.session.add(admin)
        
        db.session.flush()
        
        # Create subscriptions
        for hospital in hospitals:
            subscription = HospitalSubscription(
                hospital_id=hospital.id,
                plan_name="premium",
                max_patients=-1,
                max_doctors=-1,
                max_staff=-1,
                features=["all"],
                subscription_start=date.today(),
                subscription_end=date.today() + timedelta(days=365),
                monthly_fee=199.99
            )
            db.session.add(subscription)
        
        db.session.flush()
        
        # Create 3 demo patients (password: 123)
        patient_names = [
            {"first_name": "Arjun", "last_name": "Sharma", "phone": "9876543210", "gender": "Male"},
            {"first_name": "Priya", "last_name": "Patel", "phone": "9876543211", "gender": "Female"},
            {"first_name": "Rahul", "last_name": "Singh", "phone": "9876543212", "gender": "Male"},
        ]
        
        for i, patient_data in enumerate(patient_names):
            hospital = hospitals[i % len(hospitals)]
            
            patient_user = User(
                email=f"{patient_data['first_name'].lower()}@patient.com",
                first_name=patient_data['first_name'],
                last_name=patient_data['last_name'],
                phone=patient_data['phone'],
                role="patient",
                is_active=True
            )
            patient_user.set_password("123")
            db.session.add(patient_user)
            db.session.flush()
            
            patient = Patient(
                user_id=patient_user.id,
                patient_id=f"PAT{str(patient_user.id).zfill(4)}",
                date_of_birth=date(1990, 1, 1),
                gender=patient_data['gender'],
                blood_group='O+',
                address="Mumbai, India",
                emergency_contact_name="Emergency Contact",
                emergency_contact_phone="9876543299",
                hospital_id=hospital.id
            )
            db.session.add(patient)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Demo data initialized successfully!',
            'credentials': {
                'patients': [
                    {'email': 'arjun@patient.com', 'password': '123'},
                    {'email': 'priya@patient.com', 'password': '123'},
                    {'email': 'rahul@patient.com', 'password': '123'}
                ],
                'hospital_admins': [
                    {'email': 'city@hospital.com', 'password': '123'},
                    {'email': 'apollo@hospital.com', 'password': '123'}
                ]
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
