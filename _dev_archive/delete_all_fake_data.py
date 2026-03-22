#!/usr/bin/env python3
"""
Delete all fake/dummy data from the database
Clean slate for future proper data integration
"""

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User
from hospital.models.patient import Patient
from hospital.models.doctor import Doctor
from hospital.models.hospital_subscription import HospitalSubscription
from hospital.models.appointment import Appointment
from hospital.models.medical_record import MedicalRecord
from hospital.models.prescription import Prescription
from hospital.models.ai_diagnosis import AIDiagnosis

def delete_all_fake_data():
    app = create_app()
    
    with app.app_context():
        print("🗑️  DELETING ALL FAKE/DUMMY DATA...")
        print("=" * 50)
        
        # Count existing data before deletion
        hospitals_count = Hospital.query.count()
        users_count = User.query.count()
        patients_count = Patient.query.count()
        doctors_count = Doctor.query.count()
        subscriptions_count = HospitalSubscription.query.count()
        
        print(f"📊 Current Data Count:")
        print(f"   🏥 Hospitals: {hospitals_count}")
        print(f"   👤 Users: {users_count}")
        print(f"   🏥 Patients: {patients_count}")
        print(f"   👨‍⚕️ Doctors: {doctors_count}")
        print(f"   💳 Subscriptions: {subscriptions_count}")
        
        print(f"\n🗑️  Deleting all data...")
        
        # Delete in proper order to avoid foreign key constraints
        try:
            # Delete dependent records first
            AIDiagnosis.query.delete()
            print("   ✅ Deleted AI diagnoses")
            
            Prescription.query.delete()
            print("   ✅ Deleted prescriptions")
            
            MedicalRecord.query.delete()
            print("   ✅ Deleted medical records")
            
            Appointment.query.delete()
            print("   ✅ Deleted appointments")
            
            # Delete main entities
            Patient.query.delete()
            print("   ✅ Deleted patients")
            
            Doctor.query.delete()
            print("   ✅ Deleted doctors")
            
            HospitalSubscription.query.delete()
            print("   ✅ Deleted subscriptions")
            
            User.query.delete()
            print("   ✅ Deleted users")
            
            Hospital.query.delete()
            print("   ✅ Deleted hospitals")
            
            # Commit all deletions
            db.session.commit()
            
            print(f"\n🎉 ALL FAKE DATA DELETED SUCCESSFULLY!")
            
            # Verify deletion
            remaining_hospitals = Hospital.query.count()
            remaining_users = User.query.count()
            remaining_patients = Patient.query.count()
            remaining_doctors = Doctor.query.count()
            remaining_subscriptions = HospitalSubscription.query.count()
            
            print(f"\n📊 Remaining Data Count:")
            print(f"   🏥 Hospitals: {remaining_hospitals}")
            print(f"   👤 Users: {remaining_users}")
            print(f"   🏥 Patients: {remaining_patients}")
            print(f"   👨‍⚕️ Doctors: {remaining_doctors}")
            print(f"   💳 Subscriptions: {remaining_subscriptions}")
            
            total_remaining = (remaining_hospitals + remaining_users + 
                             remaining_patients + remaining_doctors + 
                             remaining_subscriptions)
            
            if total_remaining == 0:
                print(f"\n✅ DATABASE IS NOW COMPLETELY CLEAN!")
                print(f"🎯 Ready for proper data integration")
            else:
                print(f"\n⚠️  {total_remaining} records still remain")
            
        except Exception as e:
            print(f"❌ Error during deletion: {e}")
            db.session.rollback()
            return False
        
        return True

if __name__ == '__main__':
    success = delete_all_fake_data()
    if success:
        print(f"\n🎉 CLEANUP COMPLETE - DATABASE IS READY FOR REAL DATA!")
    else:
        print(f"\n❌ CLEANUP FAILED - CHECK ERRORS ABOVE")