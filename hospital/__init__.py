from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from config import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # ✅ Allowed frontend origins (add both old & new)
    ALLOWED_ORIGINS = {
        "https://hospital-management-frontend-0421.onrender.com",
        "https://hospital-management-frontend-6kel.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    }

    # ✅ Handle OPTIONS preflight properly
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            origin = request.headers.get("Origin")

            response = app.make_response("")
            response.status_code = 200

            # Only allow known origins (safe)
            if origin in ALLOWED_ORIGINS:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"

            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response.headers["Access-Control-Max-Age"] = "3600"
            return response

    # ✅ Add CORS headers on every response (guaranteed)
    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get("Origin")

        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"

        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    # ✅ Health check endpoint
    @app.route('/')
    @app.route('/health')
    def health_check():
        return {'status': 'ok', 'message': 'Backend is running!'}, 200

    # ✅ Debug endpoint - List all routes
    @app.route('/debug/routes')
    def list_routes():
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods),
                'path': str(rule)
            })
        return {'total_routes': len(routes), 'routes': routes}, 200

    # JWT Error Handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'error': 'Token has expired', 'code': 'token_expired'}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {'error': 'Invalid token', 'code': 'invalid_token'}, 422

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {'error': 'Authorization token is required', 'code': 'missing_token'}, 401

    @jwt.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        return {'error': 'Fresh token required', 'code': 'fresh_token_required'}, 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return {'error': 'Token has been revoked', 'code': 'token_revoked'}, 401

    # Register blueprints
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

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(hospital_auth_bp, url_prefix='/api/hospital-auth')
    app.register_blueprint(hospital_staff_bp, url_prefix='/api/hospital')
    app.register_blueprint(simple_doctor_bp, url_prefix='/api/simple')
    app.register_blueprint(patients_bp, url_prefix='/api/patients')
    app.register_blueprint(doctors_bp, url_prefix='/api/doctors')
    app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_settings_bp)
    app.register_blueprint(import_doctors_bp, url_prefix='/api/hospital')
    app.register_blueprint(import_medicines_bp, url_prefix='/api/hospital/pharmacy')
    app.register_blueprint(patient_import_bp, url_prefix='/api/hospital')
    app.register_blueprint(hospital_appointments_bp, url_prefix='/api/hospital')
    app.register_blueprint(analytics_bp, url_prefix='/api/hospital')
    app.register_blueprint(pharmacy_bp, url_prefix='/api/hospital/pharmacy')
    app.register_blueprint(prescription_bp, url_prefix='/api/prescription')
    app.register_blueprint(public_ai_bp, url_prefix='/api/public')

    return app
