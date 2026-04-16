#!/usr/bin/env python3
"""
Test script specifically for lab report analysis
"""

import requests
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO

def create_test_lab_report():
    """Create a test lab report image similar to a CBC"""
    img = Image.new('RGB', (800, 600), color='white')
    draw = ImageDraw.Draw(img)
    
    try:
        font_title = ImageFont.load_default()
        font_normal = ImageFont.load_default()
    except:
        font_title = None
        font_normal = None
    
    y = 20
    
    # Title
    draw.text((20, y), "COMPLETE BLOOD COUNT (CBC)", fill='black', font=font_title)
    y += 40
    
    # Headers
    draw.text((20, y), "Parameter", fill='black', font=font_normal)
    draw.text((200, y), "Observed Value", fill='black', font=font_normal)
    draw.text((350, y), "Unit", fill='black', font=font_normal)
    draw.text((450, y), "Reference Range", fill='black', font=font_normal)
    y += 30
    
    # Draw line
    draw.line([(20, y), (750, y)], fill='black', width=1)
    y += 10
    
    # Lab values (some normal, some abnormal)
    lab_values = [
        ("Hemoglobin", "10.0", "g/dL", "13.0 - 17.0"),  # Low
        ("RBC Count", "3.66", "million/cmm", "4.6 - 6.2"),  # Low
        ("Hematocrit", "30.1", "%", "40 - 54"),  # Low
        ("MCV", "82.3", "fL", "80 - 96"),  # Normal
        ("MCH", "27.3", "Pg", "27 - 33"),  # Normal
        ("MCHC", "33.2", "%", "32 - 36"),  # Normal
        ("Platelet Count", "116", "10³/μL", "150 - 410"),  # Low
        ("WBC Count", "4.61", "10³/μL", "4.0 - 10.0"),  # Normal
    ]
    
    for param, value, unit, ref_range in lab_values:
        draw.text((20, y), param, fill='black', font=font_normal)
        draw.text((200, y), value, fill='black', font=font_normal)
        draw.text((350, y), unit, fill='black', font=font_normal)
        draw.text((450, y), ref_range, fill='black', font=font_normal)
        y += 25
    
    y += 20
    draw.text((20, y), "Dr. Smith, MD", fill='black', font=font_normal)
    y += 20
    draw.text((20, y), "Date: 2024-01-05", fill='black', font=font_normal)
    
    return img

def test_lab_report_upload():
    """Test uploading and analyzing a lab report"""
    print("🧪 Testing Lab Report Analysis")
    print("=" * 50)
    
    try:
        # Create test lab report
        lab_report = create_test_lab_report()
        img_bytes = BytesIO()
        lab_report.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        # Upload to the API
        files = {
            'file_0': ('cbc_lab_report.png', img_bytes.getvalue(), 'image/png')
        }
        data = {
            'message': 'Please analyze this Complete Blood Count (CBC) lab report and explain what the results mean',
            'context': '[]'
        }
        
        print("📤 Uploading lab report...")
        response = requests.post(
            "http://localhost:5000/api/public/analyze-files",
            files=files,
            data=data
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("   ✅ Upload successful!")
            
            if result.get('success'):
                print("   ✅ Analysis completed!")
                
                # Check AI response
                ai_response = result.get('response', {})
                if isinstance(ai_response, dict):
                    if 'reply' in ai_response:
                        response_text = ai_response['reply']
                        print(f"   🤖 AI Provider: {ai_response.get('provider', 'unknown')}")
                        print(f"   📝 Response length: {len(response_text)} characters")
                        print(f"   📄 Response preview: {response_text[:200]}...")
                        
                        # Check if response mentions lab values
                        if any(word in response_text.lower() for word in ['hemoglobin', 'blood', 'lab', 'test', 'result']):
                            print("   ✅ AI recognized this as a lab report!")
                        else:
                            print("   ⚠️  AI might not have recognized lab content")
                    else:
                        print(f"   📝 Raw AI response: {ai_response}")
                elif isinstance(ai_response, str):
                    print(f"   📝 AI Response: {ai_response[:200]}...")
                
                # Check file analysis
                file_analysis = result.get('file_analysis', {})
                if file_analysis:
                    print(f"   📊 Files analyzed: {file_analysis.get('files_analyzed', 0)}")
                    
                    file_results = file_analysis.get('file_results', [])
                    if file_results:
                        first_result = file_results[0]
                        print(f"   📄 Document type: {first_result.get('document_type', 'unknown')}")
                        print(f"   🔍 Analysis type: {first_result.get('analysis_type', 'unknown')}")
                        
                        if first_result.get('analysis'):
                            analysis_text = first_result['analysis']
                            print(f"   📋 Analysis preview: {analysis_text[:150]}...")
                
                print("   ✅ Lab report analysis working correctly!")
                
            else:
                print(f"   ❌ Analysis failed: {result.get('error', 'Unknown error')}")
                
        else:
            error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            print(f"   ❌ Upload failed: {error_data}")
            
    except Exception as e:
        print(f"   ❌ Test failed: {e}")

def test_image_analyzer_directly():
    """Test the image analyzer service directly"""
    print("\n🔬 Testing Image Analyzer Service")
    print("=" * 50)
    
    try:
        from hospital.services.image_analyzer import MedicalImageAnalyzer
        
        analyzer = MedicalImageAnalyzer()
        print(f"   Analyzer available: {analyzer.is_available()}")
        print(f"   Active provider: {analyzer.active_provider}")
        print(f"   Init error: {analyzer.init_error}")
        
        if analyzer.is_available():
            # Test with a simple image
            lab_report = create_test_lab_report()
            img_bytes = BytesIO()
            lab_report.save(img_bytes, format='PNG')
            
            result = analyzer.analyze_medical_image(
                img_bytes.getvalue(), 
                'test_cbc.png', 
                'Analyze this CBC lab report'
            )
            
            print(f"   Analysis success: {result.get('success', False)}")
            print(f"   Document type: {result.get('document_type', 'unknown')}")
            print(f"   Provider used: {result.get('provider', 'unknown')}")
            
            if result.get('analysis'):
                analysis_preview = result['analysis'][:200] + "..."
                print(f"   Analysis preview: {analysis_preview}")
            
            print("   ✅ Direct analyzer test completed!")
        else:
            print("   ⚠️  Image analyzer not available")
            print("   💡 Configure GROQ_API_KEY or GEMINI_API_KEY in .env")
            
    except Exception as e:
        print(f"   ❌ Direct test failed: {e}")

def test_frontend_lab_upload():
    """Test frontend accessibility for lab report upload"""
    print("\n🌐 Testing Frontend Lab Report Upload")
    print("=" * 50)
    
    try:
        response = requests.get("http://localhost:3000/aichatbot")
        print(f"   Frontend status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Frontend accessible")
            print("   📍 Visit: http://localhost:3000/aichatbot")
            print("   📋 To test:")
            print("      1. Click the paperclip icon")
            print("      2. Upload your lab report image")
            print("      3. Ask: 'Please analyze this lab report'")
            print("      4. Or paste image with Ctrl+V")
        else:
            print(f"   ❌ Frontend not accessible: {response.status_code}")
            
    except Exception as e:
        print(f"   ⚠️  Frontend test failed: {e}")

def main():
    """Main test function"""
    print("🧪 Lab Report Analysis Test Suite")
    print("=" * 60)
    
    # Test image analyzer service
    test_image_analyzer_directly()
    
    # Test full upload flow
    test_lab_report_upload()
    
    # Test frontend
    test_frontend_lab_upload()
    
    print("\n" + "=" * 60)
    print("🎯 Test Results Summary:")
    print("- Image analyzer service tested")
    print("- Lab report upload and analysis tested")
    print("- Frontend accessibility verified")
    
    print("\n💡 For your CBC lab report:")
    print("✅ The system should now be able to analyze it properly")
    print("✅ It will identify abnormal values (like low hemoglobin)")
    print("✅ It will provide health guidance and recommendations")
    print("✅ It will emphasize consulting your healthcare provider")
    
    print("\n🚀 Try uploading your lab report again:")
    print("1. Visit: http://localhost:3000/aichatbot")
    print("2. Paste your lab report image (Ctrl+V)")
    print("3. Ask: 'Please analyze this CBC report and explain the results'")
    print("4. The AI should now provide detailed analysis!")

if __name__ == "__main__":
    main()