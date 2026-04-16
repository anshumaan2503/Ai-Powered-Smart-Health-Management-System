# 🔧 Prescription Analyzer Troubleshooting Guide

## Common Installation Issues

### Python 3.13 Pillow Installation Error

**Problem:** `KeyError: '__version__'` when installing Pillow
```
ERROR: Failed to build 'Pillow' when getting requirements to build wheel
```

**Solutions:**

#### Method 1: Update Build Tools
```bash
python -m pip install --upgrade pip setuptools wheel
pip install Pillow
```

#### Method 2: Use Pre-built Binary
```bash
pip install --only-binary=all Pillow
```

#### Method 3: Use Latest Version
```bash
pip install --upgrade Pillow
```

#### Method 4: Use Conda (Recommended for Windows)
```bash
conda install pillow
```

#### Method 5: Manual Download
1. Visit: https://pypi.org/project/Pillow/#files
2. Download the appropriate `.whl` file for your system
3. Install: `pip install downloaded_file.whl`

### PDF Library Issues

**Problem:** PyPDF2 installation fails

**Solutions:**
```bash
# Try alternative PDF libraries
pip install pypdf        # Modern alternative
pip install PyPDF4       # Another alternative
pip install pdfplumber   # Advanced PDF processing
```

### Missing Dependencies Error

**Problem:** "Dependencies not available" in analyzer

**Check Status:**
```bash
python -c "
from hospital.services.prescription_analyzer import PrescriptionAnalyzer
analyzer = PrescriptionAnalyzer()
print(analyzer.get_status())
"
```

**Solutions:**
- Install missing packages shown in status
- Use the simple installer: `python install_prescription_simple.py`
- Use Windows batch file: `install_prescription_windows.bat`

## Runtime Issues

### "Analysis failed" Error

**Possible Causes:**
1. File format not supported
2. File too large (>16MB)
3. Corrupted file
4. Network issues (for AI analysis)

**Solutions:**
```bash
# Check file format
curl -X GET http://localhost:5000/api/prescription/test-analyzer

# Test with smaller file
# Convert large images: Use image editor to reduce size
# For PDFs: Use PDF compressor
```

### Low Confidence Scores

**Causes:**
- Blurry images
- Poor lighting
- Handwritten prescriptions
- Low resolution

**Solutions:**
- Use high-resolution images (300+ DPI)
- Ensure good lighting and contrast
- Use PDF format when possible
- Avoid rotated or skewed images

### Database Errors

**Problem:** "Database error" when saving analysis

**Solutions:**
```bash
# Recreate database tables
python -c "
from hospital import create_app, db
app = create_app()
with app.app_context():
    db.create_all()
    print('Database tables created')
"

# Check database permissions
# Ensure SQLite file is writable
```

## API Issues

### 401 Unauthorized Error

**Problem:** Authentication required

**Solutions:**
```bash
# Get auth token first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"password"}'

# Use token in requests
curl -X POST http://localhost:5000/api/prescription/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@prescription.pdf"
```

### 413 Request Entity Too Large

**Problem:** File too large

**Solutions:**
- Compress images before upload
- Use PDF format (usually smaller)
- Split multi-page PDFs
- Maximum size: 16MB

### 500 Internal Server Error

**Check Logs:**
```bash
# Check Flask logs
python start.py  # Look for error messages

# Test analyzer status
curl -X GET http://localhost:5000/api/prescription/test-analyzer
```

## Frontend Issues

### Component Not Loading

**Problem:** React component errors

**Solutions:**
```bash
# Install frontend dependencies
cd frontend
npm install react-dropzone

# Check for TypeScript errors
npm run build

# Clear cache
rm -rf .next
npm run dev
```

### File Upload Not Working

**Problem:** Drag & drop not functioning

**Solutions:**
- Check browser console for errors
- Ensure react-dropzone is installed
- Test with different browsers
- Check file size and format

## Performance Issues

### Slow Analysis

**Causes:**
- Large files
- Network latency (AI analysis)
- Server overload

**Solutions:**
- Use smaller files
- Use PDF instead of images
- Enable caching
- Use local fallback analysis

### Memory Issues

**Problem:** Out of memory errors

**Solutions:**
- Process smaller files
- Restart the server
- Increase system memory
- Use streaming for large files

## AI-Specific Issues

### Gemini API Errors

**Problem:** AI analysis fails

**Check API Key:**
```bash
# Verify API key in .env
echo $GEMINI_API_KEY

# Test API connection
python -c "
import google.generativeai as genai
import os
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')
print('API connection successful')
"
```

**Common API Issues:**
- Invalid API key
- Quota exceeded
- Rate limiting
- Network connectivity

**Solutions:**
- Verify API key is correct
- Check quota in Google AI Studio
- Implement retry logic
- Use fallback analysis

### Poor AI Accuracy

**Causes:**
- Poor image quality
- Unusual prescription format
- Non-English text
- Handwritten prescriptions

**Solutions:**
- Use high-quality scans
- Try PDF format
- Improve prompt engineering
- Use manual validation

## System-Specific Issues

### Windows Issues

**Problem:** Path or permission errors

**Solutions:**
```cmd
# Run as administrator
# Use forward slashes in paths
# Check antivirus software
# Use Windows batch installer
install_prescription_windows.bat
```

### Linux/Mac Issues

**Problem:** Permission or library errors

**Solutions:**
```bash
# Install system dependencies
# Ubuntu/Debian:
sudo apt-get install python3-pil python3-dev

# macOS:
brew install python-tk

# Fix permissions
chmod +x install_prescription_simple.py
```

## Testing and Debugging

### Run Diagnostic Tests

```bash
# Full test suite
python test_prescription_analyzer.py

# Quick status check
curl -X GET http://localhost:5000/api/prescription/test-analyzer

# Test specific components
python -c "
from hospital.services.prescription_analyzer import PrescriptionAnalyzer
analyzer = PrescriptionAnalyzer()
print('Status:', analyzer.get_status())
"
```

### Enable Debug Mode

```python
# In your .env file
FLASK_DEBUG=True
FLASK_ENV=development

# Or in code
app.run(debug=True)
```

### Check Logs

```bash
# Flask application logs
tail -f logs/app.log

# System logs
# Windows: Event Viewer
# Linux: /var/log/syslog
# macOS: Console app
```

## Getting Help

### Before Asking for Help

1. Run the test suite: `python test_prescription_analyzer.py`
2. Check the status endpoint: `/api/prescription/test-analyzer`
3. Review error logs
4. Try the simple installer: `python install_prescription_simple.py`

### Information to Include

- Python version: `python --version`
- Operating system
- Error messages (full stack trace)
- Test results
- Status endpoint output

### Quick Fixes Checklist

- [ ] Python 3.8+ installed
- [ ] All dependencies installed
- [ ] Database tables created
- [ ] .env file configured (optional)
- [ ] File format supported
- [ ] File size under 16MB
- [ ] Authentication token valid
- [ ] Network connectivity working

## Alternative Solutions

### If Installation Fails Completely

The prescription analyzer includes fallback systems:

1. **Text-only analysis**: Works without image processing
2. **Rule-based extraction**: Works without AI
3. **Manual validation**: Always available
4. **Basic safety checks**: Built-in warnings

### Minimal Working Setup

```python
# Even with no dependencies, you get:
- API endpoints
- Database storage
- Basic validation
- Safety recommendations
- Manual prescription entry
```

### Cloud Alternatives

Consider using cloud services:
- Google Cloud Vision API
- AWS Textract
- Azure Computer Vision
- Online OCR services

---

**Still having issues?** Check the main documentation: `PRESCRIPTION_ANALYZER_GUIDE.md`