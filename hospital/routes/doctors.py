from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital import db
from hospital.models.doctor import Doctor
from hospital.models.user import User

doctors_bp = Blueprint('doctors', __name__)

@doctors_bp.route('/', methods=['GET'])
@jwt_required()
def get_doctors():
    """Get all doctors with filtering options"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        specialization = request.args.get('specialization', '')
        available_only = request.args.get('available_only', 'false').lower() == 'true'
        
        query = Doctor.query.join(User)
        
        # Apply filters
        if specialization:
            query = query.filter(Doctor.specialization.ilike(f'%{specialization}%'))
        
        if available_only:
            query = query.filter(Doctor.is_available == True)
        
        doctors = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'doctors': [doctor.to_dict() for doctor in doctors.items],
            'total': doctors.total,
            'pages': doctors.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@doctors_bp.route('/<int:doctor_id>', methods=['GET'])
@jwt_required()
def get_doctor(doctor_id):
    """Get a specific doctor"""
    try:
        doctor = Doctor.query.get(doctor_id)
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        
        return jsonify({'doctor': doctor.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@doctors_bp.route('/specializations', methods=['GET'])
@jwt_required()
def get_specializations():
    """Get all available specializations"""
    try:
        specializations = db.session.query(Doctor.specialization).distinct().all()
        specialization_list = [spec[0] for spec in specializations if spec[0]]
        
        return jsonify({'specializations': specialization_list}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500