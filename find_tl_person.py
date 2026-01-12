"""
Check what currency person ID 905170 has and find a TL person
"""
import pandas as pd
import os

upload_dir = 'uploads'
files = [f for f in os.listdir(upload_dir) if f.endswith('.xlsb')]
latest_file = max(files, key=lambda f: os.path.getctime(os.path.join(upload_dir, f)))
file_path = os.path.join(upload_dir, latest_file)

print(f"Loading: {latest_file}\n")

# Read Hourly Rates sheet
df_rates = pd.read_excel(file_path, sheet_name='Hourly Rates', engine='pyxlsb', header=1)

print("Hourly Rates sheet columns:")
for i, col in enumerate(df_rates.columns):
    print(f"  {i}: {col}")

print("\n" + "=" * 80)
print("Finding people with TL currency...")
print("=" * 80)

# Column G (index 6) should be Currency
id_col = df_rates.iloc[:, 0]  # Column A
currency_col = df_rates.iloc[:, 6]  # Column G

# Find TL currency entries
tl_people = []
for idx in range(len(df_rates)):
    person_id = id_col.iloc[idx]
    currency = currency_col.iloc[idx]
    if pd.notna(person_id) and str(currency).strip().upper() == 'TL':
        tl_people.append((person_id, currency))
        if len(tl_people) <= 5:  # Show first 5
            print(f"  ID: {person_id}, Currency: {currency}")

print(f"\nTotal people with TL currency: {len(tl_people)}")

if tl_people:
    test_id = tl_people[0][0]
    print(f"\n[RECOMMENDED] Use ID {test_id} for TL currency testing")
else:
    print("\n[NOTE] No TL currency found in Hourly Rates. Checking for special ID 905264...")
    # ID 905264 is hardcoded as TL in the code
    print("  ID 905264 is hardcoded as TL currency in the application")
    print("  [RECOMMENDED] Use ID 905264 for TL currency testing")
