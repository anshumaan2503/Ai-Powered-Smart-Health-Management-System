"""
Migration Script: Add appointment_id column to appointments table
This script adds the missing appointment_id column and populates it for existing records
"""

from hospital import db, create_app
from hospital.models.appointment import Appointment
import uuid

def add_appointment_id_column():
    """Add appointment_id column to appointments table"""
    app = create_app()
    
    with app.app_context():
        try:
            # Check if column already exists by attempting to query it
            try:
                test_query = db.session.query(Appointment.appointment_id).limit(1).all()
                print("✓ appointment_id column already exists")
                return
            except Exception as e:
                if "appointment_id" in str(e).lower():
                    print("⚠ appointment_id column does not exist. Adding it...")
                else:
                    raise e
            
            # Add the column using raw SQL
            print("Adding appointment_id column...")
            db.session.execute(
                """
                ALTER TABLE appointments 
                ADD COLUMN appointment_id VARCHAR(20) UNIQUE;
                """
            )
            db.session.commit()
            print("✓ Column added successfully")
            
            # Populate appointment_id for existing records
            print("Populating appointment_id for existing appointments...")
            appointments = Appointment.query.filter(
                (Appointment.appointment_id == None) | (Appointment.appointment_id == '')
            ).all()
            
            for appointment in appointments:
                appointment.appointment_id = f"APT{str(uuid.uuid4())[:8].upper()}"
            
            db.session.commit()
            print(f"✓ Updated {len(appointments)} appointments with unique IDs")
            
            # Make the column NOT NULL
            print("Setting column as NOT NULL...")
            db.session.execute(
                """
                ALTER TABLE appointments 
                ALTER COLUMN appointment_id SET NOT NULL;
                """
            )
            db.session.commit()
            print("✓ Column set to NOT NULL")
            
            # Create index
            print("Creating index on appointment_id...")
            db.session.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_appointments_appointment_id 
                ON appointments(appointment_id);
                """
            )
            db.session.commit()
            print("✓ Index created successfully")
            
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            db.session.rollback()
            print(f"\n❌ Migration failed: {str(e)}")
            raise e

if __name__ == '__main__':
    add_appointment_id_column()
