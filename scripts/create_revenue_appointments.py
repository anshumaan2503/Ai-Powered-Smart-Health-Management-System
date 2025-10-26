#!/usr/bin/env python3
"""
Create appointments with consultation fees to generate realistic revenue
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.patient import Patient
from hospital.models.doctor import Doctor
from hospital.models.appointment import Appointment
from datetime import datetime, timedelta
import random
import uuid

def create_revenue_appointments():
    app = create_app()
    
    with app.app_context():
        print("💰 Creating Revenue-Generating Appointments...")
        print("=" * 60)
        
        hospitals = Hospital.query.all()
        
        # Revenue ranges based on hospital type/size
        revenue_targets = {
            'small': 80000,      # Small clinics: ₹80K per month
            'medium': 350000,    # Medium hospitals: ₹3.5L per month
            'large': 1200000,    # Large hospitals: ₹12L per month
            'premium': 2500000   # Premium hospitals: ₹25L per month
        }
        
        def get_hospital_category(name):
            name_lower = name.lower()
            if any(word in name_lower for word in ['apollo', 'fortis', 'max', 'aiims', 'medanta']):
                return 'premium'
            elif any(word in name_lower for word in ['multispecialty', 'healthcare', 'medical center']):
                return 'large'
            elif any(word in name_lower for word in ['hospital', 'clinic']):
                return 'medium'
            else:
                return 'small'
        
        # Consultation fee ranges by type
        fee_ranges = {
            'General Consultation': (500, 1000),
            'Specialist Consultation': (1200, 2500),
            'Follow-up': (300, 600),
            'Emergency': (2000, 5000),
            'Surgery Consultation': (3000, 8000),
            'Diagnostic Review': (800, 1500)
        }
        
        for hospital in hospitals:
            if not hospital.id:
                continue
                
            print(f"\n🏥 {hospital.name}")
            
            # Get patients and doctors for this hospital
            patients = Patient.query.filter_by(hospital_id=hospital.id).all()
            doctors = Doctor.query.filter_by(hospital_id=hospital.id).all()
            
            if not patients or not doctors:
                print(f"   ⚠️  No patients or doctors found - skipping")
                continue
            
            category = get_hospital_category(hospital.name)
            monthly_target = revenue_targets[category]
            
            print(f"   📊 Category: {category.title()}")
            print(f"   🎯 Target Revenue: ₹{monthly_target:,}/month")
            
            # Generate appointments for last 3 months to build revenue history
            appointments_created = 0
            total_revenue = 0
            
            for month_offset in range(3, 0, -1):  # Last 3 months
                month_start = datetime.now().replace(day=1) - timedelta(days=30 * month_offset)
                month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                
                # Calculate target for this month (with some variation)
                month_target = monthly_target * random.uniform(0.8, 1.2)
                
                # Determine number of appointments needed
                avg_fee = sum([sum(fee_range) / 2 for fee_range in fee_ranges.values()]) / len(fee_ranges)
                target_appointments = int(month_target / avg_fee)
                
                month_revenue = 0
                month_appointments = 0
                
                # Create appointments throughout the month
                for _ in range(min(target_appointments, 150)):  # Limit to 150 per month
                    # Random date in the month
                    days_in_month = (month_end - month_start).days
                    random_day = random.randint(0, days_in_month)
                    appointment_date = month_start + timedelta(
                        days=random_day,
                        hours=random.randint(9, 17),
                        minutes=random.choice([0, 15, 30, 45])
                    )
                    
                    # Skip weekends for most appointments
                    if appointment_date.weekday() >= 5 and random.random() > 0.3:
                        continue
                    
                    # Select random patient and doctor
                    patient = random.choice(patients)
                    doctor = random.choice(doctors)
                    
                    # Select appointment type and fee
                    appointment_type = random.choice(list(fee_ranges.keys()))
                    min_fee, max_fee = fee_ranges[appointment_type]
                    consultation_fee = random.randint(min_fee, max_fee)
                    
                    # Generate unique appointment ID
                    appointment_id = f"APT{uuid.uuid4().hex[:8].upper()}"
                    
                    # Check if similar appointment exists
                    existing = Appointment.query.filter_by(
                        patient_id=patient.id,
                        doctor_id=doctor.id,
                        appointment_date=appointment_date
                    ).first()
                    
                    if existing:
                        continue
                    
                    # Create appointment
                    appointment = Appointment(
                        appointment_id=appointment_id,
                        patient_id=patient.id,
                        doctor_id=doctor.id,
                        hospital_id=hospital.id,
                        appointment_date=appointment_date,
                        appointment_type=appointment_type,
                        status='completed',
                        consultation_fee=consultation_fee,
                        payment_status='paid',
                        symptoms=f"Patient consultation for {appointment_type.lower()}",
                        notes=f"Completed {appointment_type} - Patient responded well to treatment"
                    )
                    
                    db.session.add(appointment)
                    appointments_created += 1
                    month_appointments += 1
                    month_revenue += consultation_fee
                    total_revenue += consultation_fee
                    
                    # Break if we've reached the target revenue for this month
                    if month_revenue >= month_target:
                        break
                
                print(f"   📅 {month_start.strftime('%B')}: {month_appointments} appointments, ₹{month_revenue:,}")
            
            print(f"   💳 Total: {appointments_created} appointments")
            print(f"   💰 Total Revenue: ₹{total_revenue:,}")
            
            # Commit appointments for this hospital
            try:
                db.session.commit()
                print(f"   ✅ Successfully created revenue data")
            except Exception as e:
                db.session.rollback()
                print(f"   ❌ Error: {str(e)}")
        
        print(f"\n🎉 Revenue Generation Complete!")
        print(f"📊 Analytics pages will now show realistic revenue numbers")
        print(f"🔄 Refresh hospital analytics dashboards to see the updates")

if __name__ == "__main__":
    create_revenue_appointments()