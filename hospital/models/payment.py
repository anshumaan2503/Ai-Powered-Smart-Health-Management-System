from hospital import db
from datetime import datetime

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=True)
    
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default='INR')
    
    razorpay_order_id = db.Column(db.String(100), unique=True, nullable=False)
    razorpay_payment_id = db.Column(db.String(100), unique=True, nullable=True)
    razorpay_signature = db.Column(db.String(255), nullable=True)
    
    status = db.Column(db.String(20), default='created')  # created, captured, failed, refunded
    payment_type = db.Column(db.String(50), nullable=False)  # 'subscription', 'appointment'
    reference_id = db.Column(db.String(100), nullable=True)  # ID of the sub or appointment
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'currency': self.currency,
            'razorpay_order_id': self.razorpay_order_id,
            'razorpay_payment_id': self.razorpay_payment_id,
            'status': self.status,
            'payment_type': self.payment_type,
            'reference_id': self.reference_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
