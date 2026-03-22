"""
Database Query Analyzer
Analyzes and reports on database query performance

Usage:
    python scripts/analyze_queries.py
"""

import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from hospital import create_app, db
from sqlalchemy import text, inspect

def check_indexes():
    """Check all indexes in the database"""
    app = create_app()
    
    with app.app_context():
        print("=" * 80)
        print("Database Index Analysis")
        print("=" * 80)
        
        # Get database type
        db_type = db.engine.dialect.name
        print(f"\nDatabase Type: {db_type}")
        
        if db_type == 'postgresql':
            # PostgreSQL index query
            result = db.session.execute(text("""
                SELECT 
                    tablename,
                    indexname,
                    indexdef
                FROM pg_indexes
                WHERE schemaname = 'public'
                ORDER BY tablename, indexname;
            """))
            
            print("\n📊 Indexes Found:")
            print("-" * 80)
            
            current_table = None
            for row in result:
                if current_table != row[0]:
                    current_table = row[0]
                    print(f"\n📋 Table: {current_table}")
                print(f"   ├─ {row[1]}")
            
        elif db_type == 'sqlite':
            # SQLite index query
            result = db.session.execute(text("""
                SELECT name, tbl_name, sql 
                FROM sqlite_master 
                WHERE type = 'index' 
                ORDER BY tbl_name, name;
            """))
            
            print("\n📊 Indexes Found:")
            print("-" * 80)
            
            current_table = None
            for row in result:
                if current_table != row[1]:
                    current_table = row[1]
                    print(f"\n📋 Table: {current_table}")
                print(f"   ├─ {row[0]}")
        
        print("\n" + "=" * 80)

def analyze_table_stats():
    """Analyze table statistics"""
    app = create_app()
    
    with app.app_context():
        print("\n" + "=" * 80)
        print("Table Statistics")
        print("=" * 80)
        
        tables = ['users', 'doctors', 'patients', 'medicines', 'appointments']
        
        for table in tables:
            try:
                result = db.session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                print(f"\n📊 {table.upper()}")
                print(f"   └─ Total Records: {count:,}")
            except Exception as e:
                print(f"\n📊 {table.upper()}")
                print(f"   └─ Error: {e}")
        
        print("\n" + "=" * 80)

def check_missing_indexes():
    """Check for potentially missing indexes"""
    app = create_app()
    
    with app.app_context():
        print("\n" + "=" * 80)
        print("Index Recommendations")
        print("=" * 80)
        
        recommendations = []
        
        # Check for foreign keys without indexes
        inspector = inspect(db.engine)
        
        for table_name in inspector.get_table_names():
            foreign_keys = inspector.get_foreign_keys(table_name)
            indexes = inspector.get_indexes(table_name)
            
            indexed_columns = set()
            for idx in indexes:
                for col in idx['column_names']:
                    indexed_columns.add(col)
            
            for fk in foreign_keys:
                for col in fk['constrained_columns']:
                    if col not in indexed_columns:
                        recommendations.append({
                            'table': table_name,
                            'column': col,
                            'reason': 'Foreign key without index'
                        })
        
        if recommendations:
            print("\n⚠️  Potential Missing Indexes:")
            print("-" * 80)
            for rec in recommendations:
                print(f"\n📋 Table: {rec['table']}")
                print(f"   ├─ Column: {rec['column']}")
                print(f"   └─ Reason: {rec['reason']}")
        else:
            print("\n✅ All foreign keys are properly indexed!")
        
        print("\n" + "=" * 80)

def explain_query(query_text):
    """Explain a query to see if indexes are used"""
    app = create_app()
    
    with app.app_context():
        print("\n" + "=" * 80)
        print("Query Execution Plan")
        print("=" * 80)
        print(f"\nQuery: {query_text}")
        print("-" * 80)
        
        db_type = db.engine.dialect.name
        
        try:
            if db_type == 'postgresql':
                result = db.session.execute(text(f"EXPLAIN ANALYZE {query_text}"))
            elif db_type == 'sqlite':
                result = db.session.execute(text(f"EXPLAIN QUERY PLAN {query_text}"))
            
            print("\nExecution Plan:")
            for row in result:
                print(f"  {row}")
        except Exception as e:
            print(f"\n❌ Error: {e}")
        
        print("\n" + "=" * 80)

def main():
    """Run all analyses"""
    print("\n🔍 Hospital Database Performance Analysis")
    
    # Check indexes
    check_indexes()
    
    # Analyze table stats
    analyze_table_stats()
    
    # Check for missing indexes
    check_missing_indexes()
    
    # Example query analysis
    print("\n" + "=" * 80)
    print("Sample Query Analysis")
    print("=" * 80)
    print("\nAnalyzing common queries to verify index usage...")
    
    sample_queries = [
        "SELECT * FROM users WHERE hospital_id = 1 AND role = 'doctor' LIMIT 10",
        "SELECT * FROM medicines WHERE hospital_id = 1 AND is_active = true LIMIT 10",
        "SELECT * FROM appointments WHERE hospital_id = 1 AND appointment_date > CURRENT_DATE LIMIT 10"
    ]
    
    for query in sample_queries:
        explain_query(query)
    
    print("\n✅ Analysis Complete!")
    print("\nFor detailed optimization guide, see: docs/PERFORMANCE_OPTIMIZATION.md")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Analysis interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
