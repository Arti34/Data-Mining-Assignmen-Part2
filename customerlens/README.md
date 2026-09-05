# CustomerLens — Autonomous Customer Segmentation

An end-to-end CRISP-DM clustering project using the popular Kaggle Mall Customers dataset. It includes EDA, preprocessing, K-Means/K-Means++, Agglomerative Clustering, DBSCAN, PCA, internal validation metrics, stability analysis, experiment tracking, hill-climbing autoresearch, inference, and a Streamlit data-science admin dashboard.

## Dataset
Download `Mall_Customers.csv` from Kaggle and place it in `data/raw/Mall_Customers.csv`. The common version contains 200 customers and 5 columns: CustomerID, Gender/Genre, Age, Annual Income (k$), Spending Score (1-100).

## Quick start
```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Put the CSV at `data/raw/Mall_Customers.csv`, then:
```bash
python run_pipeline.py
streamlit run app/dashboard.py
```

The pipeline writes `experiments/registry.json`, `experiments/runs/`, `models/champion.joblib`, and processed CSVs.

## Autoresearch
```bash
python run_autoresearch.py --iterations 40 --seed 42
```
It evaluates candidate configurations, retains the champion, and records every experiment. The objective combines silhouette, Calinski-Harabasz, inverse Davies-Bouldin, stability, and a balance term. This is an educational hill-climbing optimizer, not a claim of globally optimal clustering.

## CRISP-DM mapping
1. Business Understanding — segmentation objective and success criteria.
2. Data Understanding — profiling, quality checks, EDA.
3. Data Preparation — feature selection, encoding/scaling, optional PCA.
4. Modeling — multiple clustering algorithms.
5. Evaluation — internal metrics, stability, interpretability.
6. Deployment — persisted pipeline/model, new-customer assignment, dashboard.

## Dashboard pages
- Executive Overview
- Data Quality
- Exploration
- Clustering Lab
- Autoresearch
- Experiments
- Deployment

## Notes
CustomerID is treated as an identifier, not a clustering feature. Gender is available for descriptive profiling but is not used as a numeric clustering input by default. The default behavioral feature set is Annual Income and Spending Score; the dashboard also allows age to be included.
