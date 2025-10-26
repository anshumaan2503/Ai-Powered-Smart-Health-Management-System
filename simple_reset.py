#!/usr/bin/env python3
"""
Simple database reset
"""

from hospital import create_app, db

app = create_app()

with app.app_context():
    print("🗑️  Resetting database...")
    
    # Drop and recreate all tables
    db.drop_all()
    db.create_all()
    
    print("✅ Database reset complete!")
    print("🎉 Ready for fresh start!")
    print("\n📝 Next steps:")
    print("1. Go to: http://localhost:3000/hospital/register")
    print("2. Register your hospital")
    print("3. Start adding doctors!")