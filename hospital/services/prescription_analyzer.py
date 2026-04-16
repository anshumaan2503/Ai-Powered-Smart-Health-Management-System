"""
Prescription Analyzer Service
Analyzes prescription images and PDFs using AI to extract and validate medication information
"""

import os
import re
import json
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import base64
from io import BytesIO

# AI library will be imported lazily to prevent startup crashes
GEMINI_AVAILABLE = True 
genai = None

try:
    from PIL import Image
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

try:
    import PyPDF2
    PDF_LIBRARY = 'PyPDF2'
except ImportError:
    try:
        import pypdf as PyPDF2
        PDF_LIBRARY = 'pypdf'
    except ImportError:
        try:
            import PyPDF4 as PyPDF2
            PDF_LIBRARY = 'PyPDF4'
        except ImportError:
            PyPDF2 = None
            PDF_LIBRARY = None

DEPENDENCIES_AVAILABLE = PILLOW_AVAILABLE and PDF_LIBRARY is not None

class PrescriptionAnalyzer:
    """AI-powered prescription analysis service"""
    
    def __init__(self):
        global genai, GEMINI_AVAILABLE
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model = None
        self.init_error = None
        
        # Lazy import to prevent server crash during startup if library is broken
        if genai is None:
            try:
                import google.generativeai as genai_lib
                genai = genai_lib
                GEMINI_AVAILABLE = True
            except Exception as e:
                GEMINI_AVAILABLE = False
                self.init_error = f"Gemini library error: {str(e)}"
        
        if GEMINI_AVAILABLE and self.api_key and self.init_error is None:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                self.init_error = str(e)
    
    def is_available(self) -> bool:
        """Check if the analyzer is properly configured"""
        return GEMINI_AVAILABLE and self.model is not None and self.init_error is None
    
    def get_status(self) -> Dict[str, Any]:
        """Get detailed status of the analyzer"""
        return {
            'gemini_available': GEMINI_AVAILABLE,
            'pillow_available': PILLOW_AVAILABLE,
            'pdf_library': PDF_LIBRARY,
            'dependencies_available': DEPENDENCIES_AVAILABLE,
            'api_key_present': bool(self.api_key),
            'model_initialized': self.model is not None,
            'init_error': self.init_error,
            'can_process_images': PILLOW_AVAILABLE,
            'can_process_pdfs': PDF_LIBRARY is not None,
            'can_use_ai': self.is_available()
        }
    
    def analyze_prescription_image(self, image_data: bytes, filename: str) -> Dict[str, Any]:
        """Analyze prescription from image data"""
        try:
            if not PILLOW_AVAILABLE:
                return {
                    'error': 'Image processing not available - Pillow not installed',
                    'success': False,
                    'filename': filename,
                    'fallback_message': 'Install Pillow: pip install Pillow',
                    'analyzed_at': datetime.utcnow().isoformat()
                }
            
            if not self.is_available():
                return self._fallback_analysis(filename, 'image')
            
            # Convert image data to PIL Image
            image = Image.open(BytesIO(image_data))
            
            # Prepare the prompt for prescription analysis
            prompt = self._get_prescription_analysis_prompt()
            
            # Generate analysis using Gemini Vision
            response = self.model.generate_content([prompt, image])
            
            # Parse the response
            analysis_result = self._parse_gemini_response(response.text)
            
            # Add metadata
            analysis_result.update({
                'filename': filename,
                'file_type': 'image',
                'analyzed_at': datetime.utcnow().isoformat(),
                'analyzer_version': 'gemini-1.5-flash',
                'confidence_score': self._calculate_confidence(analysis_result)
            })
            
            return analysis_result
            
        except Exception as e:
            return {
                'error': f'Analysis failed: {str(e)}',
                'success': False,
                'filename': filename,
                'analyzed_at': datetime.utcnow().isoformat()
            }
    
    def analyze_prescription_pdf(self, pdf_data: bytes, filename: str) -> Dict[str, Any]:
        """Analyze prescription from PDF data"""
        try:
            if not PDF_LIBRARY:
                return {
                    'error': 'PDF processing not available - PDF library not installed',
                    'success': False,
                    'filename': filename,
                    'fallback_message': 'Install PDF library: pip install PyPDF2',
                    'analyzed_at': datetime.utcnow().isoformat()
                }
            
            # Extract text from PDF
            pdf_text = self._extract_pdf_text(pdf_data)
            
            if not pdf_text.strip():
                return {
                    'error': 'Could not extract text from PDF',
                    'success': False,
                    'filename': filename
                }
            
            # Analyze extracted text
            if self.is_available():
                analysis_result = self._analyze_prescription_text(pdf_text)
            else:
                analysis_result = self._fallback_text_analysis(pdf_text)
            
            # Add metadata
            analysis_result.update({
                'filename': filename,
                'file_type': 'pdf',
                'analyzed_at': datetime.utcnow().isoformat(),
                'extracted_text': pdf_text[:500] + '...' if len(pdf_text) > 500 else pdf_text,
                'pdf_library_used': PDF_LIBRARY
            })
            
            return analysis_result
            
        except Exception as e:
            return {
                'error': f'PDF analysis failed: {str(e)}',
                'success': False,
                'filename': filename,
                'analyzed_at': datetime.utcnow().isoformat()
            }
    
    def _extract_pdf_text(self, pdf_data: bytes) -> str:
        """Extract text from PDF bytes"""
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_data))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            raise Exception(f"PDF text extraction failed: {str(e)}")
    
    def _analyze_prescription_text(self, text: str) -> Dict[str, Any]:
        """Analyze prescription text using Gemini AI"""
        try:
            prompt = f"""
            {self._get_prescription_analysis_prompt()}
            
            PRESCRIPTION TEXT:
            {text}
            """
            
            response = self.model.generate_content(prompt)
            return self._parse_gemini_response(response.text)
            
        except Exception as e:
            return self._fallback_text_analysis(text)
    
    def _get_prescription_analysis_prompt(self) -> str:
        """Get the AI prompt for prescription analysis"""
        return """
        You are a medical AI assistant specializing in prescription analysis. Analyze the provided prescription and extract the following information in JSON format:

        {
            "success": true,
            "medications": [
                {
                    "name": "medication name",
                    "generic_name": "generic name if different",
                    "dosage": "strength/dosage",
                    "frequency": "how often to take",
                    "duration": "how long to take",
                    "instructions": "special instructions",
                    "quantity": "number of pills/units"
                }
            ],
            "patient_info": {
                "name": "patient name if visible",
                "age": "age if mentioned",
                "gender": "gender if mentioned"
            },
            "doctor_info": {
                "name": "doctor name if visible",
                "specialty": "specialty if mentioned",
                "license": "license number if visible"
            },
            "prescription_details": {
                "date": "prescription date",
                "clinic_name": "clinic/hospital name",
                "prescription_number": "prescription ID if visible"
            },
            "safety_alerts": [
                "list any potential drug interactions",
                "dosage concerns",
                "contraindications"
            ],
            "recommendations": [
                "general recommendations for the patient",
                "timing suggestions",
                "food interactions"
            ]
        }

        Important:
        - Extract only information that is clearly visible
        - Use "Not specified" for missing information
        - Be conservative with safety alerts - only mention clear concerns
        - Provide helpful but not diagnostic recommendations
        - Ensure all medication names are spelled correctly
        """
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Gemini AI response and extract JSON"""
        try:
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            else:
                # If no JSON found, create structured response from text
                return self._create_structured_response(response_text)
        except json.JSONDecodeError:
            return self._create_structured_response(response_text)
    
    def _create_structured_response(self, text: str) -> Dict[str, Any]:
        """Create structured response from unstructured text"""
        return {
            'success': True,
            'medications': [],
            'analysis_text': text,
            'note': 'Could not parse structured data, see analysis_text for details',
            'safety_alerts': ['Please consult with a healthcare professional for proper interpretation'],
            'recommendations': ['Verify all medication details with your doctor or pharmacist']
        }
    
    def _fallback_analysis(self, filename: str, file_type: str = 'unknown') -> Dict[str, Any]:
        """Fallback analysis when AI is not available"""
        missing_deps = []
        if not PILLOW_AVAILABLE:
            missing_deps.append('Pillow (for image processing)')
        if not PDF_LIBRARY:
            missing_deps.append('PyPDF2 (for PDF processing)')
        if not GEMINI_AVAILABLE:
            missing_deps.append('google-generativeai (for AI analysis)')
        
        return {
            'success': False,
            'error': 'Full analysis not available - missing dependencies or API key',
            'filename': filename,
            'file_type': file_type,
            'missing_dependencies': missing_deps,
            'fallback_message': f'Install missing packages: pip install {" ".join([dep.split(" ")[0] for dep in missing_deps])}',
            'recommendations': [
                'Manually review the prescription with a healthcare professional',
                'Ensure all medications are taken as prescribed',
                'Check for drug interactions with your pharmacist',
                'Install required dependencies for full AI analysis'
            ],
            'analyzed_at': datetime.utcnow().isoformat()
        }
    
    def _fallback_text_analysis(self, text: str) -> Dict[str, Any]:
        """Basic text analysis when AI is not available"""
        # Simple regex patterns for common prescription elements
        medications = []
        
        # Look for common medication patterns
        med_patterns = [
            r'(\w+)\s+(\d+\s*mg|\d+\s*mcg|\d+\s*g)',  # Name + dosage
            r'Tab\s+(\w+)\s+(\d+\s*mg)',  # Tablet format
            r'Cap\s+(\w+)\s+(\d+\s*mg)',  # Capsule format
        ]
        
        for pattern in med_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                medications.append({
                    'name': match[0],
                    'dosage': match[1] if len(match) > 1 else 'Not specified',
                    'frequency': 'Not specified',
                    'duration': 'Not specified',
                    'instructions': 'Not specified'
                })
        
        return {
            'success': True,
            'medications': medications,
            'note': 'Basic text analysis - AI not available',
            'extracted_text': text[:500] + '...' if len(text) > 500 else text,
            'safety_alerts': ['Please verify all information with a healthcare professional'],
            'recommendations': [
                'Consult with your doctor or pharmacist for proper interpretation',
                'Double-check all medication names and dosages'
            ]
        }
    
    def _calculate_confidence(self, analysis_result: Dict[str, Any]) -> float:
        """Calculate confidence score based on extracted information"""
        score = 0.0
        total_checks = 0
        
        # Check if medications were found
        if analysis_result.get('medications'):
            score += 0.3
            total_checks += 1
            
            # Check medication completeness
            for med in analysis_result['medications']:
                if med.get('name') and med.get('name') != 'Not specified':
                    score += 0.1
                if med.get('dosage') and med.get('dosage') != 'Not specified':
                    score += 0.1
                total_checks += 2
        
        # Check if patient info was found
        patient_info = analysis_result.get('patient_info', {})
        if patient_info.get('name') and patient_info.get('name') != 'Not specified':
            score += 0.2
        total_checks += 1
        
        # Check if doctor info was found
        doctor_info = analysis_result.get('doctor_info', {})
        if doctor_info.get('name') and doctor_info.get('name') != 'Not specified':
            score += 0.2
        total_checks += 1
        
        return min(score / max(total_checks, 1), 1.0) if total_checks > 0 else 0.0
    
    def validate_prescription(self, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate prescription analysis and add safety checks"""
        validation_result = {
            'is_valid': True,
            'warnings': [],
            'errors': [],
            'suggestions': []
        }
        
        medications = analysis_result.get('medications', [])
        
        if not medications:
            validation_result['errors'].append('No medications found in prescription')
            validation_result['is_valid'] = False
        
        for med in medications:
            # Check for missing critical information
            if not med.get('name') or med.get('name') == 'Not specified':
                validation_result['errors'].append('Medication name missing or unclear')
                validation_result['is_valid'] = False
            
            if not med.get('dosage') or med.get('dosage') == 'Not specified':
                validation_result['warnings'].append(f"Dosage not specified for {med.get('name', 'unknown medication')}")
            
            if not med.get('frequency') or med.get('frequency') == 'Not specified':
                validation_result['warnings'].append(f"Frequency not specified for {med.get('name', 'unknown medication')}")
        
        # Add general suggestions
        validation_result['suggestions'].extend([
            'Verify all medication names and dosages with your pharmacist',
            'Check for potential drug interactions',
            'Follow the prescribed schedule strictly',
            'Contact your doctor if you experience any side effects'
        ])
        
        return validation_result