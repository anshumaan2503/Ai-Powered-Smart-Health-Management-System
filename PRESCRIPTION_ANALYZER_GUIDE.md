# 🏥 Prescription Analyzer Feature Guide

## Overview

The Prescription Analyzer is an AI-powered feature that allows users to upload prescription images or PDFs and get detailed analysis including medication extraction, safety alerts, and recommendations.

## ✨ Features

### Core Functionality
- **Image Analysis**: Upload prescription images (PNG, JPG, JPEG, GIF, BMP, TIFF)
- **PDF Analysis**: Upload prescription PDFs with text extraction
- **AI-Powered Extraction**: Uses Gemini AI to extract medication information
- **Fallback System**: Works even without AI API key using rule-based analysis
- **Validation**: Comprehensive prescription validation with warnings and errors
- **Safety Alerts**: Identifies potential drug interactions and safety concerns
- **Recommendations**: Provides helpful guidance for patients

### Advanced Features
- **Analysis History**: Track all prescription analyses
- **Confidence Scoring**: AI confidence levels for analysis accuracy
- **Drug Interaction Checking**: Basic drug interaction detection
- **Patient Association**: Link analyses to specific patients
- **Doctor Review**: Allow doctors to review and annotate analyses

## 🚀 Installation

### Quick Installation
```bash
# Run the automated installer
python install_prescription_analyzer.py
```

### Manual Installation

#### 1. Install Python Dependencies
```bash
pip install Pillow==10.0.0 PyPDF2==3.0.1
```

#### 2. Install Frontend Dependencies
```bash
cd frontend
npm install react-dropzone
```

#### 3. Set up Database
```python
from hospital import create_app, db
app = create_app()
with app.app_context():
    db.create_all()
```

#### 4. Configure Environment (Optional)
Add to your `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🔧 Configuration

### Environment Variables
- `GEMINI_API_KEY`: Google Gemini AI API key (optional, fallback available)

### File Upload Limits
- **Maximum file size**: 16MB
- **Supported formats**: PNG, JPG, JPEG, GIF, BMP, TIFF, PDF
- **Upload method**: Drag & drop or file picker

## 📡 API Endpoints

### Core Endpoints

#### Analyze Prescription
```http
POST /api/prescription/analyze
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: prescription image or PDF
- patient_id: (optional) patient ID to associate
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "medications": [
      {
        "name": "Amoxicillin",
        "generic_name": "Amoxicillin",
        "dosage": "500mg",
        "frequency": "twice daily",
        "duration": "7 days",
        "instructions": "Take with food",
        "quantity": "14 tablets"
      }
    ],
    "patient_info": {
      "name": "John Doe",
      "age": "35",
      "gender": "Male"
    },
    "doctor_info": {
      "name": "Dr. Smith",
      "specialty": "General Medicine",
      "license": "MD12345"
    },
    "safety_alerts": [
      "Check for penicillin allergies"
    ],
    "recommendations": [
      "Take medication with food to reduce stomach upset",
      "Complete the full course even if feeling better"
    ],
    "validation": {
      "is_valid": true,
      "warnings": [],
      "errors": [],
      "suggestions": []
    },
    "confidence_score": 0.85,
    "analysis_id": "uuid-here"
  }
}
```

#### Get Analysis History
```http
GET /api/prescription/history?page=1&per_page=10
Authorization: Bearer <token>
```

#### Get Analysis Details
```http
GET /api/prescription/analysis/<analysis_id>
Authorization: Bearer <token>
```

#### Test Analyzer Status
```http
GET /api/prescription/test-analyzer
```

#### Check Drug Interactions
```http
POST /api/prescription/drug-interactions
Content-Type: application/json
Authorization: Bearer <token>

{
  "medications": [
    {"name": "warfarin"},
    {"name": "aspirin"}
  ]
}
```

## 🖥️ Frontend Usage

### Basic Component Usage
```tsx
import PrescriptionAnalyzer from '@/components/prescription/PrescriptionAnalyzer';

export default function MyPage() {
  return (
    <div>
      <PrescriptionAnalyzer />
    </div>
  );
}
```

### Access the Feature
- **URL**: `http://localhost:3000/prescription-analyzer`
- **Navigation**: Add to your app's navigation menu

## 🧪 Testing

### Run Test Suite
```bash
python test_prescription_analyzer.py
```

### Manual Testing
1. Start the backend: `python start.py`
2. Start the frontend: `cd frontend && npm run dev`
3. Visit: `http://localhost:3000/prescription-analyzer`
4. Upload a sample prescription image or PDF
5. Review the analysis results

### API Testing
```bash
# Test analyzer status
curl -X GET http://localhost:5000/api/prescription/test-analyzer

# Test with authentication
curl -X POST http://localhost:5000/api/prescription/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@sample_prescription.pdf"
```

## 🔒 Security Considerations

### File Upload Security
- File size limits (16MB max)
- File type validation
- Secure filename handling
- No file storage on server (processed in memory)

### Data Privacy
- Analysis results stored in database with user association
- Patient data extraction is optional
- Doctor review system for sensitive analyses
- User can delete their analysis history

### Authentication
- JWT token required for all endpoints
- User-specific analysis history
- Role-based access for doctor reviews

## 🎯 Use Cases

### For Patients
- **Prescription Verification**: Verify prescription details before filling
- **Medication Understanding**: Get clear information about prescribed medications
- **Safety Checking**: Identify potential drug interactions
- **Digital Records**: Keep digital copies of prescription analyses

### For Healthcare Providers
- **Quick Review**: Rapidly review patient prescriptions
- **Error Detection**: Identify potential prescription errors
- **Patient Education**: Use analysis results to educate patients
- **Documentation**: Maintain records of prescription reviews

### For Pharmacists
- **Prescription Validation**: Verify prescription details
- **Drug Interaction Checking**: Identify potential interactions
- **Patient Counseling**: Use recommendations for patient guidance
- **Quality Assurance**: Double-check prescription accuracy

## 🔧 Troubleshooting

### Common Issues

#### "Dependencies not available" Error
```bash
# Install required packages
pip install Pillow PyPDF2 google-generativeai
```

#### "Analysis failed" Error
- Check file format (must be image or PDF)
- Verify file size (max 16MB)
- Ensure file is not corrupted
- Check network connection

#### "Database error" Error
```bash
# Create database tables
python -c "from hospital import create_app, db; app=create_app(); app.app_context().push(); db.create_all()"
```

#### Low Confidence Scores
- Use high-quality, clear images
- Ensure good lighting and contrast
- Avoid blurry or rotated images
- Use PDFs when possible for better text extraction

### Performance Optimization
- Use PDF format for better text extraction
- Compress images before upload
- Clear analysis history periodically
- Monitor API usage if using Gemini AI

## 🚀 Future Enhancements

### Planned Features
- **OCR Improvements**: Better text recognition for handwritten prescriptions
- **Multi-language Support**: Support for prescriptions in different languages
- **Batch Processing**: Analyze multiple prescriptions at once
- **Integration**: Connect with pharmacy systems and EHRs
- **Mobile App**: Dedicated mobile app for prescription scanning
- **Voice Commands**: Voice-activated prescription reading

### Advanced AI Features
- **Dosage Validation**: Check if dosages are appropriate for patient
- **Allergy Checking**: Cross-reference with patient allergy records
- **Insurance Coverage**: Check medication coverage
- **Generic Alternatives**: Suggest generic alternatives
- **Side Effect Prediction**: Predict potential side effects

## 📊 Analytics & Monitoring

### Usage Metrics
- Number of prescriptions analyzed
- Analysis success rates
- Most common medications detected
- User engagement metrics

### Quality Metrics
- AI confidence scores
- Validation success rates
- Doctor review feedback
- User satisfaction scores

## 🤝 Contributing

### Adding New Features
1. Create feature branch
2. Implement backend service in `hospital/services/`
3. Add API endpoints in `hospital/routes/`
4. Create frontend components in `frontend/components/`
5. Add tests and documentation
6. Submit pull request

### Improving AI Accuracy
- Contribute training data
- Improve prompt engineering
- Add new validation rules
- Enhance fallback systems

## 📄 License

This feature is part of the Hospital Management System and follows the same MIT License.

---

**Need Help?** 
- Check the troubleshooting section
- Run the test suite: `python test_prescription_analyzer.py`
- Review API documentation above
- Check system logs for detailed error messages