#!/usr/bin/env python3
"""
Fix user permissions and role issues
"""

import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.user import User
from hospital.models.hospital import Hospital

def main():
    """Fix user permissions"""
    app = create_app()
    
    with app.app_context():
        print("🔧 Fixing User Permissions")
        print("=" * 40)
        
        # Find your admin user
        admin_user = User.query.filter_by(email="city@hospital.com").first()
        
        if not admin_user:
            print("❌ Admin user not found!")
            return
        
        print(f"👤 Found User: {admin_user.first_name} {admin_user.last_name}")
        print(f"   Email: {admin_user.email}")
        print(f"   Current Role: {admin_user.role}")
        print(f"   Hospital ID: {admin_user.hospital_id}")
        
        # Find City Hospital
        city_hospital = Hospital.query.filter(
            Hospital.name.like('%City%')
        ).first()
        
        if city_hospital:
            print(f"🏥 Hospital: {city_hospital.name} (ID: {city_hospital.id})")
            
            # Fix user permissions
            admin_user.role = 'admin'  # Ensure admin role
            admin_user.hospital_id = city_hospital.id  # Ensure correct hospital association
            
            # Also check if there are any additional permission fields
            if hasattr(admin_user, 'is_active'):
                admin_user.is_active = True
            if hasattr(admin_user, 'is_verified'):
                admin_user.is_verified = True
            if hasattr(admin_user, 'permissions'):
                admin_user.permissions = 'all'
            
            db.session.commit()
            
            print(f"\n✅ Updated User Permissions:")
            print(f"   Role: {admin_user.role}")
            print(f"   Hospital ID: {admin_user.hospital_id}")
            print(f"   Hospital Name: {city_hospital.name}")
            
            # Check what roles are allowed in the backend
            print(f"\n🔍 Checking Backend Role Requirements...")
            
            # Show all users and their roles for debugging
            all_users = User.query.filter_by(hospital_id=city_hospital.id).all()
            print(f"\n👥 All Users in {city_hospital.name}:")
            for user in all_users:
                print(f"   • {user.first_name} {user.last_name} ({user.email}) - Role: {user.role}")
            
        else:
            print("❌ City Hospital not found!")
        
        print(f"\n🔑 Your Login Credentials:")
        print(f"   Email: city@hospital.com")
        print(f"   Password: Cityhospital123")
        print(f"   Role: admin")
        print(f"\n💡 Try logging in again. The permission issue should be fixed!")

if __name__ == '__main__':
    main()