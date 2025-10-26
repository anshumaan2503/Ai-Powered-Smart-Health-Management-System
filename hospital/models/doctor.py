from datetime import datetime
from hospital import db

class Doctor(db.Model):
    __tablename__ = 'doctors'
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.String(20), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    qualification = db.Column(db.String(200))
    experience_years = db.Column(db.Integer)
    license_number = db.Column(db.String(50), unique=True)
    consultation_fee = db.Column(db.Float)
    available_days = db.Column(db.String(50))  # JSON string of available days
    available_hours = db.Column(db.String(50))  # JSON string of time slots
    is_available = db.Column(db.Boolean, default=True)
    rating = db.Column(db.Float, default=0.0)
    total_patients = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'))
    user = db.relationship('User', backref='doctor_profile')
    appointments = db.relationship('Appointment', backref='doctor', lazy=True)
    medical_records = db.relationship('MedicalRecord', backref='doctor', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'user_id': self.user_id,
            'full_name': self.user.full_name if self.user else None,
            'email': self.user.email if self.user else None,
            'phone': self.user.phone if self.user else None,
            'specialization': self.specialization,
            'qualification': self.qualification,
            'experience_years': self.experience_years,
            'license_number': self.license_number,
            'consultation_fee': self.consultation_fee,
            'available_days': self.available_days,
            'available_hours': self.available_hours,
            'is_available': self.is_available,
            'rating': self.rating,
            'total_patients': self.total_patients,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }