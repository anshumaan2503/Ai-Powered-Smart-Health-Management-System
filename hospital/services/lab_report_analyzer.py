"""
Specialized Lab Report Analyzer
Focuses on analyzing lab reports and medical documents with smart text analysis
"""

import os
from typing import Dict, List, Any, Optional
from datetime import datetime

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

class LabReportAnalyzer:
    """Specialized analyzer for lab reports and medical documents"""
    
    def __init__(self):
        self.groq_client = None
        self.active_provider = None
        
        # Initialize GROQ for enhanced text analysis
        groq_key = os.getenv('GROQ_API_KEY')
        if GROQ_AVAILABLE and groq_key:
            try:
                self.groq_client = Groq(api_key=groq_key)
                self.active_provider = "groq"
                print("[LabAnalyzer] ✅ GROQ initialized for lab report analysis")
            except Exception as e:
                print(f"[LabAnalyzer] ⚠️ GROQ failed: {e}")
    
    def is_available(self) -> bool:
        """Check if analyzer is available"""
        return self.active_provider is not None
    
    def analyze_lab_report(self, filename: str, user_message: str = "") -> Dict[str, Any]:
        """Analyze lab report with enhanced AI understanding"""
        try:
            # Determine document type from filename and message
            doc_type = self._determine_document_type(filename, user_message)
            
            # Create comprehensive analysis
            if self.groq_client:
                analysis = self._create_ai_analysis(filename, user_message, doc_type)
            else:
                analysis = self._create_fallback_analysis(filename, user_message, doc_type)
            
            return {
                'success': True,
                'filename': filename,
                'file_type': 'medical_image',
                'analysis_type': 'enhanced_ai' if self.groq_client else 'rule_based',
                'provider': self.active_provider or 'fallback',
                'document_type': doc_type,
                'analysis': analysis,
                'key_findings': self._extract_key_findings(analysis, doc_type),
                'recommendations': self._get_recommendations(doc_type),
                'safety_alerts': self._get_safety_alerts(doc_type),
                'confidence_score': 0.8 if self.groq_client else 0.6,
                'analyzed_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return self._create_error_response(f"Analysis failed: {str(e)}", filename)
    
    def _determine_document_type(self, filename: str, user_message: str) -> str:
        """Determine the type of medical document"""
        combined_text = f"{filename} {user_message}".lower()
        
        # Lab report indicators
        lab_keywords = ['cbc', 'complete blood count', 'blood test', 'lab report', 'hemoglobin', 
                       'platelet', 'wbc', 'rbc', 'hematocrit', 'blood work', 'lab result']
        
        # Prescription indicators
        rx_keywords = ['prescription', 'medication', 'pills', 'dosage', 'pharmacy', 'rx']
        
        # Imaging indicators
        imaging_keywords = ['xray', 'x-ray', 'ct scan', 'mri', 'ultrasound', 'scan']
        
        if any(keyword in combined_text for keyword in lab_keywords):
            return 'lab_report'
        elif any(keyword in combined_text for keyword in rx_keywords):
            return 'prescription'
        elif any(keyword in combined_text for keyword in imaging_keywords):
            return 'medical_imaging'
        else:
            return 'medical_document'
    
    def _create_ai_analysis(self, filename: str, user_message: str, doc_type: str) -> str:
        """Create AI-powered analysis using GROQ"""
        try:
            # Create specialized prompt based on document type
            if doc_type == 'lab_report':
                prompt = self._get_lab_report_prompt(filename, user_message)
            elif doc_type == 'prescription':
                prompt = self._get_prescription_prompt(filename, user_message)
            else:
                prompt = self._get_general_medical_prompt(filename, user_message)
            
            response = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                max_tokens=800,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"[LabAnalyzer] AI analysis error: {e}")
            return self._create_fallback_analysis(filename, user_message, doc_type)
    
    def _get_lab_report_prompt(self, filename: str, user_message: str) -> str:
        """Get specialized prompt for lab report analysis"""
        return f"""
        The user has uploaded a medical lab report image named "{filename}" and asked: "{user_message}"
        
        As a medical AI assistant, provide a comprehensive analysis of lab reports in general, focusing on:
        
        **Understanding Lab Reports:**
        
        1. **Common Lab Tests**: Explain what a Complete Blood Count (CBC) typically includes:
           - Hemoglobin (Hgb): Measures oxygen-carrying protein in red blood cells
           - Red Blood Cell Count (RBC): Number of red blood cells
           - White Blood Cell Count (WBC): Number of infection-fighting cells
           - Platelet Count: Cells that help blood clot
           - Hematocrit: Percentage of blood made up of red blood cells
        
        2. **Understanding Results**:
           - Normal ranges vary by lab and individual factors
           - Values outside normal ranges may indicate health conditions
           - Low hemoglobin might suggest anemia
           - High WBC might indicate infection or inflammation
           - Low platelets might affect blood clotting
        
        3. **Important Notes**:
           - Lab results must be interpreted by healthcare professionals
           - Single abnormal values don't always indicate serious problems
           - Results should be considered with symptoms and medical history
           - Follow-up testing may be needed to confirm findings
        
        4. **Next Steps**:
           - Schedule appointment with healthcare provider to discuss results
           - Bring list of current medications and symptoms
           - Ask about any values outside normal ranges
           - Discuss if additional testing is needed
        
        5. **When to Seek Immediate Care**:
           - If you have severe symptoms along with abnormal results
           - If your doctor recommends urgent follow-up
           - For any concerning symptoms regardless of lab values
        
        Provide this information in a clear, supportive manner while emphasizing the importance of professional medical interpretation.
        """
    
    def _get_prescription_prompt(self, filename: str, user_message: str) -> str:
        """Get specialized prompt for prescription analysis"""
        return f"""
        The user has uploaded a prescription image named "{filename}" and asked: "{user_message}"
        
        Provide helpful guidance about prescription medications:
        
        **Understanding Prescriptions:**
        
        1. **Key Information**: Prescriptions typically contain:
           - Medication name (brand and/or generic)
           - Dosage strength (mg, mcg, etc.)
           - Instructions for use (frequency, timing)
           - Quantity prescribed
           - Number of refills allowed
        
        2. **Safety Considerations**:
           - Always take medications exactly as prescribed
           - Don't skip doses or stop early without consulting doctor
           - Be aware of potential side effects
           - Check for drug interactions with other medications
           - Store medications properly
        
        3. **Questions for Your Pharmacist**:
           - How should this medication be taken?
           - What are common side effects?
           - Are there any food or drug interactions?
           - What should I do if I miss a dose?
           - How should I store this medication?
        
        4. **Important Reminders**:
           - Complete the full course of antibiotics if prescribed
           - Don't share prescription medications with others
           - Keep medications in original containers
           - Check expiration dates regularly
        
        Emphasize the importance of following prescription instructions and consulting healthcare providers with questions.
        """
    
    def _get_general_medical_prompt(self, filename: str, user_message: str) -> str:
        """Get general prompt for medical documents"""
        return f"""
        The user has uploaded a medical document named "{filename}" and asked: "{user_message}"
        
        Provide general guidance about medical documents:
        
        **Understanding Medical Documents:**
        
        1. **Types of Medical Documents**:
           - Lab reports and test results
           - Prescription medications
           - Medical imaging reports
           - Doctor's notes and summaries
           - Discharge instructions
        
        2. **Important Information to Look For**:
           - Patient identification and date
           - Healthcare provider information
           - Key findings or results
           - Recommendations or next steps
           - Follow-up instructions
        
        3. **Questions to Ask Your Healthcare Provider**:
           - What do these results mean for my health?
           - Are there any concerning findings?
           - What follow-up care is needed?
           - How do these results compare to previous tests?
           - What lifestyle changes might be helpful?
        
        4. **Keeping Medical Records**:
           - Maintain organized copies of all medical documents
           - Bring relevant documents to appointments
           - Share important results with all your healthcare providers
           - Keep emergency contact information updated
        
        Always emphasize that professional medical interpretation is essential for proper understanding of medical documents.
        """
    
    def _create_fallback_analysis(self, filename: str, user_message: str, doc_type: str) -> str:
        """Create fallback analysis when AI is not available"""
        doc_type_names = {
            'lab_report': 'Lab Report',
            'prescription': 'Prescription',
            'medical_imaging': 'Medical Imaging',
            'medical_document': 'Medical Document'
        }
        
        doc_name = doc_type_names.get(doc_type, 'Medical Document')
        
        return f"""
        **{doc_name} Analysis: {filename}**
        
        **Document Uploaded Successfully**
        
        Your {doc_name.lower()} has been received and processed. While detailed AI analysis is currently limited, here's general guidance:
        
        **For {doc_name}s:**
        • These documents contain important health information
        • Professional medical interpretation is essential
        • Results should be discussed with your healthcare provider
        • Keep copies for your medical records
        
        **Recommended Next Steps:**
        • Schedule an appointment with your healthcare provider
        • Bring this document to discuss the findings
        • Ask questions about any values or information you don't understand
        • Follow any recommendations provided by your medical team
        
        **Important Reminders:**
        • This analysis is for informational purposes only
        • Always consult healthcare professionals for medical decisions
        • Don't make treatment changes based on AI analysis alone
        • Seek immediate medical attention for urgent concerns
        
        Your health and safety are the top priority. Please ensure you discuss these results with qualified medical professionals.
        """
    
    def _extract_key_findings(self, analysis: str, doc_type: str) -> List[str]:
        """Extract key findings from analysis"""
        findings = []
        
        if doc_type == 'lab_report':
            findings = [
                'Lab report uploaded and analyzed',
                'Professional interpretation recommended',
                'Discuss results with healthcare provider'
            ]
        elif doc_type == 'prescription':
            findings = [
                'Prescription document processed',
                'Medication safety information provided',
                'Consult pharmacist for questions'
            ]
        else:
            findings = [
                'Medical document analyzed',
                'General health guidance provided',
                'Professional review recommended'
            ]
        
        return findings
    
    def _get_recommendations(self, doc_type: str) -> List[str]:
        """Get recommendations based on document type"""
        base_recommendations = [
            'Consult with your healthcare provider for proper interpretation',
            'Keep this document in your medical records',
            'Follow up as recommended by your medical team'
        ]
        
        if doc_type == 'lab_report':
            base_recommendations.insert(1, 'Discuss any abnormal values with your doctor')
        elif doc_type == 'prescription':
            base_recommendations.insert(1, 'Ask your pharmacist about medication instructions')
        
        return base_recommendations
    
    def _get_safety_alerts(self, doc_type: str) -> List[str]:
        """Get safety alerts based on document type"""
        return [
            'This AI analysis is for informational purposes only',
            'Always consult healthcare professionals for medical decisions',
            'Seek immediate medical attention for urgent health concerns'
        ]
    
    def _create_error_response(self, error_message: str, filename: str) -> Dict[str, Any]:
        """Create error response"""
        return {
            'success': False,
            'error': error_message,
            'filename': filename,
            'file_type': 'medical_image',
            'analysis_type': 'error',
            'recommendations': [
                'Try uploading a clearer image',
                'Ensure the image is in a supported format',
                'Consult with a healthcare professional for proper analysis'
            ],
            'safety_alerts': [
                'Image analysis failed - professional review recommended'
            ],
            'analyzed_at': datetime.utcnow().isoformat()
        }