import subprocess,sys,json,csv
from pathlib import Path
R=Path('autoresearch/results.tsv'); M=Path('artifacts/metrics.json')
cands=[(.10,220,31,.1,30),(.06,350,31,.1,30),(.05,450,63,.3,30),(.08,300,63,1,50),(.07,350,31,2,60),(.04,500,63,.5,40)]
R.parent.mkdir(exist_ok=True)
if not R.exists(): R.write_text('experiment_id\tstatus\trmsle\tmae_seconds\trmse_seconds\tr2\tfit_seconds\tnote\n')
best=float('inf')
for i,(lr,it,leaf,l2,minleaf) in enumerate(cands,1):
 eid=f'exp_{i:03d}'; cmd=[sys.executable,'src/train.py','--experiment-id',eid,'--learning-rate',str(lr),'--max-iter',str(it),'--max-leaf-nodes',str(leaf),'--l2',str(l2),'--min-samples-leaf',str(minleaf)]; p=subprocess.run(cmd,capture_output=True,text=True)
 if p.returncode: status='crash'; row=[eid,status,'','','','','',p.stderr[-300:].replace('\n',' ')]
 else:
  m=json.load(open(M)); status='keep' if m['rmsle']<best else 'discard'; best=min(best,m['rmsle']); row=[eid,status,f"{m['rmsle']:.8f}",f"{m['mae_seconds']:.2f}",f"{m['rmse_seconds']:.2f}",f"{m['r2']:.5f}",f"{m['fit_seconds']:.2f}",str((lr,it,leaf,l2,minleaf))]
 with R.open('a') as f: f.write('\t'.join(map(str,row))+'\n')
 print(row[:2])
