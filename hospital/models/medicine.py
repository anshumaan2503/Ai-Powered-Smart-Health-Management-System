from hospital import db
from datetime import datetime, date
from sqlalchemy import func

class Medicine(db.Model):
    __tablename__ = 'medicines'
    
    id = db.Column(db.Integer, primary_key=True)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=False)
    
    # Basic Information
    name = db.Column(db.String(200), nullable=False)
    generic_name = db.Column(db.String(200))
    brand_name = db.Column(db.String(200))
    manufacturer = db.Column(db.String(200))
    
    # Medical Information
    category = db.Column(db.String(100))  # Tablet, Syrup, Injection, etc.
    therapeutic_class = db.Column(db.String(100))  # Antibiotic, Painkiller, etc.
    composition = db.Column(db.Text)  # Active ingredients
    strength = db.Column(db.String(50))  # 500mg, 10ml, etc.
    dosage_form = db.Column(db.String(50))  # Tablet, Capsule, Syrup, etc.
    
    # Inventory Information
    batch_number = db.Column(db.String(100))
    quantity_in_stock = db.Column(db.Integer, default=0)
    unit_of_measurement = db.Column(db.String(20), default='pieces')  # pieces, bottles, vials
    reorder_level = db.Column(db.Integer, default=10)
    max_stock_level = db.Column(db.Integer, default=1000)
    
    # Pricing (in INR)
    cost_price = db.Column(db.Float)  # Purchase price
    selling_price = db.Column(db.Float)  # Selling price
    mrp = db.Column(db.Float)  # Maximum Retail Price
    discount_percentage = db.Column(db.Float, default=0)
    
    # Dates
    manufacturing_date = db.Column(db.Date)
    expiry_date = db.Column(db.Date)
    
    # Storage Information
    storage_location = db.Column(db.String(100))  # Rack A1, Cold Storage, etc.
    storage_temperature = db.Column(db.String(50))  # Room temp, 2-8°C, etc.
    
    # Regulatory Information
    drug_license_number = db.Column(db.String(100))
    schedule = db.Column(db.String(10))  # H, H1, X, etc. (Indian drug schedules)
    prescription_required = db.Column(db.Boolean, default=True)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    is_banned = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hospital = db.relationship('Hospital', backref='medicines')
    stock_movements = db.relationship('StockMovement', backref='medicine', lazy='dynamic')
    
    def __repr__(self):
        return f'<Medicine {self.name}>'
    
    @property
    def is_expired(self):
        """Check if medicine is expired"""
        if self.expiry_date:
            return self.expiry_date < date.today()
        return False
    
    @property
    def days_to_expiry(self):
        """Calculate days until expiry"""
        if self.expiry_date:
            delta = self.expiry_date - date.today()
            return delta.days
        return None
    
    @property
    def is_low_stock(self):
        """Check if stock is below reorder level"""
        return self.quantity_in_stock <= self.reorder_level
    
    @property
    def stock_status(self):
        """Get stock status"""
        if self.quantity_in_stock == 0:
            return 'Out of Stock'
        elif self.is_low_stock:
            return 'Low Stock'
        elif self.quantity_in_stock >= self.max_stock_level:
            return 'Overstock'
        else:
            return 'In Stock'
    
    @property
    def profit_margin(self):
        """Calculate profit margin percentage"""
        if self.cost_price and self.selling_price:
            return ((self.selling_price - self.cost_price) / self.cost_price) * 100
        return 0
    
    def to_dict(self):
        return {
            'id': self.id,
            'hospital_id': self.hospital_id,
            'name': self.name,
            'generic_name': self.generic_name,
            'brand_name': self.brand_name,
            'manufacturer': self.manufacturer,
            'category': self.category,
            'therapeutic_class': self.therapeutic_class,
            'composition': self.composition,
            'strength': self.strength,
            'dosage_form': self.dosage_form,
            'batch_number': self.batch_number,
            'quantity_in_stock': self.quantity_in_stock,
            'unit_of_measurement': self.unit_of_measurement,
            'reorder_level': self.reorder_level,
            'max_stock_level': self.max_stock_level,
            'cost_price': self.cost_price,
            'selling_price': self.selling_price,
            'mrp': self.mrp,
            'discount_percentage': self.discount_percentage,
            'manufacturing_date': self.manufacturing_date.isoformat() if self.manufacturing_date else None,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'storage_location': self.storage_location,
            'storage_temperature': self.storage_temperature,
            'drug_license_number': self.drug_license_number,
            'schedule': self.schedule,
            'prescription_required': self.prescription_required,
            'is_active': self.is_active,
            'is_banned': self.is_banned,
            'is_expired': self.is_expired,
            'days_to_expiry': self.days_to_expiry,
            'is_low_stock': self.is_low_stock,
            'stock_status': self.stock_status,
            'profit_margin': self.profit_margin,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class StockMovement(db.Model):
    __tablename__ = 'stock_movements'
    
    id = db.Column(db.Integer, primary_key=True)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicines.id'), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=False)
    
    # Movement Details
    movement_type = db.Column(db.String(20), nullable=False)  # 'IN', 'OUT', 'ADJUSTMENT', 'EXPIRED', 'DAMAGED'
    quantity = db.Column(db.Integer, nullable=False)
    unit_cost = db.Column(db.Float)
    total_cost = db.Column(db.Float)
    
    # Reference Information
    reference_type = db.Column(db.String(50))  # 'PURCHASE', 'SALE', 'PRESCRIPTION', 'RETURN', 'ADJUSTMENT'
    reference_id = db.Column(db.String(100))  # Invoice number, prescription ID, etc.
    supplier_name = db.Column(db.String(200))
    
    # Additional Information
    batch_number = db.Column(db.String(100))
    expiry_date = db.Column(db.Date)
    notes = db.Column(db.Text)
    
    # User Information
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    hospital = db.relationship('Hospital')
    created_by_user = db.relationship('User')
    
    def to_dict(self):
        return {
            'id': self.id,
            'medicine_id': self.medicine_id,
            'hospital_id': self.hospital_id,
            'movement_type': self.movement_type,
            'quantity': self.quantity,
            'unit_cost': self.unit_cost,
            'total_cost': self.total_cost,
            'reference_type': self.reference_type,
            'reference_id': self.reference_id,
            'supplier_name': self.supplier_name,
            'batch_number': self.batch_number,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'notes': self.notes,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'medicine': self.medicine.to_dict() if self.medicine else None
        }