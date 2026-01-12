"""Test PostgreSQL password to find the correct one"""
import psycopg2
from getpass import getpass

passwords_to_try = ['postgres', '1234', '857587', 'admin', '']

print("Testing common PostgreSQL passwords...")
print("=" * 50)

for pw in passwords_to_try:
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            user="postgres",
            password=pw,
            database="postgres"
        )
        print(f"✓ SUCCESS! Password is: '{pw}'")
        print(f"\nYour connection string should be:")
        print(f"postgresql://postgres:{pw}@localhost:5432/veri_analizi")
        conn.close()
        break
    except psycopg2.OperationalError as e:
        if 'password authentication failed' in str(e):
            print(f"✗ Password '{pw}' is incorrect")
        else:
            print(f"✗ Error with '{pw}': {e}")
else:
    print("\n" + "=" * 50)
    print("None of the common passwords worked.")
    print("\nPlease enter your PostgreSQL password manually:")
    manual_pw = getpass("Password: ")
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            user="postgres",
            password=manual_pw,
            database="postgres"
        )
        print(f"✓ SUCCESS! Your password is correct")
        print(f"\nYour connection string should be:")
        print(f"postgresql://postgres:{manual_pw}@localhost:5432/veri_analizi")
        conn.close()
    except Exception as e:
        print(f"✗ Failed: {e}")
