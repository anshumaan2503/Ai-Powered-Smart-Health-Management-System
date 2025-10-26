from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital import db
from hospital.models.appointment import Appointment
from hospital.models.patient import Patient
from hospital.models.doctor import Doctor
from datetime import datetime
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
            consultation_fee=doctor.consultation_fee
        )
        
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
        
        query = Appointment.query
        
        # Apply filters
        if status:
            query = query.filter(Appointment.status == status)
        
        if doctor_id:
            query = query.filter(Appointment.doctor_id == doctor_id)
        
        if patient_id:
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