#!/usr/bin/env python3
"""
Comprehensive system status check - verify all data is present and consistent
"""

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User
from hospital.models.patient import Patient
from hospital.models.doctor import Doctor
from hospital.models.hospital_subscription import HospitalSubscription

def check_system_status():
    app = create_app()
    
    with app.app_context():
        print("🔍 SYSTEM STATUS CHECK")
        print("=" * 50)
        
        # Check Hospitals
        hospitals = Hospital.query.all()
        print(f"🏥 Hospitals: {len(hospitals)}")
        for hospital in hospitals:
            print(f"   - {hospital.name} (ID: {hospital.id})")
        
        # Check Hospital Admins
        admins = User.query.filter_by(role='admin').all()
        print(f"\n👨‍💼 Hospital Admins: {len(admins)}")
        for admin in admins:
            hospital = Hospital.query.get(admin.hospital_id)
            print(f"   - {admin.email} → {hospital.name if hospital else 'No Hospital'}")
        
        # Check Doctors
        doctors = User.query.filter_by(role='doctor').all()
        doctor_profiles = Doctor.query.all()
        print(f"\n👨‍⚕️ Doctors: {len(doctors)} users, {len(doctor_profiles)} profiles")
        
        for hospital in hospitals:
            hospital_doctors = User.query.filter_by(role='doctor', hospital_id=hospital.id).all()
            print(f"   {hospital.name}: {len(hospital_doctors)} doctors")
            for doctor in hospital_doctors:
                profile = Doctor.query.filter_by(user_id=doctor.id).first()
                specialization = profile.specialization if profile else "No Profile"
                print(f"     - Dr. {doctor.first_name} {doctor.last_name} ({specialization})")
        
        # Check Patients
        patients = User.query.filter_by(role='patient').all()
        patient_profiles = Patient.query.all()
        print(f"\n👤 Patients: {len(patients)} users, {len(patient_profiles)} profiles")
        
        for hospital in hospitals:
            hospital_patients = Patient.query.filter_by(hospital_id=hospital.id).all()
            print(f"   {hospital.name}: {len(hospital_patients)} patients")
            for patient in hospital_patients[:3]:  # Show first 3
                user = User.query.get(patient.user_id)
                print(f"     - {user.first_name} {user.last_name} ({patient.patient_id})")
            if len(hospital_patients) > 3:
                print(f"     ... and {len(hospital_patients) - 3} more")
        
        # Check Subscriptions
        subscriptions = HospitalSubscription.query.all()
        print(f"\n💳 Subscriptions: {len(subscriptions)}")
        for subscription in subscriptions:
            hospital = Hospital.query.get(subscription.hospital_id)
            print(f"   - {hospital.name if hospital else 'Unknown'}: {subscription.plan_name}")
        
        # Check for Issues
        print(f"\n🔍 ISSUE CHECK:")
        issues = []
        
        # Check if all hospitals have admins
        for hospital in hospitals:
            admin = User.query.filter_by(role='admin', hospital_id=hospital.id).first()
            if not admin:
                issues.append(f"❌ {hospital.name} has no admin")
        
        # Check if all hospitals have subscriptions
        for hospital in hospitals:
            subscription = HospitalSubscription.query.filter_by(hospital_id=hospital.id).first()
            if not subscription:
                issues.append(f"❌ {hospital.name} has no subscription")
        
        # Check if all doctors have profiles
        for doctor in doctors:
            profile = Doctor.query.filter_by(user_id=doctor.id).first()
            if not profile:
                issues.append(f"❌ Dr. {doctor.first_name} {doctor.last_name} has no doctor profile")
        
        # Check if all patients have profiles
        for patient in patients:
            profile = Patient.query.filter_by(user_id=patient.id).first()
            if not profile:
                issues.append(f"❌ {patient.first_name} {patient.last_name} has no patient profile")
        
        if issues:
            print("   Issues found:")
            for issue in issues:
                print(f"   {issue}")
        else:
            print("   ✅ No issues found - system is consistent!")
        
        print(f"\n📊 SUMMARY:")
        print(f"   🏥 {len(hospitals)} hospitals")
        print(f"   👨‍💼 {len(admins)} admins")
        print(f"   👨‍⚕️ {len(doctors)} doctors")
        print(f"   👤 {len(patients)} patients")
        print(f"   💳 {len(subscriptions)} subscriptions")
        print(f"   ⚠️  {len(issues)} issues")
        
        if len(issues) == 0:
            print("\n🎉 SYSTEM STATUS: FULLY OPERATIONAL!")
        else:
            print(f"\n⚠️  SYSTEM STATUS: {len(issues)} ISSUES NEED ATTENTION")
        
        return len(issues) == 0

if __name__ == '__main__':
    check_system_status()