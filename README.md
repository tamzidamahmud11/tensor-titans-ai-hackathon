<<<<<<< HEAD
# 🦟 Dengue Guard

**AI-Powered Ward-Level Dengue Early Warning System for Bangladesh**

Dengue Guard is an intelligent early-warning dashboard designed to predict dengue outbreak risks across different wards of Bangladesh. It uses historical dengue cases, weather patterns, and ward-level vulnerability indicators to forecast potential outbreaks **2–4 weeks in advance**.

The platform helps public health authorities identify high-risk wards, understand outbreak drivers, and prioritize mosquito-control resources before cases increase.

---

## 👥 Team Members

| Name | Student ID |
|---|---|
| Tamzida Mahmud | 242014912 |
| Zafnun Hosney Uddin | 242010912 |
| Zoya Zubairi Fiza | 242011712 |

---

## 🎯 Project Objectives

- Predict dengue outbreak risks 2–4 weeks ahead.
- Identify high-risk wards across Bangladesh.
- Analyze rainfall, temperature, and humidity patterns.
- Understand the relationship between weather conditions and dengue outbreaks.
- Help public health authorities prioritize mosquito-control activities.
- Support data-driven decisions through interactive visualizations.

## ✨ Key Features

### 1. AI-Powered Dengue Risk Prediction

- Machine learning-based gradient-boosted tree models.
- Predicts dengue cases for 2, 3, and 4 weeks ahead.
- Classifies wards into four risk categories:
  - 🟢 Low
  - 🟡 Medium
  - 🟠 High
  - 🔴 Critical

### 2. Multi-Week Weather Analysis

- Rainfall lag analysis (0–7 weeks).
- Temperature and humidity analysis.
- Rolling rainfall calculations (2, 4, and 8 weeks).
- Identifies delayed relationships between rainfall and dengue outbreaks.

### 3. Interactive Risk Dashboard

- Ward-level dengue risk overview.
- Ranked ward predictions.
- Interactive risk heatmap and treemap.
- City corporation filtering.
- Downloadable forecast reports in CSV format.

### 4. Ward Deep-Dive Analysis

- Detailed prediction for individual wards.
- Weather driver analysis.
- Expected dengue cases.
- Forecast confidence intervals.
- Historical trend visualization.

### 5. What-If Scenario Analysis

- Adjust rainfall conditions.
- Modify temperature and humidity.
- Observe how different weather scenarios affect predicted dengue risks.

### 6. Response Planner

- Enter the number of available mosquito-control teams.
- Prioritize wards based on expected dengue cases.
- Estimate the proportion of expected cases covered by the selected teams.

### 7. Model Validation

- Chronological training, validation, and testing.
- MAE, RMSE, and R² evaluation.
- Risk-tier accuracy.
- Forecast interval coverage.

### 8. AI Help Chatbot

- Interactive dashboard assistance.
- Built-in FAQ and guided tour.
- Optional Google Gemini API integration.
- API caching and rate limiting.

---

## 🏙️ Geographic Coverage

Dengue Guard currently covers 60 wards across five city corporations:

| City Corporation | Abbreviation |
|---|---|
| Dhaka North City Corporation | DNCC |
| Dhaka South City Corporation | DSCC |
| Chattogram City Corporation | CCC |
| Gazipur City Corporation | GCC |
| Narayanganj City Corporation | NCC |

## 📊 Dataset

The project uses weekly ward-level historical data covering **2016–2025**.

- Total records: 31,320 ward-weeks.
- Number of wards: 60.
- Weather indicators:
  - Average temperature.
  - Rainfall.
  - Relative humidity.
- Ward vulnerability indicators:
  - Population density.
  - Water-logging risk index.
  - Sanitation score.
- Historical dengue case counts.

## 🧠 Machine Learning Approach

Dengue Guard uses **Histogram Gradient Boosting Regressor** models with Poisson loss for expected dengue case prediction.

The prediction pipeline includes:

1. Historical weather data processing.
2. Ward-wise feature engineering.
3. Multi-week rainfall lag calculations.
4. Temperature and humidity lag calculations.
5. Recent dengue case trend analysis.
6. Ward vulnerability analysis.
7. Direct forecasting for 2, 3, and 4-week horizons.
8. Risk classification using calibrated thresholds.

### Model Validation

The dataset is divided chronologically to prevent future-data leakage.

| Dataset | Period | Purpose |
|---|---|---|
| Training | 2016–2022 | Model training |
| Validation | 2023 | Model selection and risk calibration |
| Testing | 2024–2025 | Final evaluation |

**Reported +3-week test performance:**

- MAE: 1.02
- RMSE: 2.00
- R²: 0.732
- Risk-tier accuracy: 91.0%
- 80% prediction interval coverage: 93.2%

These are the project's reported evaluation results.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Webpage structure |
| CSS3 | Responsive interface |
| JavaScript | Frontend functionality |
| Plotly.js | Interactive charts and visualizations |
| Python | Model training and data processing |
| Scikit-learn | Machine learning |
| NumPy & Pandas | Data processing |
| Joblib | Model serialization |
| Node.js | Optional local server |
| Google Gemini API | Optional chatbot assistance |

## 📁 Project Structure

```text
DengueGuard/
│
├── index.html
├── app.html
├── about.html
├── contact.html
│
├── app.js
├── engine.js
├── server.js
│
├── chat.js
├── chat-api.js
├── chat.css
│
├── style.css
├── site.css
├── cookies.css
├── cookies.js
│
├── logo.svg
├── hero-banner.jpg
├── chatbot-avatar.png
│
├── data/
│   ├── dataset.js
│   ├── model.js
│   └── metrics.js
│
├── lib/
│   └── plotly.min.js
│
├── media/
│   ├── dengue-prevention-poster.jpg
│   └── dengue-prevention.mp4
│
├── train.py
├── requirements.txt
├── package.json
├── package-lock.json
│
├── ARCHITECTURE.md
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18 or later (optional, for the local server).
- Modern web browser.
- Git (optional).

### Step 1: Clone the Repository

```bash
git clone <your-github-repository-url>
```

### Step 2: Navigate to the Project Folder

```bash
cd DengueGuard/dg
```

If your repository contains the project files directly, simply enter that project directory.

### Step 3: Run the Application

**Option A: Open directly**

Open `index.html` in your web browser.

**Option B: Run using Node.js**

```bash
npm start
```

### Step 4: Open the Dashboard

Visit:

```text
http://localhost:8080
```

No `npm install` is required because the application has no external Node.js runtime dependencies.

---

## 🐍 Optional: Model Retraining

The application already includes trained models. Python is not required for normal dashboard operation.

To retrain the models:

```bash
pip install -r requirements.txt
```

Run:

```bash
python train.py
```

To update the application's exported model and metrics:

```bash
python train.py --write-app
```

---

## 🔐 API & Performance Optimization

Dengue Guard is designed to minimize computational and API costs.

- Forecasting runs entirely in the browser.
- No external API calls are required for predictions.
- Pre-trained models are stored as JSON.
- Historical data is processed once during initialization.
- Chart updates use Plotly's efficient rendering.
- The optional chatbot uses caching and rate limiting.
- API keys are stored on the server rather than exposed in browser code.

The optional chatbot requires Node.js, internet access, and a Gemini API key. Without the key, built-in FAQ responses remain available.

### Chatbot API Configuration

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Never upload your `.env` file or expose your API key publicly.

---

## 🌱 Future Improvements

- Integration with real-time weather APIs.
- Live dengue case data integration.
- Expansion to more city corporations and wards.
- Advanced ward-level outbreak forecasting.
- Improved prediction confidence and explainability.
- Integration with public health monitoring systems.
- Automated mosquito-control resource allocation.
- Mobile-friendly public health reporting.

---

## 🏆 Hackathon Submission

**Challenge:** AI for Urban Dengue Outbreak

**Hackathon:** EDU AI Engineering Hackathon 2026

**Project:** Dengue Guard

**Team:** Tensor Titans

**Goal:** Build an intelligent, data-driven dengue early-warning system that helps public health authorities identify vulnerable wards and respond before outbreaks peak.

---

## 🤖 AI Assistants & External APIs Disclosure

### AI Assistants Used

- Google Gemini / Antigravity
- Claude (Anthropic)

### External APIs

- Google Gemini API (optional chatbot assistance).

### Other Development Technologies

- Scikit-learn
- Plotly.js
- NumPy
- Pandas

AI assistants were used for development assistance, debugging, code review, and documentation.

---

## 📄 License

For hackathon evaluation and demonstration purposes only.

---

**Dengue Guard — Predict Early. Prepare Better. Protect Communities.** 🦟

**Developed with dedication by Team Tensor Titans.**
=======
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
| 4 | Interactive web dashboard (6-tab UI, driver breakdown, heatmap, download) | ✅ |
| 5 | ARCHITECTURE.md (data flow diagram, validation split, model rationale) | ✅ |
| 6 | Compute & API cost efficiency (zero API calls for forecasting, serialized joblib + JSON models, fast inference; optional chatbot is cached, rate limited and token capped) | ✅ |
| 7 | 3-minute uncut video demo (live localhost, voiceover, no slides) | ⏳ Record & add the link here |
| 8 | Git history + AI disclosure | ⏳ AI disclosure done above; push to GitHub with commits from every team member |
| Bonus | Ward risk heatmap, confidence intervals, MAE/RMSE validation dashboard | ✅ |

---

## License

For hackathon evaluation purposes only.
>>>>>>> e90b875 (update commit)
