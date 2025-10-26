from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital import db
from hospital.models.user import User
from hospital.models.patient import Patient
from hospital.models.doctor import Doctor
from hospital.models.hospital import Hospital
from hospital.models.hospital_subscription import HospitalSubscription
from hospital.utils.validators import validate_email, validate_password
import uuid

hospital_staff_bp = Blueprint('hospital_staff', __name__)

@hospital_staff_bp.route('/staff', methods=['GET'])
@jwt_required()
def get_hospital_staff():
    """Get all staff members for the hospital"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        # Check if user has admin privileges
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 100, type=int)  # Increased default to 100
        role_filter = request.args.get('role', '')
        
        query = User.query.filter_by(hospital_id=user.hospital_id)
        
        if role_filter:
            query = query.filter(User.role == role_filter)
        
        staff = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Get doctor profiles for doctor users
        staff_with_profiles = []
        for staff_member in staff.items:
            staff_dict = staff_member.to_dict()
            if staff_member.role == 'doctor':
                doctor_profile = Doctor.query.filter_by(user_id=staff_member.id).first()
                staff_dict['doctor_profile'] = doctor_profile.to_dict() if doctor_profile else None
            staff_with_profiles.append(staff_dict)
        
        return jsonify({
            'staff': staff_with_profiles,
            'total': staff.total,
            'pages': staff.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hospital_staff_bp.route('/staff', methods=['POST'])
@jwt_required()
def add_staff_member():
    """Add a new staff member to the hospital"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            print(f"DEBUG: User not associated with hospital. User: {user}, Hospital ID: {user.hospital_id if user else None}")
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin']:
            print(f"DEBUG: User role not admin. Role: {user.role}")
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        print(f"DEBUG: Received data: {data}")
        
        # Auto-generate email and password for all staff if not provided
        if not data.get('email'):
            hospital = Hospital.query.get(user.hospital_id)
            hospital_domain = hospital.name.lower().replace(' ', '').replace('-', '') if hospital else 'hospital'
            first_name = data.get('first_name', '').lower().replace(' ', '')
            last_name = data.get('last_name', '').lower().replace(' ', '')
            
            # Create email: firstname.lastname@hospitaldomain.com
            base_email = f"{first_name}.{last_name}@{hospital_domain}.com"
            
            # Check if email exists, if so add number
            counter = 1
            generated_email = base_email
            while User.query.filter_by(email=generated_email).first():
                generated_email = f"{first_name}.{last_name}{counter}@{hospital_domain}.com"
                counter += 1
            
            data['email'] = generated_email
        
        # Auto-generate simple password if not provided
        if not data.get('password'):
            # Set default password to 123 for all staff
            data['password'] = "123"
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'role', 'password']
        for field in required_fields:
            if not data.get(field):
                print(f"DEBUG: Missing required field: {field}")
                return jsonify({'error': f'{field} is required'}), 422
        
        # Check subscription limits
        subscription = HospitalSubscription.query.filter_by(
            hospital_id=user.hospital_id, 
            is_active=True
        ).first()
        
        if subscription:
            current_staff_count = User.query.filter_by(hospital_id=user.hospital_id).count()
            if current_staff_count >= subscription.max_staff:
                return jsonify({
                    'error': f'Staff limit reached. Current plan allows {subscription.max_staff} staff members. Please upgrade your subscription.'
                }), 403
        
        # Validate email format
        if not validate_email(data['email']):
            print(f"DEBUG: Invalid email format: {data['email']}")
            return jsonify({'error': 'Invalid email format'}), 422
        
        # Skip password validation for now - will add restrictions later
        # if not validate_password(data['password']):
        #     print(f"DEBUG: Invalid password: {data['password']}")
        #     return jsonify({'error': 'Password must be at least 8 characters with uppercase, lowercase, and number'}), 422
        
        # Check if email already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            print(f"DEBUG: Email already exists: {data['email']}")
            return jsonify({'error': 'Email already registered'}), 422
        
        # Create new staff member
        print(f"DEBUG: Creating user with data: {data}")
        print(f"DEBUG: Hospital ID: {user.hospital_id}")
        
        new_staff = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone'),
            role=data['role'],
            hospital_id=user.hospital_id
        )
        new_staff.set_password(data['password'])
        
        print(f"DEBUG: User object created: {new_staff}")
        
        db.session.add(new_staff)
        print("DEBUG: User added to session")
        
        db.session.flush()
        print("DEBUG: Session flushed successfully")
        
        # If role is doctor, create doctor profile
        if data['role'] == 'doctor':
            # Check doctor limit
            if subscription:
                current_doctors = Doctor.query.filter_by(hospital_id=user.hospital_id).count()
                if current_doctors >= subscription.max_doctors:
                    db.session.rollback()
                    return jsonify({
                        'error': f'Doctor limit reached. Current plan allows {subscription.max_doctors} doctors. Please upgrade your subscription.'
                    }), 403
            
            doctor_profile = Doctor(
                doctor_id=f"DOC{str(uuid.uuid4())[:8].upper()}",
                user_id=new_staff.id,
                specialization=data.get('specialization', 'General Medicine'),
                qualification=data.get('qualification', ''),
                experience_years=data.get('experience_years', 0),
                license_number=data.get('license_number', f"LIC{str(uuid.uuid4())[:8].upper()}"),
                consultation_fee=data.get('consultation_fee', 0.0),
                hospital_id=user.hospital_id
            )
            db.session.add(doctor_profile)
        
        print("DEBUG: About to commit transaction")
        db.session.commit()
        print("DEBUG: Transaction committed successfully")
        
        response_data = new_staff.to_dict()
        if data['role'] == 'doctor':
            doctor_profile = Doctor.query.filter_by(user_id=new_staff.id).first()
            response_data['doctor_profile'] = doctor_profile.to_dict() if doctor_profile else None
        
        return jsonify({
            'message': 'Staff member added successfully',
            'staff_member': response_data
        }), 201
        
    except Exception as e:
        print(f"DEBUG: Exception occurred: {e}")
        print(f"DEBUG: Exception type: {type(e)}")
        db.session.rollback()
        
        # Return more specific error information
        error_msg = str(e)
        if "UNIQUE constraint failed" in error_msg:
            return jsonify({'error': 'Email address already exists in database'}), 422
        elif "NOT NULL constraint failed" in error_msg:
            return jsonify({'error': f'Required field missing: {error_msg}'}), 422
        else:
            return jsonify({'error': f'Database error: {error_msg}'}), 422

@hospital_staff_bp.route('/staff/<int:staff_id>', methods=['PUT'])
@jwt_required()
def update_staff_member(staff_id):
    """Update a staff member"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        staff_member = User.query.filter_by(
            id=staff_id, 
            hospital_id=user.hospital_id
        ).first()
        
        if not staff_member:
            return jsonify({'error': 'Staff member not found'}), 404
        
        data = request.get_json()
        
        # Update basic user fields
        updatable_fields = ['first_name', 'last_name', 'phone', 'email']
        for field in updatable_fields:
            if field in data:
                # Special handling for email to check uniqueness
                if field == 'email' and data[field] != staff_member.email:
                    # Validate email format
                    if not validate_email(data[field]):
                        return jsonify({'error': 'Invalid email format'}), 422
                    
                    # Check if email already exists
                    existing_user = User.query.filter_by(email=data[field]).first()
                    if existing_user and existing_user.id != staff_member.id:
                        return jsonify({'error': 'Email already registered'}), 422
                
                setattr(staff_member, field, data[field])
        
        # Handle password change
        if 'password' in data and data['password']:
            # Skip password validation for now - will add restrictions later
            # if not validate_password(data['password']):
            #     return jsonify({'error': 'Password must be at least 8 characters with uppercase, lowercase, and number'}), 422
            
            staff_member.set_password(data['password'])
        
        # Update doctor profile if exists
        if staff_member.role == 'doctor' and 'doctor_profile' in data:
            doctor_profile = Doctor.query.filter_by(user_id=staff_member.id).first()
            if doctor_profile:
                doctor_data = data['doctor_profile']
                doctor_fields = [
                    'specialization', 'qualification', 'experience_years', 
                    'consultation_fee', 'available_days', 'available_hours'
                ]
                for field in doctor_fields:
                    if field in doctor_data:
                        setattr(doctor_profile, field, doctor_data[field])
        
        db.session.commit()
        
        response_data = staff_member.to_dict()
        if staff_member.role == 'doctor':
            doctor_profile = Doctor.query.filter_by(user_id=staff_member.id).first()
            response_data['doctor_profile'] = doctor_profile.to_dict() if doctor_profile else None
        
        return jsonify({
            'message': 'Staff member updated successfully',
            'staff_member': response_data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@hospital_staff_bp.route('/staff/<int:staff_id>/toggle-status', methods=['PUT'])
@jwt_required()
def toggle_staff_status(staff_id):
    """Toggle staff member active status"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        staff_member = User.query.filter_by(
            id=staff_id, 
            hospital_id=user.hospital_id
        ).first()
        
        if not staff_member:
            return jsonify({'error': 'Staff member not found'}), 404
        
        # Prevent admin from deactivating themselves
        if staff_member.id == current_user_id:
            return jsonify({'error': 'Cannot deactivate your own account'}), 400
        
        staff_member.is_active = not staff_member.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'Staff member {"activated" if staff_member.is_active else "deactivated"} successfully',
            'staff_member': staff_member.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@hospital_staff_bp.route('/staff/<int:staff_id>/reset-password', methods=['POST'])
@jwt_required()
def reset_staff_password(staff_id):
    """Reset staff member password"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        staff_member = User.query.filter_by(
            id=staff_id, 
            hospital_id=user.hospital_id
        ).first()
        
        if not staff_member:
            return jsonify({'error': 'Staff member not found'}), 404
        
        data = request.get_json()
        new_password = data.get('password')
        
        if not new_password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Skip password validation for now - will add restrictions later
        # if not validate_password(new_password):
        #     return jsonify({'error': 'Password must be at least 8 characters with uppercase, lowercase, and number'}), 422
        
        staff_member.set_password(new_password)
        db.session.commit()
        
        return jsonify({
            'message': 'Password reset successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@hospital_staff_bp.route('/staff/<int:staff_id>', methods=['DELETE'])
@jwt_required()
def delete_staff_member(staff_id):
    """Delete a staff member"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        staff_member = User.query.filter_by(
            id=staff_id, 
            hospital_id=user.hospital_id
        ).first()
        
        if not staff_member:
            return jsonify({'error': 'Staff member not found'}), 404
        
        # Prevent admin from deleting themselves
        if staff_member.id == int(current_user_id):
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        # If it's a doctor, delete the doctor profile first
        if staff_member.role == 'doctor':
            doctor_profile = Doctor.query.filter_by(user_id=staff_member.id).first()
            if doctor_profile:
                db.session.delete(doctor_profile)
        
        # Delete the user
        db.session.delete(staff_member)
        db.session.commit()
        
        return jsonify({
            'message': 'Staff member deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@hospital_staff_bp.route('/roles', methods=['GET'])
@jwt_required()
def get_available_roles():
    """Get available staff roles"""
    try:
        roles = [
            {
                'value': 'doctor',
                'label': 'Doctor',
                'description': 'Medical practitioner with patient consultation rights'
            },
            {
                'value': 'nurse',
                'label': 'Nurse',
                'description': 'Nursing staff with patient care responsibilities'
            },
            {
                'value': 'receptionist',
                'label': 'Receptionist',
                'description': 'Front desk staff for appointments and inquiries'
            },
            {
                'value': 'admin',
                'label': 'Administrator',
                'description': 'Full system access and management rights'
            }
        ]
        
        return jsonify({'roles': roles}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hospital_staff_bp.route('/patients', methods=['GET'])
@jwt_required()
def get_hospital_patients():
    """Get all patients for the hospital"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        # Check if user has access (admin, doctor, nurse, receptionist)
        if user.role not in ['admin', 'doctor', 'nurse', 'receptionist']:
            return jsonify({'error': 'Access denied'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search', '')
        
        # Query patients for this hospital
        query = db.session.query(Patient, User).join(User, Patient.user_id == User.id).filter(
            Patient.hospital_id == user.hospital_id
        )
        
        # Add search functionality
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    User.first_name.ilike(search_term),
                    User.last_name.ilike(search_term),
                    User.email.ilike(search_term),
                    Patient.patient_id.ilike(search_term),
                    User.phone.ilike(search_term)
                )
            )
        
        patients = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format patient data
        patients_data = []
        for patient, patient_user in patients.items:
            patient_dict = patient.to_dict()
            patient_dict['user'] = patient_user.to_dict()
            patients_data.append(patient_dict)
        
        return jsonify({
            'patients': patients_data,
            'total': patients.total,
            'pages': patients.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500