# CRISP-DM Anomaly Detection Masterclass — Kaggle Credit Card Fraud

A research-grounded, production-minded anomaly detection project using the popular Kaggle/ULB Credit Card Fraud benchmark.

## Dataset
Kaggle dataset: `mlg-ulb/creditcardfraud`
- 284,807 transactions
- 492 fraud cases
- extreme class imbalance
- anonymized PCA features V1–V28 plus Time, Amount and Class

Download `creditcard.csv` from Kaggle and place it in `data/raw/`.

## CRISP-DM
1. Business Understanding — define the fraud-review decision and capacity constraint.
2. Data Understanding — audit quality, imbalance, distributions and time structure.
3. Data Preparation — leakage-safe transforms and temporal splitting.
4. Modeling — MAD, Isolation Forest, LOF, One-Class SVM and rank ensemble.
5. Evaluation — PR-AUC, ROC-AUC, precision@budget and recall@budget.
6. Deployment/Synthesis — monitoring, feedback, versioning, rollback and operational recommendations.

## AutoResearch
`src/autoresearch.py` performs reproducible hill climbing over Isolation Forest hyperparameters. The objective combines PR-AUC, recall at a fixed investigation budget and precision at that budget, with a small complexity penalty. Every trial is logged. The final test set is never used for search.

## Dashboard
```bash
pip install -r requirements.txt
python -m src.pipeline
streamlit run app/dashboard.py
```

Dashboard tabs: Executive, Detector Lab, Investigation Capacity, AutoResearch, AI Engineering.

## Notebook
Run `notebooks/01_anomaly_detection_crispdm.ipynb` for the textbook walkthrough and quizzes.

## Research
See `research/REFERENCES.md` for Isolation Forest, LOF, Deep SAD and credit-card anomaly/fraud literature.
