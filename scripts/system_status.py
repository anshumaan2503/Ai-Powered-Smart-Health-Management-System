#!/usr/bin/env python3
"""
System Status Checker
Check the status of all components and identify issues
"""

import os
import sys
import requests
import subprocess
from pathlib import Path

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    print(f"🐍 Python Version: {version.major}.{version.minor}.{version.micro}")
    if version.major >= 3 and version.minor >= 8:
        print("✅ Python version is compatible")
        return True
    else:
        print("❌ Python version should be 3.8 or higher")
        return False

def check_required_packages():
    """Check if required packages are installed"""
    print("\n📦 Checking Required Packages:")
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
        print("💡 Run: pip install -r requirements.txt")
        return False
    else:
        print("✅ All required packages are installed")
        return True

def check_file_structure():
    """Check if all required files exist"""
    print("\n📁 Checking File Structure:")
    
    required_files = [
        'config.py',
        'app.py', 
        'start.py',
        'hospital/__init__.py',
        'hospital/models/user.py',
        'hospital/models/doctor.py',
        'hospital/routes/hospital_staff.py',
        'frontend/package.json'
    ]
    
    missing_files = []
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - MISSING")
            missing_files.append(file_path)
    
    if missing_files:
        print(f"\n⚠️ Missing files: {', '.join(missing_files)}")
        return False
    else:
        print("✅ All required files exist")
        return True

def check_database():
    """Check database connection"""
    print("\n🗄️ Checking Database:")
    try:
        from hospital import create_app, db
        
        app = create_app()
        with app.app_context():
            # Test database connection
            db.engine.execute('SELECT 1')
            print("✅ Database connection successful")
            
            # Check if tables exist
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            required_tables = ['users', 'hospitals', 'doctors', 'patients']
            missing_tables = [table for table in required_tables if table not in tables]
            
            if missing_tables:
                print(f"⚠️ Missing tables: {', '.join(missing_tables)}")
                print("💡 Run: python scripts/setup_utilities.py init")
                return False
            else:
                print(f"✅ All required tables exist ({len(tables)} total)")
                return True
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        print("💡 Run: python scripts/setup_utilities.py init")
        return False

def check_backend_server():
    """Check if backend server is running"""
    print("\n🌐 Checking Backend Server:")
    try:
        response = requests.get('http://localhost:5000/api/auth/profile', timeout=5)
        if response.status_code in [401, 422]:  # Expected without auth
            print("✅ Backend server is running on port 5000")
            return True
        else:
            print(f"⚠️ Backend server responded with status: {response.status_code}")
            return True
    except requests.exceptions.ConnectionError:
        print("❌ Backend server is not running")
        print("💡 Start with: python start.py")
        return False
    except Exception as e:
        print(f"❌ Backend server error: {e}")
        return False

def check_frontend_server():
    """Check if frontend server is running"""
    print("\n⚛️ Checking Frontend Server:")
    try:
        response = requests.get('http://localhost:3000', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend server is running on port 3000")
            return True
        else:
            print(f"⚠️ Frontend server responded with status: {response.status_code}")
            return True
    except requests.exceptions.ConnectionError:
        print("❌ Frontend server is not running")
        print("💡 Start with: cd frontend && npm run dev")
        return False
    except Exception as e:
        print(f"❌ Frontend server error: {e}")
        return False

def check_node_and_npm():
    """Check Node.js and npm"""
    print("\n📦 Checking Node.js and npm:")
    try:
        # Check Node.js
        node_result = subprocess.run(['node', '--version'], 
                                   capture_output=True, text=True)
        if node_result.returncode == 0:
            print(f"✅ Node.js: {node_result.stdout.strip()}")
            node_ok = True
        else:
            print("❌ Node.js not found")
            node_ok = False
        
        # Check npm
        npm_result = subprocess.run(['npm', '--version'], 
                                  capture_output=True, text=True)
        if npm_result.returncode == 0:
            print(f"✅ npm: {npm_result.stdout.strip()}")
            npm_ok = True
        else:
            print("❌ npm not found")
            npm_ok = False
        
        return node_ok and npm_ok
        
    except FileNotFoundError:
        print("❌ Node.js/npm not found in PATH")
        return False

def check_frontend_dependencies():
    """Check if frontend dependencies are installed"""
    print("\n📦 Checking Frontend Dependencies:")
    if os.path.exists('frontend/node_modules'):
        print("✅ Frontend dependencies installed")
        return True
    else:
        print("❌ Frontend dependencies not installed")
        print("💡 Run: cd frontend && npm install")
        return False

def main():
    """Main status check function"""
    print("🏥 Hospital Management System - Status Check")
    print("=" * 60)
    
    checks = [
        ("Python Version", check_python_version),
        ("Required Packages", check_required_packages),
        ("File Structure", check_file_structure),
        ("Database", check_database),
        ("Node.js & npm", check_node_and_npm),
        ("Frontend Dependencies", check_frontend_dependencies),
        ("Backend Server", check_backend_server),
        ("Frontend Server", check_frontend_server),
    ]
    
    results = {}
    for check_name, check_func in checks:
        try:
            results[check_name] = check_func()
        except Exception as e:
            print(f"❌ {check_name} check failed: {e}")
            results[check_name] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SYSTEM STATUS SUMMARY:")
    print("=" * 60)
    
    passed = sum(results.values())
    total = len(results)
    
    for check_name, status in results.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {check_name}")
    
    print(f"\n🎯 Overall Status: {passed}/{total} checks passed")
    
    if passed == total:
        print("🎉 All systems are working correctly!")
    elif passed >= total * 0.7:
        print("⚠️ Most systems are working, but some issues need attention.")
    else:
        print("❌ Multiple issues detected. Please fix the problems above.")
    
    # Recommendations
    print("\n💡 RECOMMENDATIONS:")
    if not results.get("Backend Server", False):
        print("• Start backend: python start.py")
    if not results.get("Frontend Server", False):
        print("• Start frontend: cd frontend && npm run dev")
    if not results.get("Required Packages", False):
        print("• Install Python packages: pip install -r requirements.txt")
    if not results.get("Frontend Dependencies", False):
        print("• Install frontend packages: cd frontend && npm install")
    if not results.get("Database", False):
        print("• Initialize database: python scripts/setup_utilities.py init")

if __name__ == "__main__":
    main()