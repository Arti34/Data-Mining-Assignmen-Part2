from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.decomposition import PCA
from sklearn.pipeline import Pipeline

SCALERS = {'standard': StandardScaler, 'minmax': MinMaxScaler, 'robust': RobustScaler}

def make_preprocessor(features, scaler='standard', pca_components=None):
    steps=[('scaler', SCALERS[scaler]())]
    if pca_components:
        steps.append(('pca', PCA(n_components=pca_components, random_state=42)))
    return Pipeline(steps)
