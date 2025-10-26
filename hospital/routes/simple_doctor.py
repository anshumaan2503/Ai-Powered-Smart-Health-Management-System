from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital import db
from hospital.models.user import User
from hospital.models.doctor import Doctor
from hospital.models.hospital import Hospital
import uuid

simple_doctor_bp = Blueprint('simple_doctor', __name__)

@simple_doctor_bp.route('/simple-add-doctor', methods=['POST'])
@jwt_required()
def simple_add_doctor():
    """Simple doctor addition with minimal validation"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        print(f"Received data: {data}")
        
        # Simple validation - just check required fields exist
        required = ['first_name', 'last_name', 'email', 'password']
        for field in required:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if email already exists
        existing = User.query.filter_by(email=data['email']).first()
        if existing:
            return jsonify({'error': 'Email already exists'}), 409
        
        # Create doctor user
        doctor_user = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone', ''),
            role='doctor',
            hospital_id=user.hospital_id,
            is_active=True
        )
        doctor_user.set_password(data['password'])
        
        db.session.add(doctor_user)
        db.session.flush()
        
        # Create doctor profile
        doctor_profile = Doctor(
            doctor_id=f"DOC{str(uuid.uuid4())[:8].upper()}",
            user_id=doctor_user.id,
            specialization=data.get('specialization', 'General Medicine'),
            qualification=data.get('qualification', 'MBBS'),
            experience_years=int(data.get('experience_years', 0)),
            license_number=data.get('license_number', f"LIC{str(uuid.uuid4())[:8].upper()}"),
            consultation_fee=float(data.get('consultation_fee', 500)),
            hospital_id=user.hospital_id,
            is_available=True,
            rating=0.0,
            total_patients=0
        )
        
        db.session.add(doctor_profile)
        db.session.commit()
        
        return jsonify({
            'message': 'Doctor added successfully!',
            'doctor': {
                'id': doctor_user.id,
                'name': f"Dr. {doctor_user.first_name} {doctor_user.last_name}",
                'email': doctor_user.email,
                'specialization': doctor_profile.specialization,
                'consultation_fee': doctor_profile.consultation_fee
            }
        }), 201
        
    except Exception as e:
        print(f"Error: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500