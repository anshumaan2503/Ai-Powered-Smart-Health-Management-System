#!/usr/bin/env python3
"""
WSGI entry point for production deployment
"""
import os
import sys

# Ensure the project root is in the path
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Set production environment
os.environ.setdefault('FLASK_ENV', 'production')
os.environ.setdefault('FLASK_CONFIG', 'production')

try:
    print("🔄 Initializing Flask application...")
    from hospital import create_app, db
    
    # Create Flask app
    app = create_app('production')
    print("✅ Flask app created successfully")
    
    # Initialize database
    with app.app_context():
        db.create_all()
        print("✅ Database initialized")
    
    print("✅ WSGI application ready!")
    
except Exception as e:
    print(f"❌ Fatal error during initialization: {e}")
    import traceback
    traceback.print_exc()
    raise

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
