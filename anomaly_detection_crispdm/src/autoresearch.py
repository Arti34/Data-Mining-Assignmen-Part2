from dataclasses import dataclass
from itertools import product
from pathlib import Path
import pandas as pd
from src.data import load,prepare,temporal_split
from src.detectors import iforest,evaluate

@dataclass
class Config:
    n_estimators:int
    max_samples:object
    contamination:float

def objective(m):
    return .60*m["pr_auc"]+.25*m["recall_at_budget"]+.15*m["precision_at_budget"]

def run_search(rounds=4,budget=.01,seed=42):
    df=prepare(load()); tr,val,_=temporal_split(df)
    f=[f"V{i}" for i in range(1,29)]+["Time","Amount_log1p"]
    Xtr,Xv=tr[f].to_numpy(),val[f].to_numpy()
    candidates=[Config(200,"auto",.005),Config(300,"auto",.01),Config(500,"auto",.02),
                Config(300,.5,.01),Config(500,.75,.01)]
    history=[]; best=None; best_score=float("-inf")
    for rnd in range(rounds):
        for c in candidates:
            _,s=iforest(Xtr,Xv,c.contamination,c.n_estimators,c.max_samples,seed)
            m=evaluate(val.Class,s,budget); score=objective(m)-c.n_estimators/100000
            history.append({"round":rnd,**c.__dict__,**m,"objective":score})
            if score>best_score: best_score,best=score,c
        candidates=[Config(max(100,int(best.n_estimators*f)),best.max_samples,c)
                    for f,c in product([.75,1,1.5],[.005,.01,.02,.03])]
    out=pd.DataFrame(history); Path("artifacts").mkdir(exist_ok=True)
    out.to_csv("artifacts/autoresearch.csv",index=False)
    print("Best:",best,"Objective:",best_score)
    return out

if __name__=="__main__": run_search()
