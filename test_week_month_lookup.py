"""
Test script to debug week_month lookup issue in Info sheet
"""
import pandas as pd
import os

# Find the latest Excel file
upload_dir = 'uploads'
files = [f for f in os.listdir(upload_dir) if f.endswith('.xlsb')]
if not files:
    print("No .xlsb files found in uploads directory")
    exit()

latest_file = max(files, key=lambda f: os.path.getctime(os.path.join(upload_dir, f)))
file_path = os.path.join(upload_dir, latest_file)

print(f"Loading Excel file: {latest_file}")
print("=" * 80)

# Read Info sheet
info_df = pd.read_excel(file_path, sheet_name='Info', engine='pyxlsb')

print("\nInfo sheet columns:")
for i, col in enumerate(info_df.columns):
    print(f"  Column {i}: {col}")

print("\n" + "=" * 80)
print("Column U (index 20) - Week/Month dates:")
print("=" * 80)

# Show the first 20 values in column U (index 20)
if len(info_df.columns) > 20:
    week_month_col = info_df.iloc[:, 20]
    print(f"\nColumn name: {info_df.columns[20]}")
    print(f"Data type: {week_month_col.dtype}")
    print(f"\nFirst 20 values:")
    for i, val in enumerate(week_month_col.head(20)):
        print(f"  Row {i}: {repr(val)} (type: {type(val).__name__})")
    
    print(f"\n... (showing last 10 values)")
    for i, val in enumerate(week_month_col.tail(10)):
        idx = len(week_month_col) - 10 + i
        print(f"  Row {idx}: {repr(val)} (type: {type(val).__name__})")
else:
    print(f"ERROR: Info sheet only has {len(info_df.columns)} columns, cannot access column 20!")

print("\n" + "=" * 80)
print("Column W (index 22) - TCMB USD/TRY rate:")
print("=" * 80)

if len(info_df.columns) > 22:
    tcmb_col = info_df.iloc[:, 22]
    print(f"\nColumn name: {info_df.columns[22]}")
    print(f"Data type: {tcmb_col.dtype}")
    print(f"\nFirst 20 values:")
    for i, val in enumerate(tcmb_col.head(20)):
        print(f"  Row {i}: {repr(val)} (type: {type(val).__name__})")
else:
    print(f"ERROR: Info sheet only has {len(info_df.columns)} columns, cannot access column 22!")

print("\n" + "=" * 80)
print("Now testing DATABASE sheet Week/Month column:")
print("=" * 80)

# Read DATABASE sheet
db_df = pd.read_excel(file_path, sheet_name='DATABASE', engine='pyxlsb', header=2)

# Find Week/Month column
week_month_variations = ['(Week /\nMonth)', '(Week / Month)', 'Week / Month', 'Week/Month']
week_month_col_name = None
for col in db_df.columns:
    if any(var in str(col) for var in week_month_variations):
        week_month_col_name = col
        break

if week_month_col_name:
    print(f"\nFound Week/Month column: {repr(week_month_col_name)}")
    week_month_values = db_df[week_month_col_name].dropna()
    print(f"Data type: {week_month_values.dtype}")
    print(f"\nFirst 10 unique values:")
    for val in week_month_values.unique()[:10]:
        print(f"  {repr(val)} (type: {type(val).__name__})")
else:
    print("\nERROR: Could not find Week/Month column in DATABASE sheet")
    print("Available columns:")
    for col in db_df.columns[:20]:
        print(f"  {repr(col)}")
