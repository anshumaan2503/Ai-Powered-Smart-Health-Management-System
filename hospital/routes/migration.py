"""
Database Migration Routes
Special routes for running database migrations on production
These should be protected and used carefully
"""

from flask import Blueprint, jsonify
from hospital import db
from hospital.models.appointment import Appointment
import uuid
from sqlalchemy import inspect, text

migration_bp = Blueprint('migration', __name__)

@migration_bp.route('/check-appointment-id', methods=['GET'])
def check_appointment_id_column():
    """Check if appointment_id column exists"""
    try:
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('appointments')]
        
        return jsonify({
            'exists': 'appointment_id' in columns,
            'all_columns': columns
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@migration_bp.route('/add-appointment-id', methods=['POST'])
def add_appointment_id_column():
    """Add appointment_id column to appointments table"""
    try:
        # Check if column already exists
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('appointments')]
        
        if 'appointment_id' in columns:
            return jsonify({
                'message': 'appointment_id column already exists',
                'status': 'skipped'
            }), 200
        
        # Add the column
        with db.engine.connect() as conn:
            # For PostgreSQL
            if 'postgresql' in str(db.engine.url):
                conn.execute(text('ALTER TABLE appointments ADD COLUMN appointment_id VARCHAR(20)'))
                conn.commit()
                
                # Populate existing records
                appointments = Appointment.query.all()
                for appointment in appointments:
                    if not appointment.appointment_id:
                        appointment.appointment_id = f"APT{str(uuid.uuid4())[:8].upper()}"
                db.session.commit()
                
                # Make it unique and not null
                conn.execute(text('ALTER TABLE appointments ALTER COLUMN appointment_id SET NOT NULL'))
                conn.execute(text('ALTER TABLE appointments ADD CONSTRAINT appointments_appointment_id_key UNIQUE (appointment_id)'))
                conn.execute(text('CREATE INDEX IF NOT EXISTS idx_appointments_appointment_id ON appointments(appointment_id)'))
                conn.commit()
                
            # For SQLite
            else:
                # SQLite requires recreating the table
                return jsonify({
                    'error': 'SQLite migration not supported. Please use PostgreSQL or manually update.',
                    'status': 'failed'
                }), 400
        
        return jsonify({
            'message': 'appointment_id column added successfully',
            'status': 'success',
            'records_updated': len(appointments) if 'appointments' in locals() else 0
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'failed'
        }), 500

@migration_bp.route('/fix-appointments', methods=['POST'])
def fix_appointments():
    """Fix any appointments missing appointment_id"""
    try:
        # Find appointments without appointment_id
        appointments = Appointment.query.filter(
            (Appointment.appointment_id == None) | (Appointment.appointment_id == '')
        ).all()
        
        updated_count = 0
        for appointment in appointments:
            appointment.appointment_id = f"APT{str(uuid.uuid4())[:8].upper()}"
            updated_count += 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Appointments fixed successfully',
            'updated_count': updated_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
