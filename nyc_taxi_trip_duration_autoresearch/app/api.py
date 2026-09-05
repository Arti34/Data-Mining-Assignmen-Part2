import json,time,joblib,numpy as np,pandas as pd
from fastapi import FastAPI,HTTPException
from pydantic import BaseModel,Field
from src.features import build_features
app=FastAPI(title='NYC Taxi Duration API')
class Trip(BaseModel):
 pickup_latitude:float=Field(...,ge=40.45,le=40.95); pickup_longitude:float=Field(...,ge=-74.30,le=-73.65); dropoff_latitude:float=Field(...,ge=40.45,le=40.95); dropoff_longitude:float=Field(...,ge=-74.30,le=-73.65); pickup_datetime:str; passenger_count:int=Field(1,ge=1,le=8); vendor_id:int=1; store_and_fwd_flag:str='N'
@app.get('/health')
def health(): return {'status':'ok','model_available':__import__('pathlib').Path('models/model.joblib').exists()}
@app.get('/metrics')
def metrics():
 try:return json.load(open('artifacts/metrics.json'))
 except:return {'status':'not_trained'}
@app.post('/predict')
def predict(r:Trip):
 try:m=joblib.load('models/model.joblib')
 except:raise HTTPException(503,'Train the model first')
 x=build_features(pd.DataFrame([r.model_dump()]),training=False); t=time.perf_counter(); p=float(np.expm1(m.predict(x)[0])); ms=(time.perf_counter()-t)*1000
 return {'estimated_duration_seconds':round(p,1),'estimated_duration_minutes':round(p/60,1),'lower_bound_minutes':round(max(30,p*.78)/60,1),'upper_bound_minutes':round(p*1.28/60,1),'latency_ms':round(ms,2)}
