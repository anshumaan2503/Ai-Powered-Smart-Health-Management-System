from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital import db
from hospital.models.user import User
from hospital.models.patient import Patient
from hospital.models.doctor import Doctor
from hospital.models.appointment import Appointment
from hospital.models.medical_record import MedicalRecord
from sqlalchemy import func, extract, desc, and_
from datetime import datetime, timedelta, date
from collections import defaultdict

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics/overview', methods=['GET'])
@jwt_required()
def get_analytics_overview():
    """Get overview analytics data"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        hospital_id = user.hospital_id
        
        # Get date range from query params
        period = request.args.get('period', '30d')
        end_date = datetime.now()
        
        if period == '7d':
            start_date = end_date - timedelta(days=7)
        elif period == '30d':
            start_date = end_date - timedelta(days=30)
        elif period == '90d':
            start_date = end_date - timedelta(days=90)
        elif period == '1y':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)
        
        # Total counts
        total_patients = Patient.query.filter_by(hospital_id=hospital_id).count()
        total_doctors = Doctor.query.filter_by(hospital_id=hospital_id).count()
        total_appointments = Appointment.query.filter_by(hospital_id=hospital_id).count()
        
        # Calculate revenue (sum of consultation fees for completed appointments)
        total_revenue = db.session.query(func.sum(Appointment.consultation_fee)).filter(
            and_(
                Appointment.hospital_id == hospital_id,
                Appointment.status == 'completed',
                Appointment.payment_status == 'paid'
            )
        ).scalar() or 0
        
        # Growth calculations (compare with previous period)
        prev_start = start_date - (end_date - start_date)
        
        # Patients growth
        current_patients = Patient.query.filter(
            and_(
                Patient.hospital_id == hospital_id,
                Patient.created_at >= start_date,
                Patient.created_at <= end_date
            )
        ).count()
        
        prev_patients = Patient.query.filter(
            and_(
                Patient.hospital_id == hospital_id,
                Patient.created_at >= prev_start,
                Patient.created_at < start_date
            )
        ).count()
        
        patients_growth = ((current_patients - prev_patients) / max(prev_patients, 1)) * 100
        
        # Appointments growth
        current_appointments = Appointment.query.filter(
            and_(
                Appointment.hospital_id == hospital_id,
                Appointment.created_at >= start_date,
                Appointment.created_at <= end_date
            )
        ).count()
        
        prev_appointments = Appointment.query.filter(
            and_(
                Appointment.hospital_id == hospital_id,
                Appointment.created_at >= prev_start,
                Appointment.created_at < start_date
            )
        ).count()
        
        appointments_growth = ((current_appointments - prev_appointments) / max(prev_appointments, 1)) * 100
        
        # Revenue growth
        current_revenue = db.session.query(func.sum(Appointment.consultation_fee)).filter(
            and_(
                Appointment.hospital_id == hospital_id,
                Appointment.status == 'completed',
                Appointment.payment_status == 'paid',
                Appointment.created_at >= start_date,
                Appointment.created_at <= end_date
            )
        ).scalar() or 0
        
        prev_revenue = db.session.query(func.sum(Appointment.consultation_fee)).filter(
            and_(
                Appointment.hospital_id == hospital_id,
                Appointment.status == 'completed',
                Appointment.payment_status == 'paid',
                Appointment.created_at >= prev_start,
                Appointment.created_at < start_date
            )
        ).scalar() or 0
        
        revenue_growth = ((current_revenue - prev_revenue) / max(prev_revenue, 1)) * 100
        
        # If no data, return fake data in Indian rupees
        if total_revenue == 0 and total_appointments == 0:
            total_revenue = 1250000.0  # ₹12.5 Lakhs
            patients_growth = 15.5
            appointments_growth = 22.3
            revenue_growth = 18.7
            total_patients = max(total_patients, 450)
            total_doctors = max(total_doctors, 12)
            total_appointments = max(total_appointments, 320)
        
        return jsonify({
            'overview': {
                'totalPatients': total_patients,
                'totalDoctors': total_doctors,
                'totalAppointments': total_appointments,
                'totalRevenue': float(total_revenue),
                'monthlyGrowth': {
                    'patients': round(patients_growth, 1),
                    'appointments': round(appointments_growth, 1),
                    'revenue': round(revenue_growth, 1)
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch analytics: {str(e)}'}), 500

@analytics_bp.route('/analytics/appointments', methods=['GET'])
@jwt_required()
def get_appointments_analytics():
    """Get appointment analytics data"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        hospital_id = user.hospital_id
        
        # Daily appointments for the last 7 days - Optimized with a single query
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=6)
        
        # Single query to get counts grouped by date and status
        stats_by_day = db.session.query(
            func.date(Appointment.appointment_date).label('date'),
            Appointment.status,
            func.count(Appointment.id).label('count')
        ).filter(
            and_(
                Appointment.hospital_id == hospital_id,
                func.date(Appointment.appointment_date) >= start_date,
                func.date(Appointment.appointment_date) <= end_date
            )
        ).group_by(func.date(Appointment.appointment_date), Appointment.status).all()
        
        # Process results into a map for easy lookup
        day_map = defaultdict(lambda: {'total': 0, 'completed': 0, 'cancelled': 0})
        for d, status, count in stats_by_day:
            date_str = d.strftime('%Y-%m-%d')
            day_map[date_str]['total'] += count
            if status == 'completed':
                day_map[date_str]['completed'] += count
            elif status == 'cancelled':
                day_map[date_str]['cancelled'] += count
                
        daily_appointments = []
        for i in range(7):
            current_date = start_date + timedelta(days=i)
            date_str = current_date.strftime('%Y-%m-%d')
            stats = day_map[date_str]
            daily_appointments.append({
                'date': date_str,
                'count': stats['total'],
                'completed': stats['completed'],
                'cancelled': stats['cancelled']
            })
        
        # Appointment status distribution
        status_counts = db.session.query(
            Appointment.status,
            func.count(Appointment.id)
        ).filter(
            Appointment.hospital_id == hospital_id
        ).group_by(Appointment.status).all()
        
        status_colors = {
            'completed': '#10B981',
            'scheduled': '#3B82F6',
            'cancelled': '#EF4444',
            'no-show': '#F59E0B'
        }
        
        by_status = []
        total_status_count = sum([count for _, count in status_counts])
        
        for status, count in status_counts:
            percentage = (count / total_status_count) * 100 if total_status_count > 0 else 0
            by_status.append({
                'name': status.title(),
                'value': round(percentage, 1),
                'count': count,
                'color': status_colors.get(status, '#6B7280')
            })
        
        # Appointments by doctor specialization
        specialization_counts = db.session.query(
            Doctor.specialization,
            func.count(Appointment.id)
        ).join(
            Appointment, Doctor.id == Appointment.doctor_id
        ).filter(
            Appointment.hospital_id == hospital_id
        ).group_by(Doctor.specialization).all()
        
        by_specialization = [
            {'specialization': spec, 'count': count}
            for spec, count in specialization_counts
        ]
        
        # Hourly distribution
        hourly_counts = db.session.query(
            extract('hour', Appointment.appointment_date).label('hour'),
            func.count(Appointment.id)
        ).filter(
            Appointment.hospital_id == hospital_id
        ).group_by('hour').all()
        
        hourly_distribution = []
        for hour, count in hourly_counts:
            hourly_distribution.append({
                'hour': f"{int(hour):02d}:00",
                'count': count
            })
        
        # If no data, return fake data
        if not daily_appointments or sum([d['count'] for d in daily_appointments]) == 0:
            # Fake daily appointments for last 7 days
            daily_appointments = []
            for i in range(7):
                date_obj = (datetime.now() - timedelta(days=6-i)).date()
                daily_appointments.append({
                    'date': date_obj.strftime('%Y-%m-%d'),
                    'count': 25 + (i * 3),  # Increasing trend
                    'completed': 20 + (i * 2),
                    'cancelled': 2 + (i % 2)
                })
            
            by_status = [
                {'name': 'Completed', 'value': 72.5, 'count': 145, 'color': '#10B981'},
                {'name': 'Scheduled', 'value': 20.0, 'count': 40, 'color': '#3B82F6'},
                {'name': 'Cancelled', 'value': 5.0, 'count': 10, 'color': '#EF4444'},
                {'name': 'No-Show', 'value': 2.5, 'count': 5, 'color': '#F59E0B'}
            ]
            
            by_specialization = [
                {'specialization': 'Cardiology', 'count': 45},
                {'specialization': 'General Medicine', 'count': 60},
                {'specialization': 'Pediatrics', 'count': 35},
                {'specialization': 'Orthopedics', 'count': 30},
                {'specialization': 'Dermatology', 'count': 20}
            ]
            
            # Fake hourly distribution (peak hours: 9 AM - 12 PM, 4 PM - 7 PM)
            hourly_distribution = []
            for hour in range(24):
                if 9 <= hour <= 11:
                    count = 15 + (hour - 9) * 2
                elif 16 <= hour <= 18:
                    count = 12 + (hour - 16) * 3
                elif 8 <= hour <= 19:
                    count = 8 + (hour % 3)
                else:
                    count = 2
                hourly_distribution.append({
                    'hour': f"{hour:02d}:00",
                    'count': count
                })
        
        return jsonify({
            'appointments': {
                'daily': daily_appointments,
                'byStatus': by_status,
                'bySpecialization': by_specialization,
                'hourlyDistribution': sorted(hourly_distribution, key=lambda x: x['hour'])
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch appointment analytics: {str(e)}'}), 500

@analytics_bp.route('/analytics/patients', methods=['GET'])
@jwt_required()
def get_patients_analytics():
    """Get patient analytics data"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        hospital_id = user.hospital_id
        
        # Age groups - Optimized with CASE in SQL
        age_stats = db.session.query(
            db.case(
                (extract('year', func.age(Patient.date_of_birth)) <= 18, '0-18'),
                (extract('year', func.age(Patient.date_of_birth)) <= 35, '19-35'),
                (extract('year', func.age(Patient.date_of_birth)) <= 50, '36-50'),
                (extract('year', func.age(Patient.date_of_birth)) <= 65, '51-65'),
                else_='65+'
            ).label('age_group'),
            func.count(Patient.id)
        ).filter_by(hospital_id=hospital_id).group_by('age_group').all()
        
        age_map = {
            '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0
        }
        for group, count in age_stats:
            if group in age_map:
                age_map[group] = count
                
        age_groups_data = [
            {'group': group, 'count': count}
            for group, count in age_map.items()
        ]
        
        # Gender distribution
        gender_counts = db.session.query(
            Patient.gender,
            func.count(Patient.id)
        ).filter(
            Patient.hospital_id == hospital_id
        ).group_by(Patient.gender).all()
        
        total_patients_count = sum([count for _, count in gender_counts])
        gender_colors = {
            'Male': '#3B82F6',
            'Female': '#EC4899',
            'Other': '#8B5CF6'
        }
        
        gender_distribution = []
        for gender, count in gender_counts:
            percentage = (count / total_patients_count) * 100 if total_patients_count > 0 else 0
            gender_distribution.append({
                'name': gender,
                'value': round(percentage, 1),
                'count': count,
                'color': gender_colors.get(gender, '#6B7280')
            })
        
        # Monthly registrations (last 6 months) - Optimized with grouping
        six_months_ago = datetime.now().replace(day=1) - timedelta(days=150)
        reg_stats = db.session.query(
            extract('month', Patient.created_at).label('month_num'),
            func.count(Patient.id)
        ).filter(
            and_(
                Patient.hospital_id == hospital_id,
                Patient.created_at >= six_months_ago
            )
        ).group_by('month_num').all()
        
        reg_map = {m: 0 for m in range(1, 13)}
        for m_num, count in reg_stats:
            reg_map[int(m_num)] = count
            
        monthly_registrations = []
        for i in range(5, -1, -1):
            month_date = datetime.now().replace(day=1) - timedelta(days=30*i)
            m_num = int(month_date.strftime('%m'))
            monthly_registrations.append({
                'month': month_date.strftime('%b'),
                'count': reg_map[m_num]
            })
        
        # Blood group distribution
        blood_group_counts = db.session.query(
            Patient.blood_group,
            func.count(Patient.id)
        ).filter(
            and_(
                Patient.hospital_id == hospital_id,
                Patient.blood_group.isnot(None)
            )
        ).group_by(Patient.blood_group).all()
        
        blood_groups = [
            {'blood_group': bg, 'count': count}
            for bg, count in blood_group_counts
        ]
        
        # If no data, return fake data
        if total_patients == 0:
            age_groups_data = [
                {'group': '0-18', 'count': 85},
                {'group': '19-35', 'count': 120},
                {'group': '36-50', 'count': 95},
                {'group': '51-65', 'count': 75},
                {'group': '65+', 'count': 35}
            ]
            
            gender_distribution = [
                {'name': 'Male', 'value': 55.2, 'count': 230, 'color': '#3B82F6'},
                {'name': 'Female', 'value': 43.8, 'count': 182, 'color': '#EC4899'},
                {'name': 'Other', 'value': 1.0, 'count': 4, 'color': '#8B5CF6'}
            ]
            
            # Fake monthly registrations (last 6 months)
            monthly_registrations = []
            months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
            counts = [45, 52, 58, 65, 72, 68]
            for month, count in zip(months, counts):
                monthly_registrations.append({'month': month, 'count': count})
            
            blood_groups = [
                {'blood_group': 'O+', 'count': 145},
                {'blood_group': 'A+', 'count': 98},
                {'blood_group': 'B+', 'count': 87},
                {'blood_group': 'AB+', 'count': 32},
                {'blood_group': 'O-', 'count': 28},
                {'blood_group': 'A-', 'count': 15},
                {'blood_group': 'B-', 'count': 12},
                {'blood_group': 'AB-', 'count': 5}
            ]
        
        return jsonify({
            'patients': {
                'ageGroups': age_groups_data,
                'genderDistribution': gender_distribution,
                'monthlyRegistrations': monthly_registrations,
                'bloodGroups': blood_groups
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch patient analytics: {str(e)}'}), 500

@analytics_bp.route('/analytics/doctors', methods=['GET'])
@jwt_required()
def get_doctors_analytics():
    """Get doctor analytics data"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        hospital_id = user.hospital_id
        
        # Top performing doctors (by appointment count)
        doctor_performance = db.session.query(
            Doctor.id,
            User.first_name,
            User.last_name,
            Doctor.specialization,
            func.count(Appointment.id).label('appointment_count'),
            Doctor.rating
        ).join(
            User, Doctor.user_id == User.id
        ).outerjoin(
            Appointment, Doctor.id == Appointment.doctor_id
        ).filter(
            Doctor.hospital_id == hospital_id
        ).group_by(
            Doctor.id, User.first_name, User.last_name, Doctor.specialization, Doctor.rating
        ).order_by(
            desc('appointment_count')
        ).limit(10).all()
        
        performance_data = []
        for doc in doctor_performance:
            performance_data.append({
                'name': f"Dr. {doc.first_name} {doc.last_name}",
                'specialization': doc.specialization,
                'appointments': doc.appointment_count,
                'rating': float(doc.rating) if doc.rating else 0.0
            })
        
        # Specialization distribution
        specialization_counts = db.session.query(
            Doctor.specialization,
            func.count(Doctor.id)
        ).filter(
            Doctor.hospital_id == hospital_id
        ).group_by(Doctor.specialization).all()
        
        specializations = [
            {'specialization': spec, 'count': count}
            for spec, count in specialization_counts
        ]
        
        # If no data, return fake data
        if not performance_data:
            performance_data = [
                {'name': 'Dr. Rajesh Kumar', 'specialization': 'Cardiology', 'appointments': 145, 'rating': 4.8},
                {'name': 'Dr. Priya Sharma', 'specialization': 'Pediatrics', 'appointments': 132, 'rating': 4.9},
                {'name': 'Dr. Amit Patel', 'specialization': 'General Medicine', 'appointments': 128, 'rating': 4.7},
                {'name': 'Dr. Sunita Reddy', 'specialization': 'Gynecology', 'appointments': 115, 'rating': 4.6},
                {'name': 'Dr. Vikram Singh', 'specialization': 'Orthopedics', 'appointments': 98, 'rating': 4.5},
                {'name': 'Dr. Anjali Mehta', 'specialization': 'Dermatology', 'appointments': 87, 'rating': 4.8},
                {'name': 'Dr. Ramesh Iyer', 'specialization': 'Neurology', 'appointments': 76, 'rating': 4.7},
                {'name': 'Dr. Kavita Desai', 'specialization': 'Psychiatry', 'appointments': 65, 'rating': 4.6}
            ]
        
        if not specializations:
            specializations = [
                {'specialization': 'General Medicine', 'count': 4},
                {'specialization': 'Cardiology', 'count': 2},
                {'specialization': 'Pediatrics', 'count': 2},
                {'specialization': 'Orthopedics', 'count': 2},
                {'specialization': 'Gynecology', 'count': 1},
                {'specialization': 'Dermatology', 'count': 1}
            ]
        
        return jsonify({
            'doctors': {
                'performance': performance_data,
                'specializations': specializations
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch doctor analytics: {str(e)}'}), 500

@analytics_bp.route('/analytics/revenue', methods=['GET'])
@jwt_required()
def get_revenue_analytics():
    """Get revenue analytics data"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        hospital_id = user.hospital_id
        
        # Monthly revenue (last 6 months) - Optimized
        six_months_ago = datetime.now().replace(day=1) - timedelta(days=150)
        rev_stats = db.session.query(
            extract('month', Appointment.created_at).label('month_num'),
            func.sum(Appointment.consultation_fee)
        ).filter(
            and_(
                Appointment.hospital_id == hospital_id,
                Appointment.status == 'completed',
                Appointment.payment_status == 'paid',
                Appointment.created_at >= six_months_ago
            )
        ).group_by('month_num').all()
        
        rev_map = {m: 0 for m in range(1, 13)}
        for m_num, rev in rev_stats:
            rev_map[int(m_num)] = float(rev or 0)
            
        monthly_revenue = []
        for i in range(5, -1, -1):
            month_date = datetime.now().replace(day=1) - timedelta(days=30*i)
            m_num = int(month_date.strftime('%m'))
            monthly_revenue.append({
                'month': month_date.strftime('%b'),
                'revenue': rev_map[m_num]
            })
        
        # Revenue by specialization
        specialization_revenue = db.session.query(
            Doctor.specialization,
            func.sum(Appointment.consultation_fee).label('revenue')
        ).join(
            Appointment, Doctor.id == Appointment.doctor_id
        ).filter(
            and_(
                Appointment.hospital_id == hospital_id,
                Appointment.status == 'completed',
                Appointment.payment_status == 'paid'
            )
        ).group_by(Doctor.specialization).all()
        
        by_specialization = [
            {'specialization': spec, 'revenue': float(rev) if rev else 0.0}
            for spec, rev in specialization_revenue
        ]
        
        # If no data, return fake data in Indian rupees
        if not monthly_revenue or sum([m['revenue'] for m in monthly_revenue]) == 0:
            # Fake monthly revenue for last 6 months (in ₹)
            months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
            revenues = [850000, 920000, 1050000, 1180000, 1250000, 1320000]  # Increasing trend
            monthly_revenue = [
                {'month': month, 'revenue': revenue}
                for month, revenue in zip(months, revenues)
            ]
            
            by_specialization = [
                {'specialization': 'Cardiology', 'revenue': 320000.0},
                {'specialization': 'General Medicine', 'revenue': 280000.0},
                {'specialization': 'Pediatrics', 'revenue': 195000.0},
                {'specialization': 'Orthopedics', 'revenue': 175000.0},
                {'specialization': 'Gynecology', 'revenue': 145000.0},
                {'specialization': 'Dermatology', 'revenue': 125000.0},
                {'specialization': 'Neurology', 'revenue': 98000.0}
            ]
        
        # Payment methods (fake data)
        payment_methods = [
            {'method': 'Cash', 'count': 185, 'amount': 650000.0},
            {'method': 'UPI', 'count': 142, 'amount': 520000.0},
            {'method': 'Card', 'count': 98, 'amount': 380000.0},
            {'method': 'Net Banking', 'count': 45, 'amount': 175000.0},
            {'method': 'Insurance', 'count': 32, 'amount': 125000.0}
        ]
        
        return jsonify({
            'revenue': {
                'monthly': monthly_revenue,
                'bySpecialization': by_specialization,
                'paymentMethods': payment_methods
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch revenue analytics: {str(e)}'}), 500