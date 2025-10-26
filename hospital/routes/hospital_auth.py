from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from hospital import db
from hospital.models.hospital import Hospital
from hospital.models.user import User
from hospital.models.doctor import Doctor
from hospital.models.hospital_subscription import HospitalSubscription
from hospital.utils.validators import validate_email, validate_password
from datetime import datetime, date, timedelta
import uuid

hospital_auth_bp = Blueprint('hospital_auth', __name__)

@hospital_auth_bp.route('/register', methods=['POST'])
def register_hospital():
    """Register a new hospital with admin user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = [
            'hospital_name', 'admin_first_name', 'admin_last_name', 
            'admin_email', 'admin_password', 'hospital_phone', 'hospital_address'
        ]
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        if not validate_email(data['admin_email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Allow any password (no validation)
        # Password can be any length and any characters
        
        # Check if hospital email already exists
        existing_user = User.query.filter_by(email=data['admin_email']).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create hospital
        hospital = Hospital(
            name=data['hospital_name'],
            address=data['hospital_address'],
            phone=data['hospital_phone'],
            email=data.get('hospital_email', data['admin_email']),
            license_number=data.get('license_number', f"LIC{str(uuid.uuid4())[:8].upper()}")
        )
        
        db.session.add(hospital)
        db.session.flush()  # Get hospital ID
        
        # Create admin user for hospital
        admin_user = User(
            email=data['admin_email'],
            first_name=data['admin_first_name'],
            last_name=data['admin_last_name'],
            phone=data.get('admin_phone'),
            role='admin',
            hospital_id=hospital.id
        )
        admin_user.set_password(data['admin_password'])
        
        db.session.add(admin_user)
        
        # Create default subscription (trial)
        subscription = HospitalSubscription(
            hospital_id=hospital.id,
            plan_name='trial',
            max_patients=50,
            max_doctors=3,
            max_staff=5,
            features=['basic_management', 'appointments', 'medical_records'],
            subscription_start=date.today(),
            subscription_end=date.today() + timedelta(days=30),  # 30-day trial
            monthly_fee=0.0
        )
        
        db.session.add(subscription)
        db.session.commit()
        
        return jsonify({
            'message': 'Hospital registered successfully',
            'hospital': hospital.to_dict(),
            'admin_user': admin_user.to_dict(),
            'subscription': subscription.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@hospital_auth_bp.route('/login', methods=['POST'])
def hospital_login():
    """Hospital staff login"""
    try:
        data = request.get_json()
        
        # Get login identifier (email or username)
        login_identifier = data.get('email') or data.get('username')
        password = data.get('password')
        
        if not login_identifier or not password:
            return jsonify({'error': 'Login credentials are required'}), 400
        
        # Find user by email
        user = User.query.filter_by(email=login_identifier).first()
        
        # If not found by email and it looks like a username, try username lookup
        if not user and '@' not in login_identifier:
            # For demo purposes, allow simple username login
            if login_identifier.lower() == 'admin':
                user = User.query.filter_by(role='admin').first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Check hospital subscription status
        if user.hospital_id:
            hospital = Hospital.query.get(user.hospital_id)
            subscription = HospitalSubscription.query.filter_by(
                hospital_id=user.hospital_id, 
                is_active=True
            ).first()
            
            if not subscription or subscription.subscription_end < date.today():
                return jsonify({'error': 'Hospital subscription has expired'}), 403
        
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        # Include hospital and subscription info in response
        response_data = {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }
        
        if user.hospital_id:
            hospital = Hospital.query.get(user.hospital_id)
            subscription = HospitalSubscription.query.filter_by(
                hospital_id=user.hospital_id, 
                is_active=True
            ).first()
            
            response_data['hospital'] = hospital.to_dict() if hospital else None
            response_data['subscription'] = subscription.to_dict() if subscription else None
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hospital_auth_bp.route('/hospital-profile', methods=['GET'])
@jwt_required()
def get_hospital_profile():
    """Get hospital profile and subscription details"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        hospital = Hospital.query.get(user.hospital_id)
        subscription = HospitalSubscription.query.filter_by(
            hospital_id=user.hospital_id, 
            is_active=True
        ).first()
        
        if not hospital:
            return jsonify({'error': 'Hospital not found'}), 404
        
        response_data = {
            'hospital': hospital.to_dict(),
            'subscription': subscription.to_dict() if subscription else None,
            'usage_stats': subscription.get_usage_stats() if subscription else None
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hospital_auth_bp.route('/subscription-status', methods=['GET'])
@jwt_required()
def get_subscription_status():
    """Get current subscription status and usage"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        subscription = HospitalSubscription.query.filter_by(
            hospital_id=user.hospital_id, 
            is_active=True
        ).first()
        
        if not subscription:
            return jsonify({'error': 'No active subscription found'}), 404
        
        usage_stats = subscription.get_usage_stats()
        days_remaining = (subscription.subscription_end - date.today()).days
        
        return jsonify({
            'subscription': subscription.to_dict(),
            'usage_stats': usage_stats,
            'days_remaining': max(0, days_remaining),
            'is_trial': subscription.plan_name == 'trial',
            'needs_upgrade': any(
                usage['percentage'] > 80 
                for usage in usage_stats.values()
            )
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@hospital_auth_bp.route('/hospitals', methods=['GET'])
def get_all_hospitals():
    """Get all active hospitals for patient dashboard"""
    try:
        # Filter out deleted hospitals (those with [DELETED] in name) and inactive hospitals
        hospitals = Hospital.query.filter(
            Hospital.is_active == True,
            ~Hospital.name.like('%[DELETED]%')
        ).all()
        
        hospitals_data = []
        for hospital in hospitals:
            # Skip hospitals with [DELETED] in name as extra safety check
            if '[DELETED]' in hospital.name:
                continue
                
            # Get doctor count for this hospital
            doctor_count = User.query.filter_by(
                hospital_id=hospital.id, 
                role='doctor', 
                is_active=True
            ).count()
            
            hospital_data = hospital.to_dict()
            hospital_data['total_doctors'] = doctor_count
            hospital_data['rating'] = 4.5  # Mock rating
            hospital_data['specializations'] = ['General Medicine', 'Cardiology', 'Neurology']  # Mock specializations
            
            hospitals_data.append(hospital_data)
        
        return jsonify({
            'success': True,
            'hospitals': hospitals_data,
            'total': len(hospitals_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hospital_auth_bp.route('/hospitals/<int:hospital_id>', methods=['GET'])
def get_hospital_details(hospital_id):
    """Get specific hospital details"""
    try:
        hospital = Hospital.query.get_or_404(hospital_id)
        
        # Check if hospital is active and not deleted
        if not hospital.is_active or '[DELETED]' in hospital.name:
            return jsonify({'error': 'Hospital not found'}), 404
        
        # Get doctor count
        doctor_count = User.query.filter_by(
            hospital_id=hospital.id, 
            role='doctor', 
            is_active=True
        ).count()
        
        hospital_data = hospital.to_dict()
        hospital_data['total_doctors'] = doctor_count
        hospital_data['total_beds'] = 150  # Mock data
        hospital_data['rating'] = 4.5  # Mock rating
        hospital_data['specializations'] = ['General Medicine', 'Cardiology', 'Neurology', 'Pediatrics']
        hospital_data['description'] = f"{hospital.name} is a leading healthcare provider committed to delivering exceptional medical care with state-of-the-art facilities and experienced medical professionals."
        hospital_data['established_year'] = 2010  # Mock data
        
        return jsonify({
            'success': True,
            'hospital': hospital_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hospital_auth_bp.route('/hospitals/<int:hospital_id>/doctors', methods=['GET'])
def get_hospital_doctors(hospital_id):
    """Get all doctors for a specific hospital (public endpoint for patients)"""
    try:
        # Check if hospital exists and is active
        hospital = Hospital.query.get_or_404(hospital_id)
        
        if not hospital.is_active or '[DELETED]' in hospital.name:
            return jsonify({'error': 'Hospital not found'}), 404
        
        # Get all active doctors for this hospital
        doctors = db.session.query(Doctor, User).join(User).filter(
            Doctor.hospital_id == hospital_id,
            User.is_active == True,
            Doctor.is_available == True
        ).all()
        
        doctors_data = []
        for doctor, user in doctors:
            doctor_data = doctor.to_dict()
            # Add user information
            doctor_data['name'] = user.full_name
            doctor_data['email'] = user.email
            doctor_data['phone'] = user.phone
            # Add mock data for patient view
            doctor_data['consultation_fee'] = 150 + (doctor.experience_years * 10)  # Dynamic fee based on experience
            doctor_data['available_days'] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            doctor_data['available_times'] = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
            doctor_data['rating'] = min(5.0, 4.0 + (doctor.experience_years * 0.05))  # Rating based on experience
            
            doctors_data.append(doctor_data)
        
        return jsonify({
            'success': True,
            'doctors': doctors_data,
            'hospital_name': hospital.name,
            'total': len(doctors_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hospital_auth_bp.route('/doctors', methods=['GET'])
def get_all_doctors():
    """Get all doctors from all hospitals (public endpoint for patients)"""
    try:
        hospital_id = request.args.get('hospital_id', type=int)
        specialization = request.args.get('specialization', '')
        
        # Base query - join Doctor with User and Hospital
        query = db.session.query(Doctor, User, Hospital).join(User).join(Hospital).filter(
            User.is_active == True,
            Doctor.is_available == True,
            Hospital.is_active == True,
            ~Hospital.name.like('%[DELETED]%')
        )
        
        # Apply filters
        if hospital_id:
            query = query.filter(Doctor.hospital_id == hospital_id)
        
        if specialization:
            query = query.filter(Doctor.specialization.ilike(f'%{specialization}%'))
        
        results = query.all()
        
        doctors_data = []
        for doctor, user, hospital in results:
            doctor_data = doctor.to_dict()
            # Add user and hospital information
            doctor_data['name'] = user.full_name
            doctor_data['email'] = user.email
            doctor_data['phone'] = user.phone
            doctor_data['hospital_name'] = hospital.name
            doctor_data['hospital_id'] = hospital.id
            # Add mock data for patient view
            doctor_data['consultation_fee'] = 150 + (doctor.experience_years * 10)
            doctor_data['available_days'] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            doctor_data['available_times'] = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
            doctor_data['rating'] = min(5.0, 4.0 + (doctor.experience_years * 0.05))
            
            doctors_data.append(doctor_data)
        
        return jsonify({
            'success': True,
            'doctors': doctors_data,
            'total': len(doctors_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500