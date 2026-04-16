from datetime import datetime, timedelta

PLAN_CONFIGS = {
    'trial': {
        'max_patients': 10,
        'max_doctors': 1,
        'max_staff': 1,
        'monthly_fee': 0.0,
        'features': ['appointments', 'records', 'email_support']
    },
    'basic': {
        'max_patients': 25,
        'max_doctors': 2,
        'max_staff': 5,
        'monthly_fee': 2999.0,
        'features': ['appointments', 'billing', 'records', 'email_support', 'mobile_app']
    },
    'standard': {
        'max_patients': 100,
        'max_doctors': 10,
        'max_staff': 20,
        'monthly_fee': 7499.0,
        'features': [
            'appointments', 'billing', 'records', 'email_support', 'mobile_app',
            'analytics', 'whatsapp_notifications', 'data_export', 'priority_support',
            'patient_portal', 'inventory'
        ]
    },
    'premium': {
        'max_patients': 200,
        'max_doctors': 25,
        'max_staff': 50,
        'monthly_fee': 12999.0,
        'features': [
            'appointments', 'billing', 'records', 'analytics', 'whatsapp', 
            'priority_support', 'patient_portal', 'advanced_analytics', 
            'custom_reports', 'api_access'
        ]
    },
    'enterprise': {
        'max_patients': -1,
        'max_doctors': -1,
        'max_staff': -1,
        'monthly_fee': 17999.0,
        'features': [
            'appointments', 'billing', 'records', 'email_support', 'mobile_app',
            'analytics', 'whatsapp_notifications', 'data_export', 'priority_support',
            'patient_portal', 'inventory', 'cloud_backup', '24_7_support',
            'role_based_access', 'advanced_analytics', 'api_access',
            'multi_location', 'custom_integrations', 'account_manager', 'sla'
        ]
    }
}
