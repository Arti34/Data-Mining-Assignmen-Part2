import json
from pathlib import Path
import joblib
from src.data.load import load_csv
from src.autoresearch.search import run_search, evaluate_config

df=load_csv(); champion,registry=run_search(df,40,42)
Path('experiments/champion.json').write_text(json.dumps(champion,indent=2))
cfg=champion['config']; metrics,model,pre=evaluate_config(df,cfg,42)
joblib.dump({'model':model,'preprocessor':pre,'config':cfg,'metrics':metrics},'models/champion.joblib')
df_out=df.copy(); X=pre.transform(df[cfg['features']]); df_out['cluster']=model.labels_; Path('data/processed').mkdir(exist_ok=True); df_out.to_csv('data/processed/customer_clusters.csv',index=False)
print(f"Champion objective={metrics['objective']:.4f}, silhouette={metrics['silhouette']:.4f}")
