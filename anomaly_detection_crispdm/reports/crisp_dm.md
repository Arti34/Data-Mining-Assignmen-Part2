# CRISP-DM Project Charter

## Business Understanding
Decision: which transactions should enter a limited fraud-investigation queue?

Primary operational KPI: precision at a fixed review budget. Secondary: recall at budget, PR-AUC, ROC-AUC, alert rate, stability and latency.

## Data Understanding
The benchmark contains 284,807 transactions and 492 fraud cases. V1–V28 are anonymized PCA components. Time and Amount are more directly interpretable.

The Class label is retained for offline evaluation. An unsupervised detector should not use Class during fitting.

## Data Preparation
- validate schema and missingness
- inspect duplicates
- log-transform Amount
- scale where distance/kernel methods require it
- fit transforms on training data only
- preserve temporal ordering for evaluation

## Modeling
Compare robust statistics, Isolation Forest, LOF, One-Class SVM and an ensemble of ranks. An autoencoder is documented as an extension point for deep-learning experimentation.

## Evaluation
Prefer PR-AUC for rare-event ranking and always report precision/recall under the actual review capacity. Select thresholds on validation data and reserve the test set.

## Deployment/Synthesis
Reference architecture:
transaction -> validation -> feature service -> anomaly scoring -> policy/threshold -> investigation queue -> feedback -> monitoring -> controlled retraining.

Production controls: model/version registry, drift monitoring, feedback capture, auditability, rollback, shadow deployment and reproducible builds.
