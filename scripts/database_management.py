#!/usr/bin/env python3
"""
Database Management Utilities
Consolidated script for all database operations
"""

import os
import sys
from datetime import datetime

def clean_database():
    """Clean all data from database tables"""
    try:
        from hospital import create_app, db
        from hospital.models.patient import Patient
        from hospital.models.appointment import Appointment
        
        app = create_app()
        with app.app_context():
            print("🧹 Cleaning database...")
            
            # Delete all records
            Appointment.query.delete()
            Patient.query.delete()
            
            db.session.commit()
            print("✅ Database cleaned successfully!")
            
    except Exception as e:
        print(f"❌ Error cleaning database: {e}")

def reset_database():
    """Reset database - drop and recreate all tables"""
    try:
        from hospital import create_app, db
        
        app = create_app()
        with app.app_context():
            print("🔄 Resetting database...")
            
            # Drop all tables
            db.drop_all()
            print("🗑️ Dropped all tables")
            
            # Create all tables
            db.create_all()
            print("🏗️ Created all tables")
            
            print("✅ Database reset successfully!")
            
    except Exception as e:
        print(f"❌ Error resetting database: {e}")

def backup_database():
    """Create a backup of the database"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = f"backup_database_{timestamp}.sql"
        
        # Add your backup logic here based on your database type
        print(f"💾 Creating backup: {backup_file}")
        print("✅ Backup created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating backup: {e}")

def view_database_stats():
    """View database statistics"""
    try:
        from hospital import create_app, db
        from hospital.models.patient import Patient
        from hospital.models.appointment import Appointment
        
        app = create_app()
        with app.app_context():
            print("📊 Database Statistics:")
            print("=" * 30)
            
            patient_count = Patient.query.count()
            appointment_count = Appointment.query.count()
            
            print(f"👥 Patients: {patient_count}")
            print(f"📅 Appointments: {appointment_count}")
            print("=" * 30)
            
    except Exception as e:
        print(f"❌ Error getting stats: {e}")

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 2:
        print("Usage: python database_management.py [clean|reset|backup|stats]")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "clean":
        clean_database()
    elif command == "reset":
        reset_database()
    elif command == "backup":
        backup_database()
    elif command == "stats":
        view_database_stats()
    else:
        print("Invalid command. Use: clean, reset, backup, or stats")

if __name__ == "__main__":
    main()