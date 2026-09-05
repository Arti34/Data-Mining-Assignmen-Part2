import streamlit as st
from pathlib import Path
import pandas as pd
import plotly.express as px

st.set_page_config(page_title="Anomaly Intelligence",page_icon="⚠️",layout="wide")
st.title("⚠️ Anomaly Intelligence")
st.caption("CRISP-DM • Kaggle Credit Card Fraud • Research-grounded anomaly detection")
art=Path("artifacts"); lb=art/"leaderboard.csv"; vs=art/"validation_scores.csv"; ar=art/"autoresearch.csv"
if not lb.exists(): st.warning("Run `python -m src.pipeline` first."); st.stop()
leader=pd.read_csv(lb); sc=pd.read_csv(vs)
a,b,c,d=st.columns(4)
a.metric("Validation transactions",f"{len(sc):,}")
b.metric("Fraud labels",f"{int(sc.Class.sum()):,}")
c.metric("Fraud rate",f"{sc.Class.mean()*100:.3f}%")
d.metric("Best PR-AUC",f"{leader.pr_auc.max():.4f}")
t1,t2,t3,t4,t5=st.tabs(["Executive","Detector Lab","Investigation Capacity","AutoResearch","AI Engineering"])
with t1:
    st.subheader("Detector leaderboard")
    st.dataframe(leader.sort_values("pr_auc",ascending=False),use_container_width=True)
    st.plotly_chart(px.bar(leader.sort_values("pr_auc",ascending=False),x="model",y="pr_auc"),use_container_width=True)
with t2:
    st.subheader("Research-to-dashboard mapping")
    st.markdown("**MAD:** robust baseline.  
**Isolation Forest:** isolation + subsampling.  
**LOF:** local density deviation.  
**One-Class SVM:** normality boundary.  
**Autoencoder:** reconstruction-error extension documented in notebook/research.")
with t3:
    rows=[]; s=sc.score; y=sc.Class
    for pct in [.1,.25,.5,1,2,5]:
        k=max(1,int(len(sc)*pct/100)); idx=s.nlargest(k).index
        rows.append({"review_budget_%":pct,"alerts":k,"precision":y.loc[idx].mean(),"recall":y.loc[idx].sum()/max(1,y.sum())})
    q=pd.DataFrame(rows); st.dataframe(q,use_container_width=True)
    st.line_chart(q.set_index("review_budget_%")[["precision","recall"]])
with t4:
    if ar.exists():
        r=pd.read_csv(ar); st.dataframe(r.sort_values("objective",ascending=False).head(50),use_container_width=True)
        st.line_chart(r.groupby("round").objective.max())
    else: st.info("Run `python -m src.autoresearch` to populate the experiment ledger.")
with t5:
    checks={"Schema validation":True,"Temporal validation":True,"Leakage-safe preprocessing":True,"Rare-event metrics":True,"Budget thresholding":True,"Experiment ledger":True,"Model registry":False,"Drift monitoring":False,"Feedback loop":False,"Shadow deployment":False,"Rollback":False}
    st.dataframe(pd.DataFrame({"control":checks.keys(),"implemented_in_demo":checks.values()}),use_container_width=True)
