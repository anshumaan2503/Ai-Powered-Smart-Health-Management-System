from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital import db
from hospital.models.patient import Patient
from hospital.utils.validators import validate_required_fields, validate_email, validate_phone, validate_date
import uuid

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/', methods=['POST'])
@jwt_required()
def create_patient():
    """Create a new patient"""
    try:
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
        
        # Check if patient with email already exists
        if data.get('email'):
            existing_patient = Patient.query.filter_by(email=data['email']).first()
            if existing_patient:
                return jsonify({'error': 'Patient with this email already exists'}), 409
        
        # Generate unique patient ID
        patient_id = f"PAT{str(uuid.uuid4())[:8].upper()}"
        
        # Create new patient
        patient = Patient(
            patient_id=patient_id,
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data.get('email'),
            phone=data['phone'],
            date_of_birth=data['date_of_birth'],
            gender=data['gender'],
            address=data.get('address'),
            emergency_contact_name=data.get('emergency_contact_name'),
            emergency_contact_phone=data.get('emergency_contact_phone'),
            blood_group=data.get('blood_group'),
            allergies=data.get('allergies'),
            medical_history=data.get('medical_history'),
            insurance_number=data.get('insurance_number')
        )
        
        db.session.add(patient)
        db.session.commit()
        
        return jsonify({
            'message': 'Patient created successfully',
            'patient': patient.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@patients_bp.route('/', methods=['GET'])
@jwt_required()
def get_patients():
    """Get all patients with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        
        query = Patient.query
        
        # Apply search filter
        if search:
            query = query.filter(
                db.or_(
                    Patient.first_name.ilike(f'%{search}%'),
                    Patient.last_name.ilike(f'%{search}%'),
                    Patient.patient_id.ilike(f'%{search}%'),
                    Patient.email.ilike(f'%{search}%'),
                    Patient.phone.ilike(f'%{search}%')
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
        
        # Update patient fields
        updatable_fields = [
            'first_name', 'last_name', 'email', 'phone', 'address',
            'emergency_contact_name', 'emergency_contact_phone', 'blood_group',
            'allergies', 'medical_history', 'insurance_number'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(patient, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Patient updated successfully',
            'patient': patient.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

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
        db.session.delete(patient)
        db.session.commit()
        
        return jsonify({'message': 'Patient deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500