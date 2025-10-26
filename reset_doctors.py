#!/usr/bin/env python3
"""
Quick script to reset doctors data
"""

from hospital import create_app, db
from hospital.models.user import User
from hospital.models.doctor import Doctor

def reset_doctors():
    """Reset all doctors data"""
    app = create_app()
    
    with app.app_context():
        print("🗑️  Clearing all doctors data...")
        
        # Delete all doctor profiles
        Doctor.query.delete()
        
        # Delete all doctor users
        User.query.filter_by(role='doctor').delete()
        
        # Commit changes
        db.session.commit()
        
        print("✅ All doctors data cleared!")
        print("💡 You can now add new doctors.")

if __name__ == '__main__':
    reset_doctors()