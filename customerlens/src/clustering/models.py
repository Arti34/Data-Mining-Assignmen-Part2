from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN

def fit_model(cfg, X, seed=42):
    algo=cfg['algorithm']
    if algo=='kmeans':
        return KMeans(n_clusters=cfg['k'], init=cfg.get('init','k-means++'), n_init=cfg.get('n_init',10), max_iter=cfg.get('max_iter',300), random_state=seed).fit(X)
    if algo=='agglomerative':
        return AgglomerativeClustering(n_clusters=cfg['k'], linkage=cfg.get('linkage','ward')).fit(X)
    if algo=='dbscan':
        return DBSCAN(eps=cfg.get('eps',0.8), min_samples=cfg.get('min_samples',5)).fit(X)
    raise ValueError(algo)
