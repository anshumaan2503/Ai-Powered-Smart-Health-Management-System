#!/usr/bin/env python3
"""
Fix admin user to match City Hospital
"""

import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.user import User
from hospital.models.hospital import Hospital

def main():
    """Fix admin user"""
    app = create_app()
    
    with app.app_context():
        print("🔧 Fixing Admin User")
        print("=" * 30)
        
        # Find City Hospital
        city_hospital = Hospital.query.filter(
            Hospital.name.like('%City%')
        ).first()
        
        if not city_hospital:
            print("❌ City Hospital not found!")
            return
        
        print(f"🏥 Hospital: {city_hospital.name} (ID: {city_hospital.id})")
        
        # Show all users
        all_users = User.query.all()
        print(f"\n👤 All Users:")
        for user in all_users:
            hospital_name = "No Hospital"
            if user.hospital_id:
                hospital = Hospital.query.get(user.hospital_id)
                if hospital:
                    hospital_name = hospital.name
            print(f"   • {user.first_name} {user.last_name} ({user.email}) - {hospital_name} - Role: {user.role}")
        
        # Find or create admin for City Hospital
        city_admin = User.query.filter_by(hospital_id=city_hospital.id, role='admin').first()
        
        if city_admin:
            print(f"\n✅ Found admin: {city_admin.email}")
            # Update email to match what you might be using
            if city_admin.email == "admin@hospital.co.in":
                city_admin.email = "admin@cityhospital.com"
                db.session.commit()
                print(f"📧 Updated admin email to: {city_admin.email}")
        else:
            print(f"\n❌ No admin found for City Hospital")
            # Create one
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
            print(f"✅ Created new admin: {admin.email}")
        
        print(f"\n🔑 Login Credentials for City Hospital:")
        print(f"   Email: admin@cityhospital.com")
        print(f"   Password: admin123")
        print(f"\n💡 Or try logging in with your existing account and check if it's associated with City Hospital")

if __name__ == '__main__':
    main()