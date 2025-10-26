from datetime import datetime, timedelta
from hospital.models.medical_record import MedicalRecord
from hospital.models.appointment import Appointment

class RiskAssessmentService:
    def __init__(self):
        self.risk_factors = self._load_risk_factors()
        self.chronic_conditions = self._load_chronic_conditions()
    
    def _load_risk_factors(self):
        """Load risk factor weights and mappings"""
        return {
            'age': {
                'ranges': [
                    {'min': 0, 'max': 18, 'weight': 0.1},
                    {'min': 18, 'max': 45, 'weight': 0.2},
                    {'min': 45, 'max': 65, 'weight': 0.4},
                    {'min': 65, 'max': 80, 'weight': 0.7},
                    {'min': 80, 'max': 120, 'weight': 1.0}
                ]
            },
            'chronic_conditions': {
                'diabetes': 0.6,
                'hypertension': 0.5,
                'heart disease': 0.8,
                'kidney disease': 0.7,
                'cancer': 0.9,
                'copd': 0.6,
                'asthma': 0.3
            },
            'lifestyle': {
                'smoking': 0.4,
                'alcohol': 0.2,
                'obesity': 0.3,
                'sedentary': 0.2
            },
            'recent_hospitalizations': 0.5,
            'medication_compliance': -0.3  # Good compliance reduces risk
        }
    
    def _load_chronic_conditions(self):
        """Load chronic condition definitions and monitoring requirements"""
        return {
            'diabetes': {
                'monitoring_frequency': 'monthly',
                'key_indicators': ['blood_glucose', 'hba1c', 'blood_pressure'],
                'complications': ['diabetic_retinopathy', 'nephropathy', 'neuropathy']
            },
            'hypertension': {
                'monitoring_frequency': 'monthly',
                'key_indicators': ['blood_pressure', 'cholesterol'],
                'complications': ['stroke', 'heart_attack', 'kidney_disease']
            },
            'heart_disease': {
                'monitoring_frequency': 'bi-weekly',
                'key_indicators': ['ecg', 'echocardiogram', 'stress_test'],
                'complications': ['heart_failure', 'arrhythmia', 'sudden_death']
            }
        }
    
    def assess_patient_risk(self, patient):
        """Comprehensive risk assessment for a patient"""
        try:
            risk_score = 0.0
            risk_factors_found = []
            recommendations = []
            
            # Age-based risk
            age_risk = self._calculate_age_risk(patient.age)
            risk_score += age_risk['score']
            if age_risk['score'] > 0.3:
                risk_factors_found.append(age_risk['description'])
            
            # Medical history risk
            history_risk = self._assess_medical_history(patient)
            risk_score += history_risk['score']
            risk_factors_found.extend(history_risk['factors'])
            recommendations.extend(history_risk['recommendations'])
            
            # Recent medical activity risk
            activity_risk = self._assess_recent_activity(patient.id)
            risk_score += activity_risk['score']
            risk_factors_found.extend(activity_risk['factors'])
            
            # Lifestyle risk (if available in patient data)
            lifestyle_risk = self._assess_lifestyle_factors(patient)
            risk_score += lifestyle_risk['score']
            risk_factors_found.extend(lifestyle_risk['factors'])
            
            # Normalize risk score to 0-1 scale
            normalized_risk = min(risk_score, 1.0)
            
            # Determine risk category
            risk_category = self._categorize_risk(normalized_risk)
            
            # Generate specific recommendations
            specific_recommendations = self._generate_recommendations(
                patient, risk_factors_found, risk_category
            )
            
            return {
                'overall_risk_score': round(normalized_risk, 2),
                'risk_category': risk_category,
                'risk_factors': risk_factors_found,
                'recommendations': specific_recommendations,
                'monitoring_plan': self._create_monitoring_plan(patient, risk_category),
                'next_assessment_date': self._calculate_next_assessment(risk_category),
                'emergency_indicators': self._check_emergency_risk_indicators(patient)
            }
            
        except Exception as e:
            raise Exception(f"Error in risk assessment: {str(e)}")
    
    def _calculate_age_risk(self, age):
        """Calculate risk based on patient age"""
        age_ranges = self.risk_factors['age']['ranges']
        
        for age_range in age_ranges:
            if age_range['min'] <= age < age_range['max']:
                return {
                    'score': age_range['weight'],
                    'description': f'Age-related risk (Age: {age})'
                }
        
        return {'score': 0.0, 'description': ''}
    
    def _assess_medical_history(self, patient):
        """Assess risk based on medical history"""
        risk_score = 0.0
        factors = []
        recommendations = []
        
        if patient.medical_history:
            history_text = patient.medical_history.lower()
            
            # Check for chronic conditions
            for condition, weight in self.risk_factors['chronic_conditions'].items():
                if condition in history_text:
                    risk_score += weight
                    factors.append(f'Chronic condition: {condition}')
                    
                    # Add condition-specific recommendations
                    if condition in self.chronic_conditions:
                        condition_info = self.chronic_conditions[condition]
                        recommendations.append(
                            f'Regular {condition_info["monitoring_frequency"]} monitoring for {condition}'
                        )
        
        # Check allergies for medication risks
        if patient.allergies:
            risk_score += 0.1
            factors.append('Known allergies - medication caution required')
            recommendations.append('Always verify medication allergies before prescribing')
        
        return {
            'score': risk_score,
            'factors': factors,
            'recommendations': recommendations
        }
    
    def _assess_recent_activity(self, patient_id):
        """Assess risk based on recent medical activity"""
        risk_score = 0.0
        factors = []
        
        # Check recent appointments and hospitalizations
        recent_date = datetime.utcnow() - timedelta(days=30)
        
        recent_appointments = Appointment.query.filter(
            Appointment.patient_id == patient_id,
            Appointment.created_at >= recent_date
        ).count()
        
        # High frequency of recent appointments indicates higher risk
        if recent_appointments > 3:
            risk_score += 0.3
            factors.append(f'High medical activity: {recent_appointments} appointments in last 30 days')
        
        # Check for emergency appointments
        emergency_appointments = Appointment.query.filter(
            Appointment.patient_id == patient_id,
            Appointment.priority == 'emergency',
            Appointment.created_at >= recent_date
        ).count()
        
        if emergency_appointments > 0:
            risk_score += 0.4
            factors.append(f'Recent emergency visits: {emergency_appointments}')
        
        return {
            'score': risk_score,
            'factors': factors
        }
    
    def _assess_lifestyle_factors(self, patient):
        """Assess lifestyle-related risk factors"""
        # In a real implementation, this would be based on patient lifestyle data
        # For now, we'll return minimal risk
        return {
            'score': 0.1,
            'factors': ['Lifestyle assessment needed']
        }
    
    def _categorize_risk(self, risk_score):
        """Categorize risk level based on score"""
        if risk_score >= 0.8:
            return 'critical'
        elif risk_score >= 0.6:
            return 'high'
        elif risk_score >= 0.4:
            return 'medium'
        elif risk_score >= 0.2:
            return 'low'
        else:
            return 'minimal'
    
    def _generate_recommendations(self, patient, risk_factors, risk_category):
        """Generate specific recommendations based on risk assessment"""
        recommendations = []
        
        # Risk category specific recommendations
        if risk_category in ['critical', 'high']:
            recommendations.extend([
                'Schedule immediate comprehensive health assessment',
                'Consider specialist referrals',
                'Implement intensive monitoring plan',
                'Review and optimize current medications'
            ])
        elif risk_category == 'medium':
            recommendations.extend([
                'Schedule regular follow-up appointments',
                'Monitor key health indicators monthly',
                'Consider preventive interventions'
            ])
        else:
            recommendations.extend([
                'Continue routine health maintenance',
                'Annual comprehensive health check-up'
            ])
        
        # Age-specific recommendations
        if patient.age > 65:
            recommendations.extend([
                'Annual geriatric assessment',
                'Fall risk evaluation',
                'Medication review for elderly-specific considerations'
            ])
        
        # Gender-specific recommendations
        if patient.gender.lower() == 'female' and 40 <= patient.age <= 70:
            recommendations.append('Regular mammography screening')
        
        if patient.age >= 50:
            recommendations.append('Colorectal cancer screening')
        
        return recommendations
    
    def _create_monitoring_plan(self, patient, risk_category):
        """Create a monitoring plan based on risk level"""
        monitoring_frequency = {
            'critical': 'weekly',
            'high': 'bi-weekly',
            'medium': 'monthly',
            'low': 'quarterly',
            'minimal': 'annually'
        }
        
        return {
            'frequency': monitoring_frequency.get(risk_category, 'monthly'),
            'key_metrics': [
                'vital_signs',
                'symptom_assessment',
                'medication_compliance',
                'functional_status'
            ],
            'required_tests': self._get_required_tests(patient, risk_category)
        }
    
    def _get_required_tests(self, patient, risk_category):
        """Get required tests based on patient profile and risk"""
        tests = ['basic_metabolic_panel', 'complete_blood_count']
        
        if patient.age > 40:
            tests.extend(['lipid_panel', 'blood_pressure_monitoring'])
        
        if patient.age > 50:
            tests.extend(['colonoscopy', 'mammography'])
        
        if risk_category in ['critical', 'high']:
            tests.extend(['ecg', 'chest_xray', 'comprehensive_metabolic_panel'])
        
        return tests
    
    def _calculate_next_assessment(self, risk_category):
        """Calculate when next risk assessment should be performed"""
        days_mapping = {
            'critical': 7,
            'high': 14,
            'medium': 30,
            'low': 90,
            'minimal': 365
        }
        
        days = days_mapping.get(risk_category, 30)
        next_date = datetime.utcnow() + timedelta(days=days)
        
        return next_date.isoformat()
    
    def _check_emergency_risk_indicators(self, patient):
        """Check for indicators that require immediate attention"""
        emergency_indicators = []
        
        # Age-based emergency indicators
        if patient.age > 80:
            emergency_indicators.append('Advanced age requires close monitoring')
        
        # Medical history emergency indicators
        if patient.medical_history:
            history = patient.medical_history.lower()
            high_risk_conditions = ['heart attack', 'stroke', 'cancer', 'kidney failure']
            
            for condition in high_risk_conditions:
                if condition in history:
                    emergency_indicators.append(f'History of {condition} - high priority monitoring')
        
        return emergency_indicators