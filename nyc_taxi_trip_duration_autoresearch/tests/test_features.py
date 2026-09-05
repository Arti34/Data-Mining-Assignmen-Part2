import pandas as pd
from src.features import haversine_km,build_features
def test_zero_distance(): assert float(haversine_km(40,-74,40,-74))<1e-8
def test_features():
 d=pd.DataFrame([{'pickup_datetime':'2016-06-01 08:30:00','vendor_id':1,'passenger_count':1,'pickup_longitude':-73.98,'pickup_latitude':40.75,'dropoff_longitude':-73.95,'dropoff_latitude':40.76,'store_and_fwd_flag':'N','trip_duration':600}]); x=build_features(d); assert 'haversine_km' in x and x.haversine_km.iloc[0]>0
