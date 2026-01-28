from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital import db
from hospital.models.user import User
from hospital.models.patient import Patient
import csv
import io
import uuid
import random
from datetime import datetime, date

patient_import_bp = Blueprint('patient_import', __name__)

@patient_import_bp.route('/patients/import', methods=['POST'])
@jwt_required()
def import_patients():
    """Import patients from CSV file"""
    try:
        current_user_id = get_jwt_identity()
        user = None
        try:
            user = User.query.get(int(current_user_id))
        except:
            db.session.rollback()
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
        
        if not file.filename.lower().endswith('.csv'):
            return jsonify({'error': 'File must be a CSV file'}), 400
        
        # Read CSV file
        try:
            content = file.stream.read().decode("utf-8")
            stream = io.StringIO(content, newline=None)
            csv_input = csv.DictReader(stream)
        except Exception as e:
            return jsonify({'error': f'Error reading CSV file: {str(e)}'}), 400
        
        # Get fieldnames and validate
        fieldnames = csv_input.fieldnames
        if not fieldnames:
            return jsonify({'error': 'CSV file is empty or has no headers'}), 400
        
        # Check for essential fields (case insensitive and flexible naming)
        fieldnames_lower = [field.lower().strip() for field in fieldnames]
        
        # Map common variations to standard field names
        field_mapping = {
            'first_name': ['first_name', 'firstname', 'first name', 'fname'],
            'last_name': ['last_name', 'lastname', 'last name', 'lname', 'surname'],
            'phone': ['phone', 'phone_number', 'mobile', 'contact', 'phone number'],
            'email': ['email', 'email_address', 'email address', 'e-mail', 'e_mail'],
            'date_of_birth': ['date_of_birth', 'dob', 'birth_date', 'birthdate', 'date of birth'],
            'gender': ['gender', 'sex'],
            'address': ['address', 'location'],
            'blood_group': ['blood_group', 'blood group', 'blood_type', 'blood type']
        }
        
        # Find actual field names in CSV
        actual_fields = {}
        for standard_field, variations in field_mapping.items():
            for variation in variations:
                if variation.lower() in fieldnames_lower:
                    actual_fields[standard_field] = fieldnames[fieldnames_lower.index(variation.lower())]
                    break
        
        # Check for essential fields
        essential_fields = ['first_name', 'last_name', 'phone']
        missing_essential = [field for field in essential_fields if field not in actual_fields]
        if missing_essential:
            return jsonify({
                'error': f'Missing required columns: {", ".join(missing_essential)}. Required: first_name, last_name, phone'
            }), 400
        
        # Process CSV rows
        success_count = 0
        failed_count = 0
        errors = []
        
        rows = list(csv_input)
        
        for row_num, row in enumerate(rows, start=2):  # Start from 2 (header is row 1)
            try:
                # Get basic required fields using mapped field names
                first_name = row.get(actual_fields.get('first_name', 'first_name'), '').strip()
                last_name = row.get(actual_fields.get('last_name', 'last_name'), '').strip()
                phone = row.get(actual_fields.get('phone', 'phone'), '').strip()
                
                if not first_name:
                    raise ValueError('First name is required')
                if not last_name:
                    raise ValueError('Last name is required')
                if not phone:
                    raise ValueError('Phone is required')
                
                # Handle optional fields using mapped field names
                email = row.get(actual_fields.get('email', 'email'), '').strip()
                gender = row.get(actual_fields.get('gender', 'gender'), 'Male').strip()
                date_of_birth = row.get(actual_fields.get('date_of_birth', 'date_of_birth'), '01-01-1990').strip()
                address = row.get(actual_fields.get('address', 'address'), '').strip()
                blood_group = row.get(actual_fields.get('blood_group', 'blood_group'), '').strip()
                
                # Clean phone number
                phone_clean = ''.join(filter(str.isdigit, phone))
                if len(phone_clean) < 10:
                    raise ValueError(f'Phone number too short: {phone}')
                if len(phone_clean) > 10:
                    phone_clean = phone_clean[-10:]  # Take last 10 digits
                
                # Convert date format - handle multiple formats
                if date_of_birth:
                    try:
                        # Try different date formats
                        date_formats = [
                            '%d-%m-%Y',  # 23-09-1975
                            '%Y-%m-%d',  # 1975-09-23
                            '%m/%d/%Y',  # 09/23/1975
                            '%d/%m/%Y',  # 23/09/1975
                            '%Y/%m/%d',  # 1975/09/23
                        ]
                        
                        parsed_date = None
                        for fmt in date_formats:
                            try:
                                parsed_date = datetime.strptime(date_of_birth, fmt)
                                break
                            except ValueError:
                                continue
                        
                        if parsed_date:
                            date_of_birth = parsed_date.date()  # Convert to date object
                        else:
                            raise ValueError(f'Invalid date format: {date_of_birth}')
                            
                    except Exception as e:
                        date_of_birth = date(1990, 1, 1)  # Default date object
                        errors.append(f'Row {row_num}: Invalid date format, used default date')
                else:
                    date_of_birth = date(1990, 1, 1)  # Default date object
                
                # Validate email if provided
                if email and '@' not in email:
                    email = ''  # Clear invalid email
                
                # Validate gender
                if gender not in ['Male', 'Female', 'Other']:
                    gender = 'Male'
                
                # Validate blood group
                valid_blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
                if blood_group not in valid_blood_groups:
                    blood_group = None
                
                # Check for duplicate phone numbers in the same hospital
                existing_patient = Patient.query.filter_by(
                    phone=phone_clean, 
                    hospital_id=user.hospital_id
                ).first()
                
                if existing_patient:
                    raise ValueError(f'Patient with phone {phone_clean} already exists')
                
                # Check for duplicate email if provided
                if email:
                    existing_email = Patient.query.filter_by(email=email).first()
                    if existing_email:
                        raise ValueError(f'Patient with email {email} already exists')
                
                # Generate unique patient ID
                patient_id = f"PAT{str(uuid.uuid4())[:8].upper()}"
                
                # Ensure patient ID is unique
                while Patient.query.filter_by(patient_id=patient_id).first():
                    patient_id = f"PAT{str(uuid.uuid4())[:8].upper()}"
                
                # Create patient
                patient = Patient(
                    patient_id=patient_id,
                    first_name=first_name,
                    last_name=last_name,
                    email=email if email else None,
                    phone=phone_clean,
                    date_of_birth=date_of_birth,
                    gender=gender,
                    blood_group=blood_group,
                    address=address,
                    hospital_id=user.hospital_id
                )
                
                db.session.add(patient)
                success_count += 1
                
            except Exception as e:
                failed_count += 1
                error_msg = f'Row {row_num}: {str(e)}'
                errors.append(error_msg)
                continue
        
        # Commit all successful imports
        if success_count > 0:
            db.session.commit()
        else:
            db.session.rollback()
        
        return jsonify({
            'message': f'Import completed: {success_count} successful, {failed_count} failed',
            'success': success_count,
            'failed': failed_count,
            'errors': errors[:10]  # Limit to first 10 errors
        }), 200
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'traceback': error_trace,
            'message': 'Internal Server Error during patient import'
        }), 500

@patient_import_bp.route('/patients/add-sample-data', methods=['POST'])
@jwt_required()
def add_sample_patients():
    """Add sample Indian patients to the hospital"""
    try:
        current_identity = get_jwt_identity()
        user = None
        try:
            user = User.query.get(int(current_identity))
        except:
            db.session.rollback()
            user = User.query.get(int(current_identity))
            
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
            
        if user.role not in ['admin']:
            return jsonify({'error': 'Admin access required'}), 403

        # Sample Patients (Indian Names)
        sample_patients = [
            {"first_name": "Arjun", "last_name": "Sharma", "phone": "9876543001", "gender": "Male", "email": "arjun.sharma@example.com"},
            {"first_name": "Priya", "last_name": "Patel", "phone": "9876543002", "gender": "Female", "email": "priya.patel@example.com"},
            {"first_name": "Rahul", "last_name": "Singh", "phone": "9876543003", "gender": "Male", "email": "rahul.singh@example.com"},
            {"first_name": "Ananya", "last_name": "Das", "phone": "9876543004", "gender": "Female", "email": "ananya.das@example.com"},
            {"first_name": "Siddharth", "last_name": "Malhotra", "phone": "9876543005", "gender": "Male", "email": "sid.m@example.com"},
            {"first_name": "Sneha", "last_name": "Reddy", "phone": "9876543006", "gender": "Female", "email": "sneha.reddy@example.com"},
            {"first_name": "Vikram", "last_name": "Gupta", "phone": "9876543007", "gender": "Male", "email": "vikram.g@example.com"},
            {"first_name": "Kavita", "last_name": "Iyer", "phone": "9876543008", "gender": "Female", "email": "kavita.iyer@example.com"},
            {"first_name": "Aditya", "last_name": "Verma", "phone": "9876543009", "gender": "Male", "email": "aditya.v@example.com"},
            {"first_name": "Meera", "last_name": "Nair", "phone": "9876543010", "gender": "Female", "email": "meera.nair@example.com"}
        ]
        
        added_count = 0
        skipped_count = 0
        
        for p_data in sample_patients:
            # Check if user with this email or phone already exists
            existing_user = User.query.filter(
                (User.email == p_data['email']) | (User.phone == p_data['phone'])
            ).first()
            
            if existing_user:
                skipped_count += 1
                continue
                
            # Create user for patient
            new_user = User(
                email=p_data['email'],
                first_name=p_data['first_name'],
                last_name=p_data['last_name'],
                phone=p_data['phone'],
                role='patient',
                hospital_id=user.hospital_id
            )
            new_user.set_password("123")
            db.session.add(new_user)
            db.session.flush()
            
            # Create patient profile
            patient_profile = Patient(
                patient_id=f"PAT{str(uuid.uuid4())[:8].upper()}",
                user_id=new_user.id,
                gender=p_data['gender'],
                date_of_birth=date(random.randint(1960, 2010), random.randint(1, 12), random.randint(1, 28)),
                blood_group=random.choice(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
                address=random.choice(['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune']),
                hospital_id=user.hospital_id
            )
            db.session.add(patient_profile)
            added_count += 1
            
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully added {added_count} sample patients. {skipped_count} skipped.',
            'added_count': added_count,
            'skipped_count': skipped_count
        }), 201
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'traceback': error_trace,
            'message': 'Internal Server Error during sample patient addition'
        }), 500

@patient_import_bp.route('/patients/import-template', methods=['GET'])
@jwt_required()
def get_patient_import_template():
    """Get CSV template for importing patients"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        # Create sample CSV template response
        template_data = {
            'first_name': ['Arjun', 'Priya'],
            'last_name': ['Sharma', 'Patel'],
            'email': ['arjun@example.com', 'priya@example.com'],
            'phone': ['9876543210', '9876543211'],
            'date_of_birth': ['1990-01-01', '1992-05-15'],
            'gender': ['Male', 'Female'],
            'blood_group': ['O+', 'B+'],
            'address': ['Mumbai, India', 'Ahmedabad, India']
        }
        
        return jsonify({
            'template': template_data,
            'required_columns': ['first_name', 'last_name', 'phone'],
            'optional_columns': ['email', 'date_of_birth', 'gender', 'blood_group', 'address'],
            'instructions': [
                'First row should contain column headers',
                'Recommended columns: first_name, last_name, phone, date_of_birth, gender',
                'Date format should be YYYY-MM-DD or DD-MM-YYYY',
                'Phone number should be 10 digits'
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500