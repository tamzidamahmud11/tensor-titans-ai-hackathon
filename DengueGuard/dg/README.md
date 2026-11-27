# 🦟 Dengue Guard

**Ward-level dengue early-warning dashboard for Bangladesh city corporations.**  
Predicts outbreak risk 2–4 weeks ahead using weather lags, ward vulnerability, and gradient-boosted tree models. Everything runs fully offline in your browser — no server, no Python, no internet required after the first load. (Only the optional help chatbot needs a free API key and internet.)

---

## Quick Start (≤ 3 minutes)

### Option A — Open directly (no install needed; the landing page links to the dashboard)

```
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### Option B — Local static server with Node.js

**Prerequisites:** Node.js ≥ 18 (https://nodejs.org)

```bash
# 1. Get the code and enter the project folder (the folder that contains package.json)
git clone <your-repo-url> dengue-guard
cd dengue-guard
#    (or unzip the submission zip and cd into the extracted folder)

# 2. Start the server (no npm install needed — zero dependencies)
npm start

# 3. Open your browser at
#    http://localhost:8080
```

The server opens the browser automatically on Windows / macOS / Linux.

> ⚠️ **No `npm install` is required.** The app has zero runtime dependencies — `package.json` only defines the `start` script.

---

## Optional: enable the AI help chatbot

The dashboard runs without any key (the chatbot then answers from its built-in FAQ and guided tour). To enable the Gemini-powered answers use Option B (needs Node.js >= 18):

```bash
cp .env.example .env        # Windows: copy .env.example .env
# edit .env (in the project root, next to package.json) and paste a free key from https://aistudio.google.com/apikey
npm start
```
`.env` is git-ignored; never commit it.

---

## What It Does

| Feature | Detail |
|---|---|
| **Multi-week weather lag pipeline** | Rainfall lags 0–7 weeks, temperature & humidity lags, 2/4/8-week rolling sums |
| **ML risk prediction engine** | Poisson gradient-boosted trees (+10%/90% quantile bands); 3 direct-horizon models (+2w/+3w/+4w) |
| **Risk tiers** | Low / Medium / High / Critical — calibrated on 2023 validation data |
| **Interactive dashboard** | 5 tabs: Risk board, Ward deep-dive, What-if scenarios, Model validation, How it works |
| **Ward coverage** | 60 wards across Dhaka North/South (DNCC/DSCC), Chattogram (CCC), Gazipur (GCC), Narayanganj (NCC) |
| **Dataset** | 31,320 ward-weeks, 2016–2025 |
| **Weather drivers** | Temperature range (max/min) + humidity chart, and a rain-to-cases delay chart for high vs low water-logging wards (Ward deep-dive tab) |
| **Response planner** | Enter how many spraying teams are available; the app assigns them to the highest expected-case wards and shows the share of expected cases covered (Risk board) |
| **Help chatbot** | Floating "Ask for help" button with a guided tour that switches tabs for you, "Open this tab" buttons, built-in FAQ answers (no API call), and Gemini only for other on-topic questions (cached, rate limited). Off-topic questions are refused without an API call |
| **Offline inference** | < 50 ms per full 60-ward forecast in the browser, with no API calls for forecasting |

---

## Project Structure

```
.
├── index.html          # Landing page (static, loads instantly)
├── about.html          # About us
├── cookies.js / cookies.css  # cookie banner and settings (choice saved in the dg_consent cookie)
├── contact.html        # Contact page (mailto form)
├── site.css            # Shared styles for the landing + info pages
├── logo.svg            # Mosquito logo / favicon
├── app.html            # Dashboard app shell (tabs, charts)
├── app.js              # Dashboard UI (tabs, charts, table, download)
├── engine.js           # Feature engineering + GBT tree inference (JS)
├── style.css           # Dark-theme responsive layout
├── server.js           # Zero-dependency Node.js static server + /api/chat route
├── chat-api.js         # Server-side chatbot proxy (key, cache, rate limit, timeout)
├── chat.js             # Chat widget in the browser (tour and FAQ first, API second)
├── .env.example        # Template for the optional Gemini key (copy to .env)
├── package.json        # { "start": "node server.js" }
├── train.py            # Offline training pipeline (Python): lags -> split -> GBT -> export
├── requirements.txt    # Python deps, only needed for train.py
├── README.md           # This file
├── ARCHITECTURE.md     # Data flow diagram, model rationale, validation split
├── data/
│   ├── dataset.js      # Embedded CSV (31,320 rows)
│   ├── model.js        # Serialised gradient-boosted tree models (JSON)
│   └── metrics.js      # Test-set metrics, confusion matrices, monthly actuals
└── lib/
    └── plotly.min.js   # Bundled Plotly.js (offline charts, no CDN)
```

---

## Using Your Own Data

Click **"Use my own weekly data (CSV)"** in the sidebar and upload a CSV with these required columns:

```
date, city, ward_id, population_density_sqkm, water_logging_risk_index,
sanitation_score, avg_temp_c, rainfall_mm, relative_humidity_pct, dengue_cases
```

- Dates must be weekly (any day-of-week), ISO format (`YYYY-MM-DD`)
- At least **8 weeks** of data per ward required (for lag features)
- The same trained model is applied instantly — no retraining

---

## Re-training the model (optional)

The dashboard ships with trained models in `data/model.js`, so you do **not** need Python to run it.
To rebuild the lag features and retrain from scratch:

```bash
pip install -r requirements.txt
python train.py                # ~30 s; writes model.js, metrics.js and dengue_gbt.joblib to ./training_output
python train.py --write-app    # same, and also overwrites data/model.js + data/metrics.js
```

`train.py` builds the per-ward lag features, splits chronologically, trains the mean/low/high models for
+2/+3/+4 weeks, reports test metrics once, and saves both a joblib file (sklearn models) and the JSON tree
export that the browser reads. Without `--write-app` the shipped model is left untouched. The shipped `data/model.js` and `data/metrics.js` come from a `--write-app` run, so the numbers below match the model you are running. A fresh
run can differ slightly (library version, tier-threshold calibration).

---

## Model & Validation

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full data flow diagram, chronological train/validation/test split details, and model selection rationale.

**Chronological split (never shuffled):**

| Split | Period | Purpose |
|---|---|---|
| Train | 2016-01 → 2022-12 | GBT model fitting |
| Validation | 2023 | Early stopping, tier threshold calibration |
| **Test (held-out)** | **2024-01 → 2025-12** | **Final reported metrics — model never saw this** |

**Test-set results (+3-week horizon):**  
MAE 1.02 · RMSE 2.00 · R² 0.732 · Tier accuracy 91.0% · 80% coverage 93.2%

---

## AI Assistants & External APIs Used

In compliance with the hackathon disclosure requirement, the following AI tools were used during development:

| Tool | Usage |
|---|---|
| **Google Gemini / Antigravity** | Code generation assistance, debugging, documentation drafting |
| **Claude (Anthropic)** | Reviewing the submission against the rubric, writing `train.py`, editing README / ARCHITECTURE; helped write the Response planner, the help chatbot (`chat.js`, `chat-api.js`) and the demo-video script |
| **Google Gemini API (free tier, `gemini-3.5-flash-lite`)** | Runtime help chatbot only (answers questions about using the dashboard). Called from the Node server, never the browser. Optional: the app works without a key |
| **scikit-learn** (`HistGradientBoostingRegressor`) | Training the gradient-boosted tree models in Python (offline, pre-training) |
| **Plotly.js** (bundled, `lib/plotly.min.js`) | Client-side interactive charts |

**Runtime AI and API usage:** the forecasting never calls an API. The prediction engine, dataset, and charts run offline in the browser, and no LLM is used to make predictions.  
The only runtime API is the optional help chatbot (Gemini free tier), called from the Node server with the key in a git-ignored `.env`. Built-in answers handle common questions with zero API calls, other on-topic questions are cached, rate limited and token capped, off-topic questions are refused locally, and if there is no key or no network the chatbot falls back to the built-in answers.

---

## Scoring Checklist (Hackathon Submission)

| # | Criterion | Status |
|---|---|---|
| 1 | Reproducible local setup (README + package.json, launches ≤ 3 min) | ✅ |
| 2 | Multi-week weather lag pipeline (rain lags 0–7w, temp/hum lags, sums) | ✅ |
| 3 | Dengue risk prediction engine (ML GBT, dynamic inference, risk tiers; training code in `train.py`) | ✅ |
| 4 | Interactive web dashboard (5-tab UI, driver breakdown, download) | ✅ |
| 5 | ARCHITECTURE.md (data flow diagram, validation split, model rationale) | ✅ |
| 6 | Compute & API cost efficiency (zero API calls for forecasting, serialized models, fast inference; optional chatbot is cached, rate limited and token capped) | ✅ |
| 7 | 3-minute video demo | ⏳ Record & upload |
| 8 | Git history + AI disclosure | ⏳ AI disclosure done above; push to GitHub with commits from every team member |
| Bonus | Ward risk heatmap, confidence intervals, MAE/RMSE validation dashboard | ✅ |

---

## License

For hackathon evaluation purposes only.
