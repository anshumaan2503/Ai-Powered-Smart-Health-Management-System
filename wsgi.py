import os
from hospital import create_app, db

app = create_app(os.getenv("FLASK_CONFIG") or "production")

# ✅ Create tables automatically on Render startup
with app.app_context():
    try:
        db.create_all()
        app.logger.info("✅ DB Tables created successfully!")
    except Exception as e:
        app.logger.exception("❌ DB create_all() failed")