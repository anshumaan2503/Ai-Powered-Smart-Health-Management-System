import os, sys
from datetime import date
sys.path.append(os.getcwd())
from hospital import create_app, db
from hospital.models.hospital_subscription import HospitalSubscription
app = create_app()
with app.app_context():
    subs = HospitalSubscription.query.filter_by(hospital_id=1, is_active=True).all()
    print(f"Found {len(subs)} active subscriptions for Hosp 1.")
    for s in subs:
        print(f"Sub {s.id}: Plan {s.plan_name} | End {s.subscription_end} | is_active {s.is_active}")
        if s.subscription_end < date.today():
             print("Subscription EXPIRED!")
