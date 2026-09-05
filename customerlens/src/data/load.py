from pathlib import Path
import pandas as pd

ALIASES = {
    'customerid':'customer_id','customer id':'customer_id',
    'gender':'gender','genre':'gender',
    'age':'age','annual income (k$)':'annual_income_k','annual income (k$)':'annual_income_k',
    'spending score (1-100)':'spending_score','spending score (1-100)':'spending_score'
}

def normalize_columns(df):
    out = df.copy()
    mapping = {}
    for c in out.columns:
        key = c.strip().lower()
        mapping[c] = ALIASES.get(key, c.strip().lower().replace(' ','_').replace('-','_'))
    return out.rename(columns=mapping)

def load_csv(path='data/raw/Mall_Customers.csv'):
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f'Missing dataset: {p}. Download Mall_Customers.csv from Kaggle and place it at this path.')
    return normalize_columns(pd.read_csv(p))
