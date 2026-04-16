import os, sys
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.user import User
app = create_app()
with app.app_context():
    users = User.query.all()
    print(f"Total Users: {len(users)}")
    with open('all_emails.txt', 'w') as f:
        for u in users:
            f.write(f"Email: {u.email}\n")
    print("Done. Saved to all_emails.txt")
