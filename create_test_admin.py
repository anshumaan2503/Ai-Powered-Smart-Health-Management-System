#!/usr/bin/env python3
"""
Create a test admin user for hospital login
"""

from hospital import create_app, db
from hospital.models.user import User
from hospital.models.hospital import Hospital

def create_test_admin():
    app = create_app()
    
    with app.app_context():
        # Check if admin already exists
        admin = User.query.filter_by(email='admin@hospital.com').first()
        
        if admin:
            print("Admin user already exists, updating password...")
            admin.set_password('admin123')
            db.session.commit()
            print("✅ Admin password updated!")
        else:
            # Get the first hospital
            hospital = Hospital.query.first()
            if not hospital:
                print("❌ No hospital found. Please create a hospital first.")
                return
            
            # Create admin user
            admin = User(
                email='admin@hospital.com',
                first_name='Admin',
                last_name='User',
                role='admin',
                hospital_id=hospital.id
            )
            admin.set_password('admin123')
            
            db.session.add(admin)
            db.session.commit()
            
            print("✅ Test admin user created!")
        
        print(f"📧 Email: admin@hospital.com")
        print(f"🔑 Password: admin123")
        print(f"🏥 Hospital ID: {admin.hospital_id}")

if __name__ == '__main__':
    create_test_admin()