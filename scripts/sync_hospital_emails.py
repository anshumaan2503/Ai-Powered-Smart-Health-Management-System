import os
import sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User

def sync_hospital_emails():
    app = create_app()
    with app.app_context():
        # Find all hospitals
        hospitals = Hospital.query.all()
        synced_count = 0
        
        for hospital in hospitals:
            # Sync the hospital's official email with any admin account that was using it
            # OR if an admin user exist but their email is different, we can't assume they want to sync unless it's only one admin.
            
            # Usually, the registration created exactly one admin user with hospital.email.
            # If we find that the hospital email doesn't match any admin user's email, we sync the only admin user we find.
            
            admin_users = User.query.filter_by(hospital_id=hospital.id, role='admin').all()
            
            if len(admin_users) == 1:
                admin_user = admin_users[0]
                if admin_user.email != hospital.email:
                    print(f"Syncing hospital {hospital.id} ({hospital.name}): {admin_user.email} -> {hospital.email}")
                    admin_user.email = hospital.email
                    synced_count += 1
            elif len(admin_users) > 1:
                # If multiple admins, only sync the one whose email was likely the old hospital email
                print(f"Hospital {hospital.id} ({hospital.name}) has multiple admins. Skipping automatic sync for caution.")
        
        if synced_count > 0:
            db.session.commit()
            print(f"Successfully synced {synced_count} hospital admin accounts.")
        else:
            print("No accounts needed syncing.")

if __name__ == '__main__':
    sync_hospital_emails()