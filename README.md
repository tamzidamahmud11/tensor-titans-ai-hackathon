# 🦟 Dengue Protirodh

**An AI-powered, ward-level dengue early-warning and public-health operations platform for Bangladesh.**

Dengue Protirodh forecasts dengue cases **2–4 weeks ahead** across 60 urban wards, translates forecasts into practical resource plans, simulates vector-control interventions, and prepares ward-specific dispatch notices for public-health teams.


---

## 👥 Team TensorTitans

| Name | Role | Student ID |
|---|---|---|
| **Tamzida Mahmud** | Team Leader | `242014912` |
| **Zafnun Hosney Uddin** | Member 2 | `242010912` |
| **Zoya Zubairi Fiza** | Member 3 | `242011712` |

---

## 🎯 Project Overview

Dengue Protirodh is designed to help ward commissioners and health-centre managers make earlier, data-informed decisions. Instead of only showing predicted dengue risk, the platform connects forecasts to operational actions: supply allocation, hospital-bed planning, spraying-team deployment, and public-health dispatch.

The project covers **60 wards** across five city corporations:

- Dhaka North
- Dhaka South
- Chattogram
- Gazipur
- Narayanganj

The bundled historical dataset contains **31,320 ward-week records** spanning 2016–2025.

## ✨ Key Features

### 1. Dengue Forecasting & Risk Dashboard
- Forecasts expected weekly dengue cases **2, 3, and 4 weeks ahead**.
- Uses weather history, recent case trends, and ward vulnerability indicators.
- Classifies wards into **Low, Medium, High, and Critical** risk tiers.
- Includes a ranked risk board, ward-level detail, charts, and risk visualizations.

### 2. Constrained Resource Allocation
- Converts predicted cases into estimated requirements for:
  - `saline_bags_needed`
  - `diagnostic_kits_needed`
  - `hospital_beds_required`
- Allocates limited regional stock across wards.
- Provides controls for available stock (**30%–100%**) and spraying-team availability.
- Prioritizes wards using risk and population density.
- Flags wards with supply shortages using deficit warnings.

### 3. Hospital Surge & Cross-Ward Overflow Routing
- Identifies wards where projected bed demand exceeds local capacity.
- Routes overflow patients to lower-burden wards **within the same city**.
- Displays ward-level deficits, transfer information, city-wide bed utilization, and remaining capacity.

### 4. What-If Vector-Control Simulator
- Simulates larvicide/fogging crew deployment to selected wards.
- Re-evaluates forecasts for the +2, +3, and +4 week horizons.
- Estimates changes in projected cases, hospital-bed demand, and saline requirements.
- Ranks interventions by estimated return on investment (cases prevented per crew).

### 5. Multi-Channel Dispatch
Creates operational notices for public-health response teams:
- **SMS** alerts (designed for a 160-character limit)
- **WhatsApp** dispatch messages
- **Printable commissioner briefs** in HTML, suitable for printing or saving as PDF
- Downloadable CSV and JSON outputs

### 6. Offline-First Operation
- Forecasting and Phase 2 operations run locally in JavaScript.
- Core prediction and operational calculations do not require an external AI API.
- A service worker supports offline use after the site has been loaded and cached.
- Includes an offline self-test for key operational calculations.

### 7. Public Awareness & Community Features
The wider website also includes:
- Dengue prevention and awareness information
- News and educational content
- Blogs and multimedia resources
- Community activities and events
- Webinars
- Community story submission
- Optional email subscription
- English and Bengali interface support
- Dark and light themes

---

## 🧠 How the Prediction System Works

1. **Historical data:** The application loads weekly dengue, weather, and ward information.
2. **Feature engineering:** It builds rainfall lags, rolling rainfall totals, temperature and humidity lags, case-trend features, and ward-vulnerability features.
3. **Machine-learning inference:** Pre-trained gradient-boosted tree models estimate dengue cases for the selected forecast horizon.
4. **Risk classification:** Forecasts are mapped to Low, Medium, High, or Critical risk levels.
5. **Operational planning:** Phase 2 modules use the forecast output to calculate supply needs, route bed overflow, simulate interventions, and prepare dispatch messages.

The browser uses pre-trained model data bundled with the project. **Python is not required to run the website.**

## 📊 Model & Validation

The project uses Histogram Gradient-Boosted Tree models with Poisson loss for expected case counts and quantile models for lower and upper prediction estimates. Separate models are used for the +2, +3, and +4 week forecast horizons.

The project documentation reports the following held-out test results:

| Forecast horizon | MAE | RMSE | R² | Risk-tier accuracy | 80% band coverage |
|---|---:|---:|---:|---:|---:|
| +2 weeks | 1.004 | 2.016 | 0.727 | 91.0% | 93.5% |
| +3 weeks | 1.024 | 2.001 | 0.732 | 91.0% | 93.2% |
| +4 weeks | 1.230 | 2.410 | 0.610 | 90.1% | 94.1% |

The chronological split documented in `ARCHITECTURE.md` is:
- **Training:** 2016–2022
- **Validation:** 2023
- **Held-out testing:** 2024–2025

These are the metrics recorded in the supplied project documentation.

---

## 🚀 Getting Started

### Requirements

- Node.js **18 or later** (only if you want to run the local server)
- A modern web browser

No `npm install` is required for the supplied application: the runtime server uses Node.js built-in modules and the project bundles its browser-side dependencies.

### Option A — Open the website directly

1. Extract the ZIP file.
2. Open the `Dengue` project folder.
3. Double-click `index.html` to open the landing page.
4. Open the dashboard using the website's dashboard link.

Some server-backed features, such as API-based form submissions and the optional Gemini chatbot, require the local server.

### Option B — Run with the local Node.js server

Open a terminal in the folder containing `package.json`, then run:

```bash
npm start
```

Open this address in your browser:

```text
http://localhost:8080
```

**Important:** Run the command from the project root — the folder that contains `package.json` and `server.js`.

---

## 🧪 Run the Offline Tests

To run the project's operational-engine self-tests:

```bash
npm test
```

The test script is `scripts/selftest.js`. It checks the project's allocation, overflow-routing, vector-simulation, and dispatch logic.

## 📦 Generate Dispatch Exports

To regenerate the sample dispatch files:

```bash
npm run exports
```

The generated files are saved in the `exports/` directory.

An optional example with explicit parameters:

```bash
node scripts/generate_exports.js 2025-08-04 3 50 25
```

The arguments represent the origin week, forecast horizon, stock percentage, and available spraying crews.

### Included Sample Exports

The repository includes:
- `exports/sms_alerts.txt`
- `exports/whatsapp_alerts.txt`
- `exports/dispatch.json`
- `exports/allocation_plan.csv`
- `exports/overflow_transfers.csv`
- `exports/commissioner_brief_all_cities.html`
- City-specific commissioner brief HTML files

These are sample generated outputs, not live dispatches.

---

## 🗂️ Project Structure

```text
Dengue/
├── index.html                 # Main landing page
├── about.html                 # About the project
├── app.html                   # Forecasting dashboard
├── app.js                     # Dashboard interface and interactions
├── engine.js                  # Browser-side prediction engine
├── ops.js                     # Phase 2 operational calculations
├── ops-ui.js                  # Phase 2 operations interface
├── ops.css                    # Phase 2 operations styles
├── data/
│   ├── dataset.js             # Bundled historical dataset
│   ├── model.js               # Serialized browser prediction models
│   └── metrics.js             # Model validation metrics
├── models/
│   └── dengue_gbt.joblib      # Serialized Python model
├── exports/                   # Sample dispatch and allocation outputs
├── scripts/
│   ├── selftest.js            # Offline operational self-tests
│   ├── generate_exports.js    # Dispatch export generator
│   └── _load.js               # Shared script loader
├── media/                     # Images, videos, and dashboard visuals
├── lib/
│   └── plotly.min.js          # Bundled chart library
├── server.js                  # Local Node.js server
├── chat.js                    # Browser help chatbot
├── chat-api.js                # Optional chatbot API handler
├── sw.js                      # Service worker for offline caching
├── train.py                   # Optional model-training pipeline
├── predict.py                 # Optional Python prediction CLI
├── requirements.txt            # Python training dependencies
├── package.json               # Project scripts
├── README.md                  # Project documentation
└── ARCHITECTURE.md             # Technical architecture
```

The website also contains additional pages and scripts for news, blogs, events, community, webinars, multimedia, stories, subscriptions, and localization.

---

## 📁 Use Your Own Weekly Dataset

The dashboard provides a CSV upload option. The documented required columns are:

```csv
date,city,ward_id,population_density_sqkm,water_logging_risk_index,sanitation_score,avg_temp_c,rainfall_mm,relative_humidity_pct,dengue_cases
```

- Use weekly dates in `YYYY-MM-DD` format.
- Provide at least **8 weeks of data per ward** for lag-based features.
- The existing trained model is applied to the uploaded data; uploading a CSV does not retrain the model.

---

## 🐍 Optional: Retrain the Machine-Learning Model

This step is **not required** to run the website. It is only needed if you want to train the model again.

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

Train the model:

```bash
python train.py
```

To write the newly trained model and metrics into the application files:

```bash
python train.py --write-app
```

See `ARCHITECTURE.md` for the training pipeline, feature engineering, validation approach, and model design.

---

## 🤖 Optional AI Chatbot

The help chatbot can provide its built-in guided tour and FAQ responses without an API key. Additional Gemini-powered answers are optional and require internet access and a Gemini API key.

1. Copy `.env.example` to `.env`.
2. Add your Gemini API key to `.env` using the variable name shown in `.env.example`.
3. Start the local server:

```bash
npm start
```

Keep `.env` private. **Never commit API keys or secrets to GitHub.** The forecasting and resource-allocation calculations do not depend on Gemini.

---

## 🏗️ Technical Architecture

For detailed diagrams, data flow, model rationale, feature engineering, validation, offline execution, and Phase 2 operational formulas, see:

- [`ARCHITECTURE.md`](ARCHITECTURE.md)

## 🛠️ Main Technologies

- **HTML, CSS, JavaScript** — website and browser interface
- **Node.js** — optional local server and API routes
- **Python** — offline model training and optional command-line prediction
- **scikit-learn** — gradient-boosted tree model training
- **Plotly.js** — interactive charts
- **Service Worker** — offline caching

## 🔐 Privacy & Runtime Notes

- Core forecasting and Phase 2 operational calculations run locally in the browser.
- The optional chatbot is a separate feature and may contact the Gemini API when configured.
- Story and subscription submissions use the optional local server endpoints when available.
- Do not place private credentials, API keys, or personal information in public repository files.

## 🏆 Hackathon Phase 2 Deliverables

The project is organized around the five Phase 2 functional requirements:

| Requirement | Project module |
|---|---|
| Constrained resource allocation | Supply allocation |
| Hospital surge and cross-ward overflow routing | Bed overflow |
| What-if vector-control impact simulation | Vector simulator |
| Multi-channel dispatch notifications | Dispatch |
| Offline resilience and deterministic fallback | Local JavaScript engines, service worker, and offline tests |

The Phase 2 brief also calls for a continuous Phase 1 repository history, a deployed live URL, sample exports, updated architecture documentation and AI disclosure, plus an uncut seven-minute system walkthrough. Add the team's final deployed URL and walkthrough link below when available.

**Live Website:** https://tensor-titans-ai-hackathon-1.onrender.com/

**System Walkthrough Video:** `Add your video URL here`

---

## 📜 License

For hackathon evaluation and educational purposes.
