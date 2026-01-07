#!/usr/bin/env python3
"""
Test script to verify file analysis is working correctly
"""

import requests
import os
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

def create_test_prescription_image():
    """Create a realistic test prescription image with text"""
    # Create a white background image
    img = Image.new('RGB', (600, 400), color='white')
    draw = ImageDraw.Draw(img)
    
    try:
        # Try to use a default font, fallback to basic if not available
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    except:
        font_large = None
        font_small = None
    
    # Add prescription-like content
    y_pos = 20
    
    # Header
    draw.text((20, y_pos), "Dr. John Smith, MD", fill='black', font=font_large)
    y_pos += 30
    draw.text((20, y_pos), "General Medicine Clinic", fill='black', font=font_small)
    y_pos += 20
    draw.text((20, y_pos), "123 Medical Center Dr.", fill='black', font=font_small)
    y_pos += 40
    
    # Patient info
    draw.text((20, y_pos), "Patient: Jane Doe", fill='black', font=font_small)
    y_pos += 20
    draw.text((20, y_pos), "Date: 2024-01-05", fill='black', font=font_small)
    y_pos += 40
    
    # Prescription
    draw.text((20, y_pos), "Rx:", fill='black', font=font_large)
    y_pos += 30
    draw.text((20, y_pos), "1. Amoxicillin 500mg", fill='black', font=font_small)
    y_pos += 20
    draw.text((30, y_pos), "Take 1 tablet twice daily for 7 days", fill='black', font=font_small)
    y_pos += 30
    draw.text((20, y_pos), "2. Ibuprofen 400mg", fill='black', font=font_small)
    y_pos += 20
    draw.text((30, y_pos), "Take 1 tablet as needed for pain", fill='black', font=font_small)
    y_pos += 40
    
    # Footer
    draw.text((20, y_pos), "Refills: 0", fill='black', font=font_small)
    y_pos += 20
    draw.text((20, y_pos), "Dr. Smith's Signature", fill='black', font=font_small)
    
    return img

def test_file_upload_analysis():
    """Test file upload and analysis"""
    base_url = "http://localhost:5000"
    
    print("📁 Testing File Upload & Analysis")
    print("=" * 50)
    
    # Test 1: Upload prescription image
    print("\n1. Testing prescription image analysis...")
    try:
        # Create test prescription image
        test_image = create_test_prescription_image()
        img_bytes = BytesIO()
        test_image.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        files = {
            'file_0': ('test_prescription.png', img_bytes.getvalue(), 'image/png')
        }
        data = {
            'message': 'Please analyze this prescription and tell me about the medications',
            'context': '[]'
        }
        
        response = requests.post(
            f"{base_url}/api/public/analyze-files",
            files=files,
            data=data
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("   ✅ File upload successful!")
            
            # Check response structure
            if result.get('success'):
                print("   ✅ Analysis completed successfully")
                
                # Check AI response
                ai_response = result.get('response', {})
                if isinstance(ai_response, dict) and 'reply' in ai_response:
                    print(f"   AI Response: {ai_response['reply'][:100]}...")
                    print(f"   Provider: {ai_response.get('provider', 'unknown')}")
                elif isinstance(ai_response, str):
                    print(f"   AI Response: {ai_response[:100]}...")
                
                # Check file analysis
                file_analysis = result.get('file_analysis', {})
                files_analyzed = file_analysis.get('files_analyzed', 0)
                print(f"   Files analyzed: {files_analyzed}")
                
                if files_analyzed > 0:
                    print("   ✅ File analysis working!")
                else:
                    print("   ⚠️  No files were analyzed")
                    
            else:
                print(f"   ❌ Analysis failed: {result.get('error', 'Unknown error')}")
        else:
            print(f"   ❌ Upload failed: {response.json()}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Upload text document
    print("\n2. Testing text document analysis...")
    try:
        # Create a simple text document
        text_content = """
        MEDICAL REPORT
        
        Patient: John Doe
        Date: 2024-01-05
        
        Chief Complaint: Headache and fever
        
        History: Patient reports having headache for 2 days, accompanied by fever.
        Temperature recorded at 101.2°F.
        
        Assessment: Possible viral infection
        
        Plan: 
        - Rest and hydration
        - Acetaminophen for fever
        - Follow up if symptoms worsen
        
        Dr. Jane Smith, MD
        """
        
        files = {
            'file_0': ('medical_report.txt', text_content.encode(), 'text/plain')
        }
        data = {
            'message': 'Please review this medical report and provide guidance',
            'context': '[]'
        }
        
        response = requests.post(
            f"{base_url}/api/public/analyze-files",
            files=files,
            data=data
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("   ✅ Text document upload successful!")
            
            if result.get('success'):
                print("   ✅ Text analysis completed")
                ai_response = result.get('response', {})
                if isinstance(ai_response, dict) and 'reply' in ai_response:
                    print(f"   AI Response: {ai_response['reply'][:100]}...")
                elif isinstance(ai_response, str):
                    print(f"   AI Response: {ai_response[:100]}...")
            else:
                print(f"   ❌ Text analysis failed: {result.get('error')}")
        else:
            print(f"   ❌ Text upload failed: {response.json()}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

def test_frontend_file_upload():
    """Test if frontend file upload interface works"""
    print("\n🌐 Testing Frontend File Upload Interface")
    print("=" * 50)
    
    try:
        response = requests.get("http://localhost:3000/aichatbot")
        print(f"   Frontend Status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.text.lower()
            
            # Check for file upload features
            has_file_input = 'type="file"' in content
            has_paperclip = 'paperclip' in content
            has_paste = 'ctrl+v' in content or 'paste' in content
            has_upload = 'upload' in content
            
            print("   ✅ Frontend accessible")
            print(f"   File input: {has_file_input}")
            print(f"   Upload button: {has_paperclip}")
            print(f"   Paste support: {has_paste}")
            print(f"   Upload functionality: {has_upload}")
            
            if has_file_input and has_upload:
                print("   ✅ File upload interface is ready!")
            else:
                print("   ⚠️  File upload interface might be incomplete")
                
        else:
            print(f"   ❌ Frontend not accessible: {response.status_code}")
            
    except Exception as e:
        print(f"   ⚠️  Frontend test failed: {e}")

def test_ai_service_status():
    """Test AI service status"""
    print("\n🤖 Testing AI Service Status")
    print("=" * 50)
    
    try:
        from hospital.services.gemini_ai import GeminiHealthChatbot
        from hospital.services.prescription_analyzer import PrescriptionAnalyzer
        
        # Test chatbot
        chatbot = GeminiHealthChatbot()
        print(f"   Chatbot available: {chatbot.is_available()}")
        print(f"   Active provider: {chatbot.active_provider}")
        
        # Test prescription analyzer
        analyzer = PrescriptionAnalyzer()
        print(f"   Prescription analyzer available: {analyzer.is_available()}")
        
        if chatbot.is_available():
            print("   ✅ AI services are working!")
        else:
            print("   ⚠️  AI services need configuration")
            print("   💡 Add GROQ_API_KEY or GEMINI_API_KEY to .env file")
            
    except Exception as e:
        print(f"   ❌ AI service test failed: {e}")

def main():
    """Main test function"""
    print("📋 File Analysis Fix Test Suite")
    print("=" * 60)
    
    # Test AI services
    test_ai_service_status()
    
    # Test file upload and analysis
    test_file_upload_analysis()
    
    # Test frontend
    test_frontend_file_upload()
    
    print("\n" + "=" * 60)
    print("🎯 Test Summary:")
    print("- AI service status checked")
    print("- File upload and analysis tested")
    print("- Frontend interface verified")
    
    print("\n🚀 Expected Results:")
    print("✅ Files should upload successfully")
    print("✅ AI should analyze file content")
    print("✅ Responses should be helpful and formatted")
    print("✅ Frontend should show file upload options")
    
    print("\n💡 How to use:")
    print("1. Visit: http://localhost:3000/aichatbot")
    print("2. Click paperclip icon or paste image (Ctrl+V)")
    print("3. Upload prescription, lab result, or medical document")
    print("4. Get AI analysis and health guidance")

if __name__ == "__main__":
    main()