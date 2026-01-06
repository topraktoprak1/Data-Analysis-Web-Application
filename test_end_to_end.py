"""
End-to-end test for the date lookup fix in Hourly Additional Rate calculation
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import load_excel_reference_data, calculate_auto_fields, excel_date_to_string

# Find the latest Excel file
upload_dir = 'uploads'
files = [f for f in os.listdir(upload_dir) if f.endswith('.xlsb')]
if not files:
    print("No .xlsb files found in uploads directory")
    exit()

latest_file = max(files, key=lambda f: os.path.getctime(os.path.join(upload_dir, f)))
file_path = os.path.join(upload_dir, latest_file)

print("=" * 80)
print(f"Testing Hourly Additional Rate calculation with file:")
print(f"  {latest_file}")
print("=" * 80)

# Test data - simulate a record with TL currency
test_record = {
    'ID': 905170,  # Example ID
    'Name Surname': 'Test Person',
    'Discipline': 'Test Discipline',
    '(Week /\nMonth)': 44927,  # This is the Excel serial number for 2023-01-01
    'Company': 'Test Company',
    'Currency': 'TL',  # TL currency to trigger TCMB rate lookup
    'LS/Unit Rate': 'Unit Rate',
    'AP-CB / \nSubcon': 'Subcon',
    'TOTAL\n MH': 100,
}

print("\nTest Record (INPUT):")
print(f"  ID: {test_record['ID']}")
week_month_key = '(Week /\nMonth)'
print(f"  Week/Month (raw): {test_record[week_month_key]} (Excel serial number)")
print(f"  Week/Month (converted): {excel_date_to_string(test_record[week_month_key])}")
print(f"  Currency: {test_record['Currency']}")
total_mh_key = 'TOTAL\n MH'
print(f"  Total MH: {test_record[total_mh_key]}")

print("\n" + "=" * 80)
print("Calculating auto fields...")
print("=" * 80)

# Calculate the auto fields
result_record, na_fields = calculate_auto_fields(test_record, file_path)

print("\nCalculation Results:")
print("-" * 80)
print(f"Hourly Base Rate: {result_record.get('Hourly Base Rate', 'N/A')}")
print(f"Hourly Additional Rates: {result_record.get('Hourly Additional Rates', 'N/A')}")
print(f"Hourly Rate: {result_record.get('Hourly Rate', 'N/A')}")
print(f"Cost: {result_record.get('Cost', 'N/A')}")
print(f"General Total Cost (USD): {result_record.get('General Total Cost (USD)', 'N/A')}")

if result_record.get('Hourly Additional Rates', 0) == 0:
    print("\n[ERROR] Hourly Additional Rate is 0!")
    print("   This suggests the TCMB rate lookup is still failing.")
else:
    print(f"\n[SUCCESS] Hourly Additional Rate calculated: {result_record.get('Hourly Additional Rates', 0)}")
    
if na_fields:
    print(f"\nFields that couldn't be calculated: {na_fields}")

print("\n" + "=" * 80)
print("Test with different dates:")
print("=" * 80)

# Test with a few different dates
test_dates = [
    (44927, "2023-01-01"),
    (45383, "2024-04-01"),
    (46022, "2025-12-01"),
    ("W49", "W49"),
]

for excel_date, expected_str in test_dates:
    test_record2 = test_record.copy()
    test_record2['(Week /\nMonth)'] = excel_date
    
    print(f"\nTesting with date: {excel_date} (expected: {expected_str})")
    result2, _ = calculate_auto_fields(test_record2, file_path)
    hourly_additional = result2.get('Hourly Additional Rates', 0)
    
    if hourly_additional > 0:
        print(f"  [OK] Hourly Additional Rate: {hourly_additional}")
    else:
        print(f"  [FAIL] Hourly Additional Rate: {hourly_additional}")

print("\n" + "=" * 80)
print("Test Complete")
print("=" * 80)
