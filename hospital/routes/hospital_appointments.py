from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital import db
from hospital.models.user import User
from hospital.models.doctor import Doctor
from hospital.models.patient import Patient
from hospital.models.appointment import Appointment
from hospital.models.hospital import Hospital
from datetime import datetime, timedelta
import uuid

hospital_appointments_bp = Blueprint('hospital_appointments', __name__)

@hospital_appointments_bp.route('/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    """Get all appointments for the hospital"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin', 'receptionist', 'nurse']:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        date_filter = request.args.get('date', '')
        doctor_id = request.args.get('doctor_id', '', type=int)
        status_filter = request.args.get('status', '')
        
        # Build query
        query = Appointment.query.filter_by(hospital_id=user.hospital_id)
        
        # Apply filters
        if date_filter:
            try:
                filter_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
                query = query.filter(db.func.date(Appointment.appointment_date) == filter_date)
            except ValueError:
                pass
        
        if doctor_id:
            # Find doctor by user_id (since doctor_id in appointment refers to doctor table id)
            doctor = Doctor.query.filter_by(user_id=doctor_id, hospital_id=user.hospital_id).first()
            if doctor:
                query = query.filter_by(doctor_id=doctor.id)
        
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        # Order by appointment date
        query = query.order_by(Appointment.appointment_date.desc())
        
        # Paginate
        appointments = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Convert to dict with patient and doctor info
        appointments_data = []
        for appointment in appointments.items:
            appointment_dict = appointment.to_dict()
            
            # Add patient info
            if appointment.patient:
                appointment_dict['patient'] = {
                    'id': appointment.patient.id,
                    'name': appointment.patient.full_name,
                    'phone': appointment.patient.phone,
                    'age': appointment.patient.age,
                    'gender': appointment.patient.gender
                }
            
            # Add doctor info
            if appointment.doctor and appointment.doctor.user:
                appointment_dict['doctor'] = {
                    'id': appointment.doctor.user.id,
                    'name': appointment.doctor.user.full_name,
                    'specialization': appointment.doctor.specialization
                }
            
            appointments_data.append(appointment_dict)
        
        return jsonify({
            'appointments': appointments_data,
            'total': appointments.total,
            'pages': appointments.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hospital_appointments_bp.route('/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    """Create a new appointment"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin', 'receptionist']:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['patient_id', 'doctor_user_id', 'appointment_date', 'appointment_time']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Get patient
        patient = Patient.query.filter_by(
            id=data['patient_id'], 
            hospital_id=user.hospital_id
        ).first()
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Get doctor
        doctor_user = User.query.filter_by(
            id=data['doctor_user_id'],
            hospital_id=user.hospital_id,
            role='doctor'
        ).first()
        
        if not doctor_user:
            return jsonify({'error': 'Doctor not found'}), 404
        
        doctor = Doctor.query.filter_by(user_id=doctor_user.id).first()
        if not doctor:
            return jsonify({'error': 'Doctor profile not found'}), 404
        
        # Parse appointment datetime
        try:
            appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
            appointment_time = datetime.strptime(data['appointment_time'], '%H:%M').time()
            appointment_datetime = datetime.combine(appointment_date, appointment_time)
        except ValueError:
            return jsonify({'error': 'Invalid date or time format'}), 400
        
        # Check if appointment time is in the future
        if appointment_datetime <= datetime.now():
            return jsonify({'error': 'Appointment must be scheduled for a future time'}), 400
        
        # Check for conflicting appointments (same doctor, same time)
        existing_appointment = Appointment.query.filter_by(
            doctor_id=doctor.id,
            appointment_date=appointment_datetime,
            hospital_id=user.hospital_id
        ).filter(Appointment.status.in_(['scheduled', 'confirmed'])).first()
        
        if existing_appointment:
            return jsonify({'error': 'Doctor is not available at this time'}), 409
        
        # Generate appointment ID
        appointment_id = f"APT{str(uuid.uuid4())[:8].upper()}"
        
        # Create appointment
        appointment = Appointment(
            appointment_id=appointment_id,
            patient_id=patient.id,
            doctor_id=doctor.id,
            appointment_date=appointment_datetime,
            appointment_type=data.get('appointment_type', 'consultation'),
            symptoms=data.get('symptoms', ''),
            notes=data.get('notes', ''),
            priority=data.get('priority', 'normal'),
            estimated_duration=data.get('estimated_duration', 30),
            consultation_fee=data.get('consultation_fee', doctor.consultation_fee),
            status='scheduled',
            payment_status='pending',
            hospital_id=user.hospital_id
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        # Return appointment with patient and doctor info
        appointment_dict = appointment.to_dict()
        appointment_dict['patient'] = {
            'id': patient.id,
            'name': patient.full_name,
            'phone': patient.phone,
            'age': patient.age,
            'gender': patient.gender
        }
        appointment_dict['doctor'] = {
            'id': doctor_user.id,
            'name': doctor_user.full_name,
            'specialization': doctor.specialization
        }
        
        return jsonify({
            'message': 'Appointment created successfully',
            'appointment': appointment_dict
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@hospital_appointments_bp.route('/appointments/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    """Update an appointment"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin', 'receptionist', 'doctor']:
            return jsonify({'error': 'Access denied'}), 403
        
        appointment = Appointment.query.filter_by(
            id=appointment_id,
            hospital_id=user.hospital_id
        ).first()
        
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        updatable_fields = ['status', 'notes', 'symptoms', 'priority', 'actual_duration', 'payment_status']
        for field in updatable_fields:
            if field in data:
                setattr(appointment, field, data[field])
        
        # Update appointment date/time if provided and user is admin/receptionist
        if user.role in ['admin', 'receptionist']:
            if 'appointment_date' in data and 'appointment_time' in data:
                try:
                    appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
                    appointment_time = datetime.strptime(data['appointment_time'], '%H:%M').time()
                    new_datetime = datetime.combine(appointment_date, appointment_time)
                    
                    if new_datetime > datetime.now():
                        appointment.appointment_date = new_datetime
                except ValueError:
                    return jsonify({'error': 'Invalid date or time format'}), 400
        
        appointment.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment updated successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@hospital_appointments_bp.route('/appointments/<int:appointment_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_appointment(appointment_id):
    """Cancel an appointment (mark as cancelled)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin', 'receptionist']:
            return jsonify({'error': 'Access denied'}), 403
        
        appointment = Appointment.query.filter_by(
            id=appointment_id,
            hospital_id=user.hospital_id
        ).first()
        
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        appointment.status = 'cancelled'
        appointment.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment cancelled successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@hospital_appointments_bp.route('/appointments/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    """Permanently delete an appointment"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        appointment = Appointment.query.filter_by(
            id=appointment_id,
            hospital_id=user.hospital_id
        ).first()
        
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        # Only allow deletion of cancelled appointments or future appointments
        if appointment.status not in ['cancelled', 'scheduled'] and appointment.appointment_date > datetime.now():
            return jsonify({'error': 'Can only delete cancelled appointments or future scheduled appointments'}), 400
        
        db.session.delete(appointment)
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment deleted permanently'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@hospital_appointments_bp.route('/quick-patient', methods=['POST'])
@jwt_required()
def create_quick_patient():
    """Create a quick patient record for appointment booking"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin', 'receptionist']:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'phone', 'date_of_birth', 'gender']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if patient with same phone already exists
        existing_patient = Patient.query.filter_by(
            phone=data['phone'],
            hospital_id=user.hospital_id
        ).first()
        
        if existing_patient:
            return jsonify({'error': 'Patient with this phone number already exists'}), 409
        
        # Parse date of birth
        try:
            dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date of birth format (YYYY-MM-DD)'}), 400
        
        # Generate patient ID
        patient_id = f"PAT{str(uuid.uuid4())[:8].upper()}"
        
        # Create patient
        patient = Patient(
            patient_id=patient_id,
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data.get('email'),
            phone=data['phone'],
            date_of_birth=dob,
            gender=data['gender'],
            address=data.get('address'),
            emergency_contact_name=data.get('emergency_contact_name'),
            emergency_contact_phone=data.get('emergency_contact_phone'),
            blood_group=data.get('blood_group'),
            allergies=data.get('allergies'),
            medical_history=data.get('medical_history'),
            hospital_id=user.hospital_id
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

@hospital_appointments_bp.route('/patients/search', methods=['GET'])
@jwt_required()
def search_patients():
    """Search patients for appointment booking"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin', 'receptionist', 'doctor', 'nurse']:
            return jsonify({'error': 'Access denied'}), 403
        
        search_term = request.args.get('q', '').strip()
        limit = request.args.get('limit', 10, type=int)
        
        if not search_term:
            return jsonify({'patients': []}), 200
        
        # Search by name, phone, or patient ID
        query = Patient.query.filter_by(hospital_id=user.hospital_id)
        query = query.filter(
            db.or_(
                Patient.first_name.ilike(f'%{search_term}%'),
                Patient.last_name.ilike(f'%{search_term}%'),
                Patient.phone.ilike(f'%{search_term}%'),
                Patient.patient_id.ilike(f'%{search_term}%')
            )
        ).limit(limit)
        
        patients = query.all()
        
        return jsonify({
            'patients': [patient.to_dict() for patient in patients]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hospital_appointments_bp.route('/patients', methods=['GET'])
@jwt_required()
def get_all_patients():
    """Get all patients for the hospital"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin', 'receptionist', 'doctor', 'nurse']:
            return jsonify({'error': 'Access denied'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        patients = Patient.query.filter_by(hospital_id=user.hospital_id).paginate(
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

@hospital_appointments_bp.route('/patients/<int:patient_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(patient_id):
    """Permanently delete a patient and all related data"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        patient = Patient.query.filter_by(
            id=patient_id,
            hospital_id=user.hospital_id
        ).first()
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Check if patient has any active appointments
        active_appointments = Appointment.query.filter_by(
            patient_id=patient.id
        ).filter(Appointment.status.in_(['scheduled', 'confirmed'])).count()
        
        if active_appointments > 0:
            return jsonify({
                'error': f'Cannot delete patient with {active_appointments} active appointments. Cancel appointments first.'
            }), 400
        
        # Delete all related appointments first
        Appointment.query.filter_by(patient_id=patient.id).delete()
        
        # Delete the patient
        db.session.delete(patient)
        db.session.commit()
        
        return jsonify({
            'message': 'Patient and all related data deleted permanently'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@hospital_appointments_bp.route('/doctors/available', methods=['GET'])
@jwt_required()
def get_available_doctors():
    """Get available doctors for appointment booking"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        # Get all active doctors
        doctors = db.session.query(Doctor, User).join(
            User, Doctor.user_id == User.id
        ).filter(
            User.hospital_id == user.hospital_id,
            User.role == 'doctor',
            User.is_active == True
        ).all()
        
        doctors_data = []
        for doctor, doctor_user in doctors:
            doctors_data.append({
                'id': doctor_user.id,  # Use user ID for booking
                'name': doctor_user.full_name,
                'specialization': doctor.specialization,
                'consultation_fee': doctor.consultation_fee,
                'qualification': doctor.qualification
            })
        
        return jsonify({
            'doctors': doctors_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500