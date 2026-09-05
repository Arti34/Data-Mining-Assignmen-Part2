import json,requests,pandas as pd,streamlit as st,folium,plotly.express as px
from streamlit_folium import st_folium
st.set_page_config(page_title='NYC Taxi AI Lab',page_icon='🚕',layout='wide'); API=st.sidebar.text_input('API URL','http://localhost:8000'); st.title('🚕 NYC Taxi AI Lab'); st.caption('Interactive trip estimation • research-grade admin dashboard • CRISP-DM • autoresearch')
t1,t2,t3=st.tabs(['Trip Estimator','Data Scientist Admin','CRISP-DM / Research'])
with t1:
 c1,c2=st.columns([1,1]);
 with c1:
  pu=st.text_input('Pickup lat, lon','40.7580, -73.9855'); dr=st.text_input('Drop-off lat, lon','40.6413, -73.7781'); dt=st.datetime_input('Pickup time'); pax=st.slider('Passengers',1,8,1)
  if st.button('Estimate trip',type='primary'):
   try:
    plat,plon=map(float,pu.split(',')); dlat,dlon=map(float,dr.split(',')); payload={'pickup_latitude':plat,'pickup_longitude':plon,'dropoff_latitude':dlat,'dropoff_longitude':dlon,'pickup_datetime':str(dt),'passenger_count':pax,'vendor_id':1,'store_and_fwd_flag':'N'}; st.session_state.pred=requests.post(API+'/predict',json=payload,timeout=10).json()
   except Exception as e: st.error(str(e))
 with c2:
  plat,plon=map(float,pu.split(',')); dlat,dlon=map(float,dr.split(',')); m=folium.Map([(plat+dlat)/2,(plon+dlon)/2],zoom_start=11); folium.Marker([plat,plon],tooltip='Pickup',icon=folium.Icon(color='green')).add_to(m); folium.Marker([dlat,dlon],tooltip='Drop-off',icon=folium.Icon(color='red')).add_to(m); folium.PolyLine([[plat,plon],[dlat,dlon]]).add_to(m); st_folium(m,height=430,use_container_width=True)
 if 'pred' in st.session_state:
  p=st.session_state.pred; a,b,c=st.columns(3); a.metric('Estimated duration',f"{p['estimated_duration_minutes']} min"); b.metric('Estimated range',f"{p['lower_bound_minutes']}–{p['upper_bound_minutes']} min"); c.metric('Latency',f"{p['latency_ms']} ms")
with t2:
 try:m=requests.get(API+'/metrics',timeout=3).json()
 except:m={}
 if m.get('status')=='not_trained': st.warning('Train model first')
 else:
  a,b,c,d=st.columns(4); a.metric('RMSLE',f"{m.get('rmsle',0):.4f}"); b.metric('MAE',f"{m.get('mae_seconds',0):.0f}s"); c.metric('RMSE',f"{m.get('rmse_seconds',0):.0f}s"); d.metric('R²',f"{m.get('r2',0):.3f}"); st.json({'experiment_id':m.get('experiment_id'),'fit_seconds':m.get('fit_seconds'),'rows':{'train':m.get('train_rows'),'valid':m.get('valid_rows')},'params':m.get('params')})
  bkt=pd.DataFrame(m.get('duration_buckets',[]));
  if not bkt.empty: st.subheader('Error by trip-duration bucket'); st.plotly_chart(px.bar(bkt,x='bucket',y='mae_seconds',text_auto='.0f'),use_container_width=True)
  p='artifacts/predictions_sample.csv'
  try:pred=pd.read_csv(p); st.subheader('Residual diagnostics'); st.plotly_chart(px.scatter(pred,x='actual',y='residual',hover_data=['prediction']),use_container_width=True)
  except:pass
  if __import__('pathlib').Path('autoresearch/results.tsv').exists(): st.subheader('Autoresearch ledger'); st.dataframe(pd.read_csv('autoresearch/results.tsv',sep='\t'),use_container_width=True,hide_index=True)
with t3:
 for h,b in [('1 Business Understanding','Estimate trip duration for rider planning and fleet analytics.'),('2 Data Understanding','Schema, missingness, target distribution, spatial and temporal validity.'),('3 Data Preparation','Cleaning, temporal/cyclic features, distance, bearing and spatial cells.'),('4 Modeling','Log-target gradient boosting and controlled experiments.'),('5 Evaluation','RMSLE plus MAE, RMSE, R², residuals and duration buckets.'),('6 Deployment','FastAPI inference + Streamlit interactive dashboard.')]: st.markdown(f'**{h}** — {b}')
 st.markdown('### Research-to-dashboard traceability'); st.write('Spatial distance/direction, pickup time, rush hour, spatial cells, model parameters, primary/secondary metrics, stratified errors, residual diagnostics, experiment history and latency are all exposed for scientific inspection.')
