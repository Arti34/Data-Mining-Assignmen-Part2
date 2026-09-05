import numpy as np
from sklearn.metrics import mean_absolute_error,mean_squared_error,r2_score

def rmsle(y,p): return float(np.sqrt(np.mean((np.log1p(np.clip(p,0,None))-np.log1p(np.clip(y,0,None)))**2)))
def evaluate(y,p):
 p=np.clip(np.asarray(p),0,None); y=np.asarray(y)
 return {'rmsle':rmsle(y,p),'mae_seconds':float(mean_absolute_error(y,p)),'rmse_seconds':float(mean_squared_error(y,p)**.5),'r2':float(r2_score(y,p)),'p50_abs_error_seconds':float(np.quantile(abs(y-p),.5)),'p90_abs_error_seconds':float(np.quantile(abs(y-p),.9))}
def buckets(y,p):
 labels=['0-5m','5-10m','10-20m','20-30m','30-60m','60m+']; edges=[0,300,600,1200,1800,3600,np.inf]; b=np.digitize(y,edges,right=True)-1; out=[]
 for i,l in enumerate(labels):
  m=b==i
  if m.any(): out.append({'bucket':l,'count':int(m.sum()),'mae_seconds':float(mean_absolute_error(y[m],p[m])),'rmsle':rmsle(y[m],p[m])})
 return out
