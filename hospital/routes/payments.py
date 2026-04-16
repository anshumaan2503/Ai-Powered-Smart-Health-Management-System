from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import razorpay
import hmac
import hashlib
import json
from hospital import db
from hospital.models.payment import Payment
from hospital.models.user import User
from hospital.models.appointment import Appointment
from hospital.models.hospital_subscription import HospitalSubscription
from hospital.models.hospital import Hospital
from datetime import datetime

payments_bp = Blueprint('payments', __name__)

def get_razorpay_client():
    return razorpay.Client(auth=(
        current_app.config.get('RAZORPAY_KEY_ID', 'rzp_test_placeholder'),
        current_app.config.get('RAZORPAY_KEY_SECRET', 'placeholder_secret')
    ))

@payments_bp.route('/create-order', methods=['POST'])
@jwt_required()
def create_order():
    """Create a Razorpay order"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        data = request.json
        amount = data.get('amount')
        payment_type = data.get('payment_type') # 'subscription' or 'appointment'
        reference_id = data.get('reference_id') # Appointment ID or Plan Name
        
        if not amount or not payment_type:
            return jsonify({'error': 'Amount and payment_type are required'}), 400
            
        client = get_razorpay_client()
        
        # Razorpay expects amount in paise (multiply by 100)
        try:
            amount_paise = int(float(amount) * 100)
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid amount format'}), 400

        razorpay_order = client.order.create({
            'amount': amount_paise,
            'currency': 'INR',
            'payment_capture': 1,
            'notes': {
                'user_id': user.id,
                'hospital_id': user.hospital_id,
                'payment_type': payment_type,
                'reference_id': reference_id
            }
        })
        
        # Save order details in our database
        new_payment = Payment(
            user_id=user.id,
            hospital_id=user.hospital_id,
            amount=float(amount),
            currency='INR',
            razorpay_order_id=razorpay_order['id'],
            status='created',
            payment_type=payment_type,
            reference_id=reference_id # Store plan name or appointment ID
        )
        
        db.session.add(new_payment)
        db.session.commit()
        
        return jsonify({
            'order_id': razorpay_order['id'],
            'amount': amount,
            'currency': 'INR',
            'key_id': current_app.config.get('RAZORPAY_KEY_ID')
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/verify-payment', methods=['POST'])
@jwt_required()
def verify_payment():
    """Verify Razorpay payment signature"""
    try:
        data = request.json
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_signature = data.get('razorpay_signature')
        
        client = get_razorpay_client()
        
        # Verify signature
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        
        try:
            client.utility.verify_payment_signature(params_dict)
        except Exception:
            return jsonify({'error': 'Invalid payment signature'}), 400
            
        # Update payment status in DB
        payment = Payment.query.filter_by(razorpay_order_id=razorpay_order_id).first()
        if not payment:
            return jsonify({'error': 'Payment record not found'}), 404
            
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = 'captured'
        
        from hospital.utils.subscription_utils import PLAN_CONFIGS
        from datetime import datetime, timedelta

        # Perform action based on payment type
        if payment.payment_type == 'subscription':
            new_plan = payment.reference_id # Assuming we stored plan_name here
            billing_cycle = 'monthly' # Default or we could store this in notes/Payment model
            
            if new_plan in PLAN_CONFIGS:
                # Deactivate current subscription
                current_subscription = HospitalSubscription.query.filter_by(
                    hospital_id=payment.hospital_id,
                    is_active=True
                ).first()
                if current_subscription:
                    current_subscription.is_active = False
                
                # Create new subscription
                config = PLAN_CONFIGS[new_plan]
                new_subscription = HospitalSubscription(
                    hospital_id=payment.hospital_id,
                    plan_name=new_plan,
                    max_patients=config['max_patients'],
                    max_doctors=config['max_doctors'],
                    max_staff=config['max_staff'],
                    features=config['features'],
                    subscription_start=datetime.utcnow().date(),
                    subscription_end=(datetime.utcnow() + timedelta(days=365 if billing_cycle == 'annual' else 30)).date(),
                    monthly_fee=payment.amount
                )
                db.session.add(new_subscription)
            
        elif payment.payment_type == 'appointment':
            # Update appointment status
            appointment = Appointment.query.get(payment.reference_id)
            if appointment:
                appointment.payment_status = 'paid'
                # Set to 'requested' so it now appears in hospital dashboard
                appointment.status = 'requested'
        
        db.session.commit()
        
        return jsonify({'message': 'Payment verified successfully', 'status': 'success'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/webhook', methods=['POST'])
def webhook():
    """Razorpay Webhook handler"""
    webhook_secret = current_app.config.get('RAZORPAY_WEBHOOK_SECRET')
    if not webhook_secret:
        return jsonify({'status': 'ignored'}), 200
        
    payload = request.get_data()
    signature = request.headers.get('X-Razorpay-Signature')
    
    # Verify webhook signature
    expected_signature = hmac.new(
        webhook_secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    if signature != expected_signature:
        return jsonify({'error': 'Invalid signature'}), 400
        
    event = json.loads(payload)
    
    if event['event'] == 'payment.captured':
        payment_id = event['payload']['payment']['entity']['id']
        order_id = event['payload']['payment']['entity']['order_id']
        
        payment = Payment.query.filter_by(razorpay_order_id=order_id).first()
        if payment and payment.status != 'captured':
            payment.razorpay_payment_id = payment_id
            payment.status = 'captured'
            
            # Action logic here (similar to verify_payment)
            if payment.payment_type == 'appointment':
                appointment = Appointment.query.get(payment.reference_id)
                if appointment:
                    appointment.payment_status = 'paid'
                    # Set to 'requested' for hospital visibility
                    appointment.status = 'requested'
            
            db.session.commit()
            
    return jsonify({'status': 'ok'}), 200
