#!/usr/bin/env python3
"""
Simple startup script for the Hospital Management System
"""

import os
import sys

def check_requirements():
    """Check if all required packages are installed"""
    required_packages = [
        'flask', 'flask_sqlalchemy', 'flask_migrate', 
        'flask_jwt_extended', 'flask_cors', 'flask_mail',
        'bcrypt'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n💡 Install them with:")
        print("   pip install -r requirements.txt")
        return False
    
    print("✅ All required packages are installed!")
    return True

def setup_environment():
    """Set up environment variables"""
    if not os.path.exists('.env'):
        print("⚠️  No .env file found. Using default settings.")
        print("💡 Copy .env.example to .env and customize for production.")
    
    # Set default environment variables
    os.environ.setdefault('FLASK_CONFIG', 'development')
    os.environ.setdefault('SECRET_KEY', 'dev-secret-key-change-in-production')
    os.environ.setdefault('JWT_SECRET_KEY', 'jwt-secret-string')

def main():
    """Main startup function"""
    print("🏥 Starting Hospital Management System...")
    print("=" * 50)
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    # Setup environment
    setup_environment()
    
    try:
        from hospital import create_app, db
        
        # Create Flask app
        app = create_app()
        
        # Create database tables
        with app.app_context():
            print("📊 Setting up database...")
            db.create_all()
            print("✅ Database tables created successfully!")
        
        print("\n🚀 Starting server...")
        print("📍 Server will be available at: http://localhost:5000")
        print("📖 API Documentation: http://localhost:5000/api/")
        print("\n💡 Press Ctrl+C to stop the server")
        print("=" * 50)
        
        # Start the server
        app.run(
            debug=True,
            host='0.0.0.0',
            port=5000,
            use_reloader=True
        )
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure you're in the correct directory and all files exist.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()