#!/usr/bin/env python3
"""
Update admin credentials to your preferred ones
"""

import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.user import User
from hospital.models.hospital import Hospital

def main():
    """Update to your preferred credentials"""
    app = create_app()
    
    with app.app_context():
        print("🔧 Updating to Your Preferred Credentials")
        print("=" * 50)
        
        # Find City Hospital
        city_hospital = Hospital.query.filter(
            Hospital.name.like('%City%')
        ).first()
        
        if not city_hospital:
            print("❌ City Hospital not found!")
            return
        
        print(f"🏥 Hospital: {city_hospital.name} (ID: {city_hospital.id})")
        
        # Find existing admin
        city_admin = User.query.filter_by(hospital_id=city_hospital.id, role='admin').first()
        
        if city_admin:
            print(f"📧 Updating existing admin: {city_admin.first_name} {city_admin.last_name}")
            print(f"   Old Email: {city_admin.email}")
            
            # Update to your preferred credentials
            city_admin.email = "city@hospital.com"
            city_admin.set_password("Cityhospital123")
            db.session.commit()
            
            print(f"   New Email: {city_admin.email}")
            print(f"   New Password: Cityhospital123")
            
        else:
            print("❌ No admin found. Creating new one with your credentials...")
            
            # Create admin with your credentials
            admin = User(
                first_name="City",
                last_name="Admin",
                email="city@hospital.com",
                phone="9876543210",
                role="admin",
                hospital_id=city_hospital.id
            )
            admin.set_password("Cityhospital123")
            db.session.add(admin)
            db.session.commit()
            
            print(f"✅ Created new admin with your credentials")
        
        # Verify the credentials work
        test_admin = User.query.filter_by(email="city@hospital.com").first()
        if test_admin:
            is_valid = test_admin.check_password("Cityhospital123")
            print(f"\n🔐 Password Test: {'✅ Valid' if is_valid else '❌ Invalid'}")
            
            print(f"\n🎉 Your Login Credentials:")
            print(f"   Email: city@hospital.com")
            print(f"   Password: Cityhospital123")
            print(f"   Hospital: {city_hospital.name}")
            
            print(f"\n💡 You can now login with your original credentials!")

if __name__ == '__main__':
    main()