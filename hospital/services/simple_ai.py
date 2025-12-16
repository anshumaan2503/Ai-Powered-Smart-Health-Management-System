"""
Simple AI services without external ML dependencies
This provides basic rule-based AI functionality for the hospital system
"""

import json
import re
from datetime import datetime, timedelta

class SimpleSymptomChecker:
    """Simple rule-based symptom checker"""
    
    def __init__(self):
        self.symptom_conditions = {
            'fever': {
                'conditions': ['flu', 'covid-19', 'pneumonia', 'infection'],
                'severity': 'medium',
                'tests': ['Temperature check', 'Blood test', 'COVID test']
            },
            'cough': {
                'conditions': ['flu', 'covid-19', 'bronchitis', 'pneumonia'],
                'severity': 'medium',
                'tests': ['Chest X-ray', 'Sputum test']
            },
            'chest pain': {
                'conditions': ['heart attack', 'angina', 'pneumonia'],
                'severity': 'high',
                'tests': ['ECG', 'Chest X-ray', 'Cardiac enzymes']
            },
            'headache': {
                'conditions': ['migraine', 'tension headache', 'hypertension'],
                'severity': 'low',
                'tests': ['Blood pressure check', 'Neurological exam']
            },
            'shortness of breath': {
                'conditions': ['asthma', 'pneumonia', 'heart failure'],
                'severity': 'high',
                'tests': ['Chest X-ray', 'Pulmonary function test', 'ECG']
            }
        }
    
    def analyze_symptoms(self, symptoms_text, patient_age=None, patient_gender=None):
        """Analyze symptoms and return preliminary diagnosis"""
        symptoms_lower = symptoms_text.lower()
        
        # Find matching symptoms
        matched_symptoms = []
        all_conditions = set()
        all_tests = set()
        max_severity = 'low'
        
        for symptom, data in self.symptom_conditions.items():
            if symptom in symptoms_lower:
                matched_symptoms.append(symptom)
                all_conditions.update(data['conditions'])
                all_tests.update(data['tests'])
                
                # Update severity
                if data['severity'] == 'high':
                    max_severity = 'high'
                elif data['severity'] == 'medium' and max_severity != 'high':
                    max_severity = 'medium'
        
        # Calculate confidence based on number of matched symptoms
        confidence = min(len(matched_symptoms) * 0.3, 0.9)
        
        # Age-based risk adjustment
        risk_level = max_severity
        if patient_age and patient_age > 65:
            if risk_level == 'medium':
                risk_level = 'high'
            elif risk_level == 'low':
                risk_level = 'medium'
        
        # Create condition list with confidence scores
        conditions_list = []
        for condition in list(all_conditions)[:5]:  # Top 5
            conditions_list.append({
                'condition': condition,
                'confidence': round(confidence, 2),
                'description': f'Possible {condition} based on symptoms'
            })
        
        return {
            'predicted_conditions': conditions_list,
            'risk_level': risk_level,
            'confidence_score': confidence,
            'recommended_tests': list(all_tests),
            'recommended_specialists': self._get_specialists(all_conditions),
            'matched_symptoms': matched_symptoms
        }
    
    def _get_specialists(self, conditions):
        """Get recommended specialists based on conditions"""
        specialist_mapping = {
            'heart attack': 'Cardiologist',
            'angina': 'Cardiologist',
            'heart failure': 'Cardiologist',
            'pneumonia': 'Pulmonologist',
            'asthma': 'Pulmonologist',
            'bronchitis': 'Pulmonologist',
            'migraine': 'Neurologist',
            'flu': 'General Physician',
            'covid-19': 'General Physician',
            'infection': 'General Physician'
        }
        
        specialists = set()
        for condition in conditions:
            if condition in specialist_mapping:
                specialists.add(specialist_mapping[condition])
        
        return list(specialists) if specialists else ['General Physician']

class SimpleRiskAssessment:
    """Simple rule-based risk assessment"""
    
    def assess_patient_risk(self, patient):
        """Assess patient risk based on basic factors"""
        risk_score = 0.0
        risk_factors = []
        
        # Age-based risk
        if patient.age > 80:
            risk_score += 0.4
            risk_factors.append('Advanced age (>80)')
        elif patient.age > 65:
            risk_score += 0.3
            risk_factors.append('Senior age (>65)')
        elif patient.age > 45:
            risk_score += 0.1
            risk_factors.append('Middle age (>45)')
        
        # Medical history risk
        if patient.medical_history:
            history = patient.medical_history.lower()
            high_risk_conditions = ['diabetes', 'heart disease', 'cancer', 'kidney disease']
            
            for condition in high_risk_conditions:
                if condition in history:
                    risk_score += 0.2
                    risk_factors.append(f'History of {condition}')
        
        # Allergies
        if patient.allergies:
            risk_score += 0.1
            risk_factors.append('Known allergies')
        
        # Determine risk category
        if risk_score >= 0.7:
            risk_category = 'high'
        elif risk_score >= 0.4:
            risk_category = 'medium'
        else:
            risk_category = 'low'
        
        return {
            'overall_risk_score': round(min(risk_score, 1.0), 2),
            'risk_category': risk_category,
            'risk_factors': risk_factors,
            'recommendations': self._get_risk_recommendations(risk_category),
            'next_assessment_date': (datetime.now() + timedelta(days=30)).isoformat()
        }
    
    def _get_risk_recommendations(self, risk_category):
        """Get recommendations based on risk category"""
        recommendations = {
            'high': [
                'Schedule immediate comprehensive health assessment',
                'Consider specialist referrals',
                'Implement intensive monitoring plan',
                'Review current medications'
            ],
            'medium': [
                'Schedule regular follow-up appointments',
                'Monitor key health indicators monthly',
                'Consider preventive interventions'
            ],
            'low': [
                'Continue routine health maintenance',
                'Annual comprehensive health check-up'
            ]
        }
        
        return recommendations.get(risk_category, recommendations['low'])

# Simple treatment recommendations
class SimpleTreatmentRecommendations:
    """Simple treatment recommendation system"""
    
    def __init__(self):
        self.treatments = {
            'flu': {
                'medications': ['Paracetamol 500mg every 6 hours', 'Rest and fluids'],
                'lifestyle': ['Complete bed rest', 'Increase fluid intake', 'Avoid contact with others'],
                'follow_up': 'If symptoms worsen or persist beyond 7 days'
            },
            'headache': {
                'medications': ['Ibuprofen 400mg every 6 hours', 'Paracetamol 500mg every 6 hours'],
                'lifestyle': ['Rest in dark room', 'Apply cold compress', 'Stay hydrated'],
                'follow_up': 'If headaches become frequent or severe'
            },
            'cough': {
                'medications': ['Cough syrup as needed', 'Throat lozenges'],
                'lifestyle': ['Stay hydrated', 'Use humidifier', 'Avoid irritants'],
                'follow_up': 'If cough persists beyond 2 weeks'
            }
        }
    
    def get_recommendations(self, conditions):
        """Get treatment recommendations for conditions"""
        recommendations = {
            'medications': [],
            'lifestyle': [],
            'follow_up': [],
            'precautions': ['Always consult with a doctor before starting treatment']
        }
        
        for condition in conditions[:3]:  # Top 3 conditions
            condition_name = condition.get('condition', '').lower()
            if condition_name in self.treatments:
                treatment = self.treatments[condition_name]
                recommendations['medications'].extend(treatment['medications'])
                recommendations['lifestyle'].extend(treatment['lifestyle'])
                recommendations['follow_up'].append(treatment['follow_up'])
        
        # Remove duplicates
        recommendations['medications'] = list(set(recommendations['medications']))
        recommendations['lifestyle'] = list(set(recommendations['lifestyle']))
        
        return recommendations


class SimpleHealthChatbot:
    """Lightweight rule-based health assistant (non-diagnostic)."""

    def __init__(self):
        # Basic intent keywords
        self.greetings = {'hi', 'hello', 'hey', 'good morning', 'good evening'}
        self.urgent_keywords = {
            'chest pain', 'shortness of breath', 'difficulty breathing',
            'loss of consciousness', 'severe headache', 'slurred speech',
            'numbness', 'bleeding', 'vision loss'
        }
        self.symptom_keywords = {
            'fever', 'cough', 'cold', 'headache', 'nausea', 'vomit',
            'diarrhea', 'pain', 'dizzy', 'fatigue', 'rash'
        }

    def respond(self, user_message: str, context=None):
        """Return a safe, helpful response with minimal rules."""
        context = context or []
        message = user_message.lower().strip()

        # Check for urgent symptoms first
        if any(k in message for k in self.urgent_keywords):
            return {
                'reply': (
                    "I detected possible urgent symptoms. Please seek immediate "
                    "medical attention or contact emergency services right away."
                ),
                'type': 'safety_alert',
                'suggestions': [
                    'Call local emergency services',
                    'Notify nearby staff or family',
                    'Do not delay urgent care'
                ],
                'disclaimer': self._disclaimer()
            }

        # Greetings / rapport
        if any(message.startswith(greet) for greet in self.greetings):
            return {
                'reply': "Hello! I can help with basic health guidance or symptom check info.",
                'type': 'greeting',
                'suggestions': [
                    'Describe your symptoms',
                    'Ask how to prepare for a doctor visit',
                    'Ask for general wellness tips'
                ],
                'disclaimer': self._disclaimer()
            }

        # Symptom guidance
        if any(k in message for k in self.symptom_keywords):
            return {
                'reply': (
                    "I can offer general guidance. For a quick check, you can run the "
                    "symptom checker with details like duration, severity, and any tests done."
                ),
                'type': 'symptom_support',
                'suggestions': [
                    'Include onset time and severity (mild/medium/severe)',
                    'Mention meds taken and existing conditions',
                    'List accompanying symptoms (fever, rash, dizziness)'
                ],
                'disclaimer': self._disclaimer()
            }

        # Appointment / logistics cues
        if 'appointment' in message or 'book' in message or 'schedule' in message:
            return {
                'reply': "To schedule, pick a date/time and preferred doctor; include reason for visit.",
                'type': 'logistics',
                'suggestions': [
                    'Share availability and preferred doctor specialty',
                    'Mention if this is a follow-up or new visit',
                    'Provide contact details for confirmations'
                ],
                'disclaimer': self._disclaimer()
            }

        # Default fallback
        return {
            'reply': (
                "I can help with general health guidance, symptom check inputs, "
                "and visit preparation tips. Tell me your symptoms or question."
            ),
            'type': 'general',
            'suggestions': [
                'Describe your symptoms and duration',
                'Ask how to prepare for a consultation',
                'Request wellness tips (sleep, hydration, activity)'
            ],
            'disclaimer': self._disclaimer()
        }

    def _disclaimer(self):
        return (
            "I am not a medical professional. For emergencies or definitive medical "
            "advice, contact a licensed clinician."
        )