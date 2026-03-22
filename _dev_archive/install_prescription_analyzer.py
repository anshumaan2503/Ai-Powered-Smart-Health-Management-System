#!/usr/bin/env python3
"""
Installation script for Prescription Analyzer feature
Installs required dependencies and sets up the database
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"   Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_dependencies():
    """Install required Python packages"""
    packages = [
        "Pillow>=10.0.0",
        "PyPDF2>=3.0.1"
    ]
    
    print("🔄 Attempting to install dependencies...")
    
    # Try different installation methods for better compatibility
    for package in packages:
        package_name = package.split('>=')[0].split('==')[0]
        
        # Method 1: Try with pip upgrade
        if not run_command(f"pip install --upgrade {package}", f"Installing {package}"):
            print(f"⚠️  Standard installation failed for {package_name}, trying alternatives...")
            
            # Method 2: Try without version constraint
            if not run_command(f"pip install --upgrade {package_name}", f"Installing {package_name} (latest)"):
                print(f"⚠️  Latest version installation failed for {package_name}, trying pre-built...")
                
                # Method 3: Try with pre-built wheels
                if not run_command(f"pip install --only-binary=all {package_name}", f"Installing {package_name} (binary)"):
                    print(f"❌ All installation methods failed for {package_name}")
                    print(f"💡 Manual installation required:")
                    if package_name == "Pillow":
                        print("   - Try: pip install --upgrade pip setuptools wheel")
                        print("   - Then: pip install Pillow")
                        print("   - Or use conda: conda install pillow")
                    elif package_name == "PyPDF2":
                        print("   - Try: pip install PyPDF2")
                        print("   - Alternative: pip install pypdf")
                    return False
    
    return True

def setup_database():
    """Set up database tables"""
    try:
        # Import after dependencies are installed
        from hospital import create_app, db
        from hospital.models.prescription_analysis import PrescriptionAnalysis
        
        app = create_app()
        with app.app_context():
            print("🔄 Creating database tables...")
            db.create_all()
            print("✅ Database tables created successfully")
        
        return True
    except Exception as e:
        print(f"❌ Database setup failed: {str(e)}")
        return False

def install_frontend_dependencies():
    """Install frontend dependencies"""
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("⚠️  Frontend directory not found, skipping frontend setup")
        return True
    
    os.chdir(frontend_dir)
    
    # Install react-dropzone for file uploads
    if not run_command("npm install react-dropzone", "Installing react-dropzone"):
        os.chdir("..")
        return False
    
    os.chdir("..")
    return True

def test_installation():
    """Test if the installation was successful"""
    try:
        from hospital.services.prescription_analyzer import PrescriptionAnalyzer
        analyzer = PrescriptionAnalyzer()
        
        print("🔄 Testing prescription analyzer...")
        
        # Test basic functionality
        test_result = analyzer._fallback_analysis("test.pdf")
        if test_result:
            print("✅ Prescription analyzer is working")
            return True
        else:
            print("❌ Prescription analyzer test failed")
            return False
            
    except Exception as e:
        print(f"❌ Installation test failed: {str(e)}")
        return False

def main():
    """Main installation function"""
    print("🏥 Prescription Analyzer Installation")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install Python dependencies
    print("\n📦 Installing Python dependencies...")
    if not install_dependencies():
        print("❌ Failed to install Python dependencies")
        sys.exit(1)
    
    # Setup database
    print("\n🗄️  Setting up database...")
    if not setup_database():
        print("❌ Failed to setup database")
        sys.exit(1)
    
    # Install frontend dependencies
    print("\n🌐 Installing frontend dependencies...")
    if not install_frontend_dependencies():
        print("❌ Failed to install frontend dependencies")
        sys.exit(1)
    
    # Test installation
    print("\n🧪 Testing installation...")
    if not test_installation():
        print("❌ Installation test failed")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 Prescription Analyzer installed successfully!")
    print("\n📋 Next steps:")
    print("1. Make sure your .env file has GEMINI_API_KEY set")
    print("2. Start the backend: python start.py")
    print("3. Start the frontend: cd frontend && npm run dev")
    print("4. Visit: http://localhost:3000/prescription-analyzer")
    print("\n🔗 API Endpoints:")
    print("- POST /api/prescription/analyze - Analyze prescription")
    print("- GET /api/prescription/history - Get analysis history")
    print("- GET /api/prescription/test-analyzer - Test analyzer status")
    print("\n💡 Features:")
    print("- Upload prescription images (PNG, JPG, JPEG, GIF, BMP, TIFF)")
    print("- Upload prescription PDFs")
    print("- AI-powered medication extraction")
    print("- Safety alerts and recommendations")
    print("- Drug interaction checking")
    print("- Analysis history tracking")

if __name__ == "__main__":
    main()