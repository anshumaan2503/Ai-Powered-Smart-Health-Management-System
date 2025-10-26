from datetime import datetime
from hospital import db

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.String(20), unique=True, nullable=False, index=True)
    # patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)  # Disabled for now
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    appointment_type = db.Column(db.String(50))  # consultation, follow-up, emergency
    status = db.Column(db.String(20), default='scheduled')  # scheduled, completed, cancelled, no-show
    symptoms = db.Column(db.Text)
    notes = db.Column(db.Text)
    priority = db.Column(db.String(10), default='normal')  # low, normal, high, emergency
    estimated_duration = db.Column(db.Integer, default=30)  # minutes
    actual_duration = db.Column(db.Integer)
    consultation_fee = db.Column(db.Float)
    payment_status = db.Column(db.String(20), default='pending')  # pending, paid, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'appointment_id': self.appointment_id,
            # 'patient_id': self.patient_id,  # Disabled for now
            'doctor_id': self.doctor_id,
            # 'patient_name': self.patient.full_name if self.patient else None,  # Disabled for now
            'doctor_name': self.doctor.user.full_name if self.doctor and self.doctor.user else None,
            'doctor_specialization': self.doctor.specialization if self.doctor else None,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'appointment_type': self.appointment_type,
            'status': self.status,
            'symptoms': self.symptoms,
            'notes': self.notes,
            'priority': self.priority,
            'estimated_duration': self.estimated_duration,
            'actual_duration': self.actual_duration,
            'consultation_fee': self.consultation_fee,
            'payment_status': self.payment_status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }