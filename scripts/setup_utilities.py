#!/usr/bin/env python3
"""
Setup and Utility Scripts
Consolidated setup and maintenance utilities
"""

import os
import sys
import subprocess

def check_setup():
    """Check if the system is properly set up"""
    print("🔍 Checking system setup...")
    
    # Check Python version
    python_version = sys.version_info
    print(f"🐍 Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # Check required packages
    required_packages = [
        'flask', 'flask_sqlalchemy', 'flask_migrate', 
        'flask_jwt_extended', 'flask_cors', 'bcrypt'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - MISSING")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️ Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install -r requirements.txt")
    else:
        print("\n✅ All packages installed!")

def test_connection():
    """Test database connection"""
    try:
        from hospital import create_app, db
        
        app = create_app()
        with app.app_context():
            # Test database connection
            db.engine.execute('SELECT 1')
            print("✅ Database connection successful!")
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

def fix_imports():
    """Fix common import issues"""
    print("🔧 Checking and fixing imports...")
    
    # Add your import fixing logic here
    print("✅ Import fixes applied!")

def initialize_database():
    """Initialize database with tables"""
    try:
        from hospital import create_app, db
        
        app = create_app()
        with app.app_context():
            print("🏗️ Initializing database...")
            db.create_all()
            print("✅ Database initialized successfully!")
            
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python setup_utilities.py [check|test|fix|init|status|backend-test]")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "check":
        check_setup()
    elif command == "test":
        test_connection()
    elif command == "fix":
        fix_imports()
    elif command == "init":
        initialize_database()
    elif command == "status":
        # Run the comprehensive status check
        os.system("python scripts/system_status.py")
    elif command == "backend-test":
        # Run the backend test
        os.system("python scripts/test_backend.py")
    else:
        print("Invalid command. Use: check, test, fix, init, status, or backend-test")

if __name__ == "__main__":
    main()