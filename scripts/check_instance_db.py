import os, sys
sys.path.append(os.getcwd())
import sqlite3

def list_instance_emails():
    # Use the database in the instance folder
    db_path = os.path.join(os.getcwd(), 'instance', 'hospital.db')
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found")
        return
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print(f"Inspecting database: {db_path}")
    
    # List all users
    cursor.execute("SELECT id, email, role, hospital_id FROM users")
    users = cursor.fetchall()
    print(f"Total Users: {len(users)}")
    for u in users:
        print(f"User {u[0]}: {u[1]} | Role: {u[2]} | HospID: {u[3]}")
        
    # List all hospitals
    cursor.execute("SELECT id, name, email FROM hospitals")
    hospitals = cursor.fetchall()
    print("\nHospitals:")
    for h in hospitals:
        print(f"Hosp {h[0]}: {h[1]} | Email: {h[2]}")
        
    conn.close()

if __name__ == '__main__':
    list_instance_emails()
