import argparse
from src.data.load import load_csv
from src.autoresearch.search import run_search
p=argparse.ArgumentParser(); p.add_argument('--iterations',type=int,default=40); p.add_argument('--seed',type=int,default=42); a=p.parse_args()
df=load_csv(); champion,registry=run_search(df,a.iterations,a.seed)
print('Champion:', champion)
