import sqlite3
import os

db_path = "hospital.db"
if not os.path.exists(db_path):
    db_path = os.path.join("instance", "hospital.db")

if not os.path.exists(db_path):
    print(f"❌ {db_path} not found in the current directory.")
    exit(1)

def fix_sqlite():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print(f"🔍 Checking 'appointments' table in {db_path}...")
        
        # Check if column exists
        cursor.execute("PRAGMA table_info(appointments)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'patient_id' in columns:
            print("✅ 'patient_id' column already exists!")
        else:
            print("➕ Adding 'patient_id' column...")
            # SQLite only allows adding columns with NULL or DEFAULT
            cursor.execute("ALTER TABLE appointments ADD COLUMN patient_id INTEGER")
            print("✅ Column added successfully!")

        conn.commit()
        conn.close()
        print("\n✨ Local database fix complete!")
        print("💡 You can now run 'python app.py' again.")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    fix_sqlite()
