from pathlib import Path
import pandas as pd
import numpy as np

FEATURES=[f"V{i}" for i in range(1,29)]+["Time","Amount"]

def load(path="data/raw/creditcard.csv"):
    p=Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Missing {p}. Download Kaggle creditcard.csv and place it there.")
    df=pd.read_csv(p)
    required=set(FEATURES+["Class"])
    missing=required-set(df.columns)
    if missing: raise ValueError(f"Missing columns: {sorted(missing)}")
    return df

def validate(df):
    return {
        "rows":len(df),
        "columns":len(df.columns),
        "missing_values":int(df.isna().sum().sum()),
        "duplicates":int(df.duplicated().sum()),
        "fraud_count":int(df.Class.sum()),
        "fraud_rate":float(df.Class.mean())
    }

def prepare(df):
    x=df.copy()
    x["Amount_log1p"]=np.log1p(x["Amount"])
    return x

def temporal_split(df, train_frac=.70, val_frac=.15):
    n=len(df); a=int(n*train_frac); b=int(n*(train_frac+val_frac))
    return df.iloc[:a].copy(),df.iloc[a:b].copy(),df.iloc[b:].copy()
