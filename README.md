# 🦟 Dengue Guard

**AI-Powered Ward-Level Dengue Early Warning System for Bangladesh**

Dengue Guard is an intelligent early-warning dashboard designed to predict dengue outbreak risks across different wards of Bangladesh. It uses historical dengue cases, weather patterns, and ward-level vulnerability indicators to forecast potential outbreaks **2–4 weeks in advance**.

The platform helps public health authorities identify high-risk wards, understand outbreak drivers, and prioritize mosquito-control resources before cases increase.

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

To configure the chatbot, create a `.env` file in the project root:

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

## 🏆 Hackathon Submission

**Challenge:** AI for Urban Dengue Outbreak

**Hackathon:** EDU AI Engineering Hackathon 2026

**Project:** Dengue Guard

**Goal:** Build an intelligent, data-driven dengue early-warning system that helps public health authorities identify vulnerable wards and respond before outbreaks peak.

## 🤖 AI Assistants & External APIs Disclosure

AI assistants and external services used during development:

- Google Gemini / Antigravity
- Claude (Anthropic)

External API:
- Google Gemini API (optional chatbot assistance).

Other development technologies:
- Scikit-learn
- Plotly.js
- NumPy
- Pandas

AI assistants were used for development assistance, debugging, code review, and documentation.

## 📄 License

For hackathon evaluation and demonstration purposes only.

---

**Dengue Guard — Predict Early. Prepare Better. Protect Communities.** 🦟
