#!/usr/bin/env python3
"""
Script to seed Indian medicine data for pharmacy inventory
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models import Hospital, Medicine, StockMovement
from datetime import datetime, date, timedelta
import random
from faker import Faker

fake = Faker('en_IN')  # Indian locale

# Common Indian medicines with realistic data
INDIAN_MEDICINES = [
    # Antibiotics
    {
        'name': 'Amoxicillin',
        'generic_name': 'Amoxicillin',
        'brand_name': 'Amoxil',
        'manufacturer': 'GlaxoSmithKline',
        'category': 'Antibiotic',
        'therapeutic_class': 'Penicillin Antibiotic',
        'composition': 'Amoxicillin Trihydrate',
        'strength': '500mg',
        'dosage_form': 'Capsule',
        'cost_price': 45,
        'selling_price': 65,
        'mrp': 75,
        'schedule': 'H',
        'prescription_required': True
    },
    {
        'name': 'Azithromycin',
        'generic_name': 'Azithromycin',
        'brand_name': 'Azithral',
        'manufacturer': 'Alembic Pharmaceuticals',
        'category': 'Antibiotic',
        'therapeutic_class': 'Macrolide Antibiotic',
        'composition': 'Azithromycin Dihydrate',
        'strength': '250mg',
        'dosage_form': 'Tablet',
        'cost_price': 85,
        'selling_price': 120,
        'mrp': 135,
        'schedule': 'H',
        'prescription_required': True
    },
    {
        'name': 'Ciprofloxacin',
        'generic_name': 'Ciprofloxacin',
        'brand_name': 'Cipro',
        'manufacturer': 'Ranbaxy',
        'category': 'Antibiotic',
        'therapeutic_class': 'Fluoroquinolone',
        'composition': 'Ciprofloxacin HCl',
        'strength': '500mg',
        'dosage_form': 'Tablet',
        'cost_price': 35,
        'selling_price': 55,
        'mrp': 65,
        'schedule': 'H',
        'prescription_required': True
    },
    
    # Pain Killers
    {
        'name': 'Paracetamol',
        'generic_name': 'Paracetamol',
        'brand_name': 'Crocin',
        'manufacturer': 'GlaxoSmithKline',
        'category': 'Analgesic',
        'therapeutic_class': 'Non-opioid Analgesic',
        'composition': 'Paracetamol',
        'strength': '650mg',
        'dosage_form': 'Tablet',
        'cost_price': 15,
        'selling_price': 25,
        'mrp': 30,
        'schedule': None,
        'prescription_required': False
    },
    {
        'name': 'Ibuprofen',
        'generic_name': 'Ibuprofen',
        'brand_name': 'Brufen',
        'manufacturer': 'Abbott',
        'category': 'Analgesic',
        'therapeutic_class': 'NSAID',
        'composition': 'Ibuprofen',
        'strength': '400mg',
        'dosage_form': 'Tablet',
        'cost_price': 25,
        'selling_price': 40,
        'mrp': 48,
        'schedule': None,
        'prescription_required': False
    },
    {
        'name': 'Diclofenac',
        'generic_name': 'Diclofenac Sodium',
        'brand_name': 'Voveran',
        'manufacturer': 'Novartis',
        'category': 'Analgesic',
        'therapeutic_class': 'NSAID',
        'composition': 'Diclofenac Sodium',
        'strength': '50mg',
        'dosage_form': 'Tablet',
        'cost_price': 18,
        'selling_price': 32,
        'mrp': 38,
        'schedule': None,
        'prescription_required': False
    },
    
    # Antacids
    {
        'name': 'Omeprazole',
        'generic_name': 'Omeprazole',
        'brand_name': 'Prilosec',
        'manufacturer': 'Dr. Reddy\'s',
        'category': 'Antacid',
        'therapeutic_class': 'Proton Pump Inhibitor',
        'composition': 'Omeprazole',
        'strength': '20mg',
        'dosage_form': 'Capsule',
        'cost_price': 45,
        'selling_price': 68,
        'mrp': 78,
        'schedule': 'H',
        'prescription_required': True
    },
    {
        'name': 'Ranitidine',
        'generic_name': 'Ranitidine',
        'brand_name': 'Aciloc',
        'manufacturer': 'Cadila Healthcare',
        'category': 'Antacid',
        'therapeutic_class': 'H2 Receptor Antagonist',
        'composition': 'Ranitidine HCl',
        'strength': '150mg',
        'dosage_form': 'Tablet',
        'cost_price': 22,
        'selling_price': 35,
        'mrp': 42,
        'schedule': None,
        'prescription_required': False
    },
    
    # Diabetes
    {
        'name': 'Metformin',
        'generic_name': 'Metformin',
        'brand_name': 'Glycomet',
        'manufacturer': 'USV',
        'category': 'Antidiabetic',
        'therapeutic_class': 'Biguanide',
        'composition': 'Metformin HCl',
        'strength': '500mg',
        'dosage_form': 'Tablet',
        'cost_price': 35,
        'selling_price': 55,
        'mrp': 65,
        'schedule': 'H',
        'prescription_required': True
    },
    {
        'name': 'Glimepiride',
        'generic_name': 'Glimepiride',
        'brand_name': 'Amaryl',
        'manufacturer': 'Sanofi',
        'category': 'Antidiabetic',
        'therapeutic_class': 'Sulfonylurea',
        'composition': 'Glimepiride',
        'strength': '2mg',
        'dosage_form': 'Tablet',
        'cost_price': 65,
        'selling_price': 95,
        'mrp': 110,
        'schedule': 'H',
        'prescription_required': True
    },
    
    # Hypertension
    {
        'name': 'Amlodipine',
        'generic_name': 'Amlodipine',
        'brand_name': 'Norvasc',
        'manufacturer': 'Pfizer',
        'category': 'Antihypertensive',
        'therapeutic_class': 'Calcium Channel Blocker',
        'composition': 'Amlodipine Besylate',
        'strength': '5mg',
        'dosage_form': 'Tablet',
        'cost_price': 28,
        'selling_price': 45,
        'mrp': 52,
        'schedule': 'H',
        'prescription_required': True
    },
    {
        'name': 'Atenolol',
        'generic_name': 'Atenolol',
        'brand_name': 'Tenormin',
        'manufacturer': 'AstraZeneca',
        'category': 'Antihypertensive',
        'therapeutic_class': 'Beta Blocker',
        'composition': 'Atenolol',
        'strength': '50mg',
        'dosage_form': 'Tablet',
        'cost_price': 22,
        'selling_price': 38,
        'mrp': 45,
        'schedule': 'H',
        'prescription_required': True
    },
    
    # Vitamins & Supplements
    {
        'name': 'Vitamin D3',
        'generic_name': 'Cholecalciferol',
        'brand_name': 'Calcirol',
        'manufacturer': 'Cadila Healthcare',
        'category': 'Vitamin',
        'therapeutic_class': 'Vitamin Supplement',
        'composition': 'Cholecalciferol',
        'strength': '60000 IU',
        'dosage_form': 'Capsule',
        'cost_price': 45,
        'selling_price': 68,
        'mrp': 78,
        'schedule': None,
        'prescription_required': False
    },
    {
        'name': 'Multivitamin',
        'generic_name': 'Multivitamin',
        'brand_name': 'Revital',
        'manufacturer': 'Ranbaxy',
        'category': 'Vitamin',
        'therapeutic_class': 'Multivitamin',
        'composition': 'Multivitamin & Minerals',
        'strength': 'Standard',
        'dosage_form': 'Capsule',
        'cost_price': 85,
        'selling_price': 125,
        'mrp': 145,
        'schedule': None,
        'prescription_required': False
    },
    
    # Cough & Cold
    {
        'name': 'Cetirizine',
        'generic_name': 'Cetirizine',
        'brand_name': 'Zyrtec',
        'manufacturer': 'UCB',
        'category': 'Antihistamine',
        'therapeutic_class': 'Antihistamine',
        'composition': 'Cetirizine HCl',
        'strength': '10mg',
        'dosage_form': 'Tablet',
        'cost_price': 18,
        'selling_price': 32,
        'mrp': 38,
        'schedule': None,
        'prescription_required': False
    },
    {
        'name': 'Dextromethorphan',
        'generic_name': 'Dextromethorphan',
        'brand_name': 'Benadryl',
        'manufacturer': 'Johnson & Johnson',
        'category': 'Cough Syrup',
        'therapeutic_class': 'Antitussive',
        'composition': 'Dextromethorphan HBr',
        'strength': '100ml',
        'dosage_form': 'Syrup',
        'cost_price': 65,
        'selling_price': 95,
        'mrp': 110,
        'schedule': None,
        'prescription_required': False
    },
    
    # Injections
    {
        'name': 'Insulin',
        'generic_name': 'Human Insulin',
        'brand_name': 'Humulin',
        'manufacturer': 'Eli Lilly',
        'category': 'Injection',
        'therapeutic_class': 'Antidiabetic Hormone',
        'composition': 'Human Insulin',
        'strength': '100 IU/ml',
        'dosage_form': 'Injection',
        'cost_price': 285,
        'selling_price': 420,
        'mrp': 485,
        'schedule': 'H',
        'prescription_required': True
    },
    {
        'name': 'Diclofenac Injection',
        'generic_name': 'Diclofenac Sodium',
        'brand_name': 'Voveran',
        'manufacturer': 'Novartis',
        'category': 'Injection',
        'therapeutic_class': 'NSAID',
        'composition': 'Diclofenac Sodium',
        'strength': '75mg/3ml',
        'dosage_form': 'Injection',
        'cost_price': 45,
        'selling_price': 68,
        'mrp': 78,
        'schedule': 'H',
        'prescription_required': True
    }
]

# Additional Indian pharmaceutical companies
INDIAN_MANUFACTURERS = [
    'Sun Pharmaceutical', 'Cipla', 'Dr. Reddy\'s Laboratories', 'Aurobindo Pharma',
    'Lupin', 'Cadila Healthcare', 'Glenmark Pharmaceuticals', 'Torrent Pharmaceuticals',
    'Alkem Laboratories', 'Mankind Pharma', 'Intas Pharmaceuticals', 'Hetero Drugs',
    'Strides Pharma', 'Biocon', 'Divi\'s Laboratories', 'Natco Pharma'
]

# Storage locations
STORAGE_LOCATIONS = [
    'Rack A1', 'Rack A2', 'Rack A3', 'Rack B1', 'Rack B2', 'Rack B3',
    'Cold Storage', 'Refrigerator', 'Controlled Room', 'General Storage',
    'Narcotics Safe', 'Emergency Stock'
]

# Storage temperatures
STORAGE_TEMPERATURES = [
    'Room Temperature (15-25°C)', 'Cool Place (8-15°C)', 'Refrigerate (2-8°C)',
    'Freeze (-20°C)', 'Do not freeze', 'Protect from light'
]

def create_medicine_variations():
    """Create variations of base medicines with different strengths and forms"""
    variations = []
    
    for base_medicine in INDIAN_MEDICINES:
        # Create 2-3 variations of each medicine
        for i in range(random.randint(2, 4)):
            medicine = base_medicine.copy()
            
            # Vary the brand name and manufacturer
            if random.choice([True, False]):
                medicine['manufacturer'] = random.choice(INDIAN_MANUFACTURERS)
                medicine['brand_name'] = f"{medicine['brand_name']}-{random.choice(['Plus', 'Forte', 'XR', 'SR', 'DS'])}"
            
            # Vary strength for tablets/capsules
            if medicine['dosage_form'] in ['Tablet', 'Capsule']:
                strengths = ['250mg', '500mg', '750mg', '1000mg', '100mg', '200mg']
                medicine['strength'] = random.choice(strengths)
            
            # Vary pricing slightly
            base_cost = medicine['cost_price']
            medicine['cost_price'] = base_cost + random.randint(-10, 20)
            medicine['selling_price'] = medicine['cost_price'] + random.randint(15, 35)
            medicine['mrp'] = medicine['selling_price'] + random.randint(5, 15)
            
            # Add batch number
            medicine['batch_number'] = f"BT{random.randint(100000, 999999)}"
            
            # Add storage info
            medicine['storage_location'] = random.choice(STORAGE_LOCATIONS)
            medicine['storage_temperature'] = random.choice(STORAGE_TEMPERATURES)
            
            # Add license number
            medicine['drug_license_number'] = f"DL{random.randint(10000, 99999)}"
            
            variations.append(medicine)
    
    return variations

def seed_medicines_for_hospital(hospital_id, num_medicines=50):
    """Seed medicines for a specific hospital"""
    print(f"Seeding medicines for hospital {hospital_id}...")
    
    # Get medicine variations
    medicine_variations = create_medicine_variations()
    
    # Select random medicines
    selected_medicines = random.sample(medicine_variations, min(num_medicines, len(medicine_variations)))
    
    medicines_created = 0
    
    for medicine_data in selected_medicines:
        try:
            # Create manufacturing and expiry dates
            manufacturing_date = fake.date_between(start_date='-2y', end_date='-6m')
            expiry_date = manufacturing_date + timedelta(days=random.randint(365, 1095))  # 1-3 years shelf life
            
            # Create medicine
            medicine = Medicine(
                hospital_id=hospital_id,
                name=medicine_data['name'],
                generic_name=medicine_data['generic_name'],
                brand_name=medicine_data['brand_name'],
                manufacturer=medicine_data['manufacturer'],
                category=medicine_data['category'],
                therapeutic_class=medicine_data['therapeutic_class'],
                composition=medicine_data['composition'],
                strength=medicine_data['strength'],
                dosage_form=medicine_data['dosage_form'],
                batch_number=medicine_data['batch_number'],
                quantity_in_stock=random.randint(10, 500),
                unit_of_measurement='pieces' if medicine_data['dosage_form'] in ['Tablet', 'Capsule'] else 'bottles',
                reorder_level=random.randint(5, 25),
                max_stock_level=random.randint(200, 1000),
                cost_price=medicine_data['cost_price'],
                selling_price=medicine_data['selling_price'],
                mrp=medicine_data['mrp'],
                discount_percentage=random.randint(0, 15),
                manufacturing_date=manufacturing_date,
                expiry_date=expiry_date,
                storage_location=medicine_data['storage_location'],
                storage_temperature=medicine_data['storage_temperature'],
                drug_license_number=medicine_data['drug_license_number'],
                schedule=medicine_data['schedule'],
                prescription_required=medicine_data['prescription_required']
            )
            
            db.session.add(medicine)
            db.session.flush()  # Get the medicine ID
            
            # Create initial stock movement
            stock_movement = StockMovement(
                medicine_id=medicine.id,
                hospital_id=hospital_id,
                movement_type='IN',
                quantity=medicine.quantity_in_stock,
                unit_cost=medicine.cost_price,
                total_cost=medicine.cost_price * medicine.quantity_in_stock,
                reference_type='INITIAL_STOCK',
                batch_number=medicine.batch_number,
                expiry_date=medicine.expiry_date,
                supplier_name=random.choice(['Apollo Pharmacy', 'MedPlus', 'Netmeds', 'PharmEasy', 'Local Distributor']),
                notes='Initial inventory setup'
            )
            
            db.session.add(stock_movement)
            medicines_created += 1
            
        except Exception as e:
            print(f"Error creating medicine {medicine_data['name']}: {str(e)}")
            continue
    
    try:
        db.session.commit()
        print(f"Successfully created {medicines_created} medicines for hospital {hospital_id}")
    except Exception as e:
        db.session.rollback()
        print(f"Error committing medicines: {str(e)}")

def main():
    app = create_app()
    
    with app.app_context():
        print("🏥 Starting Indian Medicine Data Seeding...")
        
        # Get all hospitals
        hospitals = Hospital.query.all()
        
        if not hospitals:
            print("❌ No hospitals found. Please create hospitals first.")
            return
        
        print(f"Found {len(hospitals)} hospitals")
        
        for hospital in hospitals:
            # Check if hospital already has medicines
            existing_medicines = Medicine.query.filter_by(hospital_id=hospital.id).count()
            
            if existing_medicines > 0:
                print(f"Hospital {hospital.name} already has {existing_medicines} medicines. Skipping...")
                continue
            
            # Seed medicines for this hospital
            num_medicines = random.randint(40, 80)  # Random number of medicines per hospital
            seed_medicines_for_hospital(hospital.id, num_medicines)
        
        print("✅ Medicine seeding completed!")
        print("\n📊 Summary:")
        
        # Print summary
        total_medicines = Medicine.query.count()
        total_hospitals_with_medicines = db.session.query(Medicine.hospital_id).distinct().count()
        
        print(f"Total medicines created: {total_medicines}")
        print(f"Hospitals with medicines: {total_hospitals_with_medicines}")
        
        # Print category breakdown
        categories = db.session.query(
            Medicine.category,
            db.func.count(Medicine.id).label('count')
        ).group_by(Medicine.category).all()
        
        print("\nMedicines by category:")
        for category, count in categories:
            print(f"  {category}: {count}")

if __name__ == '__main__':
    main()