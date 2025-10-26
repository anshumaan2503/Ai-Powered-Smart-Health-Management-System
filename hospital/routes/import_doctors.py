from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital import db
from hospital.models.user import User
from hospital.models.doctor import Doctor
from hospital.models.hospital import Hospital
from hospital.models.hospital_subscription import HospitalSubscription
from hospital.utils.validators import validate_email
import pandas as pd
import uuid
import random
import io

import_doctors_bp = Blueprint('import_doctors', __name__)

@import_doctors_bp.route('/import-doctors', methods=['POST'])
@jwt_required()
def import_doctors():
    """Import doctors from CSV/Excel file"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Check if file is uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        allowed_extensions = {'.csv', '.xlsx', '.xls'}
        file_ext = '.' + file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_ext not in allowed_extensions:
            return jsonify({'error': 'File must be CSV or Excel format (.csv, .xlsx, .xls)'}), 400
        
        # Read file into pandas DataFrame
        try:
            file_content = file.read()
            if file_ext == '.csv':
                df = pd.read_csv(io.BytesIO(file_content))
            else:
                df = pd.read_excel(io.BytesIO(file_content))
        except Exception as e:
            return jsonify({'error': f'Error reading file: {str(e)}'}), 400
        
        # Validate required columns
        required_columns = ['first_name', 'last_name', 'specialization', 'qualification']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return jsonify({
                'error': f'Missing required columns: {", ".join(missing_columns)}',
                'required_columns': required_columns,
                'found_columns': list(df.columns)
            }), 400
        
        # Get hospital info for email generation
        hospital = Hospital.query.get(user.hospital_id)
        hospital_domain = hospital.name.lower().replace(' ', '').replace('-', '') if hospital else 'hospital'
        
        # Check subscription limits (temporarily disabled for testing)
        subscription = HospitalSubscription.query.filter_by(
            hospital_id=user.hospital_id, 
            is_active=True
        ).first()
        
        current_staff_count = User.query.filter_by(hospital_id=user.hospital_id).count()
        current_doctors = Doctor.query.filter_by(hospital_id=user.hospital_id).count()
        
        # Temporarily disable limits for testing
        # if subscription:
        #     if current_staff_count + len(df) > subscription.max_staff:
        #         return jsonify({
        #             'error': f'Import would exceed staff limit. Current: {current_staff_count}, Trying to add: {len(df)}, Limit: {subscription.max_staff}'
        #         }), 403
        #     
        #     if current_doctors + len(df) > subscription.max_doctors:
        #         return jsonify({
        #             'error': f'Import would exceed doctor limit. Current: {current_doctors}, Trying to add: {len(df)}, Limit: {subscription.max_doctors}'
        #         }), 403
        
        # Process each row
        imported_doctors = []
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Extract data with defaults
                first_name = str(row['first_name']).strip()
                last_name = str(row['last_name']).strip()
                specialization = str(row['specialization']).strip()
                qualification = str(row['qualification']).strip()
                
                # Optional fields
                phone = str(row.get('phone', '')).strip() if pd.notna(row.get('phone')) else ''
                experience_years = int(row.get('experience_years', 0)) if pd.notna(row.get('experience_years')) else 0
                consultation_fee = float(row.get('consultation_fee', 0)) if pd.notna(row.get('consultation_fee')) else 0.0
                license_number = str(row.get('license_number', '')).strip() if pd.notna(row.get('license_number')) else ''
                
                # Validate required fields
                if not first_name or not last_name or not specialization or not qualification:
                    errors.append(f'Row {index + 2}: Missing required fields')
                    continue
                
                # Generate email
                base_email = f"{first_name.lower()}.{last_name.lower()}@{hospital_domain}.com"
                counter = 1
                generated_email = base_email
                while User.query.filter_by(email=generated_email).first():
                    generated_email = f"{first_name.lower()}.{last_name.lower()}{counter}@{hospital_domain}.com"
                    counter += 1
                
                # Set default password to 123
                generated_password = "123"
                
                # Create user
                new_doctor = User(
                    email=generated_email,
                    first_name=first_name,
                    last_name=last_name,
                    phone=phone if phone else None,
                    role='doctor',
                    hospital_id=user.hospital_id
                )
                new_doctor.set_password(generated_password)
                
                db.session.add(new_doctor)
                db.session.flush()  # Get the user ID
                
                # Create doctor profile
                doctor_profile = Doctor(
                    doctor_id=f"DOC{str(uuid.uuid4())[:8].upper()}",
                    user_id=new_doctor.id,
                    specialization=specialization,
                    qualification=qualification,
                    experience_years=experience_years,
                    license_number=license_number if license_number else f"LIC{str(uuid.uuid4())[:8].upper()}",
                    consultation_fee=consultation_fee,
                    hospital_id=user.hospital_id
                )
                db.session.add(doctor_profile)
                
                imported_doctors.append({
                    'name': f"{first_name} {last_name}",
                    'email': generated_email,
                    'password': generated_password,
                    'specialization': specialization
                })
                
            except Exception as e:
                errors.append(f'Row {index + 2}: {str(e)}')
                continue
        
        # Commit all changes
        if imported_doctors:
            db.session.commit()
        
        return jsonify({
            'message': f'Successfully imported {len(imported_doctors)} doctors',
            'imported_count': len(imported_doctors),
            'error_count': len(errors),
            'imported_doctors': imported_doctors,
            'errors': errors
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@import_doctors_bp.route('/import-staff', methods=['POST'])
@jwt_required()
def import_staff():
    """Import staff from CSV/Excel file"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Check if file is uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        allowed_extensions = {'.csv', '.xlsx', '.xls'}
        file_ext = '.' + file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_ext not in allowed_extensions:
            return jsonify({'error': 'File must be CSV or Excel format (.csv, .xlsx, .xls)'}), 400
        
        # Read file into pandas DataFrame
        try:
            file_content = file.read()
            if file_ext == '.csv':
                df = pd.read_csv(io.BytesIO(file_content))
            else:
                df = pd.read_excel(io.BytesIO(file_content))
        except Exception as e:
            return jsonify({'error': f'Error reading file: {str(e)}'}), 400
        
        # Validate required columns
        required_columns = ['first_name', 'last_name', 'role']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return jsonify({
                'error': f'Missing required columns: {", ".join(missing_columns)}',
                'required_columns': required_columns,
                'found_columns': list(df.columns)
            }), 400
        
        # Get hospital info for email generation
        hospital = Hospital.query.get(user.hospital_id)
        hospital_domain = hospital.name.lower().replace(' ', '').replace('-', '') if hospital else 'hospital'
        
        # Process each row
        imported_staff = []
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Extract data with defaults
                first_name = str(row['first_name']).strip()
                last_name = str(row['last_name']).strip()
                role = str(row['role']).strip()
                
                # Optional fields
                phone = str(row.get('phone', '')).strip() if pd.notna(row.get('phone')) else ''
                
                # Validate required fields
                if not first_name or not last_name or not role:
                    errors.append(f'Row {index + 2}: Missing required fields')
                    continue
                
                # Generate email
                base_email = f"{first_name.lower()}.{last_name.lower()}@{hospital_domain}.com"
                counter = 1
                generated_email = base_email
                while User.query.filter_by(email=generated_email).first():
                    generated_email = f"{first_name.lower()}.{last_name.lower()}{counter}@{hospital_domain}.com"
                    counter += 1
                
                # Set password to 123
                generated_password = "123"
                
                # Create user
                new_staff = User(
                    email=generated_email,
                    first_name=first_name,
                    last_name=last_name,
                    phone=phone if phone else None,
                    role=role,
                    hospital_id=user.hospital_id
                )
                new_staff.set_password(generated_password)
                
                db.session.add(new_staff)
                db.session.flush()  # Get the user ID
                
                imported_staff.append({
                    'name': f"{first_name} {last_name}",
                    'email': generated_email,
                    'password': generated_password,
                    'role': role
                })
                
            except Exception as e:
                errors.append(f'Row {index + 2}: {str(e)}')
                continue
        
        # Commit all changes
        if imported_staff:
            db.session.commit()
        
        return jsonify({
            'message': f'Successfully imported {len(imported_staff)} staff members',
            'imported_count': len(imported_staff),
            'error_count': len(errors),
            'imported_staff': imported_staff,
            'errors': errors
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@import_doctors_bp.route('/import-staff-template', methods=['GET'])
@jwt_required()
def get_staff_import_template():
    """Get CSV template for importing staff"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Create sample CSV template
        template_data = {
            'first_name': ['John', 'Jane', 'Michael'],
            'last_name': ['Smith', 'Doe', 'Johnson'],
            'role': ['nurse', 'receptionist', 'admin'],
            'phone': ['+1234567890', '+0987654321', '+1122334455']
        }
        
        return jsonify({
            'template': template_data,
            'required_columns': ['first_name', 'last_name', 'role'],
            'optional_columns': ['phone'],
            'instructions': [
                'Required columns: first_name, last_name, role',
                'Optional columns: phone',
                'Email and password will be auto-generated',
                'All passwords will be set to "123"',
                'Save as CSV or Excel file',
                'First row should contain column headers'
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@import_doctors_bp.route('/import-template', methods=['GET'])
@jwt_required()
def get_import_template():
    """Get CSV template for importing doctors"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Create sample CSV template
        template_data = {
            'first_name': ['John', 'Jane', 'Michael'],
            'last_name': ['Smith', 'Doe', 'Johnson'],
            'specialization': ['Cardiology', 'Neurology', 'Orthopedics'],
            'qualification': ['MBBS, MD', 'MBBS, MS', 'MBBS, DNB'],
            'phone': ['+1234567890', '+0987654321', '+1122334455'],
            'experience_years': [5, 8, 12],
            'consultation_fee': [500, 750, 1000],
            'license_number': ['LIC12345', 'LIC67890', 'LIC11111']
        }
        
        return jsonify({
            'template': template_data,
            'required_columns': ['first_name', 'last_name', 'specialization', 'qualification'],
            'optional_columns': ['phone', 'experience_years', 'consultation_fee', 'license_number'],
            'instructions': [
                'Required columns: first_name, last_name, specialization, qualification',
                'Optional columns: phone, experience_years, consultation_fee, license_number',
                'Email and password will be auto-generated',
                'Save as CSV or Excel file',
                'First row should contain column headers'
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500