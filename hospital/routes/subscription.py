from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from hospital import db
from hospital.models.hospital_subscription import HospitalSubscription
from hospital.models import Hospital, User, Patient, Doctor

subscription_bp = Blueprint('subscription', __name__)

@subscription_bp.route('/subscription', methods=['GET'])
@jwt_required()
def get_subscription():
    """Get current hospital subscription details"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user['id'])
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'Hospital not found'}), 404
            
        # Get current subscription
        subscription = HospitalSubscription.query.filter_by(
            hospital_id=user.hospital_id,
            is_active=True
        ).first()
        
        if not subscription:
            # Create default subscription if none exists
            subscription = HospitalSubscription(
                hospital_id=user.hospital_id,
                plan_name='basic',
                max_patients=25,
                max_doctors=2,
                max_staff=5,
                features=['appointments', 'billing', 'records'],
                subscription_start=datetime.utcnow().date(),
                subscription_end=(datetime.utcnow() + timedelta(days=30)).date(),
                monthly_fee=2999.0
            )
            db.session.add(subscription)
            db.session.commit()
        
        # Get usage statistics
        usage_stats = subscription.get_usage_stats()
        
        return jsonify({
            'subscription': subscription.to_dict(),
            'usage_stats': usage_stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/subscription/upgrade', methods=['POST'])
@jwt_required()
def upgrade_subscription():
    """Upgrade hospital subscription plan"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user['id'])
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'Hospital not found'}), 404
            
        data = request.get_json()
        new_plan = data.get('plan_name')
        billing_cycle = data.get('billing_cycle', 'monthly')  # monthly or annual
        
        # Plan configurations
        plan_configs = {
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
            'enterprise': {
                'max_patients': -1,  # Unlimited
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
        
        if new_plan not in plan_configs:
            return jsonify({'error': 'Invalid plan selected'}), 400
            
        # Get current subscription
        current_subscription = HospitalSubscription.query.filter_by(
            hospital_id=user.hospital_id,
            is_active=True
        ).first()
        
        if current_subscription:
            # Deactivate current subscription
            current_subscription.is_active = False
            current_subscription.updated_at = datetime.utcnow()
        
        # Create new subscription
        config = plan_configs[new_plan]
        monthly_fee = config['monthly_fee']
        
        # Apply annual discount (20% off)
        if billing_cycle == 'annual':
            monthly_fee = monthly_fee * 0.8
            
        new_subscription = HospitalSubscription(
            hospital_id=user.hospital_id,
            plan_name=new_plan,
            max_patients=config['max_patients'],
            max_doctors=config['max_doctors'],
            max_staff=config['max_staff'],
            features=config['features'],
            subscription_start=datetime.utcnow().date(),
            subscription_end=(datetime.utcnow() + timedelta(days=365 if billing_cycle == 'annual' else 30)).date(),
            monthly_fee=monthly_fee
        )
        
        db.session.add(new_subscription)
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully upgraded to {new_plan} plan',
            'subscription': new_subscription.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/subscription/usage', methods=['GET'])
@jwt_required()
def get_usage_stats():
    """Get detailed usage statistics"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user['id'])
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'Hospital not found'}), 404
            
        subscription = HospitalSubscription.query.filter_by(
            hospital_id=user.hospital_id,
            is_active=True
        ).first()
        
        if not subscription:
            return jsonify({'error': 'No active subscription found'}), 404
            
        usage_stats = subscription.get_usage_stats()
        
        # Add additional usage metrics
        from hospital.models.appointment import Appointment
        
        # Get monthly appointment count
        current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_appointments = Appointment.query.filter(
            Appointment.hospital_id == user.hospital_id,
            Appointment.created_at >= current_month_start
        ).count()
        
        # Get storage usage (mock data for now)
        storage_used_gb = 2.3  # This would be calculated from actual file storage
        
        usage_stats.update({
            'monthly_appointments': monthly_appointments,
            'storage_used_gb': storage_used_gb,
            'storage_limit_gb': subscription.max_staff * 2 if subscription.max_staff > 0 else -1  # Mock calculation
        })
        
        return jsonify({
            'usage_stats': usage_stats,
            'subscription_limits': {
                'max_patients': subscription.max_patients,
                'max_doctors': subscription.max_doctors,
                'max_staff': subscription.max_staff
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/subscription/billing-history', methods=['GET'])
@jwt_required()
def get_billing_history():
    """Get billing history for the hospital"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user['id'])
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'Hospital not found'}), 404
            
        # Get all subscriptions for this hospital (including inactive ones)
        subscriptions = HospitalSubscription.query.filter_by(
            hospital_id=user.hospital_id
        ).order_by(HospitalSubscription.created_at.desc()).all()
        
        billing_history = []
        for sub in subscriptions:
            billing_history.append({
                'id': sub.id,
                'date': sub.subscription_start.isoformat(),
                'plan_name': sub.plan_name,
                'amount': sub.monthly_fee,
                'status': 'paid' if sub.is_active or sub.subscription_end < datetime.utcnow().date() else 'pending',
                'billing_period': f"{sub.subscription_start.strftime('%b %Y')} - {sub.subscription_end.strftime('%b %Y')}",
                'features_count': len(sub.features) if sub.features else 0
            })
        
        return jsonify({
            'billing_history': billing_history,
            'total_records': len(billing_history)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/subscription/check-limits', methods=['POST'])
@jwt_required()
def check_limits():
    """Check if action is allowed based on subscription limits"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user['id'])
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'Hospital not found'}), 404
            
        data = request.get_json()
        action_type = data.get('action_type')  # 'add_patient', 'add_doctor', 'add_staff'
        
        subscription = HospitalSubscription.query.filter_by(
            hospital_id=user.hospital_id,
            is_active=True
        ).first()
        
        if not subscription:
            return jsonify({'error': 'No active subscription found'}), 404
            
        usage_stats = subscription.get_usage_stats()
        
        # Check limits based on action type
        allowed = True
        message = "Action allowed"
        
        if action_type == 'add_patient':
            if subscription.max_patients != -1:  # Not unlimited
                if usage_stats['patients']['current'] >= subscription.max_patients:
                    allowed = False
                    message = f"Patient limit reached ({subscription.max_patients}). Please upgrade your plan."
                    
        elif action_type == 'add_doctor':
            if subscription.max_doctors != -1:  # Not unlimited
                if usage_stats['doctors']['current'] >= subscription.max_doctors:
                    allowed = False
                    message = f"Doctor limit reached ({subscription.max_doctors}). Please upgrade your plan."
                    
        elif action_type == 'add_staff':
            if subscription.max_staff != -1:  # Not unlimited
                if usage_stats['staff']['current'] >= subscription.max_staff:
                    allowed = False
                    message = f"Staff limit reached ({subscription.max_staff}). Please upgrade your plan."
        
        return jsonify({
            'allowed': allowed,
            'message': message,
            'current_usage': usage_stats,
            'subscription_plan': subscription.plan_name
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/subscription/features', methods=['GET'])
@jwt_required()
def get_enabled_features():
    """Get list of enabled features for current subscription"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user['id'])
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'Hospital not found'}), 404
            
        subscription = HospitalSubscription.query.filter_by(
            hospital_id=user.hospital_id,
            is_active=True
        ).first()
        
        if not subscription:
            return jsonify({'error': 'No active subscription found'}), 404
            
        return jsonify({
            'enabled_features': subscription.features or [],
            'plan_name': subscription.plan_name,
            'subscription_active': subscription.is_active
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500