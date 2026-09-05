import numpy as np
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score

def evaluate(X, labels):
    labels=np.asarray(labels)
    unique, counts=np.unique(labels, return_counts=True)
    n_clusters=len(unique)
    if n_clusters < 2 or n_clusters >= len(labels):
        return {'silhouette': -1.0, 'davies_bouldin': float('inf'), 'calinski_harabasz': 0.0, 'n_clusters': n_clusters, 'balance': 0.0}
    sil=silhouette_score(X, labels)
    db=davies_bouldin_score(X, labels)
    ch=calinski_harabasz_score(X, labels)
    balance=float(np.min(counts)/np.max(counts))
    return {'silhouette':float(sil),'davies_bouldin':float(db),'calinski_harabasz':float(ch),'n_clusters':n_clusters,'balance':balance}

def objective(m, stability=1.0):
    ch=np.log1p(max(m['calinski_harabasz'],0))/10
    db=1/(1+max(m['davies_bouldin'],0))
    return float(0.45*((m['silhouette']+1)/2)+0.20*min(ch,1)+0.15*db+0.10*stability+0.10*m['balance'])
