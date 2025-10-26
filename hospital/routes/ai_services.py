from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital import db
from hospital.models.ai_diagnosis import AIDiagnosis
# from hospital.models.patient import Patient  # Disabled for now
from hospital.services.simple_ai import SimpleSymptomChecker, SimpleRiskAssessment, SimpleTreatmentRecommendations

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/symptom-checker', methods=['POST'])
@jwt_required()
def symptom_checker():
    """AI-powered symptom analysis and preliminary diagnosis"""
    try:
        data = request.get_json()
        
        if not data.get('symptoms'):
            return jsonify({'error': 'Symptoms are required'}), 400
        
        patient_id = data.get('patient_id')
        symptoms = data['symptoms']
        additional_info = data.get('additional_info', {})
        
        # Initialize AI service
        symptom_service = SimpleSymptomChecker()
        
        # Analyze symptoms
        analysis_result = symptom_service.analyze_symptoms(
            symptoms_text=symptoms,
            patient_age=additional_info.get('age'),
            patient_gender=additional_info.get('gender')
        )
        
        # Save AI diagnosis if patient_id provided (disabled for now)
        # if patient_id:
        #     ai_diagnosis = AIDiagnosis(
        #         patient_id=patient_id,
        #         symptoms=symptoms,
        #         predicted_conditions=analysis_result['predicted_conditions'],
        #         risk_assessment=analysis_result['risk_level'],
        #         recommended_tests=analysis_result['recommended_tests'],
        #         recommended_specialists=analysis_result['recommended_specialists'],
        #         ai_confidence_score=analysis_result['confidence_score'],
        #         model_version='v1.0',
        #         input_data=additional_info
        #     )
        #     
        #     db.session.add(ai_diagnosis)
        #     db.session.commit()
        #     
        #     analysis_result['diagnosis_id'] = ai_diagnosis.id
        
        return jsonify({
            'success': True,
            'analysis': analysis_result
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/risk-assessment', methods=['POST'])
@jwt_required()
def risk_assessment():
    """AI-powered patient risk assessment"""
    try:
        data = request.get_json()
        
        patient_id = data.get('patient_id')
        if not patient_id:
            return jsonify({'error': 'Patient ID is required'}), 400
        
        # Patient functionality disabled for now
        return jsonify({'error': 'Patient functionality temporarily disabled'}), 503
        
        # patient = Patient.query.get(patient_id)
        # if not patient:
        #     return jsonify({'error': 'Patient not found'}), 404
        # 
        # # Initialize risk assessment service
        # risk_service = SimpleRiskAssessment()
        # 
        # # Perform risk assessment
        # risk_result = risk_service.assess_patient_risk(patient)
        
        return jsonify({
            'success': True,
            'patient_id': patient_id,
            'risk_assessment': risk_result
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/treatment-recommendations', methods=['POST'])
@jwt_required()
def treatment_recommendations():
    """AI-powered treatment recommendations"""
    try:
        data = request.get_json()
        
        diagnosis_id = data.get('diagnosis_id')
        if not diagnosis_id:
            return jsonify({'error': 'Diagnosis ID is required'}), 400
        
        ai_diagnosis = AIDiagnosis.query.get(diagnosis_id)
        if not ai_diagnosis:
            return jsonify({'error': 'AI diagnosis not found'}), 404
        
        # Initialize treatment service
        treatment_service = SimpleTreatmentRecommendations()
        
        # Get treatment recommendations
        recommendations = treatment_service.get_recommendations(ai_diagnosis.predicted_conditions)
        
        return jsonify({
            'success': True,
            'diagnosis_id': diagnosis_id,
            'recommendations': recommendations
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/diagnoses/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient_ai_diagnoses(patient_id):
    """Get all AI diagnoses for a patient"""
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        diagnoses = AIDiagnosis.query.filter_by(patient_id=patient_id).order_by(AIDiagnosis.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'patient_id': patient_id,
            'diagnoses': [diagnosis.to_dict() for diagnosis in diagnoses]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/verify-diagnosis/<int:diagnosis_id>', methods=['PUT'])
@jwt_required()
def verify_diagnosis(diagnosis_id):
    """Doctor verification of AI diagnosis"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        ai_diagnosis = AIDiagnosis.query.get(diagnosis_id)
        if not ai_diagnosis:
            return jsonify({'error': 'AI diagnosis not found'}), 404
        
        # Update verification status
        ai_diagnosis.doctor_verified = data.get('verified', False)
        ai_diagnosis.doctor_notes = data.get('notes', '')
        ai_diagnosis.doctor_id = current_user_id
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Diagnosis verification updated',
            'diagnosis': ai_diagnosis.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500