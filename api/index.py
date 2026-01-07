#!/usr/bin/env python3
"""
Vercel serverless function entry point for Hospital Management System
"""

import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Set up environment variables for Vercel
os.environ.setdefault('FLASK_CONFIG', 'production')
os.environ.setdefault('SECRET_KEY', os.environ.get('SECRET_KEY', 'fallback-secret-key'))
os.environ.setdefault('JWT_SECRET_KEY', os.environ.get('JWT_SECRET_KEY', 'fallback-jwt-key'))

try:
    # Import Flask app
    from hospital import create_app, db
    
    # Create Flask application
    app = create_app()
    
    # Initialize database for serverless
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database initialized")
        except Exception as e:
            print(f"⚠️ Database initialization warning: {e}")
    
    # Export the app for Vercel
    # Vercel will use this as the WSGI application
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    # Create a minimal Flask app as fallback
    from flask import Flask, jsonify
    app = Flask(__name__)
    
    @app.route('/api/health')
    def health():
        return jsonify({"status": "error", "message": f"Import error: {e}"})

except Exception as e:
    print(f"❌ Error: {e}")
    # Create a minimal Flask app as fallback
    from flask import Flask, jsonify
    app = Flask(__name__)
    
    @app.route('/api/health')
    def health():
        return jsonify({"status": "error", "message": f"Setup error: {e}"})

# This is what Vercel will use
def handler(request):
    return app(request.environ, lambda status, headers: None)