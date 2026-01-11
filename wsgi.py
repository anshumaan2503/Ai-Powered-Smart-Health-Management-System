"""
WSGI entry point for production deployment
"""
import os
from hospital import create_app, db

# Create Flask app
app = create_app()

# Initialize database
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run()
