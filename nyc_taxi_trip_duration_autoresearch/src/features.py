import numpy as np
import pandas as pd

def haversine_km(lat1,lon1,lat2,lon2):
 r=6371.0088; a1,a2=np.radians(lat1),np.radians(lat2); dlat=a2-a1; dlon=np.radians(lon2-lon1)
 a=np.sin(dlat/2)**2+np.cos(a1)*np.cos(a2)*np.sin(dlon/2)**2
 return 2*r*np.arcsin(np.sqrt(np.clip(a,0,1)))

def bearing(lat1,lon1,lat2,lon2):
 a1,a2=np.radians(lat1),np.radians(lat2); dl=np.radians(lon2-lon1)
 return (np.degrees(np.arctan2(np.sin(dl)*np.cos(a2),np.cos(a1)*np.sin(a2)-np.sin(a1)*np.cos(a2)*np.cos(dl)))+360)%360

def build_features(df,training=True):
 x=df.copy(); x['pickup_datetime']=pd.to_datetime(x['pickup_datetime'],errors='coerce')
 x['pickup_hour']=x.pickup_datetime.dt.hour; x['pickup_dow']=x.pickup_datetime.dt.dayofweek; x['pickup_month']=x.pickup_datetime.dt.month; x['pickup_day']=x.pickup_datetime.dt.day
 x['is_weekend']=(x.pickup_dow>=5).astype(int); x['is_rush_hour']=x.pickup_hour.isin([7,8,9,16,17,18,19]).astype(int)
 x['hour_sin']=np.sin(2*np.pi*x.pickup_hour/24); x['hour_cos']=np.cos(2*np.pi*x.pickup_hour/24); x['dow_sin']=np.sin(2*np.pi*x.pickup_dow/7); x['dow_cos']=np.cos(2*np.pi*x.pickup_dow/7)
 x['haversine_km']=haversine_km(x.pickup_latitude,x.pickup_longitude,x.dropoff_latitude,x.dropoff_longitude)
 x['manhattan_km']=haversine_km(x.pickup_latitude,x.pickup_longitude,x.pickup_latitude,x.dropoff_longitude)+haversine_km(x.pickup_latitude,x.pickup_longitude,x.dropoff_latitude,x.pickup_longitude)
 b=bearing(x.pickup_latitude,x.pickup_longitude,x.dropoff_latitude,x.dropoff_longitude); x['bearing_sin']=np.sin(np.radians(b)); x['bearing_cos']=np.cos(np.radians(b))
 x['pickup_geo_cell']=x.pickup_latitude.round(2).astype(str)+'_'+x.pickup_longitude.round(2).astype(str); x['dropoff_geo_cell']=x.dropoff_latitude.round(2).astype(str)+'_'+x.dropoff_longitude.round(2).astype(str)
 keep=['vendor_id','passenger_count','pickup_longitude','pickup_latitude','dropoff_longitude','dropoff_latitude','store_and_fwd_flag','pickup_hour','pickup_dow','pickup_month','pickup_day','is_weekend','is_rush_hour','hour_sin','hour_cos','dow_sin','dow_cos','haversine_km','manhattan_km','bearing_sin','bearing_cos','pickup_geo_cell','dropoff_geo_cell']
 if training and 'trip_duration' in x: keep+=['trip_duration']
 return x[keep].replace([np.inf,-np.inf],np.nan)

def clean(df):
 x=df.copy(); nums=['passenger_count','pickup_longitude','pickup_latitude','dropoff_longitude','dropoff_latitude','trip_duration']
 for c in nums:x[c]=pd.to_numeric(x[c],errors='coerce')
 x=x.dropna(subset=nums+['pickup_datetime']); x=x[(x.trip_duration>0)&(x.trip_duration<=14400)&x.passenger_count.between(1,8)]
 x=x[x.pickup_longitude.between(-74.30,-73.65)&x.dropoff_longitude.between(-74.30,-73.65)&x.pickup_latitude.between(40.45,40.95)&x.dropoff_latitude.between(40.45,40.95)]
 return x.reset_index(drop=True)
