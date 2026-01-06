"""
Test script to verify the Excel date conversion and TCMB lookup
"""
import pandas as pd
import os
from datetime import datetime

# Import the excel_date_to_string function from app
import sys
sys.path.insert(0, os.path.dirname(__file__))

# Define the function here for testing
def excel_date_to_string(excel_date):
    """Convert Excel serial date number to YYYY-MM-DD string format"""
    try:
        if pd.isna(excel_date):
            return None
        # Check if it's already a string (like 'W49', 'W50')
        if isinstance(excel_date, str):
            return excel_date.strip()
        # Check if it's a datetime object
        if isinstance(excel_date, (pd.Timestamp, datetime)):
            return excel_date.strftime('%Y-%m-%d')
        # Check if it's an Excel serial number (integer or float)
        if isinstance(excel_date, (int, float)) and excel_date > 1000:
            # Excel serial date starts from 1900-01-01
            # Convert to pandas timestamp and then to string
            base_date = pd.Timestamp('1899-12-30')  # Excel's epoch
            date = base_date + pd.Timedelta(days=int(excel_date))
            return date.strftime('%Y-%m-%d')
        return str(excel_date).strip()
    except Exception as e:
        print(f"Error converting Excel date {excel_date}: {e}")
        return str(excel_date) if excel_date else None

# Test the conversion function
print("Testing Excel date conversion:")
print("=" * 80)

test_dates = [44927, 44958, 45383, 45413]
for excel_date in test_dates:
    converted = excel_date_to_string(excel_date)
    print(f"  {excel_date} -> {converted}")

print("\n" + "=" * 80)

# Now test with the actual Excel file
upload_dir = 'uploads'
files = [f for f in os.listdir(upload_dir) if f.endswith('.xlsb')]
if not files:
    print("No .xlsb files found in uploads directory")
    exit()

latest_file = max(files, key=lambda f: os.path.getctime(os.path.join(upload_dir, f)))
file_path = os.path.join(upload_dir, latest_file)

print(f"\nLoading Excel file: {latest_file}")
print("=" * 80)

# Read Info sheet
info_df = pd.read_excel(file_path, sheet_name='Info', engine='pyxlsb')

# Convert the Weeks/Month column
if len(info_df.columns) > 20:
    weeks_month_col = info_df.iloc[:, 20]
    info_df.iloc[:, 20] = weeks_month_col.apply(excel_date_to_string)
    print("✓ Converted Info sheet Weeks/Month column to date strings")
    
    print("\nConverted Week/Month dates (first 20):")
    for i, val in enumerate(info_df.iloc[:20, 20]):
        tcmb_rate = info_df.iloc[i, 22] if i < len(info_df) else None
        print(f"  Row {i}: {repr(val)} -> TCMB Rate: {tcmb_rate}")
    
    print("\nLast 10 non-NaN Week/Month dates:")
    non_nan = info_df.iloc[:, 20].dropna()
    for i, val in enumerate(non_nan.tail(10)):
        idx = non_nan.index[len(non_nan) - 10 + i]
        tcmb_rate = info_df.iloc[idx, 22]
        print(f"  Row {idx}: {repr(val)} -> TCMB Rate: {tcmb_rate}")
    
    # Test lookup
    print("\n" + "=" * 80)
    print("Testing XLOOKUP:")
    print("=" * 80)
    
    # Test lookups with different date formats
    test_lookups = ['2023-01-01', '2024-01-01', '2025-01-01', 'W49', 'W50']
    
    for lookup_date in test_lookups:
        # Find the date in the Info sheet
        week_month_series = info_df.iloc[:, 20]
        tcmb_series = info_df.iloc[:, 22]
        
        try:
            mask = week_month_series == lookup_date
            if mask.any():
                idx = mask.idxmax()
                tcmb_rate = tcmb_series.iloc[idx]
                print(f"  Lookup '{lookup_date}': Found at row {idx}, TCMB Rate = {tcmb_rate}")
            else:
                print(f"  Lookup '{lookup_date}': NOT FOUND")
        except Exception as e:
            print(f"  Lookup '{lookup_date}': ERROR - {e}")
else:
    print(f"ERROR: Info sheet only has {len(info_df.columns)} columns!")
