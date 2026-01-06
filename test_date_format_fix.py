"""
Test the date format conversion fix
"""
from app import excel_date_to_string

# Test various date formats
test_dates = [
    ("01/Jan/2023", "2023-01-01"),  # dd/mmm/yyyy format
    ("01/Dec/2025", "2025-12-01"),
    ("W49", "W49"),  # Week number
    ("W50", "W50"),
    (44927, "2023-01-01"),  # Excel serial number
    (46022, "2025-12-31"),
]

print("Testing date format conversion:")
print("=" * 80)

for input_date, expected in test_dates:
    result = excel_date_to_string(input_date)
    status = "OK" if result == expected else "FAIL"
    print(f"  {status}: excel_date_to_string({repr(input_date)}) = {repr(result)} (expected: {repr(expected)})")

print("\n" + "=" * 80)
print("All tests passed!" if all(excel_date_to_string(d[0]) == d[1] for d in test_dates) else "SOME TESTS FAILED!")
