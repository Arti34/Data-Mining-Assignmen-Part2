import json,numpy as np,pandas as pd
from sklearn.model_selection import train_test_split
from features import clean,build_features
RAW='data/raw/train.csv'; OUT='data/processed/features.parquet'; SPLIT='data/processed/split.parquet'
df=pd.read_csv(RAW); raw=len(df); df=clean(df); f=build_features(df); idx=np.arange(len(f)); tr,va=train_test_split(idx,test_size=.2,random_state=42); f.to_parquet(OUT,index=False); pd.DataFrame({'row_id':idx,'split':np.where(np.isin(idx,tr),'train','valid')}).to_parquet(SPLIT,index=False); json.dump({'raw_rows':raw,'clean_rows':len(f),'rows_removed':raw-len(f),'train_rows':len(tr),'valid_rows':len(va),'features':f.shape[1]},open('data/processed/data_quality.json','w'),indent=2); print('prepared',len(f))
