from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital import db
from hospital.models.appointment import Appointment
from hospital.models.patient import Patient
from hospital.models.doctor import Doctor
from hospital.models.user import User
from datetime import datetime
from sqlalchemy.orm import joinedload
import uuid

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/', methods=['POST'])
@jwt_required()
def create_appointment():
    """Create a new appointment"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['patient_id', 'doctor_id', 'appointment_date']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate patient exists
        patient = Patient.query.get(data['patient_id'])
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Validate doctor exists
        doctor = Doctor.query.get(data['doctor_id'])
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        
        # Parse appointment date
        try:
            appointment_date = datetime.fromisoformat(data['appointment_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid appointment date format'}), 400
        
        # Check if doctor is available at that time
        existing_appointment = Appointment.query.filter_by(
            doctor_id=data['doctor_id'],
            appointment_date=appointment_date,
            status='scheduled'
        ).first()
        
        if existing_appointment:
            return jsonify({'error': 'Doctor is not available at this time'}), 409
        
        # Generate unique appointment ID
        appointment_id = f"APT{str(uuid.uuid4())[:8].upper()}"
        
        # Create new appointment
        appointment = Appointment(
            appointment_id=appointment_id,
            patient_id=data['patient_id'],
            doctor_id=data['doctor_id'],
            appointment_date=appointment_date,
            appointment_type=data.get('appointment_type', 'consultation'),
            symptoms=data.get('symptoms'),
            notes=data.get('notes'),
            priority=data.get('priority', 'normal'),
            estimated_duration=data.get('estimated_duration', 30),
            consultation_fee=doctor.consultation_fee,
            status=data.get('status', 'requested'),
            hospital_id=doctor.hospital_id
        )

        # Also associate patient with hospital if not already associated
        if not patient.hospital_id:
            patient.hospital_id = doctor.hospital_id
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment created successfully',
            'appointment': appointment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@appointments_bp.route('/', methods=['GET'])
@jwt_required()
def get_appointments():
    """Get appointments with filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', '')
        doctor_id = request.args.get('doctor_id', type=int)
        patient_id = request.args.get('patient_id', type=int)
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        query = Appointment.query.options(
            joinedload(Appointment.patient).joinedload(Patient.user),
            joinedload(Appointment.doctor).joinedload(Doctor.user),
            joinedload(Appointment.hospital)
        )
        
        # ✅ Role-based auto-filtering
        # Get current user with their profile in one go to avoid extra DB roundtrips
        current_identity = get_jwt_identity()
        user = User.query.options(
            joinedload(User.patient_profile),
            joinedload(User.doctor_profile)
        ).get(int(current_identity))
        
        if user:
            if user.role == 'patient' and user.patient_profile:
                # Handle backref being a list or scalar
                patient = user.patient_profile[0] if isinstance(user.patient_profile, list) else user.patient_profile
                query = query.filter(Appointment.patient_id == patient.id)
            elif user.role == 'doctor' and user.doctor_profile:
                doctor = user.doctor_profile[0] if isinstance(user.doctor_profile, list) else user.doctor_profile
                query = query.filter(Appointment.doctor_id == doctor.id)
            elif user.role in ['admin', 'receptionist', 'nurse']:
                if user.hospital_id:
                    query = query.filter(Appointment.hospital_id == user.hospital_id)

        # Apply additional filters from request args
        if status:
            query = query.filter(Appointment.status == status)
        
        if doctor_id and user.role != 'doctor': # Prevent bypassing doctor filter
            query = query.filter(Appointment.doctor_id == doctor_id)
        
        if patient_id and user.role != 'patient': # Prevent bypassing patient filter
            query = query.filter(Appointment.patient_id == patient_id)

        if date_from:
            try:
                date_from_obj = datetime.fromisoformat(date_from)
                query = query.filter(Appointment.appointment_date >= date_from_obj)
            except ValueError:
                return jsonify({'error': 'Invalid date_from format'}), 400
        
        if date_to:
            try:
                date_to_obj = datetime.fromisoformat(date_to)
                query = query.filter(Appointment.appointment_date <= date_to_obj)
            except ValueError:
                return jsonify({'error': 'Invalid date_to format'}), 400
        
        appointments = query.order_by(Appointment.appointment_date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'appointments': [appointment.to_dict() for appointment in appointments.items],
            'total': appointments.total,
            'pages': appointments.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appointments_bp.route('/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    """Update appointment status or details"""
    try:
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        updatable_fields = ['status', 'notes', 'actual_duration', 'payment_status']
        for field in updatable_fields:
            if field in data:
                setattr(appointment, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment updated successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@appointments_bp.route('/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    """Delete an appointment"""
    try:
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404

        current_identity = get_jwt_identity()
        user = User.query.get(int(current_identity))

        # Check permission: Patient can only delete their own appointments
        if user.role == 'patient':
            patient = Patient.query.filter_by(user_id=user.id).first()
            if not patient or appointment.patient_id != patient.id:
                return jsonify({'error': 'Access denied'}), 403
            
            # Additional safety: patients can only delete 'awaiting_payment' or 'requested'
            if appointment.status not in ['awaiting_payment', 'requested', 'cancelled']:
                 return jsonify({'error': 'Cannot delete confirmed or completed appointments. Please contact the hospital.'}), 400
        
        # Admin can delete any (already handled in hospital_appointments but good to have here too)
        elif user.role != 'admin' and appointment.hospital_id != user.hospital_id:
             return jsonify({'error': 'Access denied'}), 403

        db.session.delete(appointment)
        db.session.commit()

        return jsonify({'message': 'Appointment deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500