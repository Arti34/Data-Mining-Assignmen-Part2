import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import silhouette_score, roc_auc_score, average_precision_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

def rfm_cluster(rfm, k=4, random_state=42):
    cols = ["recency", "frequency", "monetary"]
    X = np.log1p(rfm[cols])
    model = Pipeline([
        ("scale", StandardScaler()),
        ("kmeans", KMeans(n_clusters=k, n_init=20, random_state=random_state))
    ])
    labels = model.fit_predict(X)
    out = rfm.copy()
    out["cluster"] = labels
    sil = silhouette_score(model.named_steps["scale"].transform(X), labels)
    return model, out, sil

def isolation_forest(rfm, contamination=0.03, random_state=42):
    cols = ["recency", "frequency", "monetary", "unique_products"]
    X = np.log1p(rfm[cols])
    model = Pipeline([
        ("scale", StandardScaler()),
        ("iforest", IsolationForest(
            n_estimators=300, contamination=contamination, random_state=random_state
        ))
    ])
    pred = model.fit_predict(X)
    X_scaled = model.named_steps["scale"].transform(X)
    score = -model.named_steps["iforest"].score_samples(X_scaled)
    out = rfm.copy()
    out["anomaly"] = (pred == -1).astype(int)
    out["anomaly_score"] = score
    return model, out

def temporal_classifier(train_df, test_df):
    target = "repeat_30d"
    features = [c for c in train_df.columns if c not in ["CustomerID", target]]
    X_train, y_train = train_df[features], train_df[target]
    X_test, y_test = test_df[features], test_df[target]
    logit = Pipeline([
        ("scale", StandardScaler()),
        ("model", LogisticRegression(max_iter=2000, class_weight="balanced"))
    ])
    rf = RandomForestClassifier(
        n_estimators=400, random_state=42, class_weight="balanced_subsample",
        min_samples_leaf=5, n_jobs=-1
    )
    results = {}
    for name, model in [("logistic_regression", logit), ("random_forest", rf)]:
        model.fit(X_train, y_train)
        p = model.predict_proba(X_test)[:, 1]
        results[name] = {
            "model": model,
            "roc_auc": roc_auc_score(y_test, p),
            "pr_auc": average_precision_score(y_test, p),
            "predicted_probability": p
        }
    return results
