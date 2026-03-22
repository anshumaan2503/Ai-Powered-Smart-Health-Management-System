from datetime import datetime
from hospital import db

class Doctor(db.Model):
    __tablename__ = 'doctors'
    
    # Composite indexes for performance optimization
    __table_args__ = (
        db.Index('idx_doctor_hospital_specialization', 'hospital_id', 'specialization'),
        db.Index('idx_doctor_hospital_available', 'hospital_id', 'is_available'),
        db.Index('idx_doctor_hospital_created', 'hospital_id', 'created_at'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.String(20), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    specialization = db.Column(db.String(100), nullable=False, index=True)
    qualification = db.Column(db.String(200))
    experience_years = db.Column(db.Integer, index=True)
    license_number = db.Column(db.String(50), unique=True, index=True)
    consultation_fee = db.Column(db.Float)
    available_days = db.Column(db.String(50))  # JSON string of available days
    available_hours = db.Column(db.String(50))  # JSON string of time slots
    is_available = db.Column(db.Boolean, default=True, index=True)
    rating = db.Column(db.Float, default=0.0, index=True)
    total_patients = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), index=True)
    user = db.relationship('User', backref='doctor_profile')
    appointments = db.relationship('Appointment', backref='doctor', lazy=True)
    medical_records = db.relationship('MedicalRecord', backref='doctor', lazy=True)
    
    def to_dict(self, summary=False):
        """
        Convert doctor to dictionary.
        
        Args:
            summary (bool): If True, return minimal fields for list views (performance optimization)
        """
        if summary:
            # Minimal payload for list views
            return {
                'id': self.id,
                'doctor_id': self.doctor_id,
                'first_name': self.user.first_name if self.user else None,
                'last_name': self.user.last_name if self.user else None,
                'full_name': self.user.full_name if self.user else None,
                'specialization': self.specialization,
                'qualification': self.qualification,
                'experience_years': self.experience_years,
                'consultation_fee': self.consultation_fee,
                'is_available': self.is_available,
            }
        
        # Full payload for detail views
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