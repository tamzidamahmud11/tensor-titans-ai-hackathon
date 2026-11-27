# ARCHITECTURE.md — Dengue Guard

**Ward-level dengue early-warning & public-health action ecosystem for Bangladesh city corporations.**  
Dengue Guard forecasts expected weekly cases per ward **2–4 weeks ahead** from lagged weather, recent cases and ward vulnerability, then maps forecasts into calibrated risk tiers (Low / Medium / High / Critical) to deploy boots-on-the-ground interventions (cleanup drives, health camps, webinars, community discussions).

The architecture comprises three synchronized layers:
1. **Offline Training Pipeline** (Python / scikit-learn, zero runtime footprint)
2. **In-Browser Edge Prediction Engine** (Pure JavaScript tree evaluator, <50ms inference, privacy-first)
3. **Public-Health Action & Community Platform** (Bilingual English/Bengali UI, Dark/Light mode, Events, Webinars, Blogs, Peer Discussions)

---

## 1. End-to-End System Architecture

```
 ┌──────────────────────────────────────────────┐
 │ OFFLINE ML TRAINING (Python / scikit-learn)  │
 │ 31,320 records (60 wards, 2016–2025)         │
 └──────────────────────┬───────────────────────┘
                        │ Exports compact JSON models & validation metrics
                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ IN-BROWSER APPLICATION LAYER (Vanilla JS / Web Standards / Zero Server Load)│
 │                                                                             │
 │  ┌──────────────────────┐  ┌───────────────────────┐  ┌──────────────────┐  │
 │  │ Data & Feature Engine│  │ Gradient-Boosted Trees│  │ Action & Society │  │
 │  │ • Weather lags (0-7w)│  │ • 9 Tree Ensembles    │  │ • Events & RSVPs │  │
 │  │ • Rolling 2/4/8w sums│──► • Poisson Expected Val │──► • Webinars & Q&A │  │
 │  │ • Ward Vulnerability │  │ • 10%/90% Pinball Loss│  │ • Community Hub │  │
 │  │ • Case Trend Lags    │  │ • Dynamic Scenarios   │  │ • Research Blogs │  │
 │  └──────────────────────┘  └───────────────────────┘  └──────────────────┘  │
 │                                                                             │
 │  ┌───────────────────────────────────────────────────────────────────────┐  │
 │  │ PRESENTATION & ACCESSIBILITY CONTROLS                                 │  │
 │  │ • Dark/Light Mode Theme Switcher [data-theme]                         │  │
 │  │ • Bilingual English / Bengali (বাংলা) Localization Engine             │  │
 │  │ • Responsive Public-Health GIS Maps & Heatmaps                        │  │
 │  └───────────────────────────────────────────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Feature Engineering

All features are engineered strictly per `ward_id` using only data available prior to the origin warning week:

| Group | Features | Epidemiological Rationale |
|---|---|---|
| **Rainfall Lags** | `rain_lag0w … rain_lag7w`, rolling sums over 2, 4, and 8 weeks | Captures 7–14 day Aedes aegypti breeding cycle from egg to biting adult. |
| **Temperature & Humidity** | 0, 2, 4 week lags and 4-week mean for `avg_temp_c` and `relative_humidity_pct` | Regulates mosquito metabolic rates and extrinsic viral incubation period (EIP). |
| **Case Trajectory** | Preceding 4-week case counts, 4-week mean, trend slope | Identifies viral amplification momentum already established in the human reservoir. |
| **Ward Vulnerability** | `population_density_sqkm`, `water_logging_risk_index`, `sanitation_score` | Reflects urban breeding microhabitats, drain blockages, and transmission density. |
| **Seasonal Cyclicity** | Target week's day of year mapped through sine and cosine components | Encodes macro monsoon and post-monsoon seasonal curves. |

## 3. Chronological Validation Split

```
2016-01 ─────────────── 2022-12 │  2023  │ 2024-01 ────── 2025-12
        TRAIN                   │  VAL   │       TEST (held out)
```

Data is partitioned strictly by **target calendar date**:
- **Train (2016–2022):** Initial model convergence.
- **Validation (2023):** Calibration of risk tier boundaries and hyperparameter tuning.
- **Test (2024–2025):** 100% held-out evaluation — simulated real-world deployment.

| Horizon | MAE | RMSE | R² | Risk-Tier Accuracy | 80% Prediction Band Coverage |
|---|---|---|---|---|---|
| **+2 weeks** | 1.004 | 2.016 | 0.727 | 91.0% | 93.5% |
| **+3 weeks** | 1.024 | 2.001 | 0.732 | 91.0% | 93.2% |
| **+4 weeks** | 1.230 | 2.410 | 0.610 | 90.1% | 94.1% |

## 4. Model Selection Rationale

- **Histogram Gradient-Boosted Trees (scikit-learn):** Excels on non-linear tabular interactions between rain lags and localized drainage, requires zero feature scaling, and exports into compact, portable JSON arrays.
- **Poisson Loss Deviance:** Specifically models discrete, non-negative, over-dispersed weekly case numbers.
- **Quantile Pinball Loss (10% and 90%):** Generates robust, distribution-free 80% uncertainty bands so public-health planners can view both conservative and worst-case scenarios.
- **Direct Multi-Horizon Modeling:** Separate models for +2w, +3w, and +4w avoid iterative auto-regressive error compounding.

## 5. Client-Side Edge Architecture & Action Ecosystem

- **Zero-Latency In-Browser Inference:** Forecasts execute in client memory (<50ms for all 60 wards) via `engine.js`.
- **Complete Offline Capability:** Operates reliably in peripheral clinics and field camps without cloud dependency or server downtime.
- **Community Action Integration:** Links predictive early warning directly to municipal cleanups, fever camps, educational webinars, and neighborhood reporting.
- **Universal Accessibility:** Built-in Dark/Light theme toggle and dual English / Bengali language localization.
| Direct +2 / +3 / +4 week models | Avoids error compounding from recursive forecasting. |
| Tiers from calibrated thresholds | Cut-offs come from the validation distribution, not arbitrary constants. |
| Interpretability | Driver breakdown = how much the forecast changes when a feature group (rainfall, temperature, humidity, case trend, vulnerability, season) is set to its baseline. |

**joblib and JSON.** The scikit-learn models are serialized to `models/dengue_gbt.joblib` (loaded by `predict.py`, about 20 ms for all 60 wards). The same trees are exported to JSON so the browser can run inference directly and a health office needs no Python, server or hosting. Both paths give identical forecasts.

## 5. Compute and API cost controls

- **Zero API calls for forecasting, and no LLM in the prediction pipeline.** No tokens, no per-request cost; the app works offline after the first load. The only runtime API is the optional help chatbot (section 5b).
- **No server compute.** `server.js` is an optional static file server; opening `index.html` also works. It can be hosted on any static host.
- **Serialized models, fast inference.** 9 tree models (3 horizons × mean/low/high), saved as joblib (1.2 MB) and as JSON for the browser (1.4 MB, cached). The risk board evaluates only the 3 models for the selected horizon. A 60-ward forecast took about 8 ms when measured in Node 22 (one horizon); the UI target is under 50 ms.
- **Work done once.** The dataset is parsed and the per-ward arrays are built once at page load; each interaction only re-runs tree inference.
- **Cheap rendering.** Charts update with `Plotly.react`, which diffs traces instead of rebuilding them.
- **Training cost is paid once, offline** (under a minute on a laptop CPU for all 9 models plus metrics).

## 5b. Email sign-up (optional runtime API)

`subscribe.js` (every public page) → `POST /api/subscribe` → `subscribe-api.js` validates the address, requires consent, drops honeypot hits, rate-limits (5 per IP per hour) and appends to `submissions/subscribers.jsonl` (private, git-ignored, blocked from static serving). Unsubscribe is `GET /api/unsubscribe?t=<token>` with a per-subscriber random token. Responses are identical for new and existing addresses. No database, no third party, and no sending: mailing is done outside the app. Static hosting falls back to a `mailto:` message.

## 5a. Story submissions (optional runtime API)

`story.js` (videos.html) → `POST /api/story` → `story-api.js` validates, sanitises and appends to `submissions/pending.jsonl` (private, git-ignored, blocked from static serving). A person approves by copying entries to `submissions/approved.json`, which `GET /api/stories` serves; the browser renders them with `textContent`. No database, no third party, no automatic publishing. Static hosting falls back to a `mailto:` message.

## 5b. Help chatbot (optional runtime API)

Flow: `chat.js` answers the guided tour and built-in FAQ locally (zero API calls); only other on-topic questions go to `POST /api/chat` → `chat-api.js` → Gemini (free tier). Cost controls: key kept server-side in a git-ignored `.env`; identical questions served from an in-memory cache (200 entries, 6 h); off-topic questions refused locally by a keyword filter; question capped at 300 characters, dashboard context at about 400, answer at 250 output tokens; 8 requests per minute per IP; 8 s timeout with fallback to the built-in answers. The forecasting itself still makes zero API calls.

---

## 7. Dashboard Architecture & How It Works (`app.html` / `app.js` / `engine.js`)

The interactive dashboard (`app.html`) runs **100% client-side** in the browser with zero backend dependencies:

1. **Data Layer (`data/dataset.js`, `data/model.js`, `data/metrics.js`)**:
   - Ships with 31,320 historical weekly ward records (60 wards across 5 city corporations) and pre-trained gradient-boosted tree ensembles.
   - Supports custom user CSV uploads parsed entirely in browser memory (`FileReader`).
2. **Inference Engine (`engine.js`)**:
   - Computes 0–7 week rainfall lags, rolling 2/4/8-week sums, temperature/humidity deltas, and ward vulnerability features.
   - Evaluates 9 tree ensembles (expected counts + 10%/90% quantile bounds) in `<50ms`.
3. **Interactive Views (`app.js` + `lib/plotly.min.js`)**:
   - **Risk Board**: Ranked ward triage table, response planner (team allocation), and risk map.
   - **Ward Deep-Dive**: Historical trends, rainfall correlation curves, and factor breakdowns.
   - **What-If Scenarios**: Real-time sliders for rainfall multipliers, temperature, and humidity shifts.
   - **Model Validation**: Chronological held-out 2024–2025 metrics (R², MAE, 80% coverage).
4. **Full-Site Bilingual Localization (`i18n-bn.js` + `theme-lang.js`)**:
   - Translates all static and dynamically rendered UI text across all pages (including `app.html`) between English and Bengali (`বাংলা`) via `DG_EN_TO_BN`, `WeakMap` original-text restoration, and a `MutationObserver`.
5. **Guided Video Tutorial with Voiceover (`index.html#how`)**:
   - Embeds `media/dengue-prevention.mp4` with optional Web Speech API (`speechSynthesis`) narration in English or Bengali.
