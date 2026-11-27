# 🦟 Dengue Protirodh

**Ward-level dengue early-warning dashboard for Bangladesh city corporations.**  
Predicts outbreak risk 2–4 weeks ahead using weather lags, ward vulnerability, and gradient-boosted tree models. Everything runs fully offline in your browser — no server, no Python, no internet required after the first load. (Only the optional help chatbot needs a free API key and internet.)

### 👥 Development Team
- **Tamzida Mahmud** — CSE Student, East Delta University
- **Zafnun Hosney Uddin** — CSE Student, East Delta University
- **Zoya Zubairi Fiza** — CSE Student, East Delta University

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

## Stay in the Know (email sign-up)

The landing page has a *Stay in the Know* email form at `#subscribe` (linked from the **Subscribe** option in the Menu bar). With `npm start`, it posts to `POST /api/subscribe`, which validates the address, requires the consent box, ignores honeypot bots, allows 5 sign-ups per IP per hour and appends `{at, email, token, status}` to `submissions/subscribers.jsonl` (git-ignored, never served over HTTP). The latest line per email wins, and re-subscribing the same address is harmless. Each subscriber has a private random `token`; `GET /api/unsubscribe?t=<token>` marks them `unsubscribed`, so put that link in every email you send. **The app does not send email itself**: export the `active` addresses and use your own mail tool. Without the server (static hosting or `file://`) the form opens the visitor's email app instead.

## Submit your story (moderated)

The **Story submission** page (`story.html`, linked from the Menu bar) has a *Submit your story* form. With `npm start`, submissions are posted to `POST /api/story`, validated (length limits, consent box, honeypot, 3 per hour per IP) and appended to `submissions/pending.jsonl`. **Nothing is published automatically.** To publish a story, copy it from `pending.jsonl` into `submissions/approved.json` as `[{"name": "...", "place": "...", "role": "patient", "story": "..."}]`; it then appears under *Community stories* (`GET /api/stories`). The `submissions/` folder is git-ignored and never served over HTTP. Without the server (static hosting or `file://`) the form opens the visitor's email app instead.

## Phase 2 — Operations command system (onsite final)

Four new dashboard tabs turn the forecast into orders. All of them share one control bar with **Available regional stock (30–100%)**, **Total spraying crews** and **Hospital bed capacity ×**. Everything runs locally, with no network and no LLM.

| Module | Tab | What it does |
|---|---|---|
| 1. Constrained resource allocation | **Supply allocation** | Converts forecast cases into `saline_bags_needed`, `diagnostic_kits_needed`, `hospital_beds_required` and suggested crews. Scarce stock is shared by priority = risk tier × `population_density_sqkm` (weighted water-filling). Wards that cannot be 100% supplied are flagged `DEFICIT` / `CRITICAL DEFICIT`. |
| 2. Hospital overflow routing | **Bed overflow** | Wards over bed capacity send patients to lower-burden wards **in the same city** (Dhaka North, Dhaka South, Chattogram, Gazipur, Narayanganj). Shows a transfer Sankey, transfer orders, net ward deficits, and city utilisation and headroom. |
| 3. Vector-control simulator | **Vector simulator** | Deploys larvicide/fogging crews (auto-optimised or entered by hand), re-runs the GBT models for +2/+3/+4 weeks, and reports cases prevented, beds freed, saline saved and an ROI ranking (cases prevented per crew). |
| 4. Multi-channel dispatch | **Dispatch** | Ward notices as SMS (≤160 chars), WhatsApp text and a printable commissioner brief (HTML → PDF), with CSV/JSON downloads. |
| 5. Offline resilience | sidebar badge, `sw.js`, `npm test` | All engines are local JS. A service worker keeps the deployed site working with Wi-Fi off. `npm test` re-runs every module with networking disabled (2,392 checks). |

```bash
npm test          # offline self-test of allocation, routing, simulator and dispatch math
npm run exports   # regenerate the sample dispatch pack in /exports
# optional: node scripts/generate_exports.js 2025-08-04 3 50 25   (origin week, horizon, stock %, crews)
```

**Sample exports** (`/exports`): `sms_alerts.txt`, `whatsapp_alerts.txt`, `commissioner_brief_*.html` (all cities + one per city), `allocation_plan.csv`, `overflow_transfers.csv`, `dispatch.json`. They were generated for warning week 2025-06-09 (+3 wk), 60% stock and 20 crews.

Design, formulas and assumptions are in [ARCHITECTURE.md §8](ARCHITECTURE.md).

---

## What It Does

| Feature | Detail |
|---|---|
| **Multi-week weather lag pipeline** | Rainfall lags 0–7 weeks, temperature & humidity lags, 2/4/8-week rolling sums |
| **ML risk prediction engine** | Poisson gradient-boosted trees (+10%/90% quantile bands); 3 direct-horizon models (+2w/+3w/+4w) |
| **Risk tiers** | Low / Medium / High / Critical — calibrated on 2023 validation data |
| **Interactive dashboard** | 6 tabs: Risk board, Ward deep-dive, What-if scenarios, Model validation, How it works, Architecture |
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
├── news.html / news.js / news.css  # Dengue news and prevention page
├── blogs.html / blogs.css          # Dengue Insights & Scientific Blog
├── events.html / events.js / events.css  # Community events & action drives
├── community.html / community.js / community.css  # Community hub
├── videos.html         # Educational & report videos
├── webinars.html / webinars.js / webinars.css  # Webinars
├── multimedia.html     # Multimedia gallery & dashboard screenshots
├── story.html          # Story submission page
├── cookies.js / cookies.css  # cookie banner and settings (choice saved in the dg_consent cookie)
├── contact.html        # Contact page (mailto form)
├── site.css            # Shared styles for the landing + info pages
├── logo.svg            # Mosquito logo / favicon
├── hero-banner.jpg, chatbot-avatar.png, media/   # Images and the prevention video used on the site
├── app.html            # Dashboard app shell (tabs, charts)
├── app.js              # Dashboard UI (tabs, charts, table, download)
├── engine.js           # Feature engineering + GBT tree inference (JS)
├── ops.js              # Phase 2: allocation, overflow routing, crew simulator, dispatch templates (pure JS)
├── ops-ui.js / ops.css # Phase 2: Supply allocation, Bed overflow, Vector simulator, Dispatch tabs
├── sw.js               # Service worker: offline cache for the deployed dashboard
├── scripts/            # selftest.js (npm test), generate_exports.js (npm run exports), _load.js
├── exports/            # Sample SMS / WhatsApp / commissioner-brief dispatch pack
├── style.css           # Dark-theme responsive layout
├── server.js           # Zero-dependency Node.js static server + /api/chat route
├── chat-api.js         # Server-side chatbot proxy (key, cache, rate limit, timeout)

├── story-api.js        # "Submit your story" API: validates and stores stories for review (submissions/)

├── story.js            # Story form + approved-stories list on story.html
├── subscribe-api.js    # "Stay in the Know" email sign-up API (submissions/subscribers.jsonl)
├── subscribe.js        # Email sign-up form on index.html#subscribe
├── chat.js             # Chat widget in the browser (tour and FAQ first, API second)
├── .env.example        # Template for the optional Gemini key (copy to .env)
├── package.json        # { "start": "node server.js" }
├── train.py            # Offline training pipeline (Python): lags -> split -> GBT -> export
├── predict.py          # Fast Python inference from the serialized joblib model (CLI)
├── models/
│   └── dengue_gbt.joblib   # Serialized scikit-learn models (3 horizons x mean/10%/90%)
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
python train.py                # under a minute; writes model.js, metrics.js and dengue_gbt.joblib to ./training_output
python train.py --write-app    # same, and also overwrites data/model.js, data/metrics.js + models/dengue_gbt.joblib
```

`train.py` is deterministic (fixed seed): re-running it on the shipped dataset reproduces the shipped metrics exactly. It builds the per-ward lag features, splits chronologically, trains the mean/low/high models for
+2/+3/+4 weeks, reports test metrics once, and saves both a joblib file (sklearn models) and the JSON tree
export that the browser reads. Without `--write-app` the shipped model is left untouched. The shipped `data/model.js` and `data/metrics.js` come from a `--write-app` run, so the numbers below match the model you are running. A fresh
run can differ slightly (library version, tier-threshold calibration).

---

## Fast inference from the serialized model (Python)

`models/dengue_gbt.joblib` is the same trained model the browser runs, saved with joblib. `predict.py` loads it and ranks all 60 wards for a chosen week and window, with no retraining and no API calls:

```bash
python predict.py                          # latest week, +3 week window, top 10 wards
python predict.py --origin 2025-09-01 --horizon 4 --top 15
```

A full 60-ward forecast takes roughly 20 ms in scikit-learn (about 10 ms in the browser), and the two paths give identical forecasts for the same week and window.

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
| **Claude (Anthropic)** | Reviewing the submission against the rubric, writing `train.py`, editing README / ARCHITECTURE; helped write the Response planner, the help chatbot (`chat.js`, `chat-api.js`) and the demo-video script. **Phase 2:** helped write the operations engine and tabs (`ops.js`, `ops-ui.js`, `ops.css`), `sw.js`, `scripts/selftest.js`, `scripts/generate_exports.js` and ARCHITECTURE.md §8 |
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
| 4 | Interactive web dashboard (6-tab UI, driver breakdown, heatmap, download) | ✅ |
| 5 | ARCHITECTURE.md (data flow diagram, validation split, model rationale) | ✅ |
| 6 | Compute & API cost efficiency (zero API calls for forecasting, serialized joblib + JSON models, fast inference; optional chatbot is cached, rate limited and token capped) | ✅ |
| 7 | 3-minute uncut video demo (live localhost, voiceover, no slides) | ⏳ Record & add the link here |
| 8 | Git history + AI disclosure | ⏳ AI disclosure done above; push to GitHub with commits from every team member |
| P2-1 | Constrained resource allocation + scarcity sliders + deficit alerts | ✅ |
| P2-2 | Intra-city hospital overflow routing | ✅ |
| P2-3 | Vector-control what-if simulator (GBT counterfactual, ROI ranking) | ✅ |
| P2-4 | SMS / WhatsApp / printable brief dispatch + `/exports` | ✅ |
| P2-5 | Offline resilience (`npm test` with networking disabled, service worker) | ✅ |
| Bonus | Ward risk heatmap, confidence intervals, MAE/RMSE validation dashboard | ✅ |

---

## License

For hackathon evaluation purposes only.
