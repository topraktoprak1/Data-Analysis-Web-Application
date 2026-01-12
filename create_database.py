"""Check and create veri_analizi database"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    # Connect to default postgres database
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="857587",
        database="postgres"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute("SELECT 1 FROM pg_database WHERE datname='veri_analizi'")
    exists = cursor.fetchone()
    
    if exists:
        print("✓ Database 'veri_analizi' already exists")
    else:
        print("Creating database 'veri_analizi'...")
        cursor.execute("CREATE DATABASE veri_analizi")
        print("✓ Database 'veri_analizi' created successfully")
    
    cursor.close()
    conn.close()
    
    # Test connection to veri_analizi
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="857587",
        database="veri_analizi"
    )
    print("✓ Successfully connected to veri_analizi database")
    conn.close()
    
    print("\n✓ Everything is ready!")
    print("Restart your Flask app now.")
    
except Exception as e:
    print(f"✗ Error: {e}")
