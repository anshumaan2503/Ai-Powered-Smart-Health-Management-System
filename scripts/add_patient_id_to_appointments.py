"""
Migration script to add patient_id column to appointments table
Run this script to fix the missing patient_id column error
"""

from hospital import create_app, db
from sqlalchemy import text

def add_patient_id_column():
    app = create_app()
    
    with app.app_context():
        try:
            # Check if column exists
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='appointments' AND column_name='patient_id'
            """))
            
            if result.fetchone():
                print("✓ patient_id column already exists in appointments table")
                return True
            
            print("Adding patient_id column to appointments table...")
            
            # Add the patient_id column
            db.session.execute(text("""
                ALTER TABLE appointments 
                ADD COLUMN patient_id INTEGER;
            """))
            
            # Add foreign key constraint
            db.session.execute(text("""
                ALTER TABLE appointments 
                ADD CONSTRAINT fk_appointments_patient_id 
                FOREIGN KEY (patient_id) REFERENCES patients(id);
            """))
            
            # Make it NOT NULL after setting values (if there are existing records)
            # First, check if there are any records
            count_result = db.session.execute(text("SELECT COUNT(*) FROM appointments"))
            count = count_result.fetchone()[0]
            
            if count > 0:
                print(f"Found {count} existing appointments. Skipping NOT NULL constraint.")
                print("Note: You may need to manually update existing appointments with patient_id values")
            else:
                # Safe to add NOT NULL constraint
                db.session.execute(text("""
                    ALTER TABLE appointments 
                    ALTER COLUMN patient_id SET NOT NULL;
                """))
            
            db.session.commit()
            print("✓ Successfully added patient_id column to appointments table")
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"✗ Error adding patient_id column: {str(e)}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == '__main__':
    print("=" * 60)
    print("MIGRATION: Add patient_id column to appointments table")
    print("=" * 60)
    success = add_patient_id_column()
    if success:
        print("\n✓ Migration completed successfully!")
    else:
        print("\n✗ Migration failed. Please check the errors above.")
