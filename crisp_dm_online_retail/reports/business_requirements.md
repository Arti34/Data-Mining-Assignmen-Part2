# CRISP-DM Phase 1 — Business Understanding

## Business problem

The retailer has transactional data but lacks a systematic customer-intelligence framework. Marketing needs actionable customer segments, early-warning signals for unusual behavior, repeat-purchase propensity, and product affinity insights.

## Stakeholders

- Marketing: targeting and retention
- Merchandising: product bundles and cross-sell
- Customer operations: unusual transaction investigation
- Finance: revenue-quality checks
- Data/ML engineering: reproducible analytical pipeline
- Leadership: measurable commercial outcomes

## Analytical objectives

### A — Customer segmentation
Create interpretable customer segments using RFM behavior.

**Success criteria:** stable clusters, meaningful separation, and business-readable segment profiles.

### B — Anomaly detection
Identify customers whose behavior is unusual relative to peers.

**Success criteria:** ranked cases that can be explained and investigated.

### C — Repeat-purchase prediction
Predict whether an observed customer will make another purchase in a future time window.

**Success criteria:** strong ranking performance and useful precision/recall at an operational threshold.

### D — Market-basket intelligence
Find product combinations with meaningful support and lift.

**Success criteria:** rules are sufficiently frequent, non-trivial, and commercially interpretable.

### E — Similar-product search
Retrieve product descriptions that are approximately similar using LSH.

**Success criteria:** useful candidate retrieval with lower search complexity than exhaustive pairwise comparison at scale.

## Business KPIs

- Revenue
- Active customers
- Orders per customer
- Average order value
- Repeat-purchase rate
- Revenue concentration
- Segment size/value
- High-priority anomaly count
- Classification precision/recall/AUC
- Rule support/confidence/lift
- LSH candidate recall and search-efficiency proxy
