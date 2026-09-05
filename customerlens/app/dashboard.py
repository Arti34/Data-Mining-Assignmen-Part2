import json
from pathlib import Path
import joblib
import pandas as pd
import plotly.express as px
import streamlit as st
from src.data.load import load_csv

st.set_page_config(page_title='CustomerLens',page_icon='🎯',layout='wide')
st.title('🎯 CustomerLens')
st.caption('Autonomous Customer Segmentation • CRISP-DM • Experiment Intelligence')
try: df=load_csv()
except FileNotFoundError as e: st.error(str(e)); st.stop()

pages=['Executive Overview','Data Quality','Exploration','Clustering Lab','Autoresearch','Experiments','Deployment']
page=st.sidebar.radio('Navigate',pages)

if page=='Executive Overview':
    try: c=pd.read_csv('data/processed/customer_clusters.csv'); champion=json.loads(Path('experiments/champion.json').read_text())
    except Exception: st.warning('Run `python run_pipeline.py` first.'); st.stop()
    a,b,d,e=st.columns(4); a.metric('Customers',len(c)); b.metric('Clusters',c.cluster.nunique()); d.metric('Silhouette',f"{champion['metrics']['silhouette']:.3f}"); e.metric('Champion Run',champion['experiment_id'])
    fig=px.scatter(c,x='annual_income_k',y='spending_score',color=c.cluster.astype(str),hover_data=[x for x in ['customer_id','age','gender'] if x in c],title='Customer Segmentation Map'); st.plotly_chart(fig,use_container_width=True)
    st.subheader('Cluster profiles'); st.dataframe(c.groupby('cluster').agg(customers=('cluster','size'),age=('age','mean'),income_k=('annual_income_k','mean'),spending=('spending_score','mean')).round(2),use_container_width=True)

elif page=='Data Quality':
    st.subheader('Data Quality — CRISP-DM: Data Understanding')
    q=pd.DataFrame({'metric':['rows','columns','missing cells','duplicate rows'],'value':[len(df),df.shape[1],int(df.isna().sum().sum()),int(df.duplicated().sum())]}); st.dataframe(q,use_container_width=True)
    st.write('Column types'); st.dataframe(pd.DataFrame({'dtype':df.dtypes.astype(str),'missing':df.isna().sum(),'unique':df.nunique()}),use_container_width=True)
    st.subheader('Descriptive statistics'); st.dataframe(df.describe(include='all').T,use_container_width=True)

elif page=='Exploration':
    st.subheader('Exploration — CRISP-DM: Data Understanding')
    num=[x for x in ['age','annual_income_k','spending_score'] if x in df]
    fig=px.scatter_matrix(df,dimensions=num,color='gender' if 'gender' in df else None,title='Feature relationships'); st.plotly_chart(fig,use_container_width=True)
    fig=px.scatter(df,x='annual_income_k',y='spending_score',color='age',size='age',hover_data=['customer_id'] if 'customer_id' in df else None,title='Income vs Spending'); st.plotly_chart(fig,use_container_width=True)

elif page=='Clustering Lab':
    st.subheader('Clustering Lab')
    algo=st.selectbox('Algorithm',['kmeans','agglomerative','dbscan']); features=st.multiselect('Features',['age','annual_income_k','spending_score'],default=['annual_income_k','spending_score']); scaler=st.selectbox('Scaler',['standard','minmax','robust'])
    st.info('Use the autoresearch runner for full experiment comparison. This page is for interactive inspection of the persisted champion.')
    if Path('models/champion.joblib').exists():
        obj=joblib.load('models/champion.joblib'); st.json(obj['config']); st.metric('Champion silhouette',f"{obj['metrics']['silhouette']:.3f}")

elif page=='Autoresearch':
    st.subheader('Autoresearch / Hill Climbing')
    st.write('Run experiments from the terminal, then refresh this page.')
    p=Path('experiments/registry.json')
    if p.exists():
        r=pd.json_normalize(json.loads(p.read_text())); cols=[c for c in ['experiment_id','metrics.objective','metrics.silhouette','metrics.davies_bouldin','metrics.calinski_harabasz','metrics.stability','metrics.runtime_ms'] if c in r]; st.dataframe(r.sort_values('metrics.objective',ascending=False)[cols].head(25),use_container_width=True)
        if 'metrics.objective' in r: st.line_chart(r.set_index('experiment_id')['metrics.objective'])
    else: st.warning('No experiment registry yet.')

elif page=='Experiments':
    st.subheader('Experiment Registry'); p=Path('experiments/registry.json')
    if p.exists(): st.dataframe(pd.json_normalize(json.loads(p.read_text())),use_container_width=True)
    else: st.warning('No experiments yet.')

elif page=='Deployment':
    st.subheader('New Customer Assignment')
    if not Path('models/champion.joblib').exists(): st.warning('Run the pipeline first.'); st.stop()
    obj=joblib.load('models/champion.joblib'); cfg=obj['config']; vals={}
    for f in cfg['features']:
        vals[f]=st.number_input(f.replace('_',' ').title(),value=float(df[f].median()))
    if st.button('Assign Segment'):
        X=obj['preprocessor'].transform(pd.DataFrame([vals])); label=int(obj['model'].predict(X)[0]); st.success(f'Assigned segment: {label}')
