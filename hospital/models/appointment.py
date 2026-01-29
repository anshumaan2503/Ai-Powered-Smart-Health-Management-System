from datetime import datetime
from hospital import db

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.String(20), unique=True, nullable=False, index=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    appointment_type = db.Column(db.String(50))  # consultation, follow-up, emergency
    status = db.Column(db.String(20), default='scheduled')  # requested, scheduled, confirmed, completed, cancelled, no-show
    symptoms = db.Column(db.Text)
    notes = db.Column(db.Text)
    priority = db.Column(db.String(10), default='normal')  # low, normal, high, emergency
    estimated_duration = db.Column(db.Integer, default=30)  # minutes
    actual_duration = db.Column(db.Integer)
    consultation_fee = db.Column(db.Float)
    payment_status = db.Column(db.String(20), default='pending')  # pending, paid, cancelled
    report_url = db.Column(db.String(255))
    report_name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'))
    patient = db.relationship('Patient', backref='appointments', lazy=True)
    hospital = db.relationship('Hospital', backref='appointments', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'appointment_id': self.appointment_id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'patient_name': self.patient.full_name if self.patient else None,
            'doctor_name': self.doctor.user.full_name if self.doctor and self.doctor.user else None,
            'doctor_specialization': self.doctor.specialization if self.doctor else None,
            'hospital_name': self.hospital.name if self.hospital else None,
            'hospital_address': self.hospital.address if self.hospital else None,
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
            'report_url': self.report_url,
            'report_name': self.report_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
