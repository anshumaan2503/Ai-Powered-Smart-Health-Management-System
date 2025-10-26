from datetime import datetime, date
from hospital import db

class HospitalSubscription(db.Model):
    __tablename__ = 'hospital_subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=False)
    plan_name = db.Column(db.String(50), nullable=False)  # basic, premium, enterprise
    max_patients = db.Column(db.Integer, default=100)
    max_doctors = db.Column(db.Integer, default=5)
    max_staff = db.Column(db.Integer, default=10)
    features = db.Column(db.JSON)  # List of enabled features
    subscription_start = db.Column(db.Date, nullable=False)
    subscription_end = db.Column(db.Date, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    monthly_fee = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hospital = db.relationship('Hospital', backref='subscription')
    
    def to_dict(self):
        return {
            'id': self.id,
            'hospital_id': self.hospital_id,
            'plan_name': self.plan_name,
            'max_patients': self.max_patients,
            'max_doctors': self.max_doctors,
            'max_staff': self.max_staff,
            'features': self.features,
            'subscription_start': self.subscription_start.isoformat() if self.subscription_start else None,
            'subscription_end': self.subscription_end.isoformat() if self.subscription_end else None,
            'is_active': self.is_active,
            'monthly_fee': self.monthly_fee,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def is_feature_enabled(self, feature_name):
        """Check if a specific feature is enabled for this subscription"""
        if not self.features:
            return False
        return feature_name in self.features
    
    def get_usage_stats(self):
        """Get current usage statistics for the hospital"""
        from hospital.models import Doctor, User
        
        current_patients = 0  # Patient functionality disabled
        current_doctors = Doctor.query.filter_by(hospital_id=self.hospital_id).count()
        current_staff = User.query.filter_by(hospital_id=self.hospital_id).count()
        
        return {
            'patients': {
                'current': current_patients,
                'limit': self.max_patients,
                'percentage': (current_patients / self.max_patients * 100) if self.max_patients > 0 else 0
            },
            'doctors': {
                'current': current_doctors,
                'limit': self.max_doctors,
                'percentage': (current_doctors / self.max_doctors * 100) if self.max_doctors > 0 else 0
            },
            'staff': {
                'current': current_staff,
                'limit': self.max_staff,
                'percentage': (current_staff / self.max_staff * 100) if self.max_staff > 0 else 0
            }
        }