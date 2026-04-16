import os, sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.user import User
app = create_app()
with app.app_context():
    # If the user says they can STILL only login using 'igntu' credentials 
    # but not 'city' credentials... maybe they are confusing the email and the username?
    
    # Or maybe there is another user with the igntu email in the DB.
    
    # Let's check for any user with an email containing 'igntu'
    users = User.query.filter(User.email.ilike('%igntu%')).all()
    print(f"DEBUG: Found {len(users)} 'igntu' users.")
    for u in users:
        print(f" - User {u.id}: {u.email} (HospID: {u.hospital_id})")
        
    # Check for 'city@hospital.com'
    u_city = User.query.filter_by(email='city@hospital.com').first()
    if u_city:
        print(f"DEBUG: 'city@hospital.com' exists as User {u_city.id} (HospID: {u_city.hospital_id})")
    else:
        print("DEBUG: 'city@hospital.com' does NOT exist in User table.")

if __name__ == '__main__':
    pass
