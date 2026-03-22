from flask import Flask, send_from_directory, request, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
from config import config
import logging
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()


def create_app(config_name="default"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # ✅ Optimized Database Connection Pool for High Performance
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "pool_pre_ping": True,  # Verify connections before using
        "pool_recycle": 280,  # Recycle connections before 5 min (AWS RDS timeout is 300s)
        "pool_size": 20,  # Increased from 10 - number of persistent connections
        "max_overflow": 40,  # Increased from 20 - additional connections when pool is full
        "pool_timeout": 30,  # Wait 30s for connection from pool before failing
        "echo_pool": False,  # Disable pool logging in production
    }

    # ✅ Logging (so Render logs show real errors)
    logging.basicConfig(level=logging.INFO)
    app.logger.setLevel(logging.INFO)

    # ✅ Professional CORS Configuration
    # Uses whitelisted origins from config.py and handles credentials correctly.
    origins = app.config.get('CORS_ORIGINS', '*')
    if isinstance(origins, str) and ',' in origins:
        origins = [o.strip() for o in origins.split(',')]
    
    CORS(
        app,
        resources={
            r"/api/*": {"origins": origins},
            r"/static/*": {"origins": origins}
        },
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        expose_headers=["Content-Type", "Authorization"]
    )

    # Note: Flask-CORS 3.0+ automatically handles OPTIONS preflights and 
    # attaches headers to error responses if properly initialized on the app.
    # The redundant manual handlers below were causing duplicate headers
    # and invalid "Credentials + Origin: *" combinations in some environments.


    # ✅ Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    # ✅ Health check endpoint
    @app.route("/")
    @app.route("/health")
    def health_check():
        return {"status": "ok", "message": "Backend is running!"}, 200

    # ✅ Debug endpoint - List all routes
    @app.route("/debug/routes")
    def list_routes():
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append(
                {
                    "endpoint": rule.endpoint,
                    "methods": list(rule.methods),
                    "path": str(rule),
                }
            )
        return {"total_routes": len(routes), "routes": routes}, 200

    # ✅ Serve static files (PDFs and other uploads)
    @app.route("/static/uploads/<path:filename>")
    def serve_static(filename):
        """Serve uploaded files (PDFs, images, etc.)"""
        from flask import make_response
        static_folder = app.static_folder or os.path.join(app.root_path, 'static')
        
        # Extract the actual filename and subdirectory from the path
        # filename might be like "reports/report_ANTH_MR298_Saqib102.pdf"
        file_parts = filename.split('/')
        if len(file_parts) > 1:
            # Has subdirectory (e.g., reports/file.pdf)
            subdirectory = '/'.join(file_parts[:-1])
            actual_filename = file_parts[-1]
            upload_path = os.path.join(static_folder, 'uploads', subdirectory)
        else:
            # No subdirectory, just filename
            actual_filename = filename
            upload_path = os.path.join(static_folder, 'uploads')
        
        response = make_response(send_from_directory(upload_path, actual_filename))
        
        # Add headers for PDF/Image viewing
        ext = actual_filename.lower().rsplit('.', 1)[-1] if '.' in actual_filename else ''
        if ext == 'pdf':
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = f'inline; filename="{actual_filename}"'
        elif ext in ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp']:
            # Browsers handle image content types well, but we can be explicit
            content_type = f'image/{ext if ext != "jpg" else "jpeg"}'
            response.headers['Content-Type'] = content_type
            response.headers['Content-Disposition'] = f'inline; filename="{actual_filename}"'
        
        return response

    # ✅ Download endpoint - Forces file download
    @app.route("/static/uploads/<path:filename>/download")
    def download_static(filename):
        """Force download of uploaded files"""
        from flask import make_response
        static_folder = app.static_folder or os.path.join(app.root_path, 'static')
        
        # Extract the actual filename and subdirectory from the path
        # filename might be like "reports/report_ANTH_MR298_Saqib102.pdf"
        file_parts = filename.split('/')
        if len(file_parts) > 1:
            # Has subdirectory (e.g., reports/file.pdf)
            subdirectory = '/'.join(file_parts[:-1])
            actual_filename = file_parts[-1]
            upload_path = os.path.join(static_folder, 'uploads', subdirectory)
        else:
            # No subdirectory, just filename
            actual_filename = filename
            upload_path = os.path.join(static_folder, 'uploads')
        
        response = make_response(send_from_directory(upload_path, actual_filename))
        
        # Force download with attachment header
        response.headers['Content-Disposition'] = f'attachment; filename="{actual_filename}"'
        
        return response

    # ✅ JWT Error Handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {"error": "Token has expired", "code": "token_expired"}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {"error": "Invalid token", "code": "invalid_token"}, 422

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {"error": "Authorization token is required", "code": "missing_token"}, 401

    @jwt.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        return {"error": "Fresh token required", "code": "fresh_token_required"}, 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return {"error": "Token has been revoked", "code": "token_revoked"}, 401

    # ✅ Register blueprints
    from hospital.routes.auth import auth_bp
    from hospital.routes.hospital_auth import hospital_auth_bp
    from hospital.routes.hospital_staff import hospital_staff_bp
    from hospital.routes.simple_doctor import simple_doctor_bp
    from hospital.routes.patients import patients_bp
    from hospital.routes.doctors import doctors_bp
    from hospital.routes.appointments import appointments_bp
    from hospital.routes.ai_services import ai_bp
    from hospital.routes.admin import admin_bp
    from hospital.routes.import_doctors import import_doctors_bp
    from hospital.routes.import_medicines import import_medicines_bp
    from hospital.routes.patient_import import patient_import_bp
    from hospital.routes.hospital_appointments import hospital_appointments_bp
    from hospital.routes.analytics import analytics_bp
    from hospital.routes.admin_settings import admin_settings_bp
    from hospital.routes.pharmacy import pharmacy_bp
    from hospital.routes.prescription_analyzer import prescription_bp
    from hospital.routes.public_ai import public_ai_bp
    from hospital.routes.db_reset import db_reset_bp
    from hospital.routes.migration import migration_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(hospital_auth_bp, url_prefix="/api/hospital-auth")
    app.register_blueprint(hospital_staff_bp, url_prefix="/api/hospital")
    app.register_blueprint(simple_doctor_bp, url_prefix="/api/simple")
    app.register_blueprint(patients_bp, url_prefix="/api/patients")
    app.register_blueprint(doctors_bp, url_prefix="/api/doctors")
    app.register_blueprint(appointments_bp, url_prefix="/api/appointments")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(admin_settings_bp)
    app.register_blueprint(import_doctors_bp, url_prefix="/api/hospital")
    app.register_blueprint(import_medicines_bp, url_prefix="/api/hospital/pharmacy")
    app.register_blueprint(patient_import_bp, url_prefix="/api/hospital")
    app.register_blueprint(hospital_appointments_bp, url_prefix="/api/hospital")
    app.register_blueprint(analytics_bp, url_prefix="/api/hospital")
    app.register_blueprint(pharmacy_bp, url_prefix="/api/hospital/pharmacy")
    app.register_blueprint(prescription_bp, url_prefix="/api/prescription")
    app.register_blueprint(public_ai_bp, url_prefix="/api/public")
    app.register_blueprint(db_reset_bp, url_prefix="/api/setup")
    app.register_blueprint(migration_bp, url_prefix="/api/migration")

    # ✅ Catch ALL backend exceptions and show them in Render logs
    from werkzeug.exceptions import HTTPException
    @app.errorhandler(Exception)
    def handle_exception(e):
        # Pass through HTTP errors
        if isinstance(e, HTTPException):
            return e
        
        app.logger.exception("🔥 UNHANDLED EXCEPTION")
        return {"error": str(e)}, 500

    return app