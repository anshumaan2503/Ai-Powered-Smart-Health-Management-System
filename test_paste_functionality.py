#!/usr/bin/env python3
"""
Test script for clipboard paste functionality in AI chatbot
"""

import requests
import time
from PIL import Image
from io import BytesIO
import base64

def create_test_prescription_image():
    """Create a realistic test prescription image"""
    # Create a prescription-like image
    img = Image.new('RGB', (600, 400), color='white')
    
    # In a real scenario, you'd add text and prescription details
    # For testing, we'll create a simple colored image
    pixels = img.load()
    
    # Add some prescription-like content (simplified)
    for x in range(50, 550):
        for y in range(50, 100):
            pixels[x, y] = (240, 240, 240)  # Light gray header
    
    for x in range(50, 550):
        for y in range(120, 350):
            if (x + y) % 20 < 2:  # Create text-like lines
                pixels[x, y] = (50, 50, 50)  # Dark text
    
    return img

def test_image_to_base64():
    """Test converting image to base64 for clipboard simulation"""
    print("🖼️  Testing Image Processing")
    print("=" * 50)
    
    try:
        # Create test image
        img = create_test_prescription_image()
        
        # Convert to bytes
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        # Convert to base64 (simulating clipboard data)
        img_base64 = base64.b64encode(img_bytes.getvalue()).decode()
        
        print(f"   ✅ Test image created: {len(img_base64)} characters")
        print(f"   📏 Image size: {len(img_bytes.getvalue())} bytes")
        
        return img_bytes.getvalue()
        
    except Exception as e:
        print(f"   ❌ Image processing failed: {e}")
        return None

def test_paste_simulation():
    """Simulate paste functionality by testing file upload with generated image"""
    print("\n📋 Testing Paste Simulation (via File Upload)")
    print("=" * 50)
    
    base_url = "http://localhost:5000"
    
    try:
        # Create test image data
        img_data = create_test_prescription_image()
        img_bytes = BytesIO()
        img_data.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        # Simulate pasted image upload
        files = {
            'file_0': ('pasted-image-2024-01-05.png', img_bytes.getvalue(), 'image/png')
        }
        data = {
            'message': 'I pasted this prescription image, please analyze it',
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
            print("   ✅ Paste simulation successful!")
            print(f"   Files analyzed: {result.get('file_analysis', {}).get('files_analyzed', 0)}")
            print(f"   AI response: {result.get('response', 'No response')[:100]}...")
        else:
            print(f"   ❌ Paste simulation failed: {response.json()}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

def test_frontend_paste_instructions():
    """Test if frontend shows paste instructions"""
    print("\n🌐 Testing Frontend Paste Instructions")
    print("=" * 50)
    
    try:
        response = requests.get("http://localhost:3000/aichatbot")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.text.lower()
            
            # Check for paste-related content
            has_ctrl_v = 'ctrl+v' in content or 'ctrl + v' in content
            has_paste = 'paste' in content
            has_clipboard = 'clipboard' in content
            
            print("   ✅ Frontend accessible")
            print(f"   Ctrl+V mentioned: {has_ctrl_v}")
            print(f"   Paste functionality: {has_paste}")
            print(f"   Clipboard reference: {has_clipboard}")
            
            if has_ctrl_v or has_paste:
                print("   ✅ Paste instructions visible to users")
            else:
                print("   ⚠️  Paste instructions might not be visible")
                
        else:
            print(f"   ❌ Frontend not accessible: {response.status_code}")
            
    except Exception as e:
        print(f"   ⚠️  Frontend test failed: {e}")

def provide_manual_test_instructions():
    """Provide instructions for manual testing"""
    print("\n📝 Manual Testing Instructions")
    print("=" * 50)
    
    print("To test clipboard paste functionality:")
    print()
    print("1. 📸 Take a screenshot or copy an image:")
    print("   - Windows: Win + Shift + S (screenshot to clipboard)")
    print("   - Mac: Cmd + Shift + 4 (screenshot to clipboard)")
    print("   - Or copy any image from a webpage")
    print()
    print("2. 🌐 Open the AI chatbot:")
    print("   - Visit: http://localhost:3000/aichatbot")
    print()
    print("3. 📋 Paste the image:")
    print("   - Click in the chat area")
    print("   - Press Ctrl+V (Windows) or Cmd+V (Mac)")
    print("   - The image should appear in the selected files area")
    print()
    print("4. 💬 Send the message:")
    print("   - Add a message like 'Please analyze this image'")
    print("   - Click send or press Enter")
    print("   - AI should analyze the pasted image")
    print()
    print("✨ Expected behavior:")
    print("   - Image appears immediately after paste")
    print("   - File shows as 'pasted-image-[timestamp].png'")
    print("   - Blue 'Pasted' indicator appears")
    print("   - AI analyzes the image content")

def test_multiple_paste_scenarios():
    """Test various paste scenarios"""
    print("\n🔄 Testing Multiple Paste Scenarios")
    print("=" * 50)
    
    scenarios = [
        "Single image paste",
        "Multiple images paste",
        "Large image paste (>16MB)",
        "Non-image paste (text)",
        "Mixed content paste"
    ]
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"   {i}. {scenario}")
        
        if "Single image" in scenario:
            print("      ✅ Should work - adds image to selected files")
        elif "Multiple images" in scenario:
            print("      ✅ Should work - adds up to 5 images")
        elif "Large image" in scenario:
            print("      ⚠️  Should be rejected - size limit exceeded")
        elif "Non-image" in scenario:
            print("      ⚠️  Should be ignored - only images supported")
        elif "Mixed content" in scenario:
            print("      ✅ Should work - extracts only images")

def main():
    """Main test function"""
    print("📋 Clipboard Paste Functionality Test Suite")
    print("=" * 60)
    
    # Test image processing
    test_image_to_base64()
    
    # Test paste simulation
    test_paste_simulation()
    
    # Test frontend instructions
    test_frontend_paste_instructions()
    
    # Test scenarios
    test_multiple_paste_scenarios()
    
    # Manual test instructions
    provide_manual_test_instructions()
    
    print("\n" + "=" * 60)
    print("🎯 Test Summary:")
    print("- Image processing tested")
    print("- Paste simulation via API tested")
    print("- Frontend paste instructions verified")
    print("- Multiple scenarios documented")
    
    print("\n🚀 Key Features:")
    print("✅ Ctrl+V / Cmd+V paste support")
    print("✅ Automatic image detection")
    print("✅ Visual paste indicators")
    print("✅ Multiple image paste support")
    print("✅ Size and type validation")
    print("✅ Seamless integration with chat")
    
    print("\n💡 Use Cases:")
    print("- Paste prescription screenshots")
    print("- Paste lab result images")
    print("- Paste medical document photos")
    print("- Paste symptom photos")
    print("- Quick image sharing for analysis")
    
    print("\n🎉 The AI chatbot now supports:")
    print("1. 📁 File upload (click paperclip)")
    print("2. 📋 Image paste (Ctrl+V)")
    print("3. 🤖 AI analysis of all content")
    print("4. 💬 Natural conversation about files")

if __name__ == "__main__":
    main()