from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from hospital import db
from hospital.models.user import User
from hospital.utils.validators import validate_email

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Basic password validation - just check if it exists
        if not data['password']:
            return jsonify({'error': 'Password is required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create new user
        user = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone'),
            role=data['role']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.flush()  # Flush to get user.id
        
        # If registering as patient, create patient profile
        if data['role'] == 'patient':
            from hospital.models.patient import Patient
            import uuid
            
            # Generate unique patient ID
            patient_id = f"PAT{str(uuid.uuid4())[:8].upper()}"
            
            patient = Patient(
                user_id=user.id,
                patient_id=patient_id
            )
            db.session.add(patient)
        
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Get login identifier (email or username)
        login_identifier = data.get('email') or data.get('username')
        password = data.get('password')
        
        if not login_identifier or not password:
            return jsonify({'error': 'Login credentials are required'}), 400
        
        # Try to find user by email first, then by username (for admin)
        user = User.query.filter_by(email=login_identifier).first()
        
        # If not found by email and it looks like a username (no @), try username lookup
        if not user and '@' not in login_identifier:
            # For admin users, check if username matches a pattern
            if login_identifier.lower() == 'admin':
                user = User.query.filter_by(role='admin').first()
            elif login_identifier.lower() == 'doctor':
                user = User.query.filter_by(role='doctor').first()
            elif login_identifier.lower() == 'nurse':
                user = User.query.filter_by(role='nurse').first()
            elif login_identifier.lower() == 'receptionist':
                user = User.query.filter_by(role='receptionist').first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Auto-reactivate account if it was deactivated
        if not user.is_active:
            user.is_active = True
            db.session.commit()
        
        # Convert user.id to string as required by Flask-JWT-Extended
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        # Ensure identity is string
        new_token = create_access_token(identity=str(current_user_id))
        return jsonify({'access_token': new_token}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        
        # Validate that we got a valid user ID
        if not current_user_id:
            return jsonify({'error': 'Invalid token - no user identity'}), 422
        
        # Convert string identity back to int for database query
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Build response with user data
        response_data = user.to_dict()
        
        # Add full patient profile data if user is a patient
        if user.role == 'patient' and user.patient_profile:
            from hospital.models.patient import Patient
            patient = user.patient_profile
            
            response_data.update({
                'patient_id': patient.patient_id,
                'date_of_birth': patient.date_of_birth.isoformat() if patient.date_of_birth else None,
                'gender': patient.gender,
                'blood_group': patient.blood_group,
                'address': patient.address,
                'emergency_contact_name': patient.emergency_contact_name,
                'emergency_contact_phone': patient.emergency_contact_phone,
                'medical_history': patient.medical_history,
                'allergies': patient.allergies
            })
        
        return jsonify(response_data), 200
        
    except Exception as e:
        # Log the specific error for debugging
        print(f"Profile endpoint error: {str(e)}")
        return jsonify({'error': 'Authentication failed', 'details': str(e)}), 422

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile including patient details"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update user basic info
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        
        # Update patient-specific info if user is a patient
        if user.role == 'patient' and user.patient_profile:
            patient = user.patient_profile
            
            if 'date_of_birth' in data and data['date_of_birth']:
                from datetime import datetime
                try:
                    patient.date_of_birth = datetime.fromisoformat(data['date_of_birth'].replace('Z', '+00:00')).date()
                except:
                    patient.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            
            if 'gender' in data:
                patient.gender = data['gender']
            if 'blood_group' in data:
                patient.blood_group = data['blood_group']
            if 'address' in data:
                patient.address = data['address']
            if 'emergency_contact_name' in data:
                patient.emergency_contact_name = data['emergency_contact_name']
            if 'emergency_contact_phone' in data:
                patient.emergency_contact_phone = data['emergency_contact_phone']
            if 'medical_history' in data:
                patient.medical_history = data['medical_history']
            if 'allergies' in data:
                patient.allergies = data['allergies']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
