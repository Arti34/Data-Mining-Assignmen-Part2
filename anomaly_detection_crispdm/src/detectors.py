import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import average_precision_score,roc_auc_score,precision_score,recall_score

def iforest(Xtr,Xe,contamination=.01,n_estimators=300,max_samples="auto",seed=42):
    m=IsolationForest(n_estimators=n_estimators,contamination=contamination,max_samples=max_samples,random_state=seed,n_jobs=-1)
    m.fit(Xtr)
    return m,-m.score_samples(Xe)

def lof(Xtr,Xe,n_neighbors=35,contamination=.01):
    m=LocalOutlierFactor(n_neighbors=n_neighbors,contamination=contamination,novelty=True)
    m.fit(Xtr)
    return m,-m.score_samples(Xe)

def ocsvm(Xtr,Xe,nu=.01,gamma="scale"):
    m=Pipeline([("scale",StandardScaler()),("model",OneClassSVM(nu=nu,gamma=gamma))])
    m.fit(Xtr)
    return m,-m.decision_function(Xe).ravel()

def mad_score(Xtr,Xe,eps=1e-9):
    med=np.median(Xtr,axis=0); mad=np.median(np.abs(Xtr-med),axis=0)
    return np.max(np.abs((Xe-med)/(1.4826*mad+eps)),axis=1)

def rank01(s):
    return np.argsort(np.argsort(s))/max(1,len(s)-1)

def evaluate(y,s,budget=.01):
    y=np.asarray(y); s=np.asarray(s); k=max(1,int(len(y)*budget))
    idx=np.argsort(s)[::-1][:k]; pred=np.zeros(len(y),dtype=int); pred[idx]=1
    return {"pr_auc":average_precision_score(y,s),"roc_auc":roc_auc_score(y,s),
            "precision_at_budget":precision_score(y,pred,zero_division=0),
            "recall_at_budget":recall_score(y,pred,zero_division=0),"alerts":k}
