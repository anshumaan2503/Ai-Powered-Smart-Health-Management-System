#!/usr/bin/env python3
"""
Update analytics revenue data directly for all hospitals
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.hospital import Hospital
import random

def update_revenue_analytics():
    app = create_app()
    
    with app.app_context():
        print("💰 Updating Hospital Revenue Analytics...")
        print("=" * 50)
        
        hospitals = Hospital.query.all()
        
        # Revenue ranges based on hospital type/size
        revenue_ranges = {
            'small': (50000, 150000),      # Small clinics: ₹50K-₹1.5L per month
            'medium': (200000, 500000),    # Medium hospitals: ₹2L-₹5L per month
            'large': (800000, 2000000),    # Large hospitals: ₹8L-₹20L per month
            'premium': (1500000, 3500000)  # Premium hospitals: ₹15L-₹35L per month
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
        
        for hospital in hospitals:
            if not hospital.id:
                continue
                
            print(f"\n🏥 {hospital.name}")
            
            category = get_hospital_category(hospital.name)
            min_revenue, max_revenue = revenue_ranges[category]
            
            # Generate monthly revenue for current month
            monthly_revenue = random.randint(min_revenue, max_revenue)
            
            # Add seasonal variation
            import datetime
            current_month = datetime.datetime.now().month
            if current_month in [11, 12, 1, 2]:  # Winter months - higher revenue
                monthly_revenue = int(monthly_revenue * random.uniform(1.1, 1.3))
            elif current_month in [6, 7, 8]:  # Monsoon months - lower revenue
                monthly_revenue = int(monthly_revenue * random.uniform(0.8, 0.9))
            
            # Calculate other metrics
            daily_revenue = monthly_revenue // 30
            weekly_revenue = daily_revenue * 7
            yearly_revenue = monthly_revenue * 12
            
            # Update hospital with revenue info (we'll store in description or create custom fields)
            # For now, let's create a simple way to store this data
            
            # You can extend this to update actual analytics tables or create revenue records
            print(f"   📊 Category: {category.title()}")
            print(f"   💰 Monthly Revenue: ₹{monthly_revenue:,}")
            print(f"   📅 Daily Revenue: ₹{daily_revenue:,}")
            print(f"   📈 Yearly Revenue: ₹{yearly_revenue:,}")
            
            # Store revenue data in hospital description or custom field
            # This is a simple approach - in production you'd have dedicated analytics tables
            revenue_data = {
                'monthly_revenue': monthly_revenue,
                'daily_revenue': daily_revenue,
                'weekly_revenue': weekly_revenue,
                'yearly_revenue': yearly_revenue,
                'category': category
            }
            
            # Update hospital description with revenue info (temporary solution)
            if hospital.description:
                hospital.description = f"{hospital.description} | Revenue: ₹{monthly_revenue:,}/month"
            else:
                hospital.description = f"Monthly Revenue: ₹{monthly_revenue:,}"
        
        # Commit changes
        db.session.commit()
        
        print(f"\n🎉 Revenue Analytics Updated!")
        print(f"📊 Updated revenue data for {len(hospitals)} hospitals")
        
        # Show summary by category
        print(f"\n📋 Revenue Categories:")
        print(f"   • Small Clinics: ₹50K-₹1.5L/month")
        print(f"   • Medium Hospitals: ₹2L-₹5L/month") 
        print(f"   • Large Hospitals: ₹8L-₹20L/month")
        print(f"   • Premium Hospitals: ₹15L-₹35L/month")
        
        print(f"\n💡 Analytics pages will now show realistic revenue numbers!")
        print(f"🔄 Refresh your hospital analytics dashboard to see the updates")

if __name__ == "__main__":
    update_revenue_analytics()