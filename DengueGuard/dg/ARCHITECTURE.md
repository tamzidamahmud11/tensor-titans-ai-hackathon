# ARCHITECTURE.md — Dengue Guard

Ward-level dengue early-warning for Bangladesh city corporations. It forecasts expected weekly cases per ward **2–4 weeks ahead** from lagged weather, recent cases and ward vulnerability, then maps the forecast to a risk tier (Low / Medium / High / Critical).

The system has two parts: an **offline training pipeline** (Python, run once) and an **in-browser inference app** (JavaScript, no API for forecasting). An optional help chatbot is the only runtime API (section 5b).

## 1. Data flow

```
 OFFLINE TRAINING (train.py, run once)                      BROWSER (runs on every visit, no network)
 ─────────────────────────────────────                      ─────────────────────────────────────────
 weekly ward dataset (31,320 rows, 60 wards)                 data/dataset.js ──► engine.js
        │                                                         │   parse once, build per-ward arrays
        ▼                                                         ▼
 per-ward lag features (grouped by ward_id)                  originFeatures(): same lag features
  rain lag 0–7w, 2/4/8w sums, temp/hum lags,                      │
  case trend, vulnerability, season of target week                ▼
        │                                                   data/model.js ──► tree inference (JS)
        ▼                                                    mean + 10% + 90% model for chosen horizon
 chronological split (by target date)                             │
  train ≤2022 │ val 2023 │ test 2024–25                           ▼
        │                                                   tier = thresholds(expected cases)
        ▼                                                         │
 3 horizons × 3 models (HistGradientBoosting)                     ▼
        │                                                   app.js: risk board, ward deep-dive,
        ├─► model.js   (JSON trees → browser)                what-if sliders, validation, CSV export
        ├─► metrics.js (test scores → Validation tab)
        └─► dengue_gbt.joblib (sklearn models)
```

## 2. Features (all computed per `ward_id`, using only data up to the origin week)

| Group | Features |
|---|---|
| Rainfall lags | `rain_lag0w … rain_lag7w`, rolling sums over 2 / 4 / 8 weeks and weeks 4–7 |
| Temperature, humidity | lag 0 / 2 / 4 weeks and 4-week mean for `avg_temp_c`, `relative_humidity_pct` |
| Recent cases | last 4 weeks, 4-week mean, trend |
| Ward vulnerability | `population_density_sqkm`, `water_logging_risk_index`, `sanitation_score`, combined index |
| Seasonality | sin/cos of the target week's day of year |

The 0–7 week rainfall lags cover the 7–14 day mosquito breeding cycle plus viral incubation, so the 2–4 week gap between rain and hospital cases is learned from data rather than hard-coded. Because each ward is grouped on its own, one ward's weather never leaks into another's lags.

## 3. Chronological validation split

```
2016-01 ─────────────── 2022-12 │  2023  │ 2024-01 ────── 2025-12
        TRAIN                   │  VAL   │       TEST (held out)
```

The split is by **target date** and is never shuffled. Random k-fold would let future weeks leak into training and inflate scores; a chronological split matches deployment, where the model only knows the past.

1. Fit on TRAIN; use VAL to choose the number of trees (and to calibrate tier cut-offs from validation-year case counts).
2. Refit on TRAIN + VAL with that setting.
3. Score **once** on TEST. These are the numbers the dashboard and README report.

| Horizon | MAE | RMSE | R² | Tier accuracy | 80% interval coverage |
|---|---|---|---|---|---|
| +2 weeks | 1.004 | 2.016 | 0.727 | 91.0% | 93.5% |
| +3 weeks | 1.024 | 2.001 | 0.732 | 91.0% | 93.2% |
| +4 weeks | 1.230 | 2.410 | 0.610 | 90.1% | 94.1% |

The model beats a persistence baseline and a seasonal ward-month average at every horizon, and a no-weather ablation (see the Validation tab), so the weather lags add real signal.

## 4. Model selection rationale

| Choice | Why |
|---|---|
| Histogram gradient-boosted trees (scikit-learn) | Strong on tabular lag features, needs no scaling, trains in seconds, and the trees export to plain JSON. |
| Poisson loss for the expected value | Weekly cases are non-negative, skewed counts. |
| 10% / 90% quantile models | Give an 80% range per ward without assuming a distribution. |
| Direct +2 / +3 / +4 week models | Avoids error compounding from recursive forecasting. |
| Tiers from calibrated thresholds | Cut-offs come from the validation distribution, not arbitrary constants. |
| Interpretability | Driver breakdown = how much the forecast changes when a feature group (rainfall, temperature, humidity, case trend, vulnerability, season) is set to its baseline. |

**Why JSON trees instead of only joblib/pickle?** joblib is saved too (`dengue_gbt.joblib`), but a pickle can only be loaded by Python. Exporting the trees to JSON lets the browser run inference directly, so a health office needs no Python, server or hosting. Inference is plain tree traversal.

## 5. Compute and API cost controls

- **Zero API calls for forecasting, and no LLM in the prediction pipeline.** No tokens, no per-request cost; the app works offline after the first load. The only runtime API is the optional help chatbot (section 5b).
- **No server compute.** `server.js` is an optional static file server; opening `index.html` also works. It can be hosted on any static host.
- **Serialized models, fast inference.** 9 tree models (3 horizons × mean/low/high), about 3 MB, cached by the browser. The risk board evaluates only the 3 models for the selected horizon. A 60-ward forecast took about 8 ms when measured in Node 22 (one horizon); the UI target is under 50 ms.
- **Work done once.** The dataset is parsed and the per-ward arrays are built once at page load; each interaction only re-runs tree inference.
- **Cheap rendering.** Charts update with `Plotly.react`, which diffs traces instead of rebuilding them.
- **Training cost is paid once, offline** (~30 s on a laptop CPU for all 9 models plus metrics).

## 5b. Help chatbot (optional runtime API)

The guided tour and the "Open this tab" buttons are plain browser code that clicks the tab buttons, so navigation help costs zero API calls. The chat also sends a one-line summary of the current dashboard state (city, week, window, tier counts) so AI answers match what the user sees.

Flow: browser `chat.js` -> (1) tour / built-in FAQ match, answered locally with no network -> (2) otherwise `POST /api/chat` on `server.js` -> `chat-api.js` -> Gemini API (free tier) -> answer back to the browser.

| Control | How |
|---|---|
| Key safety | The key is read from `.env` on the server; the browser never sees it; `.env` is git-ignored |
| Fewer API calls | Built-in FAQ and tour answer common questions locally; identical questions are served from an in-memory cache (200 entries, 6 h) |
| Scope guard | Two layers: (1) a keyword filter on the server refuses clearly off-topic questions with no API call; (2) the system prompt restricts answers to the dashboard, its data/model and general dengue prevention |
| Token budget | Question capped at 300 characters, dashboard context at about 400 characters, answer capped at 250 output tokens, short system prompt |
| Rate limits | 8 requests per minute per IP on our side, so the free quota is not used up by one visitor |
| Resilience | 8 s timeout; on any failure (no key, HTTP 429, network error, empty answer) the chat shows an offline message and the dashboard is unaffected |
| Safety | The system prompt forbids medical advice and inventing numbers |

The forecasting itself still makes zero API calls.

## 6. Files

`train.py` (training, see README), `engine.js` (features + inference), `app.js` / `app.html` (dashboard), `index.html` (landing page), `data/` (dataset, `model.js`, `metrics.js`), `lib/plotly.min.js` (bundled charts).
