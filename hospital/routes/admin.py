from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from hospital import db
from hospital.models import Hospital, User, Doctor
from hospital.models.hospital_subscription import HospitalSubscription
from hospital.models.appointment import Appointment

admin_bp = Blueprint('admin', __name__)

# Simple admin authentication (for development only)
def verify_admin_token():
    """Verify admin token - in production, use proper JWT validation"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return False
    
    token = auth_header.split(' ')[1]
    return token == 'admin_authenticated'

@admin_bp.route('/dashboard/stats', methods=['GET'])
def get_admin_dashboard_stats():
    """Get overall platform statistics for admin dashboard"""
    try:
        if not verify_admin_token():
            return jsonify({'error': 'Unauthorized access'}), 401
        
        # Get total counts (excluding deleted hospitals)
        total_hospitals = Hospital.query.filter(~Hospital.name.like('[DELETED]%')).count()
        total_users = User.query.count()
        total_patients = 0  # Placeholder - patients functionality disabled
        total_doctors = Doctor.query.count()
        total_appointments = Appointment.query.count()
        
        # Get active subscriptions
        active_subscriptions = HospitalSubscription.query.filter_by(is_active=True).count()
        
        # Calculate total revenue
        active_subs = HospitalSubscription.query.filter_by(is_active=True).all()
        total_revenue = sum(sub.monthly_fee for sub in active_subs)
        
        # Get new hospitals this month (excluding deleted)
        current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_hospitals_this_month = Hospital.query.filter(
            Hospital.created_at >= current_month_start,
            ~Hospital.name.like('[DELETED]%')
        ).count()
        
        # Calculate revenue growth (mock calculation)
        revenue_growth = 15.2  # This would be calculated from historical data
        
        return jsonify({
            'stats': {
                'totalHospitals': total_hospitals,
                'activeSubscriptions': active_subscriptions,
                'totalRevenue': total_revenue,
                'totalUsers': total_users,
                'totalPatients': total_patients,
                'totalDoctors': total_doctors,
                'totalAppointments': total_appointments,
                'newHospitalsThisMonth': new_hospitals_this_month,
                'revenueGrowth': revenue_growth
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/hospitals', methods=['GET'])
def get_all_hospitals():
    """Get all registered hospitals with their details"""
    try:
        if not verify_admin_token():
            return jsonify({'error': 'Unauthorized access'}), 401
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        status_filter = request.args.get('status', 'all')
        plan_filter = request.args.get('plan', 'all')
        
        # Base query - exclude deleted hospitals
        query = Hospital.query.filter(~Hospital.name.like('[DELETED]%'))
        
        # Apply search filter
        if search:
            query = query.filter(
                Hospital.name.ilike(f'%{search}%') |
                Hospital.email.ilike(f'%{search}%') |
                Hospital.address.ilike(f'%{search}%')
            )
        
        # Get hospitals with pagination
        hospitals_pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        hospitals_data = []
        for hospital in hospitals_pagination.items:
            # Get subscription info
            subscription = HospitalSubscription.query.filter_by(
                hospital_id=hospital.id,
                is_active=True
            ).first()
            
            # Get usage statistics
            patient_count = 0  # Placeholder - patients functionality disabled
            doctor_count = Doctor.query.filter_by(hospital_id=hospital.id).count()
            staff_count = User.query.filter_by(hospital_id=hospital.id).count()
            
            # Get last login (from most recent user login)
            # Note: User model might not have last_login field, so we'll use created_at as fallback
            try:
                last_user_login = User.query.filter_by(hospital_id=hospital.id)\
                    .order_by(User.last_login.desc()).first()
            except AttributeError:
                # Fallback to using created_at if last_login doesn't exist
                last_user_login = User.query.filter_by(hospital_id=hospital.id)\
                    .order_by(User.created_at.desc()).first()
            
            hospital_data = {
                'id': hospital.id,
                'name': hospital.name,
                'email': hospital.email,
                'phone': hospital.phone,
                'address': hospital.address,
                'registeredDate': hospital.created_at.isoformat() if hospital.created_at else None,
                'lastLogin': (last_user_login.last_login.isoformat() if hasattr(last_user_login, 'last_login') and last_user_login.last_login 
                             else last_user_login.created_at.isoformat() if last_user_login and last_user_login.created_at 
                             else None),
                'subscription': {
                    'plan': subscription.plan_name if subscription else 'none',
                    'status': 'active' if subscription and subscription.is_active else 'inactive',
                    'monthlyFee': subscription.monthly_fee if subscription else 0,
                    'expiryDate': subscription.subscription_end.isoformat() if subscription else None
                },
                'stats': {
                    'totalPatients': patient_count,
                    'totalDoctors': doctor_count,
                    'totalStaff': staff_count,
                    'monthlyRevenue': subscription.monthly_fee if subscription and subscription.is_active else 0
                }
            }
            
            # Apply filters
            if status_filter != 'all':
                if hospital_data['subscription']['status'] != status_filter:
                    continue
                    
            if plan_filter != 'all':
                if hospital_data['subscription']['plan'] != plan_filter:
                    continue
            
            hospitals_data.append(hospital_data)
        
        return jsonify({
            'hospitals': hospitals_data,
            'pagination': {
                'page': hospitals_pagination.page,
                'pages': hospitals_pagination.pages,
                'per_page': hospitals_pagination.per_page,
                'total': hospitals_pagination.total,
                'has_next': hospitals_pagination.has_next,
                'has_prev': hospitals_pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/hospitals/<int:hospital_id>', methods=['GET'])
def get_hospital_details(hospital_id):
    """Get detailed information about a specific hospital"""
    try:
        if not verify_admin_token():
            return jsonify({'error': 'Unauthorized access'}), 401
        
        hospital = Hospital.query.get_or_404(hospital_id)
        
        # Get subscription
        subscription = HospitalSubscription.query.filter_by(
            hospital_id=hospital.id,
            is_active=True
        ).first()
        
        # Get detailed statistics
        patients = []  # Placeholder - patients functionality disabled
        doctors = Doctor.query.filter_by(hospital_id=hospital.id).all()
        staff = User.query.filter_by(hospital_id=hospital.id).all()
        appointments = Appointment.query.filter_by(hospital_id=hospital.id).all()
        
        # Get recent activity
        recent_patients = []  # Placeholder - patients functionality disabled
        recent_appointments = Appointment.query.filter_by(hospital_id=hospital.id)\
            .order_by(Appointment.created_at.desc()).limit(5).all()
        
        hospital_data = {
            'id': hospital.id,
            'name': hospital.name,
            'email': hospital.email,
            'phone': hospital.phone,
            'address': hospital.address,
            'registeredDate': hospital.created_at.isoformat() if hospital.created_at else None,
            'subscription': subscription.to_dict() if subscription else None,
            'stats': {
                'totalPatients': len(patients),
                'totalDoctors': len(doctors),
                'totalStaff': len(staff),
                'totalAppointments': len(appointments),
                'monthlyRevenue': subscription.monthly_fee if subscription and subscription.is_active else 0
            },
            'recentActivity': {
                'patients': [],  # Placeholder - patients functionality disabled
                'appointments': [a.to_dict() for a in recent_appointments]
            }
        }
        
        return jsonify({'hospital': hospital_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/subscriptions', methods=['GET'])
def get_all_subscriptions():
    """Get all subscriptions with filtering options"""
    try:
        if not verify_admin_token():
            return jsonify({'error': 'Unauthorized access'}), 401
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        status_filter = request.args.get('status', 'all')
        plan_filter = request.args.get('plan', 'all')
        
        # Base query with hospital join - exclude deleted hospitals
        query = db.session.query(HospitalSubscription, Hospital)\
            .join(Hospital, HospitalSubscription.hospital_id == Hospital.id)\
            .filter(~Hospital.name.like('[DELETED]%'))
        
        # Apply search filter
        if search:
            query = query.filter(Hospital.name.ilike(f'%{search}%'))
        
        # Apply status filter
        if status_filter != 'all':
            if status_filter == 'active':
                query = query.filter(HospitalSubscription.is_active == True)
            elif status_filter == 'expired':
                query = query.filter(
                    HospitalSubscription.subscription_end < datetime.utcnow().date()
                )
            elif status_filter == 'trial':
                query = query.filter(HospitalSubscription.monthly_fee == 0)
        
        # Apply plan filter
        if plan_filter != 'all':
            query = query.filter(HospitalSubscription.plan_name == plan_filter)
        
        # Get results with pagination
        subscriptions = query.all()
        
        subscriptions_data = []
        for subscription, hospital in subscriptions:
            # Get usage statistics
            usage_stats = subscription.get_usage_stats()
            
            # Determine status
            status = 'active'
            if not subscription.is_active:
                status = 'inactive'
            elif subscription.subscription_end < datetime.utcnow().date():
                status = 'expired'
            elif subscription.monthly_fee == 0:
                status = 'trial'
            
            subscription_data = {
                'id': subscription.id,
                'hospitalId': hospital.id,
                'hospitalName': hospital.name,
                'currentPlan': subscription.plan_name,
                'status': status,
                'monthlyFee': subscription.monthly_fee,
                'billingCycle': 'monthly',  # This would be stored in the model
                'startDate': subscription.subscription_start.isoformat(),
                'expiryDate': subscription.subscription_end.isoformat(),
                'autoRenew': True,  # This would be stored in the model
                'usage': {
                    'patients': usage_stats['patients']['current'],
                    'doctors': usage_stats['doctors']['current'],
                    'storage': 2.3  # Mock storage usage
                },
                'limits': {
                    'patients': subscription.max_patients,
                    'doctors': subscription.max_doctors,
                    'storage': subscription.max_staff * 2 if subscription.max_staff > 0 else -1
                }
            }
            
            subscriptions_data.append(subscription_data)
        
        return jsonify({
            'subscriptions': subscriptions_data,
            'total': len(subscriptions_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/subscriptions/<int:subscription_id>/upgrade', methods=['POST'])
def admin_upgrade_subscription(subscription_id):
    """Admin endpoint to manually upgrade/modify a subscription"""
    try:
        if not verify_admin_token():
            return jsonify({'error': 'Unauthorized access'}), 401
        
        data = request.get_json()
        new_plan = data.get('newPlan')
        billing_cycle = data.get('billingCycle', 'monthly')
        effective_date = data.get('effectiveDate')
        
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
        
        if new_plan not in plan_configs:
            return jsonify({'error': 'Invalid plan selected'}), 400
        
        # Get current subscription
        subscription = HospitalSubscription.query.get_or_404(subscription_id)
        
        # Update subscription
        config = plan_configs[new_plan]
        monthly_fee = config['monthly_fee']
        
        # Apply annual discount (20% off)
        if billing_cycle == 'annual':
            monthly_fee = monthly_fee * 0.8
        
        subscription.plan_name = new_plan
        subscription.max_patients = config['max_patients']
        subscription.max_doctors = config['max_doctors']
        subscription.max_staff = config['max_staff']
        subscription.features = config['features']
        subscription.monthly_fee = monthly_fee
        subscription.updated_at = datetime.utcnow()
        
        # Update dates if provided
        if effective_date:
            subscription.subscription_start = datetime.strptime(effective_date, '%Y-%m-%d').date()
            # Extend subscription by 1 year from effective date
            subscription.subscription_end = (
                datetime.strptime(effective_date, '%Y-%m-%d') + 
                timedelta(days=365 if billing_cycle == 'annual' else 30)
            ).date()
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully updated subscription to {new_plan} plan',
            'subscription': subscription.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/subscriptions/<int:subscription_id>/extend', methods=['POST'])
def extend_subscription(subscription_id):
    """Extend subscription expiry date"""
    try:
        if not verify_admin_token():
            return jsonify({'error': 'Unauthorized access'}), 401
        
        data = request.get_json()
        extend_days = data.get('days', 30)
        
        subscription = HospitalSubscription.query.get_or_404(subscription_id)
        
        # Extend the subscription
        subscription.subscription_end = subscription.subscription_end + timedelta(days=extend_days)
        subscription.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': f'Subscription extended by {extend_days} days',
            'newExpiryDate': subscription.subscription_end.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/hospitals/<int:hospital_id>/edit', methods=['PUT'])
def update_hospital(hospital_id):
    """Update hospital information"""
    try:
        if not verify_admin_token():
            return jsonify({'error': 'Unauthorized access'}), 401
        
        data = request.get_json()
        hospital = Hospital.query.get_or_404(hospital_id)
        
        # Update hospital fields
        if 'name' in data:
            hospital.name = data['name']
        if 'email' in data:
            hospital.email = data['email']
        if 'phone' in data:
            hospital.phone = data['phone']
        if 'address' in data:
            hospital.address = data['address']
        
        hospital.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Hospital updated successfully',
            'hospital': {
                'id': hospital.id,
                'name': hospital.name,
                'email': hospital.email,
                'phone': hospital.phone,
                'address': hospital.address
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/hospitals/<int:hospital_id>/change-password', methods=['POST'])
def change_hospital_password(hospital_id):
    """Change password for hospital admin user"""
    try:
        if not verify_admin_token():
            return jsonify({'error': 'Unauthorized access'}), 401
        
        data = request.get_json()
        new_password = data.get('newPassword')
        confirm_password = data.get('confirmPassword')
        
        if not new_password or not confirm_password:
            return jsonify({'error': 'Both password fields are required'}), 400
        
        if new_password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Get hospital
        hospital = Hospital.query.get_or_404(hospital_id)
        
        # Find the hospital admin user
        hospital_user = User.query.filter_by(hospital_id=hospital_id).first()
        
        if not hospital_user:
            return jsonify({'error': 'No user found for this hospital'}), 404
        
        # Update password using the user's set_password method (uses bcrypt)
        hospital_user.set_password(new_password)
        hospital_user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': f'Password successfully updated for {hospital.name}',
            'hospitalName': hospital.name,
            'userEmail': hospital_user.email
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/hospitals/<int:hospital_id>/reset-password', methods=['POST'])
def reset_hospital_password(hospital_id):
    """Reset hospital password to default (123)"""
    try:
        if not verify_admin_token():
            return jsonify({'error': 'Unauthorized access'}), 401
        
        # Get hospital
        hospital = Hospital.query.get_or_404(hospital_id)
        
        # Find the hospital admin user
        hospital_user = User.query.filter_by(hospital_id=hospital_id).first()
        
        if not hospital_user:
            return jsonify({'error': 'No user found for this hospital'}), 404
        
        # Reset password to default
        default_password = '123'
        hospital_user.set_password(default_password)
        hospital_user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': f'Password reset to default for {hospital.name}',
            'hospitalName': hospital.name,
            'userEmail': hospital_user.email,
            'newPassword': default_password
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/hospitals/<int:hospital_id>/delete', methods=['DELETE'])
def delete_hospital(hospital_id):
    """Delete a hospital (soft delete by deactivating)"""
    try:
        if not verify_admin_token():
            return jsonify({'error': 'Unauthorized access'}), 401
        
        data = request.get_json() or {}
        confirmation_name = data.get('confirmationName', '')
        
        hospital = Hospital.query.get_or_404(hospital_id)
        
        # Require exact name confirmation for safety
        if confirmation_name != hospital.name:
            return jsonify({
                'error': 'Hospital name confirmation does not match. Please type the exact hospital name to confirm deletion.'
            }), 400
        
        # Store original name for response
        original_name = hospital.name
        
        # Deactivate all subscriptions for this hospital
        subscriptions = HospitalSubscription.query.filter_by(hospital_id=hospital_id).all()
        for sub in subscriptions:
            sub.is_active = False
            sub.updated_at = datetime.utcnow()
        
        # Mark hospital as deleted (soft delete)
        hospital.name = f"[DELETED] {original_name}"
        hospital.email = f"deleted_{hospital_id}@deleted.com"  # Prevent email conflicts
        hospital.updated_at = datetime.utcnow()
        
        # You could also add a deleted_at timestamp field if you modify the model
        
        db.session.commit()
        
        return jsonify({
            'message': f'Hospital "{original_name}" has been successfully deactivated and all associated subscriptions have been cancelled.'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/analytics/overview', methods=['GET'])
def get_admin_analytics():
    """Get comprehensive analytics for admin dashboard"""
    try:
        if not verify_admin_token():
            return jsonify({'error': 'Unauthorized access'}), 401
        
        # Get subscription distribution
        subscription_stats = db.session.query(
            HospitalSubscription.plan_name,
            db.func.count(HospitalSubscription.id).label('count'),
            db.func.sum(HospitalSubscription.monthly_fee).label('revenue')
        ).filter_by(is_active=True).group_by(HospitalSubscription.plan_name).all()
        
        plan_distribution = []
        for stat in subscription_stats:
            plan_distribution.append({
                'plan': stat.plan_name,
                'count': stat.count,
                'revenue': float(stat.revenue) if stat.revenue else 0
            })
        
        # Get monthly growth data (mock data for now)
        monthly_growth = [
            {'month': 'Jan', 'hospitals': 8, 'revenue': 450000},
            {'month': 'Feb', 'hospitals': 10, 'revenue': 580000},
            {'month': 'Mar', 'hospitals': 12, 'revenue': 720000},
            {'month': 'Apr', 'hospitals': 15, 'revenue': 890000}
        ]
        
        # Get recent registrations (excluding deleted)
        recent_hospitals = Hospital.query.filter(~Hospital.name.like('[DELETED]%')).order_by(Hospital.created_at.desc()).limit(10).all()
        recent_registrations = [
            {
                'id': h.id,
                'name': h.name,
                'registeredDate': h.created_at.isoformat() if h.created_at else None
            }
            for h in recent_hospitals
        ]
        
        return jsonify({
            'planDistribution': plan_distribution,
            'monthlyGrowth': monthly_growth,
            'recentRegistrations': recent_registrations,
            'systemHealth': {
                'serverStatus': 'online',
                'databaseStatus': 'connected',
                'paymentGateway': 'development_mode'
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500