import os, sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.user import User
app = create_app()
with app.app_context():
    u = User.query.filter_by(email='pankaj.verma@cityhospital.com').first()
    if u:
        u.set_password('123')
        db.session.commit()
        print("Success: Password for pankaj.verma@cityhospital.com is now 123")
    else:
        print("Error: Pankaj not found")
