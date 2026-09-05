# NYC Taxi Trip Duration — End-to-End AI/Data Science Project

Includes CRISP-DM, Kaggle data pipeline, training, autoresearch-style hill climbing, FastAPI deployment, interactive Folium map, trip estimator, and a research-grade admin dashboard.

## Run
1. Put Kaggle `train.csv` in `data/raw/train.csv`.
2. `python -m venv .venv` then activate it.
3. `pip install -r requirements.txt`
4. `python src/prepare.py`
5. `python src/train.py`
6. `uvicorn app.api:app --reload --port 8000`
7. In another terminal: `streamlit run app/dashboard.py`
8. For hill climbing: `python autoresearch/run_autoresearch.py --max-experiments 6` (the current script accepts the argument only as a future-compatible interface; edit candidate count if needed).

## Architecture
Kaggle CSV → fixed preparation → fixed validation → experimentable training → model artifact → FastAPI → Streamlit estimator/admin dashboard.

See `docs/research_report.md` and `autoresearch/program.md`.
