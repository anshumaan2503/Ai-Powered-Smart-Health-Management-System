import os, sys
sys.path.append(os.getcwd())
import bcrypt
from hospital import create_app, db
from hospital.models.user import User

def debug_hash():
    app = create_app()
    with app.app_context():
        u = User.query.filter_by(email='city@hospital.com').first()
        if not u:
            print("User not found")
            return
            
        print(f"User {u.id}: Email: {u.email}")
        print(f"Hash: {u.password_hash}")
        print(f"Hash length: {len(u.password_hash)}")
        
        test_pw = '123'
        check = bcrypt.checkpw(test_pw.encode('utf-8'), u.password_hash.encode('utf-8'))
        print(f"Check 123: {check}")
        
        # Is the hash string or bytes?
        print(f"Hash type: {type(u.password_hash)}")

if __name__ == '__main__':
    debug_hash()
