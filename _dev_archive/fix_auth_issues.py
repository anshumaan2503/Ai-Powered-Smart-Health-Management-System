#!/usr/bin/env python3
"""
Fix authentication issues in the hospital management system
"""

import os
import sys
from datetime import datetime

def clear_browser_storage_instructions():
    """Provide instructions to clear browser storage"""
    print("🌐 Browser Storage Cleanup Instructions")
    print("=" * 50)
    print("To fix authentication issues, clear browser storage:")
    print()
    print("Chrome/Edge:")
    print("1. Press F12 to open Developer Tools")
    print("2. Go to Application tab")
    print("3. Click 'Local Storage' and 'Session Storage'")
    print("4. Delete all entries for localhost:3000")
    print("5. Refresh the page")
    print()
    print("Firefox:")
    print("1. Press F12 to open Developer Tools")
    print("2. Go to Storage tab")
    print("3. Clear Local Storage and Session Storage")
    print("4. Refresh the page")
    print()
    print("Alternative: Use Incognito/Private browsing mode")

def check_database_users():
    """Check if there are users in the database"""
    try:
        from hospital import create_app, db
        from hospital.models.user import User
        
        app = create_app()
        with app.app_context():
            users = User.query.all()
            print(f"📊 Database Status: {len(users)} users found")
            
            if users:
                print("   Users in database:")
                for user in users[:5]:  # Show first 5 users
                    print(f"   - {user.email} ({user.role}) - Active: {user.is_active}")
                if len(users) > 5:
                    print(f"   ... and {len(users) - 5} more users")
            else:
                print("   ⚠️  No users found in database")
                return False
            
            return True
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

def create_test_user():
    """Create a test user for authentication testing"""
    try:
        from hospital import create_app, db
        from hospital.models.user import User
        
        app = create_app()
        with app.app_context():
            # Check if test user already exists
            test_user = User.query.filter_by(email='test@hospital.com').first()
            if test_user:
                print("✅ Test user already exists: test@hospital.com")
                return True
            
            # Create test user
            user = User(
                email='test@hospital.com',
                first_name='Test',
                last_name='User',
                role='admin'
            )
            user.set_password('test123')
            
            db.session.add(user)
            db.session.commit()
            
            print("✅ Test user created:")
            print("   Email: test@hospital.com")
            print("   Password: test123")
            print("   Role: admin")
            
            return True
    except Exception as e:
        print(f"❌ Failed to create test user: {e}")
        return False

def test_jwt_configuration():
    """Test JWT configuration"""
    try:
        from hospital import create_app
        from flask_jwt_extended import create_access_token
        
        app = create_app()
        with app.app_context():
            # Try to create a test token
            test_token = create_access_token(identity=1)
            print("✅ JWT configuration is working")
            print(f"   Sample token created: {test_token[:50]}...")
            return True
    except Exception as e:
        print(f"❌ JWT configuration error: {e}")
        return False

def check_environment_variables():
    """Check important environment variables"""
    print("🔧 Environment Variables Check")
    print("=" * 50)
    
    important_vars = [
        ('SECRET_KEY', 'Flask secret key'),
        ('JWT_SECRET_KEY', 'JWT secret key'),
        ('DATABASE_URL', 'Database URL'),
        ('GEMINI_API_KEY', 'Gemini AI API key (optional)')
    ]
    
    all_good = True
    for var_name, description in important_vars:
        value = os.getenv(var_name)
        if value:
            if 'KEY' in var_name:
                print(f"   ✅ {var_name}: {'*' * min(len(value), 20)}")
            else:
                print(f"   ✅ {var_name}: {value}")
        else:
            if var_name == 'GEMINI_API_KEY':
                print(f"   ⚠️  {var_name}: Not set (optional)")
            else:
                print(f"   ❌ {var_name}: Not set")
                all_good = False
    
    return all_good

def fix_common_issues():
    """Fix common authentication issues"""
    print("🔧 Fixing Common Issues")
    print("=" * 50)
    
    try:
        from hospital import create_app, db
        
        app = create_app()
        with app.app_context():
            # Ensure all tables exist
            print("📊 Creating database tables...")
            db.create_all()
            print("   ✅ Database tables ready")
            
            # Check for admin user
            from hospital.models.user import User
            admin_user = User.query.filter_by(role='admin').first()
            if not admin_user:
                print("👤 Creating default admin user...")
                admin = User(
                    email='admin@hospital.com',
                    first_name='Admin',
                    last_name='User',
                    role='admin'
                )
                admin.set_password('admin123')
                db.session.add(admin)
                db.session.commit()
                print("   ✅ Admin user created: admin@hospital.com / admin123")
            else:
                print("   ✅ Admin user exists")
            
            return True
    except Exception as e:
        print(f"❌ Fix failed: {e}")
        return False

def main():
    """Main fix function"""
    print("🔐 Authentication Issues Fix Script")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Check environment variables
    env_ok = check_environment_variables()
    print()
    
    # Test JWT configuration
    jwt_ok = test_jwt_configuration()
    print()
    
    # Check database and users
    print("📊 Database Check")
    print("=" * 50)
    db_ok = check_database_users()
    print()
    
    # Fix common issues
    fix_ok = fix_common_issues()
    print()
    
    # Create test user
    print("👤 Test User Setup")
    print("=" * 50)
    test_user_ok = create_test_user()
    print()
    
    # Browser storage instructions
    clear_browser_storage_instructions()
    print()
    
    # Summary
    print("=" * 60)
    print("🎯 Fix Summary:")
    print(f"   Environment Variables: {'✅' if env_ok else '❌'}")
    print(f"   JWT Configuration: {'✅' if jwt_ok else '❌'}")
    print(f"   Database: {'✅' if db_ok else '❌'}")
    print(f"   Common Issues Fixed: {'✅' if fix_ok else '❌'}")
    print(f"   Test User Created: {'✅' if test_user_ok else '❌'}")
    
    if all([env_ok, jwt_ok, db_ok, fix_ok, test_user_ok]):
        print("\n🎉 All authentication issues should be resolved!")
        print("\n🚀 Next steps:")
        print("1. Clear browser storage (see instructions above)")
        print("2. Restart the backend: python start.py")
        print("3. Restart the frontend: cd frontend && npm run dev")
        print("4. Test login with: test@hospital.com / test123")
        print("5. Or admin login: admin@hospital.com / admin123")
        print("\n🧪 Test the fix:")
        print("   python test_auth_fix.py")
    else:
        print("\n⚠️  Some issues remain. Check the errors above.")
        print("\n💡 Common solutions:")
        print("- Set missing environment variables in .env file")
        print("- Check database permissions")
        print("- Restart the application")
        print("- Clear browser cache and storage")

if __name__ == "__main__":
    main()