#!/usr/bin/env python3
"""
Force reset database without confirmation
"""

import os
from hospital import create_app, db

def force_reset():
    """Force reset the entire database"""
    print("🗑️  FORCE RESETTING DATABASE...")
    
    app = create_app()
    
    with app.app_context():
        try:
            print("🗑️  Dropping all database tables...")
            db.drop_all()
            
            print("📊 Creating fresh database tables...")
            db.create_all()
            
            print("✅ Database completely reset!")
            print("\n🎉 Fresh start ready!")
            
        except Exception as e:
            print(f"❌ Error resetting database: {e}")

if __name__ == '__main__':
    force_reset()