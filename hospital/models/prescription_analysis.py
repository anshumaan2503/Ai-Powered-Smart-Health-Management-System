"""
Prescription Analysis Model
Database model for storing prescription analysis results
"""

from hospital import db
from datetime import datetime
import json

class PrescriptionAnalysis(db.Model):
    """Model for storing prescription analysis results"""
    
    __tablename__ = 'prescription_analyses'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    user_id = db.Column(db.Integer, nullable=False)  # User who uploaded
    patient_id = db.Column(db.Integer, nullable=True)  # Associated patient (optional)
    
    # File information
    filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(10), nullable=False)  # 'image' or 'pdf'
    file_size = db.Column(db.Integer, nullable=False)  # Size in bytes
    
    # Analysis results (stored as JSON)
    analysis_result = db.Column(db.JSON, nullable=False)
    confidence_score = db.Column(db.Float, default=0.0)
    is_valid = db.Column(db.Boolean, default=False)
    
    # Metadata
    analyzer_version = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Optional: Doctor review
    reviewed_by_doctor = db.Column(db.Integer, nullable=True)  # Doctor user ID
    doctor_notes = db.Column(db.Text, nullable=True)
    review_date = db.Column(db.DateTime, nullable=True)
    
    def __repr__(self):
        return f'<PrescriptionAnalysis {self.id}: {self.filename}>'
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'patient_id': self.patient_id,
            'filename': self.filename,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'file_size_mb': round(self.file_size / (1024 * 1024), 2),
            'analysis_result': self.analysis_result,
            'confidence_score': self.confidence_score,
            'is_valid': self.is_valid,
            'analyzer_version': self.analyzer_version,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'reviewed_by_doctor': self.reviewed_by_doctor,
            'doctor_notes': self.doctor_notes,
            'review_date': self.review_date.isoformat() if self.review_date else None,
            'has_doctor_review': bool(self.reviewed_by_doctor)
        }
    
    def get_medications(self):
        """Extract medications from analysis result"""
        if self.analysis_result and 'medications' in self.analysis_result:
            return self.analysis_result['medications']
        return []
    
    def get_safety_alerts(self):
        """Extract safety alerts from analysis result"""
        if self.analysis_result and 'safety_alerts' in self.analysis_result:
            return self.analysis_result['safety_alerts']
        return []
    
    def get_recommendations(self):
        """Extract recommendations from analysis result"""
        if self.analysis_result and 'recommendations' in self.analysis_result:
            return self.analysis_result['recommendations']
        return []
    
    def add_doctor_review(self, doctor_id, notes):
        """Add doctor review to the analysis"""
        self.reviewed_by_doctor = doctor_id
        self.doctor_notes = notes
        self.review_date = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    @staticmethod
    def get_user_analyses(user_id, limit=10):
        """Get recent analyses for a user"""
        return PrescriptionAnalysis.query.filter_by(user_id=user_id)\
                                        .order_by(PrescriptionAnalysis.created_at.desc())\
                                        .limit(limit).all()
    
    @staticmethod
    def get_patient_analyses(patient_id, limit=10):
        """Get analyses for a specific patient"""
        return PrescriptionAnalysis.query.filter_by(patient_id=patient_id)\
                                        .order_by(PrescriptionAnalysis.created_at.desc())\
                                        .limit(limit).all()
    
    @staticmethod
    def get_pending_reviews():
        """Get analyses pending doctor review"""
        return PrescriptionAnalysis.query.filter_by(reviewed_by_doctor=None)\
                                        .order_by(PrescriptionAnalysis.created_at.desc()).all()