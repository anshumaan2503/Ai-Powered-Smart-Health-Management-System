#!/usr/bin/env python3
"""
Remove duplicate admin accounts and keep only your credentials
"""

import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.user import User
from hospital.models.hospital import Hospital

def main():
    """Clean up admin accounts"""
    app = create_app()
    
    with app.app_context():
        print("🧹 Cleaning Up Admin Accounts")
        print("=" * 40)
        
        # Find City Hospital
        city_hospital = Hospital.query.filter(
            Hospital.name.like('%City%')
        ).first()
        
        if not city_hospital:
            print("❌ City Hospital not found!")
            return
        
        print(f"🏥 Hospital: {city_hospital.name} (ID: {city_hospital.id})")
        
        # Show all admin users before cleanup
        all_admins = User.query.filter_by(role='admin').all()
        print(f"\n👤 Admin Users Before Cleanup ({len(all_admins)}):")
        for admin in all_admins:
            hospital_name = "No Hospital"
            if admin.hospital_id:
                hospital = Hospital.query.get(admin.hospital_id)
                if hospital:
                    hospital_name = hospital.name
            print(f"   • {admin.first_name} {admin.last_name} ({admin.email}) - {hospital_name}")
        
        # Keep only your preferred admin account
        your_admin = User.query.filter_by(email="city@hospital.com").first()
        
        if not your_admin:
            print(f"\n❌ Your admin account (city@hospital.com) not found!")
            print("Creating it now...")
            
            # Create your admin account
            your_admin = User(
                first_name="City",
                last_name="Admin",
                email="city@hospital.com",
                phone="9876543210",
                role="admin",
                hospital_id=city_hospital.id
            )
            your_admin.set_password("Cityhospital123")
            db.session.add(your_admin)
            db.session.commit()
            print("✅ Created your admin account")
        
        # Remove all other admin accounts
        other_admins = User.query.filter(
            User.role == 'admin',
            User.email != 'city@hospital.com'
        ).all()
        
        if other_admins:
            print(f"\n🗑️ Removing {len(other_admins)} other admin accounts:")
            for admin in other_admins:
                print(f"   • Removing: {admin.first_name} {admin.last_name} ({admin.email})")
                db.session.delete(admin)
            
            db.session.commit()
            print("✅ Cleanup completed!")
        else:
            print(f"\n✅ No other admin accounts to remove")
        
        # Verify final state
        final_admins = User.query.filter_by(role='admin').all()
        print(f"\n🎉 Final Admin Users ({len(final_admins)}):")
        for admin in final_admins:
            hospital_name = "No Hospital"
            if admin.hospital_id:
                hospital = Hospital.query.get(admin.hospital_id)
                if hospital:
                    hospital_name = hospital.name
            print(f"   • {admin.first_name} {admin.last_name} ({admin.email}) - {hospital_name}")
        
        # Test your credentials
        test_admin = User.query.filter_by(email="city@hospital.com").first()
        if test_admin:
            is_valid = test_admin.check_password("Cityhospital123")
            print(f"\n🔐 Your Credentials Test: {'✅ Valid' if is_valid else '❌ Invalid'}")
            
            print(f"\n🔑 Your Login Credentials:")
            print(f"   Email: city@hospital.com")
            print(f"   Password: Cityhospital123")
            print(f"   Hospital: {city_hospital.name}")

if __name__ == '__main__':
    main()