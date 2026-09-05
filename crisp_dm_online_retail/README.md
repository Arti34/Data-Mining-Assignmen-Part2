# CRISP-DM End-to-End Data Science Project — Online Retail

A textbook-quality, end-to-end data science learning project built around the **Online Retail** transactional dataset. It walks through every CRISP-DM phase and connects business reasoning to EDA, preprocessing, unsupervised learning, anomaly detection, supervised learning, association rules, and locality-sensitive hashing (LSH).

## Dataset

This project uses the well-known UCI Online Retail dataset as distributed through Kaggle. It contains transactions for a UK-based online retailer from **1 Dec 2010 to 9 Dec 2011**, with invoice, product, quantity, date, unit price, customer, and country fields.

Kaggle reference:
https://www.kaggle.com/datasets/jihyeseo/online-retail-data-set-from-uci-ml-repo

UCI reference:
https://archive.ics.uci.edu/dataset/352/online+retail

The raw workbook is intentionally not bundled. Run `python -m src.download_data`, then extract the downloaded archive into `data/raw/`.

## Business case

Imagine you are a data scientist supporting an online giftware retailer.

Leadership wants to answer:
1. Who are our most valuable customer segments?
2. Which customers look unusual enough to investigate?
3. Can we predict whether a customer will purchase again soon?
4. Which products are commonly purchased together?
5. Can we build a fast similarity-search mechanism for products?
6. How should these findings translate into business action?

## CRISP-DM map

| Phase | Project output |
|---|---|
| 1. Business Understanding | Problem framing, stakeholders, assumptions, success criteria |
| 2. Data Understanding | Data dictionary, quality audit, EDA, missingness, distributions |
| 3. Data Preparation | Cancellation handling, missing IDs, invalid quantities/prices, feature engineering |
| 4. Modeling | RFM clustering, Isolation Forest anomaly detection, repeat-purchase classification, Apriori rules, MinHash LSH |
| 5. Evaluation | Cluster quality, anomaly review, classification metrics, rule metrics, LSH retrieval quality |
| 6. Deployment / Synthesis | Segment playbook, model governance, monitoring, limitations, next actions |

## Learning objectives

You will practice:
- translating a vague business request into measurable analytical objectives;
- distinguishing cleaning from feature engineering;
- avoiding leakage with temporal validation;
- choosing and interpreting clustering variables;
- separating statistical outliers from business anomalies;
- evaluating classification beyond accuracy;
- understanding support, confidence, lift, and conviction;
- understanding MinHash and LSH as approximate sub-linear search;
- turning multiple models into one coherent business recommendation.

## Quick start

```bash
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

pip install -r requirements.txt
python -m src.download_data
```

Extract `data/raw/online_retail.zip`. Then place `Online Retail.xlsx` under `data/raw/` and launch:

```bash
jupyter notebook notebooks/01_crisp_dm_masterclass.ipynb
```

The notebook is designed to be read and executed top-to-bottom. Markdown sections contain quizzes, reasoning checkpoints, methodology explanations, and reflection questions.

## Important methodological choices

### Cancellation policy
Invoices beginning with `C` are treated as cancellations. They remain in the raw audit trail but are excluded from the positive-sales analytical dataset unless an exercise explicitly studies cancellations.

### Customer-level modeling
RFM and supervised learning operate at customer level. This avoids the common mistake of clustering transaction rows and calling the result "customer segmentation."

### Temporal supervised learning
The repeat-purchase classifier uses a time-based cutoff. Features are calculated using transactions before the cutoff; the target is whether the customer purchases during the following prediction window.

### Association mining
Baskets are constructed from invoice-product pairs. Rules describe co-purchase patterns, not causal effects.

### LSH
MinHash signatures are built over product-description shingles. LSH retrieves approximate candidate neighbors. It is a retrieval-acceleration technique, not a guarantee of exact nearest neighbors.

## Final learning outcome

You should be able to explain not only *what model was run*, but:

> **Why this business question required this data representation, why the algorithm was appropriate, how it was evaluated, what its limitations are, and what decision it enables.**
