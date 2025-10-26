#!/usr/bin/env python3
"""
Enhance analytics data with additional realistic patterns
"""

import sys
import os
import random
from datetime import datetime, timedelta

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.appointment import Appointment
from hospital.models.patient import Patient
from hospital.models.doctor import Doctor

def enhance_appointment_patterns():
    """Add more realistic appointment patterns"""
    app = create_app()
    
    with app.app_context():
        print("📈 Enhancing appointment patterns...")
        
        # Get all appointments
        appointments = Appointment.query.all()
        
        # Add more realistic hourly distribution
        business_hours = [9, 10, 11, 14, 15, 16, 17]  # 9 AM to 5 PM (skip lunch hour 12-1)
        
        for appointment in appointments:
            # Set realistic appointment hours
            hour = random.choices(
                business_hours,
                weights=[15, 25, 30, 20, 25, 20, 10]  # Peak at 11 AM and 3 PM
            )[0]
            
            # Keep the same date but set realistic time
            new_datetime = appointment.appointment_date.replace(
                hour=hour,
                minute=random.choice([0, 15, 30, 45]),  # 15-minute intervals
                second=0,
                microsecond=0
            )
            appointment.appointment_date = new_datetime
        
        # Add weekend pattern (fewer appointments)
        weekend_appointments = [apt for apt in appointments if apt.appointment_date.weekday() >= 5]
        for apt in random.sample(weekend_appointments, len(weekend_appointments) // 3):
            # Move some weekend appointments to weekdays
            days_to_subtract = random.randint(1, 2)
            apt.appointment_date = apt.appointment_date - timedelta(days=days_to_subtract)
        
        db.session.commit()
        print("✅ Appointment patterns enhanced!")

def add_seasonal_trends():
    """Add seasonal trends to patient registrations"""
    app = create_app()
    
    with app.app_context():
        print("🌟 Adding seasonal trends...")
        
        patients = Patient.query.all()
        
        for patient in patients:
            # Add seasonal bias to registration dates
            month = patient.created_at.month
            
            # Winter months (Dec, Jan, Feb) - more registrations due to flu season
            if month in [12, 1, 2]:
                # Keep as is - higher registration
                pass
            # Spring months (Mar, Apr, May) - moderate registrations
            elif month in [3, 4, 5]:
                # Slightly reduce
                if random.random() < 0.1:
                    patient.created_at = patient.created_at + timedelta(days=random.randint(30, 60))
            # Summer months (Jun, Jul, Aug) - lower registrations
            elif month in [6, 7, 8]:
                # Reduce more
                if random.random() < 0.2:
                    patient.created_at = patient.created_at + timedelta(days=random.randint(15, 45))
            # Fall months (Sep, Oct, Nov) - back to school/work, more registrations
            else:
                # Keep as is
                pass
        
        db.session.commit()
        print("✅ Seasonal trends added!")

def enhance_doctor_performance():
    """Enhance doctor performance metrics"""
    app = create_app()
    
    with app.app_context():
        print("👨‍⚕️ Enhancing doctor performance...")
        
        doctors = Doctor.query.all()
        
        for doctor in doctors:
            # Count actual appointments
            appointment_count = Appointment.query.filter_by(doctor_id=doctor.id).count()
            doctor.total_patients = appointment_count
            
            # Adjust rating based on specialization and experience
            base_rating = 4.0
            
            # Experience bonus
            experience_bonus = min(doctor.experience_years * 0.02, 0.5)
            
            # Specialization bonus
            high_demand_specializations = ['Cardiology', 'Neurology', 'Surgery']
            specialization_bonus = 0.2 if doctor.specialization in high_demand_specializations else 0.1
            
            # Random variation
            random_factor = random.uniform(-0.3, 0.5)
            
            final_rating = base_rating + experience_bonus + specialization_bonus + random_factor
            doctor.rating = round(min(max(final_rating, 3.5), 5.0), 1)  # Clamp between 3.5 and 5.0
        
        db.session.commit()
        print("✅ Doctor performance enhanced!")

def main():
    """Main function"""
    print("🚀 Enhancing Analytics Data")
    print("=" * 30)
    
    enhance_appointment_patterns()
    add_seasonal_trends()
    enhance_doctor_performance()
    
    print("\n✅ Analytics data enhancement completed!")
    print("📊 Your dashboard will now show more realistic patterns and trends!")

if __name__ == '__main__':
    main()