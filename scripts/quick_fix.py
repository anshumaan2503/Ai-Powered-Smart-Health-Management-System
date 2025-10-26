#!/usr/bin/env python3
"""
Quick Fix Script
Automatically fix common issues in the hospital management system
"""

import os
import sys
import subprocess

def fix_database_issues():
    """Fix common database issues"""
    print("🔧 Fixing database issues...")
    try:
        from hospital import create_app, db
        
        app = create_app()
        with app.app_context():
            print("📊 Dropping all tables...")
            db.drop_all()
            
            print("🏗️ Creating all tables...")
            db.create_all()
            
            print("✅ Database reset successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Database fix failed: {e}")
        return False

def fix_frontend_dependencies():
    """Fix frontend dependency issues"""
    print("🔧 Fixing frontend dependencies...")
    try:
        if os.path.exists('frontend'):
            original_dir = os.getcwd()
            os.chdir('frontend')
            
            # Check if node_modules exists and has content
            node_modules_exists = os.path.exists('node_modules') and os.listdir('node_modules')
            
            if not node_modules_exists:
                print("📦 Installing dependencies...")
                result = subprocess.run(['npm', 'install'], capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ Frontend dependencies installed!")
                    os.chdir(original_dir)
                    return True
                else:
                    print(f"❌ npm install failed: {result.stderr}")
                    os.chdir(original_dir)
                    return False
            else:
                # Remove node_modules and package-lock.json for fresh install
                print("🗑️ Removing old node_modules...")
                if os.name == 'nt':  # Windows
                    os.system('rmdir /s /q node_modules')
                else:  # Unix/Linux/Mac
                    os.system('rm -rf node_modules')
                
                if os.path.exists('package-lock.json'):
                    print("🗑️ Removing package-lock.json...")
                    os.remove('package-lock.json')
                
                # Reinstall dependencies
                print("📦 Installing fresh dependencies...")
                result = subprocess.run(['npm', 'install'], capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ Frontend dependencies fixed!")
                    os.chdir(original_dir)
                    return True
                else:
                    print(f"❌ npm install failed: {result.stderr}")
                    os.chdir(original_dir)
                    return False
                
    except Exception as e:
        print(f"❌ Frontend fix failed: {e}")
        return False

def fix_python_packages():
    """Fix Python package issues"""
    print("🔧 Fixing Python packages...")
    try:
        print("📦 Upgrading pip...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip'], 
                      capture_output=True)
        
        print("📦 Installing requirements...")
        result = subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Python packages fixed!")
            return True
        else:
            print(f"❌ Package installation failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Python package fix failed: {e}")
        return False

def fix_file_permissions():
    """Fix file permission issues (Unix/Linux/Mac only)"""
    if os.name == 'nt':  # Windows
        print("⏭️ Skipping file permissions (Windows)")
        return True
    
    print("🔧 Fixing file permissions...")
    try:
        # Make scripts executable
        script_files = [
            'scripts/setup_utilities.py',
            'scripts/database_management.py',
            'scripts/system_status.py',
            'scripts/test_backend.py',
            'scripts/quick_fix.py'
        ]
        
        for script in script_files:
            if os.path.exists(script):
                os.chmod(script, 0o755)
                print(f"✅ Made {script} executable")
        
        return True
        
    except Exception as e:
        print(f"❌ Permission fix failed: {e}")
        return False

def create_missing_directories():
    """Create missing directories"""
    print("🔧 Creating missing directories...")
    try:
        directories = [
            'logs',
            'uploads',
            'backups',
            'frontend/public/uploads'
        ]
        
        for directory in directories:
            if not os.path.exists(directory):
                os.makedirs(directory, exist_ok=True)
                print(f"✅ Created directory: {directory}")
        
        return True
        
    except Exception as e:
        print(f"❌ Directory creation failed: {e}")
        return False

def main():
    """Main fix function"""
    print("🔧 Hospital Management System - Quick Fix")
    print("=" * 50)
    
    fixes = [
        ("File Permissions", fix_file_permissions),
        ("Missing Directories", create_missing_directories),
        ("Python Packages", fix_python_packages),
        ("Database Issues", fix_database_issues),
        ("Frontend Dependencies", fix_frontend_dependencies),
    ]
    
    results = {}
    for fix_name, fix_func in fixes:
        print(f"\n🔧 {fix_name}:")
        try:
            results[fix_name] = fix_func()
        except Exception as e:
            print(f"❌ {fix_name} fix failed: {e}")
            results[fix_name] = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 FIX RESULTS:")
    print("=" * 50)
    
    passed = sum(results.values())
    total = len(results)
    
    for fix_name, status in results.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {fix_name}")
    
    print(f"\n🎯 Overall: {passed}/{total} fixes successful")
    
    if passed == total:
        print("🎉 All fixes applied successfully!")
        print("\n💡 Next steps:")
        print("1. Start backend: python start.py")
        print("2. Start frontend: cd frontend && npm run dev")
        print("3. Check status: python scripts/setup_utilities.py status")
    else:
        print("⚠️ Some fixes failed. Please check the errors above.")

if __name__ == "__main__":
    main()