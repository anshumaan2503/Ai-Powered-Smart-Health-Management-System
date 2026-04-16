#!/usr/bin/env python3
"""
Set simple passwords for all hospital admins
"""

from hospital import create_app, db
from hospital.models.user import User

def set_simple_passwords():
    app = create_app()
    
    with app.app_context():
        # Get all admin users
        admins = User.query.filter_by(role='admin').all()
        
        print(f"Found {len(admins)} admin users")
        
        for admin in admins:
            admin.set_password('123')
            print(f"✅ Updated password to '123' for {admin.email}")
        
        db.session.commit()
        print("\n🎉 All admin passwords updated to '123'")
        print("\nYou can now login with:")
        print("- Email: city@hospital.com, Password: 123")
        print("- Email: apollo@hospital.com, Password: 123")
        print("- Email: fortis@hospital.com, Password: 123")
        print("- Email: admin@hospital.com, Password: 123")

if __name__ == '__main__':
    set_simple_passwords()