from datetime import datetime, date
from hospital import db

class Patient(db.Model):
    __tablename__ = 'patients'
    
    # Composite indexes for performance optimization
    __table_args__ = (
        db.Index('idx_patient_hospital_created', 'hospital_id', 'created_at'),
        db.Index('idx_patient_hospital_gender', 'hospital_id', 'gender'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False, index=True)
    patient_id = db.Column(db.String(20), unique=True, nullable=False, index=True)
    date_of_birth = db.Column(db.Date, index=True)
    gender = db.Column(db.String(10), index=True)
    blood_group = db.Column(db.String(5), index=True)
    address = db.Column(db.Text)
    emergency_contact_name = db.Column(db.String(100))
    emergency_contact_phone = db.Column(db.String(15))
    medical_history = db.Column(db.Text)
    allergies = db.Column(db.Text)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='patient_profile', lazy=True)
    hospital = db.relationship('Hospital', backref='patients', lazy=True)
    
    @property
    def age(self):
        if self.date_of_birth:
            today = date.today()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None

    @property
    def full_name(self):
        return self.user.full_name if self.user else ''

    @property
    def email(self):
        return self.user.email if self.user else ''

    @property
    def phone(self):
        return self.user.phone if self.user else ''

    @property
    def first_name(self):
        return self.user.first_name if self.user else ''

    @property
    def last_name(self):
        return self.user.last_name if self.user else ''
    
    def to_dict(self, summary=False):
        """
        Convert patient to dictionary.
        
        Args:
            summary (bool): If True, return minimal fields for list views (performance optimization)
        """
        if summary:
            # Minimal payload for list views
            return {
                'id': self.id,
                'patient_id': self.patient_id,
                'first_name': self.user.first_name if self.user else '',
                'last_name': self.user.last_name if self.user else '',
                'full_name': self.user.full_name if self.user else '',
                'age': self.age,
                'gender': self.gender,
                'phone': self.user.phone if self.user else '',
            }
        
        # Full payload for detail views
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'user_id': self.user_id,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'age': self.age,
            'gender': self.gender,
            'blood_group': self.blood_group,
            'address': self.address,
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_phone': self.emergency_contact_phone,
            'medical_history': self.medical_history,
            'allergies': self.allergies,
            'hospital_id': self.hospital_id,
            'first_name': self.user.first_name if self.user else '',
            'last_name': self.user.last_name if self.user else '',
            'full_name': self.user.full_name if self.user else '',
            'email': self.user.email if self.user else '',
            'phone': self.user.phone if self.user else '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }