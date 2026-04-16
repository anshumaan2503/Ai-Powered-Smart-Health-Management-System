import os, sys, sqlite3
db_path = os.path.join(os.getcwd(), 'instance', 'hospital.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT id, email, role, hospital_id FROM users")
for u in cursor.fetchall():
    print(f"DEBUG_USER: ID={u[0]}, EMAIL={u[1]}, ROLE={u[2]}, HOSP={u[3]}")
conn.close()
