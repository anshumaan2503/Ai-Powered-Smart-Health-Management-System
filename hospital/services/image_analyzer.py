"""
Enhanced Image Analysis Service for Medical Documents
Supports lab reports, prescriptions, and medical images with multiple AI providers
"""

import os
import re
from typing import Dict, List, Any, Optional
from datetime import datetime
import base64
from io import BytesIO

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    try:
        import google.genai as genai
        GEMINI_AVAILABLE = True
    except ImportError:
        GEMINI_AVAILABLE = False

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

try:
    from PIL import Image
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

class MedicalImageAnalyzer:
    """Enhanced medical image analyzer with multiple AI providers"""
    
    def __init__(self):
        self.groq_client = None
        self.gemini_model = None
        self.active_provider = None
        self.init_error = None
        
        # Initialize GROQ first (more reliable for text analysis)
        groq_key = os.getenv('GROQ_API_KEY')
        if GROQ_AVAILABLE and groq_key:
            try:
                self.groq_client = Groq(api_key=groq_key)
                self.active_provider = "groq"
                print("[ImageAnalyzer] ✅ GROQ initialized for text analysis")
            except Exception as e:
                print(f"[ImageAnalyzer] ⚠️ GROQ failed: {e}")
        
        # Initialize Gemini for vision (if available)
        gemini_key = os.getenv('GEMINI_API_KEY')
        if GEMINI_AVAILABLE and gemini_key:
            try:
                genai.configure(api_key=gemini_key)
                # Use the most stable Gemini model for vision
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
                if not self.active_provider:
                    self.active_provider = "gemini"
                print("[ImageAnalyzer] ✅ Gemini initialized for vision analysis")
            except Exception as e:
                print(f"[ImageAnalyzer] ⚠️ Gemini failed: {e}")
                # Try to continue with GROQ only
                if not self.active_provider and self.groq_client:
                    self.active_provider = "groq"
        
        if not self.active_provider:
            self.init_error = "No AI provider available for image analysis"
            print(f"[ImageAnalyzer] ❌ {self.init_error}")
    
    def is_available(self) -> bool:
        """Check if any AI provider is available"""
        return self.active_provider is not None
    
    def analyze_medical_image(self, image_data: bytes, filename: str, user_message: str = "") -> Dict[str, Any]:
        """Analyze medical image with enhanced AI"""
        try:
            if not PILLOW_AVAILABLE:
                return self._create_error_response("Image processing not available - Pillow not installed", filename)
            
            # Convert image data to PIL Image
            image = Image.open(BytesIO(image_data))
            
            # Try Gemini vision first for image analysis
            if self.gemini_model and GEMINI_AVAILABLE:
                return self._analyze_with_gemini_vision(image, filename, user_message)
            
            # Fallback to text-based analysis
            return self._analyze_with_text_extraction(image, filename, user_message)
            
        except Exception as e:
            return self._create_error_response(f"Image analysis failed: {str(e)}", filename)
    
    def _analyze_with_gemini_vision(self, image: Image.Image, filename: str, user_message: str) -> Dict[str, Any]:
        """Analyze image using Gemini Vision"""
        try:
            # Create a comprehensive prompt for medical image analysis
            prompt = f"""
            You are a medical AI assistant analyzing a medical document/image. The user has uploaded: {filename}
            User's message: "{user_message}"
            
            Please analyze this medical image and provide:
            
            1. **Document Type**: What type of medical document is this? (lab report, prescription, X-ray, etc.)
            
            2. **Key Findings**: Extract and list the main medical information:
               - For lab reports: List test names, values, reference ranges, and flag any abnormal values
               - For prescriptions: List medications, dosages, instructions
               - For other medical documents: Extract relevant medical information
            
            3. **Important Values**: Highlight any values that are outside normal ranges or concerning
            
            4. **General Interpretation**: Provide a simple explanation of what the results might mean
            
            5. **Recommendations**: Suggest next steps or when to consult a healthcare provider
            
            IMPORTANT: 
            - Always emphasize that this is for informational purposes only
            - Recommend consulting healthcare professionals for medical decisions
            - Be clear about limitations of AI analysis
            - If you cannot clearly read the image, say so
            
            Format your response clearly with sections and bullet points.
            """
            
            # Generate analysis
            response = self.gemini_model.generate_content([prompt, image])
            analysis_text = response.text
            
            return {
                'success': True,
                'filename': filename,
                'file_type': 'image',
                'analysis_type': 'vision_ai',
                'provider': 'gemini',
                'analysis': analysis_text,
                'document_type': self._extract_document_type(analysis_text),
                'key_findings': self._extract_key_findings(analysis_text),
                'recommendations': [
                    'Consult with your healthcare provider for proper interpretation',
                    'Discuss any concerning values with your doctor',
                    'Keep this report for your medical records'
                ],
                'safety_alerts': [
                    'This AI analysis is for informational purposes only',
                    'Always consult healthcare professionals for medical decisions'
                ],
                'confidence_score': 0.8,
                'analyzed_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"[ImageAnalyzer] Gemini vision error: {e}")
            return self._analyze_with_text_extraction(image, filename, user_message)
    
    def _analyze_with_text_extraction(self, image: Image.Image, filename: str, user_message: str) -> Dict[str, Any]:
        """Fallback analysis using text extraction and GROQ"""
        try:
            # Basic image analysis without OCR (simplified)
            analysis_text = self._create_basic_analysis(filename, user_message)
            
            # If GROQ is available, enhance the analysis
            if self.groq_client:
                enhanced_analysis = self._enhance_with_groq(analysis_text, user_message)
                analysis_text = enhanced_analysis
            
            return {
                'success': True,
                'filename': filename,
                'file_type': 'image',
                'analysis_type': 'text_based',
                'provider': self.active_provider or 'fallback',
                'analysis': analysis_text,
                'document_type': 'medical_document',
                'key_findings': ['Image uploaded successfully', 'Basic analysis completed'],
                'recommendations': [
                    'For detailed analysis, please consult a healthcare professional',
                    'Consider using a higher quality scan if text is unclear',
                    'Share this document with your doctor for proper interpretation'
                ],
                'safety_alerts': [
                    'This is a basic analysis only',
                    'Professional medical interpretation is recommended'
                ],
                'confidence_score': 0.4,
                'analyzed_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return self._create_error_response(f"Text analysis failed: {str(e)}", filename)
    
    def _enhance_with_groq(self, basic_analysis: str, user_message: str) -> str:
        """Enhance analysis using GROQ for text processing"""
        try:
            prompt = f"""
            A user has uploaded a medical image for analysis. Here's what we know:
            
            Basic Analysis: {basic_analysis}
            User's Question: {user_message}
            
            Please provide helpful guidance about medical images and lab reports in general:
            
            1. Explain what types of information are typically found in medical documents
            2. Provide general guidance about understanding lab results
            3. Emphasize the importance of professional medical interpretation
            4. Suggest questions the user might ask their healthcare provider
            
            Keep the response helpful, supportive, and medically responsible.
            """
            
            response = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"[ImageAnalyzer] GROQ enhancement error: {e}")
            return basic_analysis
    
    def _create_basic_analysis(self, filename: str, user_message: str) -> str:
        """Create basic analysis when AI is not available"""
        file_type = "medical document"
        
        if any(word in filename.lower() for word in ['lab', 'blood', 'test', 'result']):
            file_type = "lab report"
        elif any(word in filename.lower() for word in ['prescription', 'rx', 'med']):
            file_type = "prescription"
        elif any(word in filename.lower() for word in ['xray', 'x-ray', 'scan', 'mri', 'ct']):
            file_type = "medical imaging"
        
        return f"""
        **Document Analysis: {filename}**
        
        **Document Type**: {file_type.title()}
        
        **Analysis Status**: Image uploaded successfully. For detailed analysis of medical documents like this, I recommend:
        
        **General Guidance**:
        • Medical documents contain important health information that requires professional interpretation
        • Lab reports typically show test values compared to normal reference ranges
        • Values outside the normal range may need medical attention
        • Prescriptions contain medication names, dosages, and instructions
        
        **Next Steps**:
        • Share this document with your healthcare provider
        • Ask your doctor to explain any concerning values
        • Keep this document in your medical records
        • Follow up as recommended by your healthcare team
        
        **Important**: This analysis is limited without advanced AI vision capabilities. For accurate interpretation of your medical results, please consult with a qualified healthcare professional.
        """
    
    def _extract_document_type(self, analysis_text: str) -> str:
        """Extract document type from analysis"""
        text_lower = analysis_text.lower()
        if 'lab report' in text_lower or 'blood test' in text_lower:
            return 'lab_report'
        elif 'prescription' in text_lower:
            return 'prescription'
        elif 'x-ray' in text_lower or 'scan' in text_lower:
            return 'medical_imaging'
        else:
            return 'medical_document'
    
    def _extract_key_findings(self, analysis_text: str) -> List[str]:
        """Extract key findings from analysis"""
        findings = []
        
        # Look for bullet points or numbered items
        lines = analysis_text.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('•') or line.startswith('-') or re.match(r'^\d+\.', line):
                findings.append(line)
        
        # If no structured findings found, return general ones
        if not findings:
            findings = [
                'Medical document analyzed',
                'Professional interpretation recommended'
            ]
        
        return findings[:5]  # Limit to 5 key findings
    
    def _create_error_response(self, error_message: str, filename: str) -> Dict[str, Any]:
        """Create error response"""
        return {
            'success': False,
            'error': error_message,
            'filename': filename,
            'file_type': 'image',
            'analysis_type': 'error',
            'recommendations': [
                'Try uploading a clearer image',
                'Ensure the image is in a supported format (PNG, JPG, etc.)',
                'Consult with a healthcare professional for proper analysis'
            ],
            'safety_alerts': [
                'Image analysis failed - professional review recommended'
            ],
            'analyzed_at': datetime.utcnow().isoformat()
        }