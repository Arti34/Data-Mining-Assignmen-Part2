from pathlib import Path
import numpy as np,pandas as pd
from sklearn.preprocessing import StandardScaler
from src.data import load,prepare,temporal_split
from src.detectors import iforest,lof,ocsvm,mad_score,rank01,evaluate

def main():
    df=prepare(load())
    train,val,test=temporal_split(df)
    f=[f"V{i}" for i in range(1,29)]+["Time","Amount_log1p"]
    Xtr=train[f].to_numpy(); Xv=val[f].to_numpy()
    rows=[]; scores={}
    _,s=iforest(Xtr,Xv); scores["Isolation Forest"]=s; rows.append({"model":"Isolation Forest",**evaluate(val.Class,s)})
    sc=StandardScaler().fit(Xtr)
    _,s=lof(sc.transform(Xtr),sc.transform(Xv)); scores["LOF"]=s; rows.append({"model":"LOF",**evaluate(val.Class,s)})
    _,s=ocsvm(Xtr,Xv); scores["One-Class SVM"]=s; rows.append({"model":"One-Class SVM",**evaluate(val.Class,s)})
    s=mad_score(Xtr,Xv); scores["MAD baseline"]=s; rows.append({"model":"MAD baseline",**evaluate(val.Class,s)})
    ens=np.mean([rank01(s) for s in scores.values()],axis=0)
    rows.append({"model":"Rank ensemble",**evaluate(val.Class,ens)})
    Path("artifacts").mkdir(exist_ok=True)
    pd.DataFrame(rows).sort_values("pr_auc",ascending=False).to_csv("artifacts/leaderboard.csv",index=False)
    pd.DataFrame({"score":ens,"Class":val.Class.to_numpy()}).to_csv("artifacts/validation_scores.csv",index=False)
    print(pd.DataFrame(rows).sort_values("pr_auc",ascending=False))

if __name__=="__main__": main()
