from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital import db
from hospital.models.patient import Patient
from hospital.models.user import User
from hospital.utils.validators import validate_required_fields, validate_email, validate_phone, validate_date
from sqlalchemy.orm import joinedload
import uuid
import traceback

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/', methods=['POST'])
@jwt_required()
def create_patient():
    """Create a new patient"""
    try:
        current_identity = get_jwt_identity()
        user = None
        try:
            admin_user = User.query.get(int(current_identity))
        except:
            db.session.rollback()
            admin_user = User.query.get(int(current_identity))
            
        if not admin_user or not admin_user.hospital_id:
            return jsonify({'error': 'Unauthorized or no hospital associated'}), 401
            
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'phone', 'date_of_birth', 'gender']
        missing_fields = validate_required_fields(data, required_fields)
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Validate email if provided
        if data.get('email') and not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate phone
        if not validate_phone(data['phone']):
            return jsonify({'error': 'Invalid phone number format'}), 400
        
        # Validate date of birth
        if not validate_date(data['date_of_birth']):
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Check if user with this email or phone already exists
        email = data.get('email')
        phone = data.get('phone')
        
        existing_user = User.query.filter(
            (User.email == email) | (User.phone == phone)
        ).first()
        
        if existing_user:
            return jsonify({'error': 'User with this email or phone already exists'}), 409
        
        # Create User first
        patient_user = User(
            email=email,
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=phone,
            role='patient',
            hospital_id=admin_user.hospital_id
        )
        patient_user.set_password(str(uuid.uuid4())[:12]) # Random password for patients
        db.session.add(patient_user)
        db.session.flush()

        # Generate unique patient ID
        patient_id = f"PAT{str(uuid.uuid4())[:8].upper()}"
        
        # Create new patient profile
        patient = Patient(
            patient_id=patient_id,
            user_id=patient_user.id,
            date_of_birth=data['date_of_birth'],
            gender=data['gender'],
            address=data.get('address'),
            emergency_contact_name=data.get('emergency_contact_name'),
            emergency_contact_phone=data.get('emergency_contact_phone'),
            blood_group=data.get('blood_group'),
            allergies=data.get('allergies'),
            medical_history=data.get('medical_history'),
            hospital_id=admin_user.hospital_id
        )
        
        db.session.add(patient)
        db.session.commit()
        
        return jsonify({
            'message': 'Patient created successfully',
            'patient': patient.to_dict()
        }), 201
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'traceback': error_trace,
            'message': 'Internal Server Error during patient creation'
        }), 500

@patients_bp.route('/', methods=['GET'])
@jwt_required()
def get_patients():
    """Get all patients with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        
        query = Patient.query.options(joinedload(Patient.user))
        
        # Apply search filter
        if search:
            query = query.filter(
                db.or_(
                    User.first_name.ilike(f'%{search}%'),
                    User.last_name.ilike(f'%{search}%'),
                    Patient.patient_id.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%'),
                    User.phone.ilike(f'%{search}%')
                )
            )
        
        patients = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'patients': [patient.to_dict() for patient in patients.items],
            'total': patients.total,
            'pages': patients.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@patients_bp.route('/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    """Get a specific patient"""
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        return jsonify({'patient': patient.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@patients_bp.route('/<int:patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    """Update a patient"""
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        data = request.get_json()
        
        # Validate email if provided
        if data.get('email') and not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate phone if provided
        if data.get('phone') and not validate_phone(data['phone']):
            return jsonify({'error': 'Invalid phone number format'}), 400
        
        # Update user fields if provided
        user_fields = ['first_name', 'last_name', 'email', 'phone']
        for field in user_fields:
            if field in data and patient.user:
                setattr(patient.user, field, data[field])
                
        # Update patient fields
        patient_fields = [
            'address', 'emergency_contact_name', 'emergency_contact_phone', 
            'blood_group', 'allergies', 'medical_history'
        ]
        
        for field in patient_fields:
            if field in data:
                setattr(patient, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Patient updated successfully',
            'patient': patient.to_dict()
        }), 200
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'traceback': error_trace,
            'message': 'Internal Server Error during patient update'
        }), 500

@patients_bp.route('/<int:patient_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(patient_id):
    """Delete a patient (soft delete by deactivating)"""
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # In a real system, you might want to soft delete instead of hard delete
        # For now, we'll just delete the record
        # Delete User and Patient record
        if patient.user:
            db.session.delete(patient.user)
        db.session.delete(patient)
        db.session.commit()
        
        return jsonify({'message': 'Patient deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500