#!/usr/bin/env python3
"""
Check and fix login credentials for City Hospital
"""

import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.user import User
from hospital.models.hospital import Hospital

def main():
    """Check and fix login credentials"""
    app = create_app()
    
    with app.app_context():
        print("🔍 Checking Login Credentials")
        print("=" * 40)
        
        # Find City Hospital
        city_hospital = Hospital.query.filter(
            Hospital.name.like('%City%')
        ).first()
        
        if not city_hospital:
            print("❌ City Hospital not found!")
            return
        
        print(f"🏥 Hospital: {city_hospital.name} (ID: {city_hospital.id})")
        
        # Show all admin users
        admin_users = User.query.filter_by(role='admin').all()
        print(f"\n👤 All Admin Users:")
        for user in admin_users:
            hospital_name = "No Hospital"
            if user.hospital_id:
                hospital = Hospital.query.get(user.hospital_id)
                if hospital:
                    hospital_name = hospital.name
            print(f"   • {user.first_name} {user.last_name}")
            print(f"     Email: {user.email}")
            print(f"     Hospital: {hospital_name}")
            print(f"     Role: {user.role}")
            print()
        
        # Find admin for City Hospital
        city_admin = User.query.filter_by(hospital_id=city_hospital.id, role='admin').first()
        
        if city_admin:
            print(f"✅ Found City Hospital Admin:")
            print(f"   Name: {city_admin.first_name} {city_admin.last_name}")
            print(f"   Email: {city_admin.email}")
            
            # Reset password to ensure it works
            city_admin.set_password("admin123")
            db.session.commit()
            print(f"   Password: admin123 (reset)")
            
            print(f"\n🔑 Login Credentials:")
            print(f"   Email: {city_admin.email}")
            print(f"   Password: admin123")
            
        else:
            print(f"❌ No admin found for City Hospital. Creating one...")
            
            # Create admin user
            admin = User(
                first_name="Admin",
                last_name="User",
                email="admin@cityhospital.com",
                phone="9876543210",
                role="admin",
                hospital_id=city_hospital.id
            )
            admin.set_password("admin123")
            db.session.add(admin)
            db.session.commit()
            
            print(f"✅ Created admin user:")
            print(f"   Email: admin@cityhospital.com")
            print(f"   Password: admin123")
        
        # Test password verification
        test_admin = User.query.filter_by(hospital_id=city_hospital.id, role='admin').first()
        if test_admin:
            is_valid = test_admin.check_password("admin123")
            print(f"\n🔐 Password Test: {'✅ Valid' if is_valid else '❌ Invalid'}")

if __name__ == '__main__':
    main()