#!/usr/bin/env python3
"""
Fix admin passwords for all hospitals
"""

from hospital import create_app, db
from hospital.models.user import User

def fix_admin_passwords():
    app = create_app()
    
    with app.app_context():
        # Get all admin users
        admins = User.query.filter_by(role='admin').all()
        
        print(f"Found {len(admins)} admin users")
        
        for admin in admins:
            admin.set_password('admin123')
            print(f"✅ Updated password for {admin.email}")
        
        db.session.commit()
        print("\n🎉 All admin passwords updated to 'admin123'")

if __name__ == '__main__':
    fix_admin_passwords()