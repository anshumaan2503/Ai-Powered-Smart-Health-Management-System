import sqlite3
import os

db_path = os.path.join('instance', 'hospital.db')
if not os.path.exists(db_path):
    db_path = 'hospital.db'

if not os.path.exists(db_path):
    print("Error: Database file not found.")
else:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        tables = [
            'appointment',
            'medical_record',
            'medicine',
            'prescription',
            'ai_diagnosis',
            'prescription_analysis',
            'doctor',
            'patient'
        ]
        
        print("Cleaning tables...")
        for table in tables:
            try:
                # Check if table exists
                cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                if cursor.fetchone():
                    cursor.execute(f"DELETE FROM {table}")
                    cursor.execute(f"UPDATE sqlite_sequence SET seq=0 WHERE name='{table}'")
                    print(f"Purged: {table}")
            except sqlite3.OperationalError as e:
                print(f"Skipping {table}: {e}")
                
        conn.commit()
        conn.close()
        print("Cleanup successful! Credentials and profiles preserved.")
    except Exception as e:
        print(f"Error: {e}")
