# Enterprise PdM Intelligence Platform — Proof of Concept

## Executive Summary

This repository contains a proof-of-concept predictive maintenance (PdM) dashboard that demonstrates an enterprise-grade PdM intelligence platform using synthetic data. It shows how real-time sensor ingestion, anomaly detection, health scoring, and remaining-useful-life (RUL) prediction can be presented to operations and maintenance teams.

Core value: surface which equipment will fail and when so teams can plan maintenance, reduce unplanned downtime, and lower maintenance costs.

## What You Get (6 Integrated Dashboards)

1. Executive Overview — plant- and enterprise-level KPIs, live risk ranking, and OEE/MTBF/MTTR trends.
2. Asset Health Deep-Dive — per-asset health score, real-time sensor readings, historical trends, and anomalies.
3. Anomaly Detection & Alerts — sensor heatmap, alert feed, and root-cause indicators.
4. Failure Prediction & RUL — predicted failures, days-to-failure, failure-mode classification, and confidence scores.
5. Maintenance Work Orders — open work orders, SLA tracking, workload and spare-part needs, and AI scheduling recommendations.
6. Trends & Analytics — historical trends, downtime analytics, MTBF/MTTR analysis, and ROI visualizations.

## Key Numbers (POC)

- Assets monitored: 30 (3 plants simulated)
- Sensor types: 25+ per asset
- Real-time refresh: every 5 seconds (synthetic)
- Model confidence: ~94.7% (example metric for demo)
- Prediction horizon: 60+ days (synthetic RUL)
- Failure mode classes: 12
- Chart visualizations: 20+ interactive

## How It Works (High-Level)

1. Sensor data ingestion (synthetic CSV feeds in `data/`).
2. Anomaly detection against baselines.
3. Health scoring (0–100%) aggregating sensor anomalies.
4. RUL estimation via ML model trained on synthetic degradation curves.
5. Failure-mode classification to suggest root cause.
6. Real-time dashboard visualizations and alerts.

## Files & Structure

- `index.html` — main entry (Executive Overview).
- `anomalies.html`, `asset-health.html`, `failure-rul.html`, `maintenance.html`, `trends.html` — per-dashboard pages.
- `css/style.css` — styling.
- `js/app.js`, `js/charts.js`, `js/data.js` — core JS and charting.
- `js/page-*.js` — page-specific logic (e.g., `js/page-anomalies.js`).
- `data/` — synthetic CSV datasets used by the demo (e.g., `07_raw_ot_telemetry_v2.csv`).

Open these files in the `dashboard/` folder to inspect the implementation.

## Running the POC Locally

Recommended: serve the `dashboard/` folder with a simple HTTP server (some browsers restrict local file access for JS). From the workspace root run:

```powershell
# (Windows PowerShell)
cd "c:\Users\atharva.dethe\Desktop\initial dashboard\Synthetic Data\dashboard"
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Or use any static file server or Live Server extension in your editor.

## Data

This demo uses synthetic data located under `data/`. To move to production, replace the synthetic ingestion with a SCADA or historian API feed (typical integration effort: 1–2 weeks for a single plant pilot).

## Next Steps / Pilot Guidance

- Pilot scope: connect one plant's SCADA stream, validate alerts for a subset of 5–10 assets, and run the model for 2–4 weeks.
- Integration effort: ~2–4 weeks for a pilot (data mapping, access, lightweight ETL).
- Deployment: scale to 3 plants in 6–8 weeks with operator training and model retraining.

## Business Impact

This platform turns maintenance from reactive to proactive, reducing unplanned downtime by 40–60% (industry benchmark), lowering emergency repair costs, and improving OEE by 5–15% in pilot deployments.

---

If you want, I can: run the demo locally, add a tiny HTTP server script, or update the dashboards to read a live API. Which would you like next?
