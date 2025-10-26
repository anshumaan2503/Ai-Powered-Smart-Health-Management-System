from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital.models import db
import json
import os
from datetime import datetime

admin_settings_bp = Blueprint('admin_settings', __name__)

# Default admin settings
DEFAULT_ADMIN_SETTINGS = {
    'system_name': 'Smart Hospital Management System',
    'system_version': '1.0.0',
    'maintenance_mode': False,
    'debug_mode': False,
    'default_hospital_settings': {
        'appointment_duration': 30,
        'advance_booking_days': 30,
        'cancellation_hours': 24,
        'currency': 'INR',
        'tax_rate': 18,
        'timezone': 'Asia/Kolkata',
        'date_format': 'DD/MM/YYYY',
        'time_format': '24h',
        'language': 'en'
    },
    'global_security': {
        'password_expiry_days': 90,
        'max_login_attempts': 5,
        'session_timeout_minutes': 60,
        'require_two_factor': False,
        'password_min_length': 8,
        'password_require_special': True
    },
    'global_notifications': {
        'email_enabled': True,
        'sms_enabled': True,
        'smtp_host': '',
        'smtp_port': 587,
        'smtp_username': '',
        'smtp_password': '',
        'sms_provider': 'twilio',
        'sms_api_key': ''
    },
    'backup_config': {
        'auto_backup': True,
        'backup_frequency': 'daily',
        'retention_days': 30,
        'backup_location': '/backups'
    },
    'audit_config': {
        'enable_audit_log': True,
        'log_retention_days': 365,
        'log_sensitive_data': False,
        'alert_on_critical_changes': True
    }
}

def get_settings_file_path():
    """Get the path to the admin settings file"""
    return os.path.join(current_app.instance_path, 'admin_settings.json')

def load_admin_settings():
    """Load admin settings from file or return defaults"""
    try:
        settings_file = get_settings_file_path()
        if os.path.exists(settings_file):
            with open(settings_file, 'r') as f:
                settings = json.load(f)
                # Merge with defaults to ensure all keys exist
                return merge_settings(DEFAULT_ADMIN_SETTINGS, settings)
        return DEFAULT_ADMIN_SETTINGS.copy()
    except Exception as e:
        current_app.logger.error(f"Error loading admin settings: {str(e)}")
        return DEFAULT_ADMIN_SETTINGS.copy()

def save_admin_settings(settings):
    """Save admin settings to file"""
    try:
        settings_file = get_settings_file_path()
        os.makedirs(os.path.dirname(settings_file), exist_ok=True)
        
        # Add metadata
        settings['last_updated'] = datetime.utcnow().isoformat()
        settings['updated_by'] = get_jwt_identity() if get_jwt_identity() else 'system'
        
        with open(settings_file, 'w') as f:
            json.dump(settings, f, indent=2)
        return True
    except Exception as e:
        current_app.logger.error(f"Error saving admin settings: {str(e)}")
        return False

def merge_settings(defaults, user_settings):
    """Recursively merge user settings with defaults"""
    result = defaults.copy()
    for key, value in user_settings.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_settings(result[key], value)
        else:
            result[key] = value
    return result

def validate_admin_settings(settings):
    """Validate admin settings"""
    errors = []
    
    # System validation
    if not settings.get('system_name', '').strip():
        errors.append('System name is required')
    
    if not settings.get('system_version', '').strip():
        errors.append('System version is required')
    
    # Security validation
    security = settings.get('global_security', {})
    if security.get('password_min_length', 0) < 6:
        errors.append('Password minimum length must be at least 6')
    
    if security.get('max_login_attempts', 0) < 1:
        errors.append('Max login attempts must be at least 1')
    
    # Notification validation
    notifications = settings.get('global_notifications', {})
    if notifications.get('smtp_port', 0) < 1 or notifications.get('smtp_port', 0) > 65535:
        errors.append('SMTP port must be between 1 and 65535')
    
    # Backup validation
    backup = settings.get('backup_config', {})
    if backup.get('retention_days', 0) < 1:
        errors.append('Backup retention days must be at least 1')
    
    return errors

@admin_settings_bp.route('/api/admin/settings', methods=['GET'])
@jwt_required()
def get_admin_settings():
    """Get admin settings"""
    try:
        # Check if user is admin (you might want to implement proper admin role checking)
        current_user = get_jwt_identity()
        if not current_user:
            return jsonify({'error': 'Unauthorized'}), 401
        
        settings = load_admin_settings()
        return jsonify(settings), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting admin settings: {str(e)}")
        return jsonify({'error': 'Failed to load settings'}), 500

@admin_settings_bp.route('/api/admin/settings', methods=['PUT'])
@jwt_required()
def update_admin_settings():
    """Update admin settings"""
    try:
        # Check if user is admin
        current_user = get_jwt_identity()
        if not current_user:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate settings
        validation_errors = validate_admin_settings(data)
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'details': validation_errors
            }), 400
        
        # Save settings
        if save_admin_settings(data):
            # Log the change (you might want to implement proper audit logging)
            current_app.logger.info(f"Admin settings updated by {current_user}")
            
            return jsonify({
                'message': 'Settings updated successfully',
                'settings': data
            }), 200
        else:
            return jsonify({'error': 'Failed to save settings'}), 500
            
    except Exception as e:
        current_app.logger.error(f"Error updating admin settings: {str(e)}")
        return jsonify({'error': 'Failed to update settings'}), 500

@admin_settings_bp.route('/api/admin/settings/export', methods=['GET'])
@jwt_required()
def export_admin_settings():
    """Export admin settings"""
    try:
        current_user = get_jwt_identity()
        if not current_user:
            return jsonify({'error': 'Unauthorized'}), 401
        
        settings = load_admin_settings()
        
        # Add export metadata
        export_data = {
            'exported_at': datetime.utcnow().isoformat(),
            'exported_by': current_user,
            'version': settings.get('system_version', '1.0.0'),
            'settings': settings
        }
        
        return jsonify(export_data), 200
        
    except Exception as e:
        current_app.logger.error(f"Error exporting admin settings: {str(e)}")
        return jsonify({'error': 'Failed to export settings'}), 500

@admin_settings_bp.route('/api/admin/settings/reset', methods=['POST'])
@jwt_required()
def reset_admin_settings():
    """Reset admin settings to defaults"""
    try:
        current_user = get_jwt_identity()
        if not current_user:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Save default settings
        if save_admin_settings(DEFAULT_ADMIN_SETTINGS.copy()):
            current_app.logger.info(f"Admin settings reset to defaults by {current_user}")
            
            return jsonify({
                'message': 'Settings reset to defaults successfully',
                'settings': DEFAULT_ADMIN_SETTINGS
            }), 200
        else:
            return jsonify({'error': 'Failed to reset settings'}), 500
            
    except Exception as e:
        current_app.logger.error(f"Error resetting admin settings: {str(e)}")
        return jsonify({'error': 'Failed to reset settings'}), 500

@admin_settings_bp.route('/api/admin/settings/validate', methods=['POST'])
@jwt_required()
def validate_settings():
    """Validate admin settings without saving"""
    try:
        current_user = get_jwt_identity()
        if not current_user:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        validation_errors = validate_admin_settings(data)
        
        return jsonify({
            'valid': len(validation_errors) == 0,
            'errors': validation_errors
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error validating admin settings: {str(e)}")
        return jsonify({'error': 'Failed to validate settings'}), 500