#!/usr/bin/env python3

from hospital import create_app, db
from hospital.models.hospital_subscription import HospitalSubscription

def update_subscription_limits():
    app = create_app()
    with app.app_context():
        print("=== Updating Subscription Limits ===")
        
        # Get all subscriptions
        subscriptions = HospitalSubscription.query.all()
        
        for sub in subscriptions:
            print(f"Hospital ID: {sub.hospital_id}")
            print(f"Current limits - Staff: {sub.max_staff}, Doctors: {sub.max_doctors}")
            
            # Update limits to allow more staff/doctors
            sub.max_staff = 50  # Increase to 50 staff
            sub.max_doctors = 25  # Increase to 25 doctors
            
            print(f"Updated limits - Staff: {sub.max_staff}, Doctors: {sub.max_doctors}")
            print("---")
        
        db.session.commit()
        print("Subscription limits updated successfully!")

if __name__ == "__main__":
    update_subscription_limits()