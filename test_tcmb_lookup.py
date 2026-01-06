"""
Final test specifically for TL currency and TCMB rate lookup
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import load_excel_reference_data, calculate_auto_fields, _excel_cache

# Find the latest Excel file
upload_dir = 'uploads'
files = [f for f in os.listdir(upload_dir) if f.endswith('.xlsb')]
latest_file = max(files, key=lambda f: os.path.getctime(os.path.join(upload_dir, f)))
file_path = os.path.join(upload_dir, latest_file)

print("=" * 80)
print("Testing TCMB Rate Lookup for TL Currency")
print("=" * 80)

# Load the Excel data
load_excel_reference_data(file_path)
info_df = _excel_cache['info_df']

# Show what's in the Info sheet after conversion
print("\nInfo sheet Weeks/Month column (after conversion):")
print(info_df.iloc[:10, 20].tolist())

print("\nCorresponding TCMB USD/TRY rates:")
print(info_df.iloc[:10, 22].tolist())

# Test with TL currency - using a person ID that has TL currency in Hourly Rates sheet
test_record = {
    'ID': 905320,  # Person with TL currency
    'Name Surname': 'Test Person',
    'Discipline': 'Test Discipline',
    '(Week /\nMonth)': 44927,  # 2023-01-01
    'Company': 'Test Company',
    'LS/Unit Rate': 'Unit Rate',
    'AP-CB / \nSubcon': 'Subcon',
    'TOTAL\n MH': 100,
}

print("\n" + "=" * 80)
print("Test Record:")
print("=" * 80)
week_key = '(Week /\nMonth)'
print(f"  ID: {test_record['ID']}")
print(f"  Week/Month: {test_record[week_key]} (Excel serial -> 2023-01-01)")
print(f"  Currency: TL (should trigger TCMB rate lookup)")
print(f"  Total MH: 100")

print("\nExpected behavior:")
print("  1. Look up Hourly Additional base rate from Hourly Rates sheet")
print("  2. Look up TCMB USD/TRY rate for 2023-01-01 from Info sheet (should be 18.8499)")
print("  3. Multiply base rate by TCMB rate")

print("\n" + "=" * 80)
print("Calculating...")
print("=" * 80)

result, na_fields = calculate_auto_fields(test_record, file_path)

print("\nResults:")
print("-" * 80)
hourly_additional = result.get('Hourly Additional Rates', 0)
print(f"Hourly Additional Rates: {hourly_additional}")

if hourly_additional > 7:  # If it's just the base (7), TCMB wasn't applied
    print(f"\n[SUCCESS] TCMB rate was applied!")
    print(f"  Base rate: ~7.0")
    print(f"  TCMB rate: ~18.8499")
    print(f"  Result: {hourly_additional} (= 7.0 * 18.8499 = 131.9493)")
else:
    print(f"\n[PROBLEM] TCMB rate may not have been applied")
    print(f"  Expected: ~131.95 (7.0 * 18.8499)")
    print(f"  Got: {hourly_additional}")

print("\n" + "=" * 80)
