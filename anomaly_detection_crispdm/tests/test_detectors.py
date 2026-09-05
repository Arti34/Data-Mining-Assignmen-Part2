import numpy as np
from src.detectors import rank01,mad_score
def test_rank(): 
    r=rank01(np.array([1.,2.,3.])); assert r[0]<r[1]<r[2]
def test_mad():
    x=np.array([[0.,0.],[0.,0.],[0.,0.],[100.,100.]])
    assert mad_score(x[:3],x)[-1]>mad_score(x[:3],x)[0]
