from datetime import datetime
from hospital import db

class MedicalRecord(db.Model):
    __tablename__ = 'medical_records'
    
    id = db.Column(db.Integer, primary_key=True)
    # patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)  # Disabled for now
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'))
    visit_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    chief_complaint = db.Column(db.Text)
    symptoms = db.Column(db.Text)
    diagnosis = db.Column(db.Text)
    treatment = db.Column(db.Text)
    medications = db.Column(db.JSON)  # List of prescribed medications
    lab_results = db.Column(db.JSON)  # Lab test results
    vital_signs = db.Column(db.JSON)  # Blood pressure, temperature, etc.
    notes = db.Column(db.Text)
    follow_up_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'))
    
    def to_dict(self):
        return {
            'id': self.id,
            # 'patient_id': self.patient_id,  # Disabled for now
            'doctor_id': self.doctor_id,
            'appointment_id': self.appointment_id,
            # 'patient_name': self.patient.full_name if self.patient else None,  # Disabled for now
            'doctor_name': self.doctor.user.full_name if self.doctor and self.doctor.user else None,
            'visit_date': self.visit_date.isoformat() if self.visit_date else None,
            'chief_complaint': self.chief_complaint,
            'symptoms': self.symptoms,
            'diagnosis': self.diagnosis,
            'treatment': self.treatment,
            'medications': self.medications,
            'lab_results': self.lab_results,
            'vital_signs': self.vital_signs,
            'notes': self.notes,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }