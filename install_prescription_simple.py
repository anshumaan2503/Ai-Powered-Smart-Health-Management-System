#!/usr/bin/env python3
"""
Simple installation script for Prescription Analyzer
Handles Python 3.13 compatibility issues
"""

import subprocess
import sys
import os

def run_command(command):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def install_pillow():
    """Install Pillow with multiple fallback methods"""
    print("🔄 Installing Pillow (image processing library)...")
    
    methods = [
        ("pip install --upgrade Pillow", "Latest Pillow version"),
        ("pip install --upgrade pip setuptools wheel && pip install Pillow", "With updated tools"),
        ("pip install --only-binary=all Pillow", "Pre-built binary"),
        ("pip install Pillow --no-cache-dir", "Without cache"),
    ]
    
    for command, description in methods:
        print(f"   Trying: {description}")
        success, output = run_command(command)
        if success:
            print("   ✅ Pillow installed successfully!")
            return True
        else:
            print(f"   ❌ Failed: {output[:100]}...")
    
    print("❌ Could not install Pillow automatically.")
    print("💡 Manual installation options:")
    print("   1. Update pip: python -m pip install --upgrade pip setuptools wheel")
    print("   2. Try conda: conda install pillow")
    print("   3. Use system package manager (Ubuntu): sudo apt-get install python3-pil")
    print("   4. Download wheel from: https://pypi.org/project/Pillow/#files")
    return False

def install_pypdf():
    """Install PDF processing library"""
    print("🔄 Installing PDF processing library...")
    
    methods = [
        ("pip install PyPDF2", "PyPDF2"),
        ("pip install pypdf", "pypdf (alternative)"),
        ("pip install PyPDF4", "PyPDF4 (alternative)"),
    ]
    
    for command, description in methods:
        print(f"   Trying: {description}")
        success, output = run_command(command)
        if success:
            print(f"   ✅ {description} installed successfully!")
            return True
    
    print("❌ Could not install PDF library.")
    return False

def test_imports():
    """Test if the required libraries can be imported"""
    print("🧪 Testing imports...")
    
    try:
        from PIL import Image
        print("   ✅ Pillow (PIL) import successful")
        pillow_ok = True
    except ImportError as e:
        print(f"   ❌ Pillow import failed: {e}")
        pillow_ok = False
    
    pdf_ok = False
    for lib in ['PyPDF2', 'pypdf', 'PyPDF4']:
        try:
            __import__(lib)
            print(f"   ✅ {lib} import successful")
            pdf_ok = True
            break
        except ImportError:
            continue
    
    if not pdf_ok:
        print("   ❌ No PDF library available")
    
    return pillow_ok, pdf_ok

def setup_database():
    """Set up database tables"""
    print("🔄 Setting up database...")
    try:
        from hospital import create_app, db
        from hospital.models.prescription_analysis import PrescriptionAnalysis
        
        app = create_app()
        with app.app_context():
            db.create_all()
            print("   ✅ Database tables created")
        return True
    except Exception as e:
        print(f"   ❌ Database setup failed: {e}")
        return False

def main():
    """Main installation function"""
    print("🏥 Prescription Analyzer - Simple Installation")
    print("=" * 50)
    
    # Check Python version
    version = sys.version_info
    print(f"🐍 Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ required")
        return False
    
    # Install dependencies
    pillow_ok = install_pillow()
    pdf_ok = install_pypdf()
    
    # Test imports
    pillow_test, pdf_test = test_imports()
    
    # Setup database
    db_ok = setup_database()
    
    print("\n" + "=" * 50)
    print("📊 Installation Summary:")
    print(f"   Pillow (images): {'✅' if pillow_test else '❌'}")
    print(f"   PDF library: {'✅' if pdf_test else '❌'}")
    print(f"   Database: {'✅' if db_ok else '❌'}")
    
    if pillow_test and pdf_test and db_ok:
        print("\n🎉 Installation completed successfully!")
        print("\n🚀 Next steps:")
        print("1. Start backend: python start.py")
        print("2. Start frontend: cd frontend && npm run dev")
        print("3. Visit: http://localhost:3000/prescription-analyzer")
        
        print("\n🧪 Test the feature:")
        print("   python test_prescription_analyzer.py")
        
        return True
    else:
        print("\n⚠️  Partial installation - some features may not work")
        print("\n💡 The prescription analyzer will still work with:")
        print("   - Basic text analysis (no images)")
        print("   - Fallback validation system")
        print("   - All API endpoints")
        
        if not pillow_test:
            print("\n❌ Without Pillow: Cannot process prescription images")
        if not pdf_test:
            print("\n❌ Without PDF library: Cannot process PDF files")
        
        return False

if __name__ == "__main__":
    main()