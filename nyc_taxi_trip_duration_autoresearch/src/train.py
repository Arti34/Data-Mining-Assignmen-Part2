import argparse,json,time,joblib,numpy as np,pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from evaluate import evaluate,buckets
P='data/processed/features.parquet'; S='data/processed/split.parquet'
ap=argparse.ArgumentParser(); ap.add_argument('--experiment-id',default='manual'); ap.add_argument('--max-iter',type=int,default=300); ap.add_argument('--learning-rate',type=float,default=.08); ap.add_argument('--max-leaf-nodes',type=int,default=31); ap.add_argument('--l2',type=float,default=.1); ap.add_argument('--min-samples-leaf',type=int,default=30); a=ap.parse_args()
df=pd.read_parquet(P); sp=pd.read_parquet(S).split.values; tr=df[sp=='train'].copy(); va=df[sp=='valid'].copy(); yt=tr.pop('trip_duration'); yv=va.pop('trip_duration'); cats=['store_and_fwd_flag','pickup_geo_cell','dropoff_geo_cell']; nums=[c for c in tr.columns if c not in cats]
pre=ColumnTransformer([('cat',OneHotEncoder(handle_unknown='ignore',sparse_output=False),cats),('num',SimpleImputer(strategy='median'),nums)])
model=Pipeline([('prep',pre),('model',HistGradientBoostingRegressor(max_iter=a.max_iter,learning_rate=a.learning_rate,max_leaf_nodes=a.max_leaf_nodes,l2_regularization=a.l2,min_samples_leaf=a.min_samples_leaf,random_state=42))])
t=time.perf_counter(); model.fit(tr,np.log1p(yt)); fit=time.perf_counter()-t; pred=np.expm1(model.predict(va)); m=evaluate(yv,pred); m.update({'experiment_id':a.experiment_id,'fit_seconds':fit,'train_rows':len(tr),'valid_rows':len(va),'params':vars(a),'duration_buckets':buckets(yv.to_numpy(),pred)}); joblib.dump(model,'models/model.joblib'); json.dump(m,open('artifacts/metrics.json','w'),indent=2); pd.DataFrame({'actual':yv.to_numpy()[:5000],'prediction':pred[:5000],'residual':yv.to_numpy()[:5000]-pred[:5000]}).to_csv('artifacts/predictions_sample.csv',index=False); print(json.dumps({k:m[k] for k in ['experiment_id','rmsle','mae_seconds','rmse_seconds','r2','fit_seconds']},indent=2))
