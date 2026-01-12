"""
Comprehensive diagnostic for data integrity issues
"""
import pandas as pd
import os
from app import load_excel_reference_data, _excel_cache, excel_date_to_string

# Find the latest Excel file
upload_dir = 'uploads'
files = [f for f in os.listdir(upload_dir) if f.endswith('.xlsb')]
latest_file = max(files, key=lambda f: os.path.getctime(os.path.join(upload_dir, f)))
file_path = os.path.join(upload_dir, latest_file)

print("=" * 80)
print(f"DATA INTEGRITY DIAGNOSTIC")
print(f"File: {latest_file}")
print("=" * 80)

# Load reference data
load_excel_reference_data(file_path)
info_df = _excel_cache['info_df']
rates_df = _excel_cache['hourly_rates_df']

print("\n1. CHECKING FOR TRAILING SPACES AND CASE ISSUES")
print("-" * 80)

# Check Info sheet Scope column (index 13)
scope_col = info_df.iloc[:, 13]
print(f"\nInfo Sheet - Scope Column (index 13):")
print(f"  Total entries: {len(scope_col)}")
print(f"  Non-null entries: {scope_col.notna().sum()}")
print(f"  Data type: {scope_col.dtype}")

# Check for trailing spaces
has_trailing = scope_col.astype(str).str.endswith(' ')
if has_trailing.any():
    print(f"  WARNING: {has_trailing.sum()} entries have trailing spaces!")
    print(f"  Examples: {scope_col[has_trailing].head(3).tolist()}")
else:
    print(f"  OK: No trailing spaces found")

# Check for leading spaces
has_leading = scope_col.astype(str).str.startswith(' ')
if has_leading.any():
    print(f"  WARNING: {has_leading.sum()} entries have leading spaces!")
else:
    print(f"  OK: No leading spaces found")

print("\n2. CHECKING HOURLY RATES SHEET DATA TYPES")
print("-" * 80)

# Check ID column (index 0)
id_col = rates_df.iloc[:, 0]
print(f"\nHourly Rates - ID Column (index 0):")
print(f"  Data type: {id_col.dtype}")
print(f"  Sample values: {id_col.head(5).tolist()}")

# Check Currency column (index 6)
currency_col = rates_df.iloc[:, 6]
print(f"\nHourly Rates - Currency Column (index 6):")
print(f"  Data type: {currency_col.dtype}")
print(f"  Unique values: {currency_col.unique().tolist()}")

# Check for mixed types
unique_types = set(type(x).__name__ for x in currency_col if pd.notna(x))
if len(unique_types) > 1:
    print(f"  WARNING: Mixed data types found: {unique_types}")
else:
    print(f"  OK: Consistent data type")

print("\n3. CHECKING WEEK/MONTH COLUMN IN INFO SHEET")
print("-" * 80)

week_month_col = info_df.iloc[:, 20]
print(f"\nInfo Sheet - Weeks/Month Column (index 20):")
print(f"  Data type: {week_month_col.dtype}")
print(f"  First 10 values: {week_month_col.head(10).tolist()}")
print(f"  Last 10 values: {week_month_col.tail(10).tolist()}")

# Check if values are properly converted
sample_values = week_month_col.dropna().head(20)
for i, val in enumerate(sample_values):
    val_type = type(val).__name__
    if i < 5:
        print(f"  Row {i}: {repr(val)} (type: {val_type})")

print("\n4. CHECKING FOR DUPLICATE KEYS")
print("-" * 80)

# Check for duplicate IDs in Hourly Rates
id_duplicates = rates_df.iloc[:, 0].duplicated()
if id_duplicates.any():
    dup_count = id_duplicates.sum()
    print(f"  WARNING: {dup_count} duplicate IDs found in Hourly Rates!")
    dup_ids = rates_df.iloc[:, 0][id_duplicates].unique()
    print(f"  Duplicate IDs: {dup_ids[:10].tolist()}")
else:
    print(f"  OK: No duplicate IDs in Hourly Rates")

# Check for duplicate Scopes in Info
scope_duplicates = info_df.iloc[:, 13].duplicated()
if scope_duplicates.any():
    dup_count = scope_duplicates.sum()
    print(f"  WARNING: {dup_count} duplicate Scopes found in Info sheet!")
    dup_scopes = info_df.iloc[:, 13][scope_duplicates].unique()
    print(f"  Duplicate Scopes: {dup_scopes[:10].tolist()}")
else:
    print(f"  OK: No duplicate Scopes in Info sheet")

print("\n5. CHECKING TCMB RATES AND DATE MATCHING")
print("-" * 80)

tcmb_col = info_df.iloc[:, 22]
print(f"\nInfo Sheet - TCMB USD/TRY Column (index 22):")
print(f"  Data type: {tcmb_col.dtype}")
print(f"  Non-null entries: {tcmb_col.notna().sum()}")
print(f"  Min: {tcmb_col.min()}, Max: {tcmb_col.max()}")
print(f"  Sample values:")

for i in range(min(10, len(info_df))):
    week_val = week_month_col.iloc[i]
    tcmb_val = tcmb_col.iloc[i]
    print(f"    {repr(week_val)} -> {tcmb_val}")

print("\n6. TESTING XLOOKUP WITH REAL DATA")
print("-" * 80)

# Test a few lookups
from app import xlookup

# Test 1: Lookup a date
test_date = "2023-01-01"
result = xlookup(test_date, week_month_col, tcmb_col, -999)
print(f"\nTest 1: xlookup('{test_date}', week_month_col, tcmb_col)")
print(f"  Result: {result}")
print(f"  Expected: ~18.8499")

# Test 2: Lookup an ID
test_id = 905170.0
result = xlookup(test_id, rates_df.iloc[:, 0], rates_df.iloc[:, 6], "NOT_FOUND")
print(f"\nTest 2: xlookup({test_id}, ID_col, Currency_col)")
print(f"  Result: {result}")

# Test 3: Lookup with potential mismatch
test_id_int = 905170  # Integer instead of float
result = xlookup(test_id_int, rates_df.iloc[:, 0], rates_df.iloc[:, 6], "NOT_FOUND")
print(f"\nTest 3: xlookup({test_id_int} [int], ID_col, Currency_col)")
print(f"  Result: {result}")

print("\n7. CHECKING FOR NaN AND NULL VALUES")
print("-" * 80)

# Check rates sheet for NaN in critical columns
print(f"\nHourly Rates Sheet NaN counts:")
print(f"  ID (col 0): {rates_df.iloc[:, 0].isna().sum()}")
print(f"  Currency (col 6): {rates_df.iloc[:, 6].isna().sum()}")
print(f"  Hourly Base Rate 2 (col 7): {rates_df.iloc[:, 7].isna().sum()}")
print(f"  Hourly Additional Rate (col 11): {rates_df.iloc[:, 11].isna().sum()}")

print(f"\nInfo Sheet NaN counts:")
print(f"  Scope (col 13): {info_df.iloc[:, 13].isna().sum()}")
print(f"  North/South (col 16): {info_df.iloc[:, 16].isna().sum()}")
print(f"  Weeks/Month (col 20): {info_df.iloc[:, 20].isna().sum()}")
print(f"  TCMB USD/TRY (col 22): {info_df.iloc[:, 22].isna().sum()}")

print("\n" + "=" * 80)
print("DIAGNOSTIC COMPLETE")
print("=" * 80)
