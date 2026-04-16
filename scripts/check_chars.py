import os, sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.user import User

def check_chars():
    app = create_app()
    with app.app_context():
        u = User.query.filter_by(id=1).first()
        if u:
            print(f"Email: {u.email}")
            print(f"Chars: {[ord(c) for c in u.email]}")
        else:
            print("User 1 not found")

if __name__ == '__main__':
    check_chars()
