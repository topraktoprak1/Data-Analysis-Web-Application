# Date Lookup Fix for Hourly Additional Rate Calculation

## Problem Summary
The Hourly Additional Rate calculation was failing to obtain the correct TCMB (exchange rate) from the Info sheet because it couldn't match the date values.

## Root Cause
**Excel stores dates as serial numbers**, not as formatted strings:
- When you see "2023-01-01" in Excel, it's actually stored as the number **44927**
- When pandas reads the Excel file, it gets these numbers as integers
- The lookup was trying to match date strings against integers, which always failed
- As a result, the TCMB rate lookup returned the default value (1), causing incorrect calculations

### Example:
- **What you see in Excel**: "01-Jan-2023" or "2023-01-01"
- **What's actually stored**: 44927 (days since January 1, 1900)
- **What pandas reads**: 44927 (integer)
- **What the lookup needs**: "2023-01-01" (string)

## Solution Implemented

### 1. Excel Date Conversion Function
Added `excel_date_to_string()` function that:
- Detects Excel serial number dates (integers > 1000)
- Converts them to YYYY-MM-DD format (e.g., "2023-01-01")
- **NEW:** Converts dd/mmm/yyyy format (e.g., "01/Jan/2023") to YYYY-MM-DD
- Preserves week numbers like "W49", "W50" as-is
- Handles datetime objects and existing strings

```python
def excel_date_to_string(excel_date):
    """Convert Excel serial date number to YYYY-MM-DD string format"""
    if isinstance(excel_date, str):
        excel_date_str = excel_date.strip()
        # Check if it's in dd/mmm/yyyy format (like "01/Jan/2023")
        if '/' in excel_date_str:
            try:
                dt = pd.to_datetime(excel_date_str, format='%d/%b/%Y', errors='coerce')
                if pd.notna(dt):
                    return dt.strftime('%Y-%m-%d')  # Convert to "2023-01-01"
            except:
                pass
        return excel_date_str  # Already a string like "W49"
    if isinstance(excel_date, (int, float)) and excel_date > 1000:
        base_date = pd.Timestamp('1899-12-30')  # Excel's epoch
        date = base_date + pd.Timedelta(days=int(excel_date))
        return date.strftime('%Y-%m-%d')  # Convert to "2023-01-01"
    return str(excel_date)
```

### 2. Automatic Conversion on Load
When the Info sheet is loaded:
```python
# Convert the Weeks/Month column (index 20) from serial dates to strings
weeks_month_col = df_info.iloc[:, 20]
df_info.iloc[:, 20] = weeks_month_col.apply(excel_date_to_string)
```

**Result**: 
- 44927 → "2023-01-01"
- 45383 → "2024-04-01"
- "W49" → "W49" (unchanged)

### 3. Convert Week/Month Values Before Lookup
When extracting week_month from user data:
```python
week_month_raw = record_data.get('(Week /\nMonth)', '')
week_month = excel_date_to_string(week_month_raw)  # Convert to string
```

Now the lookup works:
```python
tcmb_rate = xlookup(week_month, info_df.iloc[:, 20], info_df.iloc[:, 22], 1)
```

## Testing Results

### Before Fix:
- Excel serial number: 44927
- Lookup value: 44927 (integer)
- Info sheet: [44927, 44958, 45017, ...]  (integers)
- **Match**: ❌ Failed (wrong data type comparison)
- **Result**: Default value (1) used → **Incorrect calculation**

### After Fix:
- Excel serial number: 44927
- Converted to: "2023-01-01"
- Info sheet: ["2023-01-01", "2023-02-01", "2024-01-01", ...]
- **Match**: ✅ Found at row 0
- **TCMB Rate**: 18.8499 → **Correct calculation**

### Test Examples:
```
2023-01-01 → TCMB Rate = 18.8499
2024-01-01 → TCMB Rate = 30.3953
2025-01-01 → TCMB Rate = 35.8811
W49 → TCMB Rate = 42.5171
W50 → TCMB Rate = 42.6748
```

## Impact

### Files Modified:
1. **app.py**:
   - Added `excel_date_to_string()` function
   - Modified `load_excel_reference_data()` to convert Info sheet dates
   - Modified `calculate_auto_fields()` to convert week_month value
   - Added debug logging to track conversion

2. **FORMULA_REFERENCE.md**:
   - Added "Date Handling" section explaining Excel serial numbers
   - Updated "Common Issues" section with date conversion notes
   - Added troubleshooting guidance for date-related issues

### Affected Calculations:
1. **Hourly Additional Rate** (TL currency only)
   - Now correctly multiplies base rate by TCMB USD/TRY rate
   
2. **General Total Cost (USD)** (TL currency)
   - Now correctly divides cost by TCMB USD/TRY rate
   
3. **General Total Cost (USD)** (EURO currency)
   - Now correctly multiplies cost by TCMB EUR/USD rate

## Verification

To verify the fix is working:
1. Check the console output when filling cells
2. Look for: `"✓ Converted Info sheet Weeks/Month column to date strings"`
3. Check debug output showing week_month conversion
4. Verify TCMB rate lookups are finding values (not returning default 1)

Example console output:
```
✓ Converted Info sheet Weeks/Month column to date strings
DEBUG: Raw week_month value = '44927' (type: int)
DEBUG: Converted week_month value = '2023-01-01'
DEBUG: Looking up TCMB rate with week_month="2023-01-01"
DEBUG: TCMB rate found = 18.8499
```

## Summary

The issue was a **data type mismatch** caused by Excel's internal date storage format. By converting Excel serial numbers to readable date strings during data loading, the TCMB rate lookup now works correctly, ensuring accurate calculations for:
- Hourly Additional Rates (TL currency)
- Currency conversions (TL to USD, EURO to USD)
- All downstream calculations depending on exchange rates

This fix ensures that the system handles both:
- Monthly dates: "2023-01-01", "2024-04-01", etc.
- Weekly dates: "W49", "W50", "W51", etc.
