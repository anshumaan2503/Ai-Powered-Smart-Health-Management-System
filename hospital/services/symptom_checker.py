import json
import re
from collections import Counter

class SymptomChecker:
    def __init__(self):
        # In a real implementation, you'd load pre-trained models
        # For now, we'll use a rule-based approach with medical knowledge
        self.symptom_database = self._load_symptom_database()
        self.condition_database = self._load_condition_database()
        # Simple text matching instead of TF-IDF for now
        
    def _load_symptom_database(self):
        """Load symptom-condition mappings"""
        return {
            'fever': ['flu', 'covid-19', 'pneumonia', 'malaria', 'typhoid'],
            'cough': ['flu', 'covid-19', 'pneumonia', 'bronchitis', 'asthma'],
            'headache': ['migraine', 'tension headache', 'flu', 'hypertension'],
            'chest pain': ['heart attack', 'angina', 'pneumonia', 'acid reflux'],
            'shortness of breath': ['asthma', 'pneumonia', 'heart failure', 'covid-19'],
            'nausea': ['food poisoning', 'gastritis', 'pregnancy', 'migraine'],
            'fatigue': ['anemia', 'depression', 'thyroid disorder', 'diabetes'],
            'abdominal pain': ['appendicitis', 'gastritis', 'kidney stones', 'gallstones'],
            'dizziness': ['vertigo', 'low blood pressure', 'anemia', 'dehydration'],
            'joint pain': ['arthritis', 'lupus', 'fibromyalgia', 'gout']
        }
    
    def _load_condition_database(self):
        """Load condition information with severity and recommendations"""
        return {
            'flu': {
                'severity': 'mild',
                'description': 'Viral infection affecting respiratory system',
                'common_symptoms': ['fever', 'cough', 'fatigue', 'body aches'],
                'recommended_tests': ['Complete Blood Count', 'Flu Test'],
                'specialists': ['General Physician']
            },
            'covid-19': {
                'severity': 'moderate',
                'description': 'Viral infection caused by SARS-CoV-2',
                'common_symptoms': ['fever', 'cough', 'shortness of breath', 'loss of taste'],
                'recommended_tests': ['RT-PCR Test', 'Chest X-ray', 'Oxygen Saturation'],
                'specialists': ['General Physician', 'Pulmonologist']
            },
            'pneumonia': {
                'severity': 'high',
                'description': 'Infection that inflames air sacs in lungs',
                'common_symptoms': ['fever', 'cough', 'chest pain', 'shortness of breath'],
                'recommended_tests': ['Chest X-ray', 'Blood Culture', 'Sputum Test'],
                'specialists': ['Pulmonologist', 'Internal Medicine']
            },
            'heart attack': {
                'severity': 'critical',
                'description': 'Blockage of blood flow to heart muscle',
                'common_symptoms': ['chest pain', 'shortness of breath', 'nausea', 'sweating'],
                'recommended_tests': ['ECG', 'Cardiac Enzymes', 'Echocardiogram'],
                'specialists': ['Cardiologist', 'Emergency Medicine']
            },
            'migraine': {
                'severity': 'moderate',
                'description': 'Severe recurring headache',
                'common_symptoms': ['headache', 'nausea', 'sensitivity to light'],
                'recommended_tests': ['Neurological Exam', 'MRI (if needed)'],
                'specialists': ['Neurologist']
            }
        }
    
    def analyze_symptoms(self, symptoms, patient_age=None, patient_gender=None, medical_history=None):
        """Analyze symptoms and provide preliminary diagnosis"""
        try:
            # Normalize symptoms input
            if isinstance(symptoms, str):
                symptom_list = [s.strip().lower() for s in symptoms.split(',')]
            else:
                symptom_list = [s.lower() for s in symptoms]
            
            # Find matching conditions
            possible_conditions = {}
            
            for symptom in symptom_list:
                for key_symptom, conditions in self.symptom_database.items():
                    if symptom in key_symptom or key_symptom in symptom:
                        for condition in conditions:
                            if condition not in possible_conditions:
                                possible_conditions[condition] = 0
                            possible_conditions[condition] += 1
            
            # Calculate confidence scores
            total_symptoms = len(symptom_list)
            scored_conditions = []
            
            for condition, matches in possible_conditions.items():
                confidence = min(matches / total_symptoms, 1.0)
                condition_info = self.condition_database.get(condition, {})
                
                scored_conditions.append({
                    'condition': condition,
                    'confidence': round(confidence, 2),
                    'severity': condition_info.get('severity', 'unknown'),
                    'description': condition_info.get('description', ''),
                    'match_count': matches
                })
            
            # Sort by confidence
            scored_conditions.sort(key=lambda x: x['confidence'], reverse=True)
            
            # Determine overall risk level
            risk_level = self._assess_risk_level(scored_conditions, patient_age)
            
            # Get recommendations
            recommendations = self._get_recommendations(scored_conditions[:3])
            
            return {
                'predicted_conditions': scored_conditions[:5],  # Top 5 conditions
                'risk_level': risk_level,
                'confidence_score': scored_conditions[0]['confidence'] if scored_conditions else 0,
                'recommended_tests': recommendations['tests'],
                'recommended_specialists': recommendations['specialists'],
                'emergency_indicators': self._check_emergency_indicators(symptom_list),
                'lifestyle_recommendations': self._get_lifestyle_recommendations(scored_conditions[:3])
            }
            
        except Exception as e:
            raise Exception(f"Error in symptom analysis: {str(e)}")
    
    def _assess_risk_level(self, conditions, patient_age):
        """Assess overall risk level based on conditions and patient factors"""
        if not conditions:
            return 'low'
        
        highest_severity = conditions[0].get('severity', 'mild')
        
        # Age-based risk adjustment
        age_risk_factor = 1.0
        if patient_age:
            if patient_age > 65:
                age_risk_factor = 1.5
            elif patient_age > 45:
                age_risk_factor = 1.2
        
        severity_mapping = {
            'mild': 1,
            'moderate': 2,
            'high': 3,
            'critical': 4
        }
        
        base_risk = severity_mapping.get(highest_severity, 1)
        adjusted_risk = base_risk * age_risk_factor
        
        if adjusted_risk >= 4:
            return 'critical'
        elif adjusted_risk >= 3:
            return 'high'
        elif adjusted_risk >= 2:
            return 'medium'
        else:
            return 'low'
    
    def _get_recommendations(self, top_conditions):
        """Get test and specialist recommendations"""
        all_tests = set()
        all_specialists = set()
        
        for condition_data in top_conditions:
            condition = condition_data['condition']
            condition_info = self.condition_database.get(condition, {})
            
            all_tests.update(condition_info.get('recommended_tests', []))
            all_specialists.update(condition_info.get('specialists', []))
        
        return {
            'tests': list(all_tests),
            'specialists': list(all_specialists)
        }
    
    def _check_emergency_indicators(self, symptoms):
        """Check for emergency symptoms that require immediate attention"""
        emergency_symptoms = [
            'chest pain', 'difficulty breathing', 'severe headache',
            'loss of consciousness', 'severe bleeding', 'stroke symptoms',
            'severe abdominal pain', 'high fever with confusion'
        ]
        
        emergency_found = []
        for symptom in symptoms:
            for emergency in emergency_symptoms:
                if emergency in symptom or symptom in emergency:
                    emergency_found.append(emergency)
        
        return emergency_found
    
    def _get_lifestyle_recommendations(self, conditions):
        """Provide lifestyle recommendations based on conditions"""
        recommendations = []
        
        condition_names = [c['condition'] for c in conditions]
        
        if any(c in ['flu', 'covid-19'] for c in condition_names):
            recommendations.extend([
                'Get plenty of rest',
                'Stay hydrated',
                'Isolate to prevent spread',
                'Monitor temperature regularly'
            ])
        
        if any(c in ['heart attack', 'hypertension'] for c in condition_names):
            recommendations.extend([
                'Avoid strenuous activity',
                'Follow low-sodium diet',
                'Monitor blood pressure',
                'Take prescribed medications'
            ])
        
        if any(c in ['migraine'] for c in condition_names):
            recommendations.extend([
                'Rest in dark, quiet room',
                'Apply cold compress',
                'Avoid triggers',
                'Stay hydrated'
            ])
        
        return list(set(recommendations))  # Remove duplicates