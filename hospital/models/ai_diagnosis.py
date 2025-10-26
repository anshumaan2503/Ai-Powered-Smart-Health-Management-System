from datetime import datetime
from hospital import db

class AIDiagnosis(db.Model):
    __tablename__ = 'ai_diagnoses'
    
    id = db.Column(db.Integer, primary_key=True)
    # patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)  # Disabled for now
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'))
    symptoms = db.Column(db.Text, nullable=False)
    predicted_conditions = db.Column(db.JSON)  # List of conditions with confidence scores
    risk_assessment = db.Column(db.String(20))  # low, medium, high, critical
    recommended_tests = db.Column(db.JSON)  # List of recommended diagnostic tests
    recommended_specialists = db.Column(db.JSON)  # List of specialist recommendations
    ai_confidence_score = db.Column(db.Float)  # 0.0 to 1.0
    model_version = db.Column(db.String(20))
    input_data = db.Column(db.JSON)  # Store the input features used
    doctor_verified = db.Column(db.Boolean, default=False)
    doctor_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'))
    
    def to_dict(self):
        return {
            'id': self.id,
            # 'patient_id': self.patient_id,  # Disabled for now
            'doctor_id': self.doctor_id,
            # 'patient_name': self.patient.full_name if self.patient else None,  # Disabled for now
            'doctor_name': self.doctor.user.full_name if self.doctor and self.doctor.user else None,
            'symptoms': self.symptoms,
            'predicted_conditions': self.predicted_conditions,
            'risk_assessment': self.risk_assessment,
            'recommended_tests': self.recommended_tests,
            'recommended_specialists': self.recommended_specialists,
            'ai_confidence_score': self.ai_confidence_score,
            'model_version': self.model_version,
            'doctor_verified': self.doctor_verified,
            'doctor_notes': self.doctor_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }