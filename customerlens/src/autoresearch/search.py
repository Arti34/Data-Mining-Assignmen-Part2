import json, random, time
from pathlib import Path
import numpy as np
from src.clustering.models import fit_model
from src.evaluation.metrics import evaluate, objective
from src.preprocessing.pipeline import make_preprocessor

def _stability(df, features, cfg, seed):
    vals=[]
    for s in [seed, seed+7, seed+21]:
        X=make_preprocessor(features,cfg['scaler'],cfg.get('pca_components')).fit_transform(df[features])
        labels=fit_model(cfg,X,s).labels_
        vals.append(evaluate(X,labels)['silhouette'])
    return float(np.clip(1-np.std(vals),0,1))

def evaluate_config(df, cfg, seed=42):
    features=cfg['features']; pre=make_preprocessor(features,cfg['scaler'],cfg.get('pca_components'))
    X=pre.fit_transform(df[features]); t=time.perf_counter(); model=fit_model(cfg,X,seed); elapsed=(time.perf_counter()-t)*1000
    m=evaluate(X,model.labels_); stab=_stability(df,features,cfg,seed)
    m['stability']=stab; m['objective']=objective(m,stab); m['runtime_ms']=elapsed
    return m, model, pre

def random_candidate(rng, features_list):
    algo=rng.choice(['kmeans','agglomerative','dbscan']); cfg={'algorithm':algo,'features':rng.choice(features_list),'scaler':rng.choice(['standard','minmax','robust']),'pca_components':rng.choice([None,2])}
    if algo in ('kmeans','agglomerative'): cfg['k']=rng.randint(2,10)
    else: cfg.update({'eps':round(rng.uniform(.3,1.5),2),'min_samples':rng.randint(3,8)})
    if cfg['pca_components'] and cfg['pca_components']>len(cfg['features']): cfg['pca_components']=None
    return cfg

def run_search(df, iterations=40, seed=42, out='experiments'):
    rng=random.Random(seed); Path(out).mkdir(parents=True,exist_ok=True); registry=[]; champion=None
    features_list=[['annual_income_k','spending_score'],['age','annual_income_k','spending_score']]
    for i in range(1,iterations+1):
        cfg=random_candidate(rng,features_list)
        try: metrics,model,pre=evaluate_config(df,cfg,seed)
        except Exception as e: metrics={'objective':-1,'error':str(e)}; model=pre=None
        rec={'experiment_id':i,'config':cfg,'metrics':metrics,'is_champion':False}
        if champion is None or metrics.get('objective',-1)>champion['metrics'].get('objective',-1): rec['is_champion']=True; champion=rec
        registry.append(rec); Path(out,f'run_{i:03d}.json').write_text(json.dumps(rec,indent=2))
    Path(out,'registry.json').write_text(json.dumps(registry,indent=2)); return champion,registry
