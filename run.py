import os
from hospital import create_app, db
from flask_migrate import upgrade

def deploy():
    """Run deployment tasks."""
    app = create_app(os.getenv('FLASK_CONFIG') or 'default')
    
    with app.app_context():
        # Create database tables
        db.create_all()
        
        # Migrate database to latest revision
        try:
            upgrade()
        except:
            pass

if __name__ == '__main__':
    app = create_app(os.getenv('FLASK_CONFIG') or 'development')
    
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, host='0.0.0.0', port=5000)