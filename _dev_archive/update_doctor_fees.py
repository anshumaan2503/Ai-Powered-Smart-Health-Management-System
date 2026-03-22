import os
try:
    import psycopg2
    from urllib.parse import urlparse
except ImportError:
    print("Error: psycopg2-binary is required. Run 'pip install psycopg2-binary'")
    exit(1)

# The URL provided by the user
DB_URL = "postgresql://neondb_owner:npg_n8bhTBFX2fwN@ep-frosty-morning-a1eh72l6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def update_fees():
    conn = None
    try:
        # Connect to the database
        print("Connecting to database...")
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()

        # Update all doctors
        print("Updating consultation fees to 500 INR...")
        cur.execute("UPDATE doctors SET consultation_fee = 500.0;")
        
        # Commit the changes
        conn.commit()
        
        affected_rows = cur.rowcount
        print(f"Success! Updated {affected_rows} doctors.")

        cur.close()
    except Exception as e:
        print(f"Error updating database: {e}")
    finally:
        if conn is not None:
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    update_fees()
