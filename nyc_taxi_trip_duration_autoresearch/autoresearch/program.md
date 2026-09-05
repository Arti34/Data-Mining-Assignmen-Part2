# Autoresearch adaptation

Follow Karpathy autoresearch principles: fixed evaluation/data preparation; one experimentable training surface; baseline first; one coherent hypothesis per run; log results in TSV; keep only lower validation RMSLE; discard regressions; record crashes; prefer simpler changes when performance is equal; never alter the validation set to improve the score.

Fixed: src/prepare.py, src/evaluate.py, validation split, metric definition and deployment contract.
Mutable: src/train.py model family, hyperparameters and feature transformations that respect pickup-time information.

Dashboard must expose RMSLE, MAE, RMSE, R2, fit time, row counts, parameters, duration-bucket error, residual diagnostics and experiment ledger.
