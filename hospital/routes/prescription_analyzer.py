"""
Prescription Analyzer Routes
API endpoints for prescription image/PDF analysis
"""

import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from hospital.services.prescription_analyzer import PrescriptionAnalyzer
from hospital import db
from hospital.models.prescription_analysis import PrescriptionAnalysis
import uuid
from datetime import datetime

prescription_bp = Blueprint('prescription', __name__)

# Configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'pdf'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def is_image_file(filename):
    """Check if file is an image"""
    image_extensions = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in image_extensions

@prescription_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_prescription():
    """
    Analyze prescription from uploaded image or PDF
    
    Expected form data:
    - file: prescription image or PDF file
    - patient_id: (optional) patient ID to associate with analysis
    """
    try:
        # Verify user authentication
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, BMP, TIFF, PDF'
            }), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large. Maximum size: 16MB'}), 400
        
        # Read file data
        file_data = file.read()
        filename = secure_filename(file.filename)
        
        # Initialize analyzer
        analyzer = PrescriptionAnalyzer()
        
        # Analyze based on file type
        if is_image_file(filename):
            analysis_result = analyzer.analyze_prescription_image(file_data, filename)
        else:  # PDF
            analysis_result = analyzer.analyze_prescription_pdf(file_data, filename)
        
        # Validate the analysis
        validation_result = analyzer.validate_prescription(analysis_result)
        analysis_result['validation'] = validation_result
        
        # Get additional form data
        patient_id = request.form.get('patient_id')
        
        # Save analysis to database
        try:
            prescription_analysis = PrescriptionAnalysis(
                id=str(uuid.uuid4()),
                user_id=user_id,
                patient_id=patient_id,
                filename=filename,
                file_type='image' if is_image_file(filename) else 'pdf',
                file_size=file_size,
                analysis_result=analysis_result,
                confidence_score=analysis_result.get('confidence_score', 0.0),
                is_valid=validation_result.get('is_valid', False),
                analyzer_version=analysis_result.get('analyzer_version', 'unknown')
            )
            
            db.session.add(prescription_analysis)
            db.session.commit()
            
            analysis_result['analysis_id'] = prescription_analysis.id
            
        except Exception as db_error:
            # Continue even if database save fails
            current_app.logger.error(f"Failed to save prescription analysis: {str(db_error)}")
            analysis_result['warning'] = 'Analysis completed but could not be saved to database'
        
        return jsonify({
            'success': True,
            'analysis': analysis_result,
            'message': 'Prescription analyzed successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Prescription analysis error: {str(e)}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@prescription_bp.route('/history', methods=['GET'])
@jwt_required()
def get_analysis_history():
    """Get prescription analysis history for current user"""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Query user's prescription analyses
        analyses = PrescriptionAnalysis.query.filter_by(user_id=user_id)\
                                           .order_by(PrescriptionAnalysis.created_at.desc())\
                                           .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'analyses': [analysis.to_dict() for analysis in analyses.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': analyses.total,
                'pages': analyses.pages,
                'has_next': analyses.has_next,
                'has_prev': analyses.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@prescription_bp.route('/analysis/<analysis_id>', methods=['GET'])
@jwt_required()
def get_analysis_details(analysis_id):
    """Get detailed analysis results"""
    try:
        user_id = get_jwt_identity()
        
        analysis = PrescriptionAnalysis.query.filter_by(
            id=analysis_id,
            user_id=user_id
        ).first()
        
        if not analysis:
            return jsonify({'error': 'Analysis not found'}), 404
        
        return jsonify({
            'success': True,
            'analysis': analysis.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@prescription_bp.route('/analysis/<analysis_id>', methods=['DELETE'])
@jwt_required()
def delete_analysis(analysis_id):
    """Delete prescription analysis"""
    try:
        user_id = get_jwt_identity()
        
        analysis = PrescriptionAnalysis.query.filter_by(
            id=analysis_id,
            user_id=user_id
        ).first()
        
        if not analysis:
            return jsonify({'error': 'Analysis not found'}), 404
        
        db.session.delete(analysis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Analysis deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@prescription_bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_prescription_data():
    """Validate prescription data manually entered by user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        analyzer = PrescriptionAnalyzer()
        validation_result = analyzer.validate_prescription(data)
        
        return jsonify({
            'success': True,
            'validation': validation_result
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@prescription_bp.route('/test-analyzer', methods=['GET'])
def test_analyzer():
    """Test endpoint to check if prescription analyzer is working"""
    try:
        analyzer = PrescriptionAnalyzer()
        status = analyzer.get_status()
        
        # Add additional system info
        status.update({
            'supported_formats': list(ALLOWED_EXTENSIONS),
            'max_file_size_mb': MAX_FILE_SIZE / (1024 * 1024),
            'system_ready': status['dependencies_available'],
            'message': 'Prescription analyzer is ready!' if status['dependencies_available'] else 'Some dependencies missing - partial functionality available'
        })
        
        return jsonify(status), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'analyzer_available': False,
            'system_ready': False
        }), 500

@prescription_bp.route('/drug-interactions', methods=['POST'])
@jwt_required()
def check_drug_interactions():
    """Check for potential drug interactions"""
    try:
        data = request.get_json()
        medications = data.get('medications', [])
        
        if not medications:
            return jsonify({'error': 'No medications provided'}), 400
        
        # This is a simplified interaction checker
        # In production, you'd integrate with a proper drug interaction database
        interactions = []
        warnings = []
        
        # Basic interaction patterns (expand this with real data)
        interaction_patterns = {
            'warfarin': ['aspirin', 'ibuprofen', 'naproxen'],
            'metformin': ['alcohol', 'contrast dye'],
            'lisinopril': ['potassium supplements', 'spironolactone'],
            'simvastatin': ['grapefruit', 'clarithromycin', 'erythromycin']
        }
        
        med_names = [med.get('name', '').lower() for med in medications if med.get('name')]
        
        for med in med_names:
            if med in interaction_patterns:
                for other_med in med_names:
                    if other_med in interaction_patterns[med]:
                        interactions.append({
                            'medication1': med,
                            'medication2': other_med,
                            'severity': 'moderate',
                            'description': f'Potential interaction between {med} and {other_med}'
                        })
        
        # General warnings
        if len(medications) > 5:
            warnings.append('Taking multiple medications - consult pharmacist for comprehensive review')
        
        return jsonify({
            'success': True,
            'interactions': interactions,
            'warnings': warnings,
            'total_medications': len(medications),
            'note': 'This is a basic interaction check. Consult healthcare professionals for comprehensive analysis.'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500