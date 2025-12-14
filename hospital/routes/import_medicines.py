from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital import db
from hospital.models.user import User
from hospital.models.medicine import Medicine
from hospital.models.hospital import Hospital
from datetime import datetime
import pandas as pd
import io

import_medicines_bp = Blueprint('import_medicines', __name__)

@import_medicines_bp.route('/import-medicines', methods=['POST'])
@jwt_required()
def import_medicines():
    """Import medicines from CSV/Excel file"""
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
        required_columns = ['name', 'quantity']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return jsonify({
                'error': f'Missing required columns: {", ".join(missing_columns)}',
                'required_columns': required_columns,
                'found_columns': list(df.columns)
            }), 400
        
        # Optional columns that can be imported
        optional_columns = ['mrp', 'cost_price', 'selling_price', 'expiry_date']
        
        # Process each row
        imported_medicines = []
        errors = []
        skipped = []
        
        for index, row in df.iterrows():
            try:
                # Extract data
                name = str(row['name']).strip()
                quantity = row['quantity']
                
                # Validate name
                if not name or name == '' or name.lower() == 'nan':
                    errors.append({
                        'row': index + 2,  # +2 because index is 0-based and we have header
                        'error': 'Medicine name is required'
                    })
                    continue
                
                # Validate quantity
                try:
                    quantity = int(float(quantity))  # Convert to int, handling float strings
                    if quantity < 0:
                        raise ValueError('Quantity cannot be negative')
                except (ValueError, TypeError):
                    errors.append({
                        'row': index + 2,
                        'error': f'Invalid quantity: {quantity}. Must be a positive number'
                    })
                    continue
                
                # Extract optional fields
                mrp = None
                cost_price = None
                selling_price = None
                expiry_date = None
                
                # Parse MRP
                if 'mrp' in df.columns and pd.notna(row.get('mrp')):
                    try:
                        mrp = float(row['mrp'])
                        if mrp < 0:
                            mrp = None
                    except (ValueError, TypeError):
                        pass
                
                # Parse cost_price
                if 'cost_price' in df.columns and pd.notna(row.get('cost_price')):
                    try:
                        cost_price = float(row['cost_price'])
                        if cost_price < 0:
                            cost_price = None
                    except (ValueError, TypeError):
                        pass
                
                # Auto-calculate cost_price from MRP if not provided (assume 60% of MRP as typical wholesale cost)
                if cost_price is None and mrp is not None and mrp > 0:
                    cost_price = round(mrp * 0.6, 2)  # 60% of MRP as default cost
                
                # Parse selling_price
                if 'selling_price' in df.columns and pd.notna(row.get('selling_price')):
                    try:
                        selling_price = float(row['selling_price'])
                        if selling_price < 0:
                            selling_price = None
                    except (ValueError, TypeError):
                        pass
                
                # Parse expiry_date (accepts formats: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY)
                if 'expiry_date' in df.columns and pd.notna(row.get('expiry_date')):
                    try:
                        expiry_str = str(row['expiry_date']).strip()
                        if expiry_str and expiry_str.lower() != 'nan':
                            # Try parsing different date formats
                            date_formats = ['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%Y/%m/%d', '%d-%m-%y', '%d/%m/%y']
                            parsed = False
                            for fmt in date_formats:
                                try:
                                    expiry_date = datetime.strptime(expiry_str, fmt).date()
                                    parsed = True
                                    break
                                except ValueError:
                                    continue
                            if not parsed:
                                # Try pandas date parsing as fallback
                                try:
                                    expiry_date = pd.to_datetime(expiry_str).date()
                                except:
                                    expiry_date = None
                    except (ValueError, TypeError, AttributeError):
                        expiry_date = None
                
                # Check if medicine with same name already exists for this hospital
                existing_medicine = Medicine.query.filter_by(
                    hospital_id=user.hospital_id,
                    name=name,
                    is_active=True
                ).first()
                
                if existing_medicine:
                    # Update existing medicine quantity
                    existing_medicine.quantity_in_stock += quantity
                    skipped.append({
                        'row': index + 2,
                        'name': name,
                        'message': f'Medicine already exists. Quantity will be updated to: {existing_medicine.quantity_in_stock + quantity}'
                    })
                    continue
                
                # Create new medicine
                medicine = Medicine(
                    hospital_id=user.hospital_id,
                    name=name,
                    quantity_in_stock=quantity,
                    unit_of_measurement='pieces',
                    is_active=True,
                    prescription_required=True,
                    mrp=mrp,
                    cost_price=cost_price,
                    selling_price=selling_price,
                    expiry_date=expiry_date
                )
                
                db.session.add(medicine)
                
                imported_medicines.append({
                    'id': medicine.id,
                    'name': medicine.name,
                    'quantity': medicine.quantity_in_stock
                })
                
            except Exception as e:
                db.session.rollback()
                errors.append({
                    'row': index + 2,
                    'error': f'Error processing row: {str(e)}'
                })
                continue
        
        # Commit all changes at once
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Failed to save medicines: {str(e)}'}), 500
        
        # Prepare response
        response_data = {
            'success': True,
            'imported_count': len(imported_medicines),
            'errors_count': len(errors),
            'skipped_count': len(skipped),
            'imported_medicines': imported_medicines[:10],  # Return first 10 for preview
            'total_rows': len(df)
        }
        
        if errors:
            response_data['errors'] = errors[:20]  # Return first 20 errors
        
        if skipped:
            response_data['skipped'] = skipped[:10]  # Return first 10 skipped items
        
        return jsonify(response_data), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to import medicines: {str(e)}'}), 500

@import_medicines_bp.route('/import-medicines-template', methods=['GET'])
@jwt_required()
def get_import_template():
    """Get CSV template for medicine import"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'User not associated with any hospital'}), 404
        
        # Create sample CSV content with all optional columns
        csv_content = "name,quantity,mrp,cost_price,selling_price,expiry_date\n"
        csv_content += "Paracetamol 500mg,100,30,15,25,2025-12-31\n"
        csv_content += "Amoxicillin 250mg,50,75,45,65,2025-06-30\n"
        csv_content += "Ibuprofen 400mg,75,50,30,40,2025-09-15\n"
        
        return jsonify({
            'template': csv_content,
            'required_columns': ['name', 'quantity'],
            'optional_columns': ['mrp', 'cost_price', 'selling_price', 'expiry_date'],
            'description': 'CSV file must have: name (medicine name) and quantity (number of units). Optional: mrp, cost_price, selling_price, expiry_date (format: YYYY-MM-DD or DD-MM-YYYY)'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate template: {str(e)}'}), 500

