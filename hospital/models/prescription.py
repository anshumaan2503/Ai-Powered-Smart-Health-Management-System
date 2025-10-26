from datetime import datetime
from hospital import db

class Prescription(db.Model):
    __tablename__ = 'prescriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    prescription_id = db.Column(db.String(20), unique=True, nullable=False, index=True)
    # patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)  # Disabled for now
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    medical_record_id = db.Column(db.Integer, db.ForeignKey('medical_records.id'))
    medications = db.Column(db.JSON, nullable=False)  # List of medications with dosage
    instructions = db.Column(db.Text)
    duration = db.Column(db.String(50))  # e.g., "7 days", "2 weeks"
    status = db.Column(db.String(20), default='active')  # active, completed, cancelled
    issued_date = db.Column(db.DateTime, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime)
    pharmacy_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'))
    # patient = db.relationship('Patient', backref='prescriptions')  # Disabled for now
    doctor = db.relationship('Doctor', backref='prescriptions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'prescription_id': self.prescription_id,
            # 'patient_id': self.patient_id,  # Disabled for now
            'doctor_id': self.doctor_id,
            'medical_record_id': self.medical_record_id,
            # 'patient_name': self.patient.full_name if self.patient else None,  # Disabled for now
            'doctor_name': self.doctor.user.full_name if self.doctor and self.doctor.user else None,
            'medications': self.medications,
            'instructions': self.instructions,
            'duration': self.duration,
            'status': self.status,
            'issued_date': self.issued_date.isoformat() if self.issued_date else None,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'pharmacy_notes': self.pharmacy_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }