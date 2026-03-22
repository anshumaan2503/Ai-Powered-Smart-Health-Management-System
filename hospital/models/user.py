from datetime import datetime
from hospital import db
import bcrypt

class User(db.Model):
    __tablename__ = 'users'
    
    # Composite indexes for performance optimization
    __table_args__ = (
        db.Index('idx_hospital_role', 'hospital_id', 'role'),
        db.Index('idx_hospital_created', 'hospital_id', 'created_at'),
        db.Index('idx_hospital_active', 'hospital_id', 'is_active'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50), nullable=False, index=True)
    last_name = db.Column(db.String(50), nullable=False, index=True)
    phone = db.Column(db.String(15), index=True)
    role = db.Column(db.String(20), nullable=False, index=True)  # admin, doctor, nurse, receptionist, patient
    is_active = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), index=True)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def to_dict(self, summary=False):
        """
        Convert user to dictionary.
        
        Args:
            summary (bool): If True, return minimal fields for list views (performance optimization)
        """
        if summary:
            # Minimal payload for list views
            return {
                'id': self.id,
                'first_name': self.first_name,
                'last_name': self.last_name,
                'full_name': self.full_name,
                'email': self.email,
                'role': self.role,
                'is_active': self.is_active,
            }
        
        # Full payload for detail views
        data = {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'phone': self.phone,
            'role': self.role,
            'is_active': self.is_active,
            'hospital_id': self.hospital_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        # Add profile info if exists
        if hasattr(self, 'patient_profile') and self.patient_profile:
            data['patient_profile'] = {
                'id': self.patient_profile[0].id if isinstance(self.patient_profile, list) else self.patient_profile.id,
                'patient_id': self.patient_profile[0].patient_id if isinstance(self.patient_profile, list) else self.patient_profile.patient_id
            }
        
        if hasattr(self, 'doctor_profile') and self.doctor_profile:
            profile = self.doctor_profile
            if isinstance(profile, list) and len(profile) > 0:
                profile = profile[0]
            
            if not isinstance(profile, list) and profile:
                data['doctor_profile'] = profile.to_dict()
            else:
                data['doctor_profile'] = None
            
        return data