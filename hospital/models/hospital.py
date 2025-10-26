from datetime import datetime
from hospital import db

class Hospital(db.Model):
    __tablename__ = 'hospitals'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.Text)
    phone = db.Column(db.String(15))
    email = db.Column(db.String(120))
    license_number = db.Column(db.String(50), unique=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = db.relationship('User', backref='hospital', lazy=True)
    doctors = db.relationship('Doctor', backref='hospital', lazy=True)
    # appointments = db.relationship('Appointment', backref='hospital', lazy=True)  # Disabled for now
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'license_number': self.license_number,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }