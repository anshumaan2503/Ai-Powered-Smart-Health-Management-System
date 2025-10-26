#!/usr/bin/env python3
"""
Generate realistic revenue data for all hospitals
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.patient import Patient
from hospital.models.appointment import Appointment
from datetime import datetime, timedelta
import random
from faker import Faker

fake = Faker('en_IN')

def generate_revenue_data():
    app = create_app()
    
    with app.app_context():
        print("💰 Generating Realistic Hospital Revenue Data...")
        print("=" * 60)
        
        hospitals = Hospital.query.all()
        
        # Revenue ranges based on hospital type/size
        revenue_ranges = {
            'small': (50000, 150000),      # Small clinics: ₹50K-₹1.5L per month
            'medium': (200000, 500000),    # Medium hospitals: ₹2L-₹5L per month
            'large': (800000, 2000000),    # Large hospitals: ₹8L-₹20L per month
            'premium': (1500000, 3500000)  # Premium hospitals: ₹15L-₹35L per month
        }
        
        # Categorize hospitals by name/type
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
        
        for hospital in hospitals:
            if not hospital.id:
                continue
                
            print(f"\n🏥 {hospital.name}")
            
            category = get_hospital_category(hospital.name)
            min_revenue, max_revenue = revenue_ranges[category]
            
            # Generate revenue for last 12 months
            total_revenue = 0
            monthly_revenues = []
            
            for month_offset in range(12, 0, -1):
                # Calculate date for this month
                target_date = datetime.now() - timedelta(days=30 * month_offset)
                
                # Generate monthly revenue with some variation
                base_revenue = random.randint(min_revenue, max_revenue)
                
                # Add seasonal variation (higher in winter months)
                if target_date.month in [11, 12, 1, 2]:  # Winter months
                    base_revenue = int(base_revenue * random.uniform(1.1, 1.3))
                elif target_date.month in [6, 7, 8]:  # Monsoon months
                    base_revenue = int(base_revenue * random.uniform(0.8, 0.9))
                
                monthly_revenues.append(base_revenue)
                total_revenue += base_revenue
            
            # Update hospital with revenue data (we'll store in a custom field or create revenue records)
            # For now, let's create some sample appointments with fees to generate revenue
            
            # Get existing patients for this hospital
            patients = Patient.query.filter_by(hospital_id=hospital.id).limit(50).all()
            
            if patients:
                # Generate appointments with fees for revenue
                appointments_created = 0
                target_appointments = random.randint(100, 300)  # Appointments per month
                
                for month_offset in range(6, 0, -1):  # Last 6 months
                    month_date = datetime.now() - timedelta(days=30 * month_offset)
                    month_revenue = monthly_revenues[month_offset - 1] if month_offset <= len(monthly_revenues) else monthly_revenues[0]
                    
                    # Calculate average fee per appointment
                    avg_fee = month_revenue // target_appointments if target_appointments > 0 else 1000
                    
                    # Create appointments for this month
                    for _ in range(random.randint(80, target_appointments)):
                        if appointments_created >= 200:  # Limit total appointments
                            break
                            
                        patient = random.choice(patients)
                        
                        # Random appointment date in this month
                        appointment_date = month_date + timedelta(
                            days=random.randint(0, 28),
                            hours=random.randint(9, 17),
                            minutes=random.choice([0, 15, 30, 45])
                        )
                        
                        # Generate realistic fee based on appointment type
                        fee_types = [
                            (500, 800, 'Consultation'),
                            (1000, 2000, 'Specialist Consultation'),
                            (2000, 5000, 'Procedure'),
                            (5000, 15000, 'Surgery'),
                            (300, 600, 'Follow-up'),
                            (1500, 3000, 'Diagnostic')
                        ]
                        
                        min_fee, max_fee, appointment_type = random.choice(fee_types)
                        fee = random.randint(min_fee, max_fee)
                        
                        # Check if appointment already exists
                        existing = Appointment.query.filter_by(
                            patient_id=patient.id,
                            appointment_date=appointment_date
                        ).first()
                        
                        if not existing:
                            # Generate unique appointment ID
                            import time
                            appointment_id = f"APT{int(time.time())}{random.randint(100, 999)}"
                            
                            # Get a random doctor for this hospital
                            from hospital.models.doctor import Doctor
                            doctors = Doctor.query.filter_by(hospital_id=hospital.id).all()
                            if not doctors:
                                continue  # Skip if no doctors
                            
                            doctor = random.choice(doctors)
                            
                            appointment = Appointment(
                                appointment_id=appointment_id,
                                patient_id=patient.id,
                                doctor_id=doctor.id,
                                hospital_id=hospital.id,
                                appointment_date=appointment_date,
                                appointment_type=appointment_type,
                                status='completed',
                                consultation_fee=fee,
                                payment_status='paid',
                                symptoms=fake.sentence(),
                                notes=f'{appointment_type} - {fake.sentence()}'
                            )
                            
                            db.session.add(appointment)
                            appointments_created += 1
                    
                    if appointments_created >= 200:
                        break
                
                print(f"   💳 Generated {appointments_created} revenue appointments")
                print(f"   📊 Category: {category.title()}")
                print(f"   💰 Est. Monthly Revenue: ₹{min_revenue:,} - ₹{max_revenue:,}")
                
            else:
                print(f"   ⚠️  No patients found - skipping revenue generation")
        
        # Commit all changes
        db.session.commit()
        
        print(f"\n🎉 Revenue Data Generation Complete!")
        print(f"📊 Generated realistic revenue data for {len(hospitals)} hospitals")
        print(f"💡 Analytics pages will now show practical revenue numbers")
        
        # Show summary
        print(f"\n📋 Revenue Categories:")
        print(f"   • Small Clinics: ₹50K-₹1.5L/month")
        print(f"   • Medium Hospitals: ₹2L-₹5L/month") 
        print(f"   • Large Hospitals: ₹8L-₹20L/month")
        print(f"   • Premium Hospitals: ₹15L-₹35L/month")

if __name__ == "__main__":
    generate_revenue_data()