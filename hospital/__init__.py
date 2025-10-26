from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from config import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)
    mail.init_app(app)
    
    # Register blueprints
    from hospital.routes.auth import auth_bp
    from hospital.routes.hospital_auth import hospital_auth_bp
    from hospital.routes.hospital_staff import hospital_staff_bp
    from hospital.routes.simple_doctor import simple_doctor_bp
    # from hospital.routes.patients import patients_bp  # Disabled for now
    from hospital.routes.doctors import doctors_bp
    # from hospital.routes.appointments import appointments_bp  # Disabled for now
    from hospital.routes.ai_services import ai_bp
    from hospital.routes.admin import admin_bp
    from hospital.routes.import_doctors import import_doctors_bp
    # from hospital.routes.patient_import import patient_import_bp  # Disabled for now
    # from hospital.routes.hospital_appointments import hospital_appointments_bp  # Disabled for now
    # from hospital.routes.analytics import analytics_bp  # Disabled for now
    # from hospital.routes.subscription import subscription_bp  # Disabled for now
    from hospital.routes.admin_settings import admin_settings_bp
    from hospital.routes.pharmacy import pharmacy_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(hospital_auth_bp, url_prefix='/api/hospital-auth')
    app.register_blueprint(hospital_staff_bp, url_prefix='/api/hospital')
    app.register_blueprint(simple_doctor_bp, url_prefix='/api/simple')
    # app.register_blueprint(patients_bp, url_prefix='/api/patients')  # Disabled for now
    app.register_blueprint(doctors_bp, url_prefix='/api/doctors')
    # app.register_blueprint(appointments_bp, url_prefix='/api/appointments')  # Disabled for now
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_settings_bp)
    app.register_blueprint(import_doctors_bp, url_prefix='/api/hospital')
    # app.register_blueprint(patient_import_bp, url_prefix='/api/hospital')  # Disabled for now
    # app.register_blueprint(hospital_appointments_bp, url_prefix='/api/hospital')  # Disabled for now
    # app.register_blueprint(analytics_bp, url_prefix='/api/hospital')  # Disabled for now
    # app.register_blueprint(subscription_bp, url_prefix='/api/hospital')  # Disabled for now
    app.register_blueprint(pharmacy_bp, url_prefix='/api/hospital/pharmacy')
    
    return app