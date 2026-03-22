from hospital import create_app, db
from hospital.models.doctor import Doctor
from hospital.models.user import User

app = create_app()
with app.app_context():
    try:
        doc_count = Doctor.query.count()
        user_count = User.query.count()
        print(f"Doctors: {doc_count}")
        print(f"Users: {user_count}")
    except Exception as e:
        print(f"Error: {e}")
