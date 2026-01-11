"""
WSGI entry point for production deployment
"""
import os
import sys

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from hospital import create_app, db
    
    # Create Flask app
    app = create_app()
    
    # Initialize database
    with app.app_context():
        db.create_all()
        print("✅ Database initialized")
except Exception as e:
    print(f"❌ Error initializing app: {e}")
    import traceback
    traceback.print_exc()
    raise

if __name__ == "__main__":
    app.run()
