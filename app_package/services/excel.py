import pandas as pd

# Minimal skeleton of excel services extracted from app.py
_excel_cache = {
    'info_df': None,
    'hourly_rates_df': None,
    'summary_df': None,
    'file_path': None
}

def load_excel_reference_data(file_path=None, upload_dir='uploads'):
    """Load Info/Hourly Rates/Summary sheets into cache. Returns True on success."""
    try:
        if file_path is None:
            # find latest xlsb/xlsx in upload_dir
            import os
            files = [f for f in os.listdir(upload_dir) if f.endswith(('.xlsb', '.xlsx', '.xls'))]
            if not files:
                return False
            files.sort(reverse=True)
            file_path = os.path.join(upload_dir, files[0])

        # This is intentionally minimal; real implementation should handle engines and errors
        info_df = pd.read_excel(file_path, sheet_name='Info', engine='pyxlsb')
        _excel_cache['info_df'] = info_df
        _excel_cache['file_path'] = file_path
        return True
    except Exception:
        return False

def xlookup(lookup_value, lookup_array, return_array, if_not_found=0):
    try:
        lookup_series = pd.Series(lookup_array)
        return_series = pd.Series(return_array)
        mask = lookup_series == lookup_value
        if mask.any():
            idx = mask.idxmax()
            return return_series.iloc[idx]
        return if_not_found
    except Exception:
        return if_not_found

def calculate_auto_fields(record_data, file_path=None):
    # Placeholder that would call load_excel_reference_data and apply formulas
    return record_data, []
