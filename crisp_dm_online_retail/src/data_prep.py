import pandas as pd
import numpy as np

def load_raw(path):
    df = pd.read_excel(path, engine="openpyxl")
    df.columns = [c.strip() for c in df.columns]
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"], errors="coerce")
    return df

def clean_sales(df):
    x = df.copy()
    x["InvoiceNo"] = x["InvoiceNo"].astype(str).str.strip()
    x["StockCode"] = x["StockCode"].astype(str).str.strip()
    x["Description"] = x["Description"].astype("string").str.strip()
    x["Country"] = x["Country"].astype("string").str.strip()
    x["is_cancellation"] = x["InvoiceNo"].str.upper().str.startswith("C")
    x["line_revenue"] = x["Quantity"] * x["UnitPrice"]
    x = x[
        (~x["is_cancellation"]) &
        x["CustomerID"].notna() &
        (x["Quantity"] > 0) &
        (x["UnitPrice"] > 0) &
        x["InvoiceDate"].notna()
    ].copy()
    x["CustomerID"] = x["CustomerID"].astype(int)
    x["date"] = x["InvoiceDate"].dt.date
    x["month"] = x["InvoiceDate"].dt.to_period("M").astype(str)
    return x

def build_rfm(sales, as_of=None):
    x = sales.copy()
    if as_of is None:
        as_of = x["InvoiceDate"].max() + pd.Timedelta(days=1)
    customer = x.groupby("CustomerID").agg(
        last_purchase=("InvoiceDate", "max"),
        frequency=("InvoiceNo", "nunique"),
        monetary=("line_revenue", "sum"),
        quantity=("Quantity", "sum"),
        unique_products=("StockCode", "nunique"),
    )
    customer["recency"] = (as_of - customer["last_purchase"]).dt.days
    customer["avg_order_value"] = customer["monetary"] / customer["frequency"]
    customer["avg_items_per_order"] = customer["quantity"] / customer["frequency"]
    return customer.reset_index()

def build_repeat_purchase_dataset(sales, cutoff, horizon_days=30, lookback_days=180):
    cutoff = pd.Timestamp(cutoff)
    history = sales[
        (sales["InvoiceDate"] < cutoff) &
        (sales["InvoiceDate"] >= cutoff - pd.Timedelta(days=lookback_days))
    ].copy()
    future = sales[
        (sales["InvoiceDate"] >= cutoff) &
        (sales["InvoiceDate"] < cutoff + pd.Timedelta(days=horizon_days))
    ].copy()

    feats = history.groupby("CustomerID").agg(
        recency=("InvoiceDate", lambda s: (cutoff - s.max()).days),
        frequency=("InvoiceNo", "nunique"),
        monetary=("line_revenue", "sum"),
        quantity=("Quantity", "sum"),
        unique_products=("StockCode", "nunique"),
        active_days=("InvoiceDate", lambda s: s.dt.date.nunique()),
    )
    feats["avg_order_value"] = feats["monetary"] / feats["frequency"]
    feats["avg_items_per_order"] = feats["quantity"] / feats["frequency"]
    future_customers = set(future["CustomerID"].unique())
    feats["repeat_30d"] = feats.index.to_series().isin(future_customers).astype(int)
    return feats.reset_index()
