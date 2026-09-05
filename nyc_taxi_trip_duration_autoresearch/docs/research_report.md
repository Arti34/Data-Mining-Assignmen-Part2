# NYC Taxi Trip Duration — CRISP-DM Research Report

## Executive summary
This project predicts NYC taxi trip duration using pickup-time information and requested destination coordinates. The Kaggle competition defines RMSLE as the primary metric. The implementation adds a reproducible fixed validation harness, log-target gradient boosting, spatial/temporal features, an autoresearch-style hill-climbing loop, FastAPI deployment, and a research-oriented Streamlit dashboard.

## CRISP-DM
**Business Understanding:** rider planning and operational analytics; primary success criterion is lower RMSLE.

**Data Understanding:** Kaggle NYC Taxi Trip Duration contains pickup/drop-off coordinates, pickup time, passenger count, vendor/store-forward fields and trip duration. `dropoff_datetime` is excluded from deployment features because it is only known after the trip.

**Data Preparation:** invalid/missing records are removed; extreme duration and coordinate values are filtered; temporal, cyclic, Haversine/Manhattan-style distance, bearing and spatial-cell features are derived.

**Modeling:** HistGradientBoostingRegressor is trained on `log1p(trip_duration)`. This aligns training with the logarithmic nature of RMSLE while preserving a fast CPU-friendly baseline.

**Evaluation:** RMSLE is primary; MAE, RMSE, R², median/90th-percentile absolute error, duration-bucket error and residual plots are secondary diagnostics.

**Deployment:** FastAPI serves predictions and metrics; Streamlit provides an interactive map, estimator and admin dashboard. The map line is a straight-line visualization, not live road routing.

## Autoresearch methodology
Karpathy's autoresearch uses a fixed preparation/evaluation contract, one mutable training program, a fixed compute budget, baseline-first experimentation, a TSV result ledger and keep/discard decisions. This project adapts those principles to tabular regression: `prepare.py` and `evaluate.py` remain fixed, `train.py` is the experiment surface, validation RMSLE is the objective, and `autoresearch/results.tsv` records each run. One coherent hypothesis should be tested at a time; regressions are discarded; crashes are logged.

## Research-to-dashboard mapping
The dashboard exposes spatial distance/direction, pickup-time effects, rush-hour signal, spatial cells, model hyperparameters, RMSLE/MAE/RMSE/R², stratified error, residual diagnostics, experiment history and inference latency. This turns the frontend from a demo into a model-development and monitoring console.

## Research hypotheses
1. Log-target training improves RMSLE consistency.
2. Manhattan-style and Haversine distance capture complementary spatial structure.
3. Cyclic hour/day features improve temporal generalization.
4. Spatial cells provide coarse location context.
5. Tree depth, learning rate, leaf count and regularization trade accuracy against fit cost.
6. Duration-bucket evaluation can expose failures hidden by the aggregate RMSLE.

## Limitations and next steps
The estimator is not a live ETA: it has no live traffic, road closures, weather or routing-engine travel time. Next research steps are learned taxi-zone IDs, road-network distance, weather/events, XGBoost/LightGBM comparison, temporal validation, calibrated prediction intervals, SHAP explanations and drift monitoring.

## Sources
- Kaggle NYC Taxi Trip Duration: https://www.kaggle.com/c/nyc-taxi-trip-duration
- IBM CRISP-DM overview: https://www.ibm.com/docs/en/spss-modeler/saas?topic=dm-crisp-help-overview
- Poongodi et al., NYC taxi trip duration prediction using MLP and XGBoost: https://pmc.ncbi.nlm.nih.gov/articles/PMC8248292/
- Karpathy autoresearch: https://github.com/karpathy/autoresearch
- NYC TLC trip record data: https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page
