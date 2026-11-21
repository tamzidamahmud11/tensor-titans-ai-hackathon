# 🦟 Dengue Guard
### Ward-Level Dengue Early Warning & Outbreak Risk Prediction System for Bangladesh

Dengue Guard is an AI-powered early-warning dashboard designed to predict dengue outbreak risks at the ward level across major cities in Bangladesh.

The system forecasts dengue risk **2–4 weeks in advance** by combining historical dengue cases, multi-week weather patterns, and ward-level vulnerability indicators. It uses Gradient Boosted Tree (GBT) models to generate predictions and classify wards into four risk categories.

The application runs entirely in the browser using pre-trained models and embedded datasets. No external API calls or server-side machine learning are required during prediction.

---

## 🚀 Quick Start (Under 3 Minutes)

### Prerequisites

- Node.js version 16 or later (only for the optional local server).
- A modern web browser.

### Option A: Open Directly (No Installation Required)

The landing page can be opened directly in a browser.

**Windows:**
```bash
start index.html
```

**macOS:**
```bash
open index.html
```

**Linux:**
```bash
xdg-open index.html
```

### Option B: Run Using Node.js

**1. Clone the repository**

```bash
git clone https://github.com/TensorTitans/tensor-titans-ai-hackathon.git
```

**2. Navigate to the project directory**

```bash
cd tensor-titans-ai-hackathon/dg
```

**3. Start the local server**

```bash
npm start
```

**4. Open the application**

Visit the following address in your browser:

http://localhost:8080

The server automatically opens the browser on supported Windows, macOS, and Linux systems.

> **Note:** No `npm install` is required. The application has zero runtime dependencies. The `package.json` file only defines the start script.

---

## 🎯 Key Features

| Feature | Description |
|---|---|
| Multi-Week Weather Lag Pipeline | Uses rainfall lags (0–7 weeks), temperature and humidity lags, and 2/4/8-week rolling sums. |
| AI-Based Risk Prediction | Uses Poisson Gradient Boosted Trees with lower and upper prediction estimates. |
| Multiple Forecast Horizons | Generates direct predictions for +2, +3, and +4 weeks. |
| Risk Classification | Categorizes wards into Low, Medium, High, and Critical risk levels. |
| Interactive Dashboard | Includes five tabs: Risk Board, Ward Deep-Dive, What-If Scenarios, Model Validation, and How It Works. |
| Ward-Level Monitoring | Covers 60 wards across DNCC, DSCC, CCC, GCC, and NCC. |
| Historical Dataset | Contains 31,320 ward-week records covering 2016–2025. |
| Weather Impact Analysis | Visualizes temperature, humidity, rainfall, and the relationship between rainfall and dengue cases. |
| Offline Prediction | Performs full 60-ward inference in under 50 ms without external API calls. |

---

## 🏙️ Geographic Coverage

Dengue Guard currently covers five major city corporation areas in Bangladesh:

- Dhaka North City Corporation (DNCC)
- Dhaka South City Corporation (DSCC)
- Chattogram City Corporation (CCC)
- Gazipur City Corporation (GCC)
- Narayanganj City Corporation (NCC)

**Total Coverage:** 60 wards.

---

## 📊 Interactive Dashboard

The dashboard contains five main sections:

1. **Risk Board:** Displays ward-level dengue risk classifications and forecasts.
2. **Ward Deep-Dive:** Provides detailed ward-level analysis, including weather drivers and historical dengue trends.
3. **What-If Scenarios:** Allows users to explore hypothetical changes in weather conditions and their potential impact on risk predictions.
4. **Model Validation:** Presents model performance metrics, validation results, and prediction accuracy.
5. **How It Works:** Explains the prediction methodology, feature engineering, and model architecture.

---

## 🧠 AI & Machine Learning Approach

Dengue Guard uses a Gradient Boosted Tree-based prediction engine trained on historical ward-level data.

### 1. Weather Feature Engineering

The system extracts meaningful temporal features from historical weather observations, including:

- Rainfall lags from 0 to 7 weeks.
- Temperature and humidity lags.
- Rolling rainfall sums over 2, 4, and 8 weeks.

These features help the model capture delayed weather-related patterns associated with dengue cases.

### 2. Prediction Models

The system uses Poisson Gradient Boosted Trees to estimate dengue cases.

Three direct-horizon models generate forecasts for:

- 2 weeks ahead.
- 3 weeks ahead.
- 4 weeks ahead.

The prediction engine also generates lower and upper quantile estimates for uncertainty visualization.

### 3. Risk Classification

Predicted dengue risk is grouped into four categories:

- Low
- Medium
- High
- Critical

Risk thresholds are calibrated using 2023 validation data.

### 4. Offline Inference

Pre-trained models are serialized and exported into JavaScript-compatible files.

All prediction operations run locally in the browser without requiring:
- Cloud-based prediction services.
- External AI APIs.
- Internet connectivity during inference.

---

## 📁 Project Structure

```text
dg/
│
├── index.html              # Main landing page
├── about.html              # About page
├── contact.html            # Contact page
├── privacy.html            # Privacy policy
├── terms.html              # Terms of use
│
├── site.css                # Landing and information page styles
├── logo.svg                # Mosquito logo and favicon
│
├── app.html                # Dashboard application shell
├── app.js                  # Dashboard UI and interactions
├── engine.js               # Feature engineering and ML inference
├── style.css               # Dashboard styling
│
├── server.js               # Optional Node.js static server
├── package.json            # Project scripts
├── package-lock.json       # Dependency lock file
│
├── train.py                # Model training pipeline
├── requirements.txt        # Python training dependencies
│
├── ARCHITECTURE.md         # System architecture and model details
├── README.md               # Project documentation
│
├── data/
│   ├── dataset.js          # Embedded historical dataset
│   ├── model.js            # Serialized GBT models
│   └── metrics.js          # Model evaluation metrics
│
├── lib/
│   └── plotly.min.js       # Bundled Plotly.js library
│
└── training_output/        # Generated model training outputs
```

---

## 📂 Using Your Own Data

Users can upload their own weekly dengue dataset through the dashboard using the **"Use my own weekly data (CSV)"** feature.

The uploaded CSV must contain the following columns:

```csv
date,city,ward_id,population_density_sqkm,water_logging_risk_index,sanitation_score,avg_temp_c,rainfall_mm,relative_humidity_pct,dengue_cases
```

### Data Requirements

- Dates must follow the ISO format: `YYYY-MM-DD`.
- Data should be recorded weekly.
- Each ward must contain at least 8 weeks of historical records.
- The existing trained model is applied to the uploaded data without retraining.

---

## 🔄 Model Re-Training (Optional)

The dashboard includes pre-trained models in `data/model.js`. Therefore, Python is not required for normal application usage.

However, developers can retrain the models using the provided Python training pipeline.

### Install Training Dependencies

```bash
pip install -r requirements.txt
```

### Train the Models

```bash
python train.py
```

This command builds the lag features, trains the models, evaluates performance, and saves the generated outputs in `training_output/`.

### Update the Dashboard Models

```bash
python train.py --write-app
```

This command also updates:

- `data/model.js`
- `data/metrics.js`

The training pipeline uses chronological data splitting to prevent future information from leaking into the training process.

---

## 📈 Model Training & Validation

Dengue Guard uses chronological data splitting rather than random shuffling.

| Dataset Split | Period | Purpose |
|---|---|---|
| Training | 2016-01 to 2022-12 | Model training |
| Validation | 2023 | Early stopping and risk threshold calibration |
| Testing | 2024-01 to 2025-12 | Final model performance evaluation |

The held-out test period is kept separate from model training.

### Reported Test Results (+3-Week Forecast)

| Evaluation Metric | Result |
|---|---:|
| MAE | 1.02 |
| RMSE | 2.00 |
| R² Score | 0.732 |
| Risk Tier Accuracy | 91.0% |
| 80% Prediction Interval Coverage | 93.2% |

These metrics describe the reported evaluation results for the +3-week prediction horizon.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Responsive dashboard design |
| JavaScript | Dashboard functionality and prediction inference |
| Python | Model training and feature engineering |
| Scikit-learn | Gradient Boosted Tree model training |
| Plotly.js | Interactive data visualization |
| Node.js | Optional local static server |

---

## 🤖 AI Assistants & External Tools Disclosure

The following tools and technologies were used during development:

| Tool | Contribution |
|---|---|
| Google Gemini / Antigravity | Code generation assistance, debugging, and documentation support |
| Claude (Anthropic) | Submission review, training pipeline development, and documentation editing |
| Scikit-learn | Training Gradient Boosted Tree models using `HistGradientBoostingRegressor` |
| Plotly.js | Interactive charts and data visualization |

**Runtime AI and API Usage:**

No external AI APIs or third-party prediction APIs are called during runtime. All model inference and chart rendering take place locally in the browser.

No LLM (GPT, Gemini, or Claude) is used during prediction.

---

## ✅ Hackathon Submission Checklist

| # | Evaluation Criteria | Status |
|---|---|---|
| 1 | Reproducible local setup and README documentation | ✅ |
| 2 | Multi-week weather lag pipeline | ✅ |
| 3 | ML-based dengue risk prediction engine | ✅ |
| 4 | Interactive dashboard with five sections | ✅ |
| 5 | System architecture and model documentation | ✅ |
| 6 | Offline inference and API cost efficiency | ✅ |
| 7 | Three-minute video demonstration | ⏳ Pending |
| 8 | Git contribution history from all team members | ⏳ Pending verification |
| 9 | AI tool disclosure | ✅ |
| Bonus | Ward-level risk heatmap, prediction intervals, and validation dashboard | ✅ |

---

## 📚 Documentation

For more information about the internal system design, data flow, model selection, and validation methodology, see:

- `ARCHITECTURE.md` – System architecture and model methodology.
- `train.py` – Model training and feature engineering pipeline.
- `data/model.js` – Pre-trained prediction models.
- `data/metrics.js` – Model evaluation results.

---

## 📄 License

This project is provided for hackathon evaluation purposes only.
