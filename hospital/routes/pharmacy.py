from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from hospital.models import db, Medicine, StockMovement, Hospital, User
from datetime import datetime, date, timedelta
from sqlalchemy import or_, and_, func
import traceback

pharmacy_bp = Blueprint('pharmacy', __name__)

@pharmacy_bp.route('/test', methods=['GET'])
def test_pharmacy():
    """Test endpoint to check if pharmacy routes are working"""
    return jsonify({'message': 'Pharmacy API is working!', 'medicines_count': Medicine.query.count()}), 200

@pharmacy_bp.route('/medicines', methods=['GET'])
@jwt_required()
def get_medicines():
    """Get all medicines for a hospital with filtering and pagination"""
    try:
        current_user = get_jwt_identity()
        print(f"Current user ID: {current_user}")
        user = User.query.get(current_user)
        print(f"User found: {user.full_name if user else 'None'}")
        print(f"User hospital ID: {user.hospital_id if user else 'None'}")
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'Hospital not found'}), 404
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        search = request.args.get('search', '')
        category = request.args.get('category', '')
        status = request.args.get('status', '')  # 'low_stock', 'expired', 'expiring_soon'
        sort_by = request.args.get('sort_by', 'name')
        sort_order = request.args.get('sort_order', 'asc')
        
        # Base query
        query = Medicine.query.filter_by(hospital_id=user.hospital_id, is_active=True)
        
        # Apply search filter
        if search:
            query = query.filter(
                or_(
                    Medicine.name.ilike(f'%{search}%'),
                    Medicine.generic_name.ilike(f'%{search}%'),
                    Medicine.brand_name.ilike(f'%{search}%'),
                    Medicine.manufacturer.ilike(f'%{search}%')
                )
            )
        
        # Apply category filter
        if category:
            query = query.filter(Medicine.category == category)
        
        # Apply status filter
        if status == 'low_stock':
            query = query.filter(Medicine.quantity_in_stock <= Medicine.reorder_level)
        elif status == 'expired':
            query = query.filter(Medicine.expiry_date < date.today())
        elif status == 'expiring_soon':
            thirty_days_from_now = date.today() + timedelta(days=30)
            query = query.filter(
                and_(
                    Medicine.expiry_date <= thirty_days_from_now,
                    Medicine.expiry_date >= date.today()
                )
            )
        
        # Apply sorting
        if hasattr(Medicine, sort_by):
            if sort_order == 'desc':
                query = query.order_by(getattr(Medicine, sort_by).desc())
            else:
                query = query.order_by(getattr(Medicine, sort_by))
        
        # Paginate
        medicines = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Get categories for filter dropdown
        categories = db.session.query(Medicine.category).filter_by(
            hospital_id=user.hospital_id, is_active=True
        ).distinct().all()
        categories = [cat[0] for cat in categories if cat[0]]
        
        # Get summary statistics
        total_medicines = Medicine.query.filter_by(hospital_id=user.hospital_id, is_active=True).count()
        low_stock_count = Medicine.query.filter(
            Medicine.hospital_id == user.hospital_id,
            Medicine.is_active == True,
            Medicine.quantity_in_stock <= Medicine.reorder_level
        ).count()
        expired_count = Medicine.query.filter(
            Medicine.hospital_id == user.hospital_id,
            Medicine.is_active == True,
            Medicine.expiry_date < date.today()
        ).count()
        
        return jsonify({
            'medicines': [medicine.to_dict() for medicine in medicines.items],
            'pagination': {
                'page': medicines.page,
                'pages': medicines.pages,
                'per_page': medicines.per_page,
                'total': medicines.total,
                'has_next': medicines.has_next,
                'has_prev': medicines.has_prev
            },
            'categories': categories,
            'summary': {
                'total_medicines': total_medicines,
                'low_stock_count': low_stock_count,
                'expired_count': expired_count
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting medicines: {str(e)}")
        return jsonify({'error': 'Failed to fetch medicines'}), 500

@pharmacy_bp.route('/medicines', methods=['POST'])
@jwt_required()
def add_medicine():
    """Add a new medicine to inventory"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user)
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'Hospital not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'category', 'quantity_in_stock', 'cost_price', 'selling_price']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create new medicine
        medicine = Medicine(
            hospital_id=user.hospital_id,
            name=data['name'],
            generic_name=data.get('generic_name'),
            brand_name=data.get('brand_name'),
            manufacturer=data.get('manufacturer'),
            category=data['category'],
            therapeutic_class=data.get('therapeutic_class'),
            composition=data.get('composition'),
            strength=data.get('strength'),
            dosage_form=data.get('dosage_form'),
            batch_number=data.get('batch_number'),
            quantity_in_stock=data['quantity_in_stock'],
            unit_of_measurement=data.get('unit_of_measurement', 'pieces'),
            reorder_level=data.get('reorder_level', 10),
            max_stock_level=data.get('max_stock_level', 1000),
            cost_price=data['cost_price'],
            selling_price=data['selling_price'],
            mrp=data.get('mrp'),
            discount_percentage=data.get('discount_percentage', 0),
            storage_location=data.get('storage_location'),
            storage_temperature=data.get('storage_temperature'),
            drug_license_number=data.get('drug_license_number'),
            schedule=data.get('schedule'),
            prescription_required=data.get('prescription_required', True)
        )
        
        # Handle dates
        if data.get('manufacturing_date'):
            medicine.manufacturing_date = datetime.strptime(data['manufacturing_date'], '%Y-%m-%d').date()
        if data.get('expiry_date'):
            medicine.expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
        
        db.session.add(medicine)
        db.session.flush()  # Get the medicine ID
        
        # Create initial stock movement
        if medicine.quantity_in_stock > 0:
            stock_movement = StockMovement(
                medicine_id=medicine.id,
                hospital_id=user.hospital_id,
                movement_type='IN',
                quantity=medicine.quantity_in_stock,
                unit_cost=medicine.cost_price,
                total_cost=medicine.cost_price * medicine.quantity_in_stock,
                reference_type='INITIAL_STOCK',
                batch_number=medicine.batch_number,
                expiry_date=medicine.expiry_date,
                created_by=current_user,
                notes='Initial stock entry'
            )
            db.session.add(stock_movement)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Medicine added successfully',
            'medicine': medicine.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding medicine: {str(e)}")
        return jsonify({'error': 'Failed to add medicine'}), 500

@pharmacy_bp.route('/medicines/<int:medicine_id>', methods=['GET'])
@jwt_required()
def get_medicine(medicine_id):
    """Get a specific medicine by ID"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user)
        
        medicine = Medicine.query.filter_by(
            id=medicine_id, 
            hospital_id=user.hospital_id,
            is_active=True
        ).first()
        
        if not medicine:
            return jsonify({'error': 'Medicine not found'}), 404
        
        # Get recent stock movements
        recent_movements = StockMovement.query.filter_by(
            medicine_id=medicine_id
        ).order_by(StockMovement.created_at.desc()).limit(10).all()
        
        return jsonify({
            'medicine': medicine.to_dict(),
            'recent_movements': [movement.to_dict() for movement in recent_movements]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting medicine: {str(e)}")
        return jsonify({'error': 'Failed to fetch medicine'}), 500

@pharmacy_bp.route('/medicines/<int:medicine_id>', methods=['PUT'])
@jwt_required()
def update_medicine(medicine_id):
    """Update a medicine"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user)
        
        medicine = Medicine.query.filter_by(
            id=medicine_id, 
            hospital_id=user.hospital_id,
            is_active=True
        ).first()
        
        if not medicine:
            return jsonify({'error': 'Medicine not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        updatable_fields = [
            'name', 'generic_name', 'brand_name', 'manufacturer', 'category',
            'therapeutic_class', 'composition', 'strength', 'dosage_form',
            'batch_number', 'unit_of_measurement', 'reorder_level', 'max_stock_level',
            'cost_price', 'selling_price', 'mrp', 'discount_percentage',
            'storage_location', 'storage_temperature', 'drug_license_number',
            'schedule', 'prescription_required'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(medicine, field, data[field])
        
        # Handle dates
        if 'manufacturing_date' in data and data['manufacturing_date']:
            medicine.manufacturing_date = datetime.strptime(data['manufacturing_date'], '%Y-%m-%d').date()
        if 'expiry_date' in data and data['expiry_date']:
            medicine.expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
        
        medicine.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Medicine updated successfully',
            'medicine': medicine.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating medicine: {str(e)}")
        return jsonify({'error': 'Failed to update medicine'}), 500

@pharmacy_bp.route('/medicines/<int:medicine_id>/stock', methods=['POST'])
@jwt_required()
def update_stock(medicine_id):
    """Update medicine stock (add or remove)"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user)
        
        medicine = Medicine.query.filter_by(
            id=medicine_id, 
            hospital_id=user.hospital_id,
            is_active=True
        ).first()
        
        if not medicine:
            return jsonify({'error': 'Medicine not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if 'movement_type' not in data or 'quantity' not in data:
            return jsonify({'error': 'movement_type and quantity are required'}), 400
        
        movement_type = data['movement_type']  # 'IN' or 'OUT'
        quantity = int(data['quantity'])
        
        if quantity <= 0:
            return jsonify({'error': 'Quantity must be positive'}), 400
        
        # Update stock based on movement type
        if movement_type == 'IN':
            medicine.quantity_in_stock += quantity
        elif movement_type == 'OUT':
            if medicine.quantity_in_stock < quantity:
                return jsonify({'error': 'Insufficient stock'}), 400
            medicine.quantity_in_stock -= quantity
        else:
            return jsonify({'error': 'Invalid movement type'}), 400
        
        # Create stock movement record
        stock_movement = StockMovement(
            medicine_id=medicine_id,
            hospital_id=user.hospital_id,
            movement_type=movement_type,
            quantity=quantity,
            unit_cost=data.get('unit_cost', medicine.cost_price),
            total_cost=data.get('unit_cost', medicine.cost_price) * quantity,
            reference_type=data.get('reference_type', 'MANUAL_ADJUSTMENT'),
            reference_id=data.get('reference_id'),
            supplier_name=data.get('supplier_name'),
            batch_number=data.get('batch_number', medicine.batch_number),
            notes=data.get('notes'),
            created_by=current_user
        )
        
        if data.get('expiry_date'):
            stock_movement.expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
        
        db.session.add(stock_movement)
        medicine.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Stock updated successfully',
            'medicine': medicine.to_dict(),
            'movement': stock_movement.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating stock: {str(e)}")
        return jsonify({'error': 'Failed to update stock'}), 500

@pharmacy_bp.route('/medicines/<int:medicine_id>', methods=['DELETE'])
@jwt_required()
def delete_medicine(medicine_id):
    """Soft delete a medicine"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user)
        
        medicine = Medicine.query.filter_by(
            id=medicine_id, 
            hospital_id=user.hospital_id,
            is_active=True
        ).first()
        
        if not medicine:
            return jsonify({'error': 'Medicine not found'}), 404
        
        medicine.is_active = False
        medicine.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Medicine deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting medicine: {str(e)}")
        return jsonify({'error': 'Failed to delete medicine'}), 500

@pharmacy_bp.route('/stock-movements', methods=['GET'])
@jwt_required()
def get_stock_movements():
    """Get stock movements with filtering"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user)
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'Hospital not found'}), 404
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        medicine_id = request.args.get('medicine_id', type=int)
        movement_type = request.args.get('movement_type')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Base query
        query = StockMovement.query.filter_by(hospital_id=user.hospital_id)
        
        # Apply filters
        if medicine_id:
            query = query.filter(StockMovement.medicine_id == medicine_id)
        if movement_type:
            query = query.filter(StockMovement.movement_type == movement_type)
        if start_date:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(StockMovement.created_at >= start)
        if end_date:
            end = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
            query = query.filter(StockMovement.created_at < end)
        
        # Order by most recent first
        query = query.order_by(StockMovement.created_at.desc())
        
        # Paginate
        movements = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'movements': [movement.to_dict() for movement in movements.items],
            'pagination': {
                'page': movements.page,
                'pages': movements.pages,
                'per_page': movements.per_page,
                'total': movements.total,
                'has_next': movements.has_next,
                'has_prev': movements.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting stock movements: {str(e)}")
        return jsonify({'error': 'Failed to fetch stock movements'}), 500

@pharmacy_bp.route('/dashboard-stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get pharmacy dashboard statistics"""
    try:
        current_user = get_jwt_identity()
        print(f"Dashboard stats - Current user ID: {current_user}")
        user = User.query.get(current_user)
        print(f"Dashboard stats - User found: {user.full_name if user else 'None'}")
        print(f"Dashboard stats - User hospital ID: {user.hospital_id if user else 'None'}")
        
        if not user or not user.hospital_id:
            return jsonify({'error': 'Hospital not found'}), 404
        
        hospital_id = user.hospital_id
        
        # Basic counts
        total_medicines = Medicine.query.filter_by(hospital_id=hospital_id, is_active=True).count()
        
        # Stock status counts
        low_stock = Medicine.query.filter(
            Medicine.hospital_id == hospital_id,
            Medicine.is_active == True,
            Medicine.quantity_in_stock <= Medicine.reorder_level
        ).count()
        
        out_of_stock = Medicine.query.filter(
            Medicine.hospital_id == hospital_id,
            Medicine.is_active == True,
            Medicine.quantity_in_stock == 0
        ).count()
        
        # Expiry related counts
        expired = Medicine.query.filter(
            Medicine.hospital_id == hospital_id,
            Medicine.is_active == True,
            Medicine.expiry_date < date.today()
        ).count()
        
        expiring_soon = Medicine.query.filter(
            Medicine.hospital_id == hospital_id,
            Medicine.is_active == True,
            Medicine.expiry_date <= date.today() + timedelta(days=30),
            Medicine.expiry_date >= date.today()
        ).count()
        
        # Total inventory value
        total_value = db.session.query(
            func.sum(Medicine.quantity_in_stock * Medicine.cost_price)
        ).filter(
            Medicine.hospital_id == hospital_id,
            Medicine.is_active == True
        ).scalar() or 0
        
        # Recent stock movements (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        recent_movements = StockMovement.query.filter(
            StockMovement.hospital_id == hospital_id,
            StockMovement.created_at >= week_ago
        ).count()
        
        # Top categories by count
        categories = db.session.query(
            Medicine.category,
            func.count(Medicine.id).label('count')
        ).filter(
            Medicine.hospital_id == hospital_id,
            Medicine.is_active == True
        ).group_by(Medicine.category).order_by(func.count(Medicine.id).desc()).limit(5).all()
        
        return jsonify({
            'total_medicines': total_medicines,
            'low_stock': low_stock,
            'out_of_stock': out_of_stock,
            'expired': expired,
            'expiring_soon': expiring_soon,
            'total_inventory_value': round(total_value, 2),
            'recent_movements': recent_movements,
            'top_categories': [{'name': cat[0], 'count': cat[1]} for cat in categories if cat[0]]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting dashboard stats: {str(e)}")
        return jsonify({'error': 'Failed to fetch dashboard statistics'}), 500