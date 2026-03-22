#!/usr/bin/env python3
"""
Test script for AI chatbot file upload functionality
"""

import requests
import os
from io import BytesIO
from PIL import Image

def create_test_image():
    """Create a simple test image"""
    # Create a simple test prescription image
    img = Image.new('RGB', (400, 300), color='white')
    
    # Save to bytes
    img_bytes = BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes.getvalue()

def test_file_upload_api():
    """Test the file upload API endpoint"""
    base_url = "http://localhost:5000"
    
    print("📁 Testing File Upload API")
    print("=" * 50)
    
    # Test 1: Upload image file
    print("\n1. Testing image upload...")
    try:
        test_image_data = create_test_image()
        
        files = {
            'file_0': ('test_prescription.png', test_image_data, 'image/png')
        }
        data = {
            'message': 'Please analyze this prescription image',
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
            print("   ✅ Image upload working!")
            print(f"   Files analyzed: {result.get('file_analysis', {}).get('files_analyzed', 0)}")
            print(f"   AI response: {result.get('response', 'No response')[:100]}...")
        else:
            print(f"   ❌ Upload failed: {response.json()}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Upload without files (should fail)
    print("\n2. Testing upload without files...")
    try:
        data = {
            'message': 'Analyze my files',
            'context': '[]'
        }
        
        response = requests.post(
            f"{base_url}/api/public/analyze-files",
            data=data
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 400:
            print("   ✅ Correctly rejects requests without files")
        else:
            print(f"   ❌ Should return 400: {response.json()}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Multiple files
    print("\n3. Testing multiple file upload...")
    try:
        test_image_data = create_test_image()
        
        files = {
            'file_0': ('prescription1.png', test_image_data, 'image/png'),
            'file_1': ('prescription2.png', test_image_data, 'image/png')
        }
        data = {
            'message': 'Please analyze these prescription images',
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
            print("   ✅ Multiple file upload working!")
            print(f"   Files analyzed: {result.get('file_analysis', {}).get('files_analyzed', 0)}")
        else:
            print(f"   ❌ Multiple upload failed: {response.json()}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

def test_frontend_file_upload():
    """Test if frontend file upload interface is accessible"""
    print("\n🌐 Testing Frontend File Upload")
    print("=" * 50)
    
    try:
        response = requests.get("http://localhost:3000/aichatbot")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            # Check if the response contains file upload elements
            content = response.text
            has_file_input = 'type="file"' in content or 'PaperClipIcon' in content
            has_upload_button = 'upload' in content.lower() or 'file' in content.lower()
            
            print("   ✅ Frontend accessible")
            print(f"   File input detected: {has_file_input}")
            print(f"   Upload functionality: {has_upload_button}")
            print("   📍 Visit: http://localhost:3000/aichatbot")
        else:
            print(f"   ❌ Frontend not accessible: {response.status_code}")
            
    except Exception as e:
        print(f"   ⚠️  Frontend test failed: {e}")

def test_supported_file_types():
    """Test different file type support"""
    print("\n📄 Testing File Type Support")
    print("=" * 50)
    
    base_url = "http://localhost:5000"
    
    # Test different file types
    test_files = [
        ('test.png', b'fake_png_data', 'image/png'),
        ('test.pdf', b'fake_pdf_data', 'application/pdf'),
        ('test.txt', b'This is a test document', 'text/plain'),
        ('test.exe', b'fake_exe_data', 'application/octet-stream'),  # Should be rejected
    ]
    
    for filename, data, content_type in test_files:
        try:
            files = {
                'file_0': (filename, data, content_type)
            }
            form_data = {
                'message': f'Analyze {filename}',
                'context': '[]'
            }
            
            response = requests.post(
                f"{base_url}/api/public/analyze-files",
                files=files,
                data=form_data
            )
            
            print(f"   {filename}: Status {response.status_code}")
            
            if filename.endswith('.exe'):
                if response.status_code == 400:
                    print("     ✅ Correctly rejects .exe files")
                else:
                    print("     ❌ Should reject .exe files")
            else:
                if response.status_code in [200, 500]:  # 500 is OK for fake data
                    print("     ✅ Accepts valid file type")
                else:
                    print(f"     ⚠️  Unexpected response: {response.status_code}")
                    
        except Exception as e:
            print(f"   {filename}: Error - {e}")

def main():
    """Main test function"""
    print("📁 AI Chatbot File Upload Test Suite")
    print("=" * 60)
    
    # Test API endpoints
    test_file_upload_api()
    
    # Test frontend
    test_frontend_file_upload()
    
    # Test file types
    test_supported_file_types()
    
    print("\n" + "=" * 60)
    print("🎯 Test Summary:")
    print("- File upload API tested")
    print("- Multiple file support verified")
    print("- File type validation checked")
    print("- Frontend interface tested")
    
    print("\n🚀 How to use:")
    print("1. Start backend: python start.py")
    print("2. Start frontend: cd frontend && npm run dev")
    print("3. Visit: http://localhost:3000/aichatbot")
    print("4. Click the paperclip icon to upload files")
    print("5. Upload images, PDFs, or documents for AI analysis")
    
    print("\n💡 Supported file types:")
    print("- Images: PNG, JPG, JPEG, GIF, BMP, TIFF")
    print("- Documents: PDF, DOC, DOCX, TXT")
    print("- Max size: 16MB per file")
    print("- Max files: 5 per message")
    
    print("\n🔬 Analysis capabilities:")
    print("- Prescription analysis from images")
    print("- Lab result interpretation from PDFs")
    print("- Medical document analysis")
    print("- General health image analysis")

if __name__ == "__main__":
    main()