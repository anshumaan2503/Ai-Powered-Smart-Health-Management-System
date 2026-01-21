#!/usr/bin/env python3
"""
WSGI entry point for production deployment
"""
import os
import sys
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

# Ensure the project root is in the path
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Set production environment
os.environ.setdefault('FLASK_ENV', 'production')
os.environ.setdefault('FLASK_CONFIG', 'production')

try:
    logger.info("=" * 60)
    logger.info("🔄 Initializing Flask application...")
    logger.info(f"Python version: {sys.version}")
    logger.info(f"Project root: {project_root}")
    
    from hospital import create_app, db
    logger.info("✅ Successfully imported create_app and db")
    
    # Create Flask app
    app = create_app('production')
    logger.info("✅ Flask app created successfully")
    
    # Log all registered routes
    logger.info(f"📋 Total routes registered: {len(list(app.url_map.iter_rules()))}")
    for rule in app.url_map.iter_rules():
        logger.info(f"  → {rule.methods} {rule.rule} -> {rule.endpoint}")
    
    # Initialize database
    with app.app_context():
        try:
            db.create_all()
            logger.info("✅ Database initialized")
        except Exception as db_error:
            logger.error(f"⚠️  Database initialization failed (non-fatal): {db_error}")
    
    logger.info("✅ WSGI application ready!")
    logger.info("=" * 60)
    
except Exception as e:
    logger.error("=" * 60)
    logger.error(f"❌ FATAL ERROR during initialization!")
    logger.error(f"Error type: {type(e).__name__}")
    logger.error(f"Error message: {e}")
    logger.error("=" * 60)
    import traceback
    traceback.print_exc()
    
    # Create a minimal Flask app that shows the error
    from flask import Flask
    app = Flask(__name__)
    
    @app.route('/')
    @app.route('/<path:path>')
    def error_page(path=''):
        return {
            'error': 'Application failed to initialize',
            'details': str(e),
            'type': type(e).__name__
        }, 500

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
