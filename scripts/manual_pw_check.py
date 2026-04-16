import os, sys
sys.path.append(os.getcwd())
import bcrypt
from hospital import create_app, db
from hospital.models.user import User

def check_manual():
    app = create_app()
    with app.app_context():
        u = User.query.filter_by(email='city@hospital.com').first()
        if not u:
            print("User not found")
            return
            
        print(f"User {u.id}: Email: {u.email}")
        
        # Test 123
        password = '123'
        is_match = bcrypt.checkpw(password.encode('utf-8'), u.password_hash.encode('utf-8'))
        print(f"Manual match for '123': {is_match}")
        
        if not is_match:
            print("RE-SETTING PASSWORD MANUALLY...")
            new_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            u.password_hash = new_hash
            db.session.commit()
            print("New password hash set.")

if __name__ == '__main__':
    check_manual()
