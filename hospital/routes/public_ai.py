"""
Public AI Routes - No authentication required
Provides public access to AI chatbot functionality with file analysis
"""

from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from hospital.services.simple_ai import SimpleHealthChatbot
from hospital.services.gemini_ai import GeminiHealthChatbot
from hospital.services.lab_report_analyzer import LabReportAnalyzer
import time
import os
from datetime import datetime

public_ai_bp = Blueprint('public_ai', __name__)

# Rate limiting storage (in production, use Redis)
request_counts = {}
RATE_LIMIT = 50  # requests per hour per IP
RATE_WINDOW = 3600  # 1 hour in seconds

# File upload settings
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'pdf', 'doc', 'docx', 'txt'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def check_rate_limit(ip_address):
    """Simple rate limiting by IP address"""
    current_time = time.time()
    
    # Clean old entries
    for ip in list(request_counts.keys()):
        request_counts[ip] = [req_time for req_time in request_counts[ip] 
                             if current_time - req_time < RATE_WINDOW]
        if not request_counts[ip]:
            del request_counts[ip]
    
    # Check current IP
    if ip_address not in request_counts:
        request_counts[ip_address] = []
    
    if len(request_counts[ip_address]) >= RATE_LIMIT:
        return False
    
    request_counts[ip_address].append(current_time)
    return True

@public_ai_bp.route('/chatbot', methods=['POST'])
def public_ai_chatbot():
    """Public AI chatbot endpoint - no authentication required"""
    try:
        # Rate limiting
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if not check_rate_limit(client_ip):
            return jsonify({
                'error': 'Rate limit exceeded. Please try again later.',
                'rate_limit': f'{RATE_LIMIT} requests per hour'
            }), 429
        
        data = request.get_json() or {}
        message = data.get('message', '').strip()
        context = data.get('context', [])

        if not message:
            return jsonify({'error': 'Message is required'}), 400

        # Validate message length
        if len(message) > 1000:
            return jsonify({'error': 'Message too long. Maximum 1000 characters.'}), 400

        # Try Gemini AI first, fallback to simple chatbot
        gemini_bot = GeminiHealthChatbot()
        if gemini_bot.is_available():
            result = gemini_bot.respond(message, context)
            ai_type = 'gemini'
        else:
            # Fallback to simple rule-based chatbot
            simple_bot = SimpleHealthChatbot()
            result = simple_bot.respond(message, context)
            ai_type = 'simple'

        return jsonify({
            'success': True,
            'response': result,
            'ai_type': ai_type,
            'timestamp': datetime.utcnow().isoformat(),
            'disclaimer': 'This is general health information only. Consult healthcare professionals for medical advice.'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Service temporarily unavailable',
            'message': 'Please try again later or consult a healthcare professional',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@public_ai_bp.route('/analyze-files', methods=['POST'])
def analyze_files():
    """Analyze uploaded files (images, documents) with AI"""
    try:
        # Rate limiting
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if not check_rate_limit(client_ip):
            return jsonify({
                'error': 'Rate limit exceeded. Please try again later.',
                'rate_limit': f'{RATE_LIMIT} requests per hour'
            }), 429

        # Get message and context
        message = request.form.get('message', '').strip()
        context_str = request.form.get('context', '[]')
        
        try:
            context = eval(context_str) if context_str else []
        except:
            context = []

        # Get uploaded files
        uploaded_files = []
        file_analyses = []
        
        for key in request.files:
            if key.startswith('file_'):
                file = request.files[key]
                if file and file.filename and allowed_file(file.filename):
                    # Check file size
                    file.seek(0, os.SEEK_END)
                    file_size = file.tell()
                    file.seek(0)
                    
                    if file_size > MAX_FILE_SIZE:
                        continue
                    
                    filename = secure_filename(file.filename)
                    file_data = file.read()
                    
                    # Use the specialized lab report analyzer
                    analyzer = LabReportAnalyzer()
                    
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff')):
                        # Enhanced lab report and medical image analysis
                        analysis = analyzer.analyze_lab_report(filename, message)
                    elif filename.lower().endswith('.pdf'):
                        # For PDFs, we'll use the same analyzer with document context
                        analysis = analyzer.analyze_lab_report(filename, f"PDF document: {message}")
                    else:
                        # Text document analysis
                        try:
                            text_content = file_data.decode('utf-8', errors='ignore')
                            analysis = {
                                'success': True,
                                'filename': filename,
                                'file_type': 'document',
                                'analysis': f'Text document "{filename}" processed. Content length: {len(text_content)} characters. For medical documents, professional interpretation is recommended.',
                                'document_type': 'text_document',
                                'extracted_text': text_content[:500] + '...' if len(text_content) > 500 else text_content,
                                'recommendations': [
                                    'Have a healthcare professional review this document',
                                    'Discuss the contents with your doctor',
                                    'Keep this document for your medical records'
                                ],
                                'safety_alerts': [
                                    'Text document processed - professional interpretation needed'
                                ]
                            }
                        except:
                            analysis = {
                                'error': f'Could not process text document {filename}',
                                'filename': filename,
                                'success': False
                            }
                    
                    file_analyses.append(analysis)
                    uploaded_files.append(filename)

        if not file_analyses:
            return jsonify({
                'error': 'No valid files uploaded',
                'supported_formats': list(ALLOWED_EXTENSIONS),
                'max_file_size_mb': MAX_FILE_SIZE / (1024 * 1024)
            }), 400

        # Combine file analyses with AI chat response
        combined_analysis = {
            'files_analyzed': len(file_analyses),
            'file_results': file_analyses,
            'uploaded_files': uploaded_files
        }

        # Generate AI response based on file analysis
        gemini_bot = GeminiHealthChatbot()
        
        # Create a comprehensive summary of the analysis
        analysis_summary = []
        successful_analyses = []
        
        for analysis in file_analyses:
            if analysis.get('success'):
                filename = analysis.get('filename', 'Unknown file')
                doc_type = analysis.get('document_type', 'medical document')
                
                summary = f"📄 **{filename}** ({doc_type}):\n"
                
                # Add analysis content
                if analysis.get('analysis'):
                    # Get first few lines of analysis
                    analysis_lines = analysis['analysis'].split('\n')[:3]
                    summary += f"   Analysis: {' '.join(analysis_lines)}\n"
                
                # Add key findings if available
                if analysis.get('key_findings'):
                    findings = analysis['key_findings'][:2]  # First 2 findings
                    summary += f"   Key findings: {', '.join(findings)}\n"
                
                # Add any specific medical data
                if analysis.get('medications'):
                    meds = analysis['medications']
                    summary += f"   • Found {len(meds)} medication(s)\n"
                
                if analysis.get('extracted_text'):
                    summary += f"   • Text content extracted\n"
                
                successful_analyses.append(analysis)
                analysis_summary.append(summary)
            else:
                error_msg = analysis.get('error', 'Analysis failed')
                filename = analysis.get('filename', 'Unknown file')
                analysis_summary.append(f"❌ **{filename}**: {error_msg}")
        
        # Create AI prompt based on analysis results
        if successful_analyses:
            ai_prompt = f"""
            The user uploaded {len(file_analyses)} medical file(s) for analysis. Here are the results:

            {chr(10).join(analysis_summary)}

            User's message: "{message}"

            Based on these analysis results, please provide helpful health guidance that includes:

            1. **Summary**: What types of medical documents were analyzed
            2. **Key Information**: Highlight important findings from the analysis
            3. **Health Guidance**: Provide relevant health advice based on the content
            4. **Next Steps**: Recommend appropriate follow-up actions
            5. **Professional Care**: Emphasize when to consult healthcare providers

            Important guidelines:
            - Be supportive and informative
            - Always emphasize that AI analysis is supplementary to professional medical care
            - Provide actionable advice while being medically responsible
            - If lab results show abnormal values, suggest discussing with a doctor
            - Keep the response organized and easy to understand

            Remember: You are providing health guidance, not medical diagnosis.
            """
        else:
            ai_prompt = f"""
            The user tried to upload {len(file_analyses)} medical file(s) for analysis, but the analysis encountered issues.
            
            Problems encountered:
            {chr(10).join(analysis_summary)}
            
            User's message: "{message}"
            
            Please help the user by:
            1. Explaining what might have gone wrong with the file analysis
            2. Suggesting alternative approaches for getting their medical documents analyzed
            3. Providing general guidance about medical document interpretation
            4. Recommending they consult healthcare professionals for proper analysis
            
            Be supportive and helpful while emphasizing the importance of professional medical care.
            """
        
        if gemini_bot.is_available():
            ai_response = gemini_bot.respond(ai_prompt, context)
        else:
            # Enhanced fallback response
            simple_bot = SimpleHealthChatbot()
            fallback_message = f"I've attempted to analyze your {len(file_analyses)} file(s). "
            if successful_analyses:
                fallback_message += f"I found some information, but for the best analysis, please consult with a healthcare professional who can properly review your medical documents."
            else:
                fallback_message += "Unfortunately, I couldn't process the files properly. Please ensure they are clear images or readable documents, and consider consulting with a healthcare professional for proper analysis."
            
            ai_response = simple_bot.respond(fallback_message, context)

        return jsonify({
            'success': True,
            'response': ai_response,
            'file_analysis': combined_analysis,
            'timestamp': datetime.utcnow().isoformat(),
            'disclaimer': 'This analysis is for informational purposes only. Always consult healthcare professionals for medical decisions.'
        }), 200

    except Exception as e:
        current_app.logger.error(f"File analysis error: {str(e)}")
        return jsonify({
            'error': 'File analysis failed',
            'message': 'Please try again later or consult a healthcare professional',
            'timestamp': datetime.utcnow().isoformat()
        }), 500