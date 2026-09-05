# Model Card

Intended use: prioritize transactions for a human fraud-review queue in a benchmark.

Not intended for: automatic transaction denial, legal decisions, or production deployment without independent validation.

Key metrics: PR-AUC, precision@budget, recall@budget, alert rate.

Limitations: anonymized features, historical benchmark, potential distribution shift, imperfect labels, score-vs-probability distinction, threshold dependence on review capacity, and possible legitimate rare behavior.

Human oversight: alerts should be reviewed and outcomes captured as feedback labels.
