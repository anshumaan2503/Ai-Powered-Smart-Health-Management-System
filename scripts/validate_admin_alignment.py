#!/usr/bin/env python3
"""
Comprehensive validation to ensure all changes align with admin page display
This should be run after any hospital/user modifications
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hospital import create_app, db
from hospital.models.hospital import Hospital
from hospital.models.user import User
from hospital.models.hospital_subscription import HospitalSubscription

def validate_admin_alignment():
    app = create_app()
    
    with app.app_context():
        print("🔍 ADMIN PAGE ALIGNMENT VALIDATION")
        print("=" * 60)
        
        hospitals = Hospital.query.all()
        issues_found = []
        
        print(f"📊 Validating {len(hospitals)} hospitals...")
        
        for hospital in hospitals:
            print(f"\n🏥 {hospital.name} (ID: {hospital.id})")
            
            # 1. Check if hospital has login user
            login_user = User.query.filter_by(hospital_id=hospital.id).first()
            if not login_user:
                issue = f"❌ No login user found for {hospital.name}"
                print(f"   {issue}")
                issues_found.append(issue)
                continue
            
            # 2. Check email alignment
            if hospital.email != login_user.email:
                issue = f"❌ Email mismatch: Hospital({hospital.email}) vs Login({login_user.email})"
                print(f"   {issue}")
                issues_found.append(issue)
            else:
                print(f"   ✅ Email aligned: {hospital.email}")
            
            # 3. Check subscription exists
            subscription = HospitalSubscription.query.filter_by(hospital_id=hospital.id).first()
            if not subscription:
                issue = f"❌ No subscription found for {hospital.name}"
                print(f"   {issue}")
                issues_found.append(issue)
            elif not subscription.is_active:
                issue = f"❌ Inactive subscription for {hospital.name}"
                print(f"   {issue}")
                issues_found.append(issue)
            else:
                print(f"   ✅ Active subscription: {subscription.plan_name}")
            
            # 4. Check login credentials work
            if login_user.check_password('123'):
                print(f"   ✅ Login credentials: {login_user.email} / 123")
            else:
                issue = f"❌ Login password incorrect for {hospital.name}"
                print(f"   {issue}")
                issues_found.append(issue)
        
        print(f"\n" + "=" * 60)
        if issues_found:
            print(f"❌ VALIDATION FAILED - {len(issues_found)} issues found:")
            for i, issue in enumerate(issues_found, 1):
                print(f"   {i}. {issue}")
            print(f"\n🔧 Run fix scripts to resolve these issues")
        else:
            print(f"✅ VALIDATION PASSED - All hospitals aligned with admin page!")
            print(f"   • All emails match login credentials")
            print(f"   • All subscriptions are active")
            print(f"   • All login credentials work")
        
        print(f"\n📋 ADMIN PAGE READY HOSPITALS:")
        working_hospitals = []
        for hospital in hospitals:
            login_user = User.query.filter_by(hospital_id=hospital.id).first()
            subscription = HospitalSubscription.query.filter_by(hospital_id=hospital.id).first()
            
            if (login_user and 
                hospital.email == login_user.email and 
                subscription and subscription.is_active and
                login_user.check_password('123')):
                working_hospitals.append(hospital)
                print(f"   ✅ {hospital.name}: {hospital.email} / 123")
        
        print(f"\n🎉 {len(working_hospitals)}/{len(hospitals)} hospitals ready for admin page display!")
        
        return len(issues_found) == 0

if __name__ == "__main__":
    success = validate_admin_alignment()
    sys.exit(0 if success else 1)