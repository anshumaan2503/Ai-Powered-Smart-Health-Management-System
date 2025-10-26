from datetime import datetime, timedelta
from hospital.models.medical_record import MedicalRecord
from hospital.models.appointment import Appointment

class AIDiagnosisService:
    def __init__(self):
        self.treatment_database = self._load_treatment_database()
        self.drug_interaction_database = self._load_drug_interactions()
    
    def _load_treatment_database(self):
        """Load treatment protocols for different conditions"""
        return {
            'flu': {
                'medications': [
                    {'name': 'Paracetamol', 'dosage': '500mg every 6 hours', 'duration': '5-7 days'},
                    {'name': 'Rest and fluids', 'dosage': 'As needed', 'duration': 'Until recovery'}
                ],
                'lifestyle': [
                    'Complete bed rest for 2-3 days',
                    'Increase fluid intake',
                    'Avoid contact with others',
                    'Return to work only after fever-free for 24 hours'
                ],
                'follow_up': 'If symptoms worsen or persist beyond 7 days'
            },
            'covid-19': {
                'medications': [
                    {'name': 'Paracetamol', 'dosage': '500mg every 6 hours', 'duration': '7-10 days'},
                    {'name': 'Vitamin C', 'dosage': '1000mg daily', 'duration': '14 days'},
                    {'name': 'Zinc', 'dosage': '15mg daily', 'duration': '14 days'}
                ],
                'lifestyle': [
                    'Complete isolation for 10 days',
                    'Monitor oxygen saturation',
                    'Prone positioning if breathing difficulty',
                    'Steam inhalation 2-3 times daily'
                ],
                'follow_up': 'Immediate if oxygen saturation drops below 94%'
            },
            'pneumonia': {
                'medications': [
                    {'name': 'Antibiotics', 'dosage': 'As prescribed', 'duration': '7-14 days'},
                    {'name': 'Bronchodilators', 'dosage': 'As needed', 'duration': 'Until recovery'}
                ],
                'lifestyle': [
                    'Complete rest',
                    'Chest physiotherapy',
                    'Adequate hydration',
                    'Avoid smoking and pollutants'
                ],
                'follow_up': 'Follow-up chest X-ray in 2-4 weeks'
            },
            'heart attack': {
                'medications': [
                    {'name': 'Aspirin', 'dosage': '75mg daily', 'duration': 'Long-term'},
                    {'name': 'Beta-blockers', 'dosage': 'As prescribed', 'duration': 'Long-term'},
                    {'name': 'Statins', 'dosage': 'As prescribed', 'duration': 'Long-term'}
                ],
                'lifestyle': [
                    'Cardiac rehabilitation program',
                    'Low-sodium, heart-healthy diet',
                    'Regular moderate exercise (as approved)',
                    'Stress management techniques'
                ],
                'follow_up': 'Cardiology follow-up in 1-2 weeks'
            },
            'migraine': {
                'medications': [
                    {'name': 'Sumatriptan', 'dosage': '50mg at onset', 'duration': 'As needed'},
                    {'name': 'Ibuprofen', 'dosage': '400mg every 6 hours', 'duration': 'During episode'}
                ],
                'lifestyle': [
                    'Identify and avoid triggers',
                    'Regular sleep schedule',
                    'Stress reduction techniques',
                    'Stay hydrated'
                ],
                'follow_up': 'If frequency increases or severity worsens'
            }
        }
    
    def _load_drug_interactions(self):
        """Load drug interaction database"""
        return {
            'aspirin': ['warfarin', 'methotrexate', 'lithium'],
            'ibuprofen': ['warfarin', 'ace_inhibitors', 'lithium'],
            'paracetamol': ['warfarin', 'phenytoin'],
            'antibiotics': ['warfarin', 'oral_contraceptives']
        }
    
    def get_treatment_recommendations(self, ai_diagnosis):
        """Generate treatment recommendations based on AI diagnosis"""
        try:
            recommendations = {
                'primary_treatments': [],
                'alternative_treatments': [],
                'lifestyle_modifications': [],
                'follow_up_plan': [],
                'precautions': [],
                'drug_interactions': []
            }
            
            # Get patient's medical history for personalization
            patient = ai_diagnosis.patient
            medical_history = self._get_patient_medical_history(patient.id)
            current_medications = self._get_current_medications(patient.id)
            
            # Process each predicted condition
            for condition_data in ai_diagnosis.predicted_conditions:
                condition = condition_data['condition']
                confidence = condition_data['confidence']
                
                if condition in self.treatment_database:
                    treatment_info = self.treatment_database[condition]
                    
                    # Add medications with confidence weighting
                    for med in treatment_info['medications']:
                        med_recommendation = {
                            'medication': med['name'],
                            'dosage': med['dosage'],
                            'duration': med['duration'],
                            'confidence': confidence,
                            'condition': condition
                        }
                        recommendations['primary_treatments'].append(med_recommendation)
                    
                    # Add lifestyle modifications
                    for lifestyle in treatment_info['lifestyle']:
                        recommendations['lifestyle_modifications'].append({
                            'recommendation': lifestyle,
                            'condition': condition,
                            'priority': 'high' if confidence > 0.7 else 'medium'
                        })
                    
                    # Add follow-up plan
                    recommendations['follow_up_plan'].append({
                        'instruction': treatment_info['follow_up'],
                        'condition': condition,
                        'timeline': self._estimate_follow_up_timeline(condition)
                    })
            
            # Check for drug interactions
            recommendations['drug_interactions'] = self._check_drug_interactions(
                recommendations['primary_treatments'], 
                current_medications
            )
            
            # Add personalized precautions
            recommendations['precautions'] = self._get_personalized_precautions(
                patient, 
                ai_diagnosis.predicted_conditions
            )
            
            # Generate alternative treatments for lower confidence conditions
            recommendations['alternative_treatments'] = self._get_alternative_treatments(
                ai_diagnosis.predicted_conditions
            )
            
            return recommendations
            
        except Exception as e:
            raise Exception(f"Error generating treatment recommendations: {str(e)}")
    
    def _get_patient_medical_history(self, patient_id):
        """Get patient's relevant medical history"""
        try:
            records = MedicalRecord.query.filter_by(patient_id=patient_id).order_by(
                MedicalRecord.created_at.desc()
            ).limit(10).all()
            
            history = {
                'chronic_conditions': [],
                'allergies': [],
                'previous_treatments': [],
                'hospitalizations': []
            }
            
            for record in records:
                if record.diagnosis:
                    history['chronic_conditions'].append(record.diagnosis)
                if record.treatment:
                    history['previous_treatments'].append(record.treatment)
            
            return history
        except:
            return {'chronic_conditions': [], 'allergies': [], 'previous_treatments': [], 'hospitalizations': []}
    
    def _get_current_medications(self, patient_id):
        """Get patient's current medications"""
        try:
            # In a real implementation, this would query a medications table
            # For now, return empty list
            return []
        except:
            return []
    
    def _check_drug_interactions(self, recommended_medications, current_medications):
        """Check for potential drug interactions"""
        interactions = []
        
        for rec_med in recommended_medications:
            rec_med_name = rec_med['medication'].lower()
            
            for current_med in current_medications:
                current_med_name = current_med.lower()
                
                # Check if there's a known interaction
                if rec_med_name in self.drug_interaction_database:
                    if current_med_name in self.drug_interaction_database[rec_med_name]:
                        interactions.append({
                            'medication1': rec_med['medication'],
                            'medication2': current_med,
                            'severity': 'moderate',  # In real implementation, this would be more sophisticated
                            'description': f'Potential interaction between {rec_med["medication"]} and {current_med}'
                        })
        
        return interactions
    
    def _get_personalized_precautions(self, patient, predicted_conditions):
        """Generate personalized precautions based on patient profile"""
        precautions = []
        
        # Age-based precautions
        if patient.age > 65:
            precautions.append({
                'type': 'age_related',
                'message': 'Monitor for side effects more closely due to advanced age',
                'priority': 'high'
            })
        
        if patient.age < 18:
            precautions.append({
                'type': 'pediatric',
                'message': 'Dosages may need pediatric adjustment',
                'priority': 'high'
            })
        
        # Gender-specific precautions
        if patient.gender.lower() == 'female':
            precautions.append({
                'type': 'pregnancy_check',
                'message': 'Verify pregnancy status before prescribing certain medications',
                'priority': 'medium'
            })
        
        # Condition-specific precautions
        high_risk_conditions = [c for c in predicted_conditions if c.get('severity') in ['high', 'critical']]
        if high_risk_conditions:
            precautions.append({
                'type': 'high_risk',
                'message': 'Close monitoring required due to high-risk conditions',
                'priority': 'critical'
            })
        
        return precautions
    
    def _get_alternative_treatments(self, predicted_conditions):
        """Get alternative treatment options for conditions with lower confidence"""
        alternatives = []
        
        for condition_data in predicted_conditions:
            if condition_data['confidence'] < 0.6:  # Lower confidence conditions
                alternatives.append({
                    'condition': condition_data['condition'],
                    'confidence': condition_data['confidence'],
                    'recommendation': f'Consider alternative diagnosis and treatment for {condition_data["condition"]}',
                    'action': 'Further diagnostic tests recommended'
                })
        
        return alternatives
    
    def _estimate_follow_up_timeline(self, condition):
        """Estimate appropriate follow-up timeline for condition"""
        timeline_mapping = {
            'flu': '7-10 days',
            'covid-19': '14 days',
            'pneumonia': '2-4 weeks',
            'heart attack': '1-2 weeks',
            'migraine': '2-4 weeks',
            'hypertension': '2-4 weeks',
            'diabetes': '3 months'
        }
        
        return timeline_mapping.get(condition, '2-4 weeks')