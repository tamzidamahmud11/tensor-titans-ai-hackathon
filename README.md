# **🦟 Dengue Guard**

### **Ward-Level Dengue Early Warning & Prediction System for Bangladesh**

Dengue Guard is an AI-powered, ward-level dengue forecasting and early-warning dashboard designed for city corporations in Bangladesh. It predicts dengue cases **2–4 weeks in advance**, identifies high-risk wards, and helps public health authorities make data-driven decisions for dengue prevention and resource allocation.

By combining historical dengue cases, weather patterns, and ward-level vulnerability indicators, Dengue Guard transforms raw data into actionable public health insights.

## **🎯 Project Objectives**

- Predict dengue cases at the ward level 2–4 weeks ahead.
- Identify dengue-prone areas using intelligent risk classification.
- Provide early warnings to support preventive actions.
- Help authorities allocate mosquito-control and response teams efficiently.
- Visualize dengue trends, weather patterns, and geographical risk.
- Support data-driven public health planning across Bangladesh.

## **✨ Key Features**

| Feature                     | Description                                                                    |
| --------------------------- | ------------------------------------------------------------------------------ |
| 🔮 Dengue Forecasting       | Predicts dengue cases 2, 3, and 4 weeks ahead.                                 |
| 🗺️ Ward-Level Risk Mapping | Visualizes dengue risk across different wards.                                 |
| 🚦 Risk Classification      | Categorizes wards into Low, Medium, High, and Critical risk levels.            |
| 🌧️ Weather Analysis        | Analyzes rainfall, temperature, and humidity patterns.                         |
| 📊 Interactive Dashboard    | Provides charts, statistics, and ward-level insights.                          |
| 🏙️ Multi-City Coverage     | Supports 60 wards across five city corporations.                               |
| 🧠 AI/ML Prediction Engine  | Uses Poisson gradient-boosted regression models.                               |
| 🚑 Response Planner         | Helps prioritize wards for mosquito-control teams.                             |
| 🔄 What-if Scenarios        | Explores how changes in conditions affect predicted risk.                      |
| 📁 CSV Import/Export        | Uploads weekly datasets and downloads forecasts.                               |
| 🤖 AI Help Chatbot          | Provides project guidance using built-in FAQs and optional Gemini integration. |
| ⚡ Offline Prediction        | Runs forecasting directly in the browser without external API calls.           |

## **🏙️ Geographic Coverage**

Dengue Guard currently covers 60 wards across five city corporations:

- Dhaka North City Corporation (DNCC)
- Dhaka South City Corporation (DSCC)
- Chattogram City Corporation (CCC)
- Gazipur City Corporation (GCC)
- Narayanganj City Corporation (NCC)

## **🧠 Machine Learning Approach**

Dengue Guard uses a **Poisson Gradient Boosting Regression** approach to forecast future dengue cases.

### **Input Features**

- Historical dengue case counts
- Lagged rainfall measurements
- Temperature variations
- Relative humidity
- Population density
- Water-logging risk index
- Sanitation score
- Rolling rainfall averages

### **Prediction Horizons**

The system generates three independent forecasting horizons:

- 2 weeks ahead
- 3 weeks ahead
- 4 weeks ahead

### **Risk Classification**

Predicted dengue cases are converted into four risk categories:

| Risk Level  | Interpretation                          |
| ----------- | --------------------------------------- |
| 🟢 Low      | Relatively low expected dengue activity |
| 🟡 Medium   | Moderate dengue activity                |
| 🟠 High     | Elevated dengue activity                |
| 🔴 Critical | Very high expected dengue activity      |

Risk thresholds are calibrated using validation data from 2023.

## **📈 Model Performance**

The model was evaluated using a chronological train-validation-test split.

| Dataset    | Period    | Purpose                                     |
| ---------- | --------- | ------------------------------------------- |
| Training   | 2016–2022 | Model training                              |
| Validation | 2023      | Model tuning and risk-threshold calibration |
| Testing    | 2024–2025 | Final performance evaluation                |

### **Test Results**

| Forecast Horizon | MAE  | RMSE | R²    | Risk Tier Accuracy |
| ---------------- | ---- | ---- | ----- | ------------------ |
| 2 Weeks          | 1.00 | 2.02 | 0.727 | 91.0%              |
| 3 Weeks          | 1.02 | 2.00 | 0.732 | 91.0%              |
| 4 Weeks          | 1.23 | 2.41 | 0.610 | 90.1%              |

The system also generates 80% prediction intervals to represent forecast uncertainty.

*Note: These are the project's reported evaluation results. They should be interpreted alongside the held-out test methodology, data quality, and model limitations.*

## **🛠️ Technology Stack**

| Technology        | Purpose                                       |
| ----------------- | --------------------------------------------- |
| HTML5             | Website structure                             |
| CSS3              | User interface and styling                    |
| JavaScript        | Dashboard functionality and prediction engine |
| Plotly.js         | Interactive data visualization                |
| Node.js           | Local server and chatbot API                  |
| Python            | Model training and data processing            |
| NumPy & Pandas    | Data processing                               |
| Scikit-learn      | Machine learning                              |
| Google Gemini API | Optional AI chatbot integration               |

## **⚙️ Installation & Setup**

### **Prerequisites**

- Node.js 18 or later
- A modern web browser
- Python 3.9+ (only required for model retraining)

### **1. Clone the Repository**

```
git clone YOUR_GITHUB_REPOSITORY_URL
```

### **2. Navigate to the Project Directory**

```
cd dengue-guard
```

### **3. Start the Application**

```
npm start
```

No `npm install` is required for the supplied zero-dependency Node.js server.

### **4. Open in Your Browser**

[http://localhost:8080](http://localhost:8080?utm_source=chatgpt.com)

Alternatively, open `index.html` directly in a modern browser to access the website without running the Node.js server.

## **🤖 Optional AI Chatbot Setup**

Dengue Guard includes an optional Gemini-powered chatbot.

To enable AI-generated answers:

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey?utm_source=chatgpt.com).
2. Create a `.env` file in the project root.
3. Add the following configuration:

```
GEMINI_API_KEY=your_api_key_here
```

4\. Start the application:

```
npm start
```

The chatbot includes built-in FAQ responses and a guided tour that work without an API key.

**Security:** The API key is stored on the server and should never be committed to GitHub.

## **📂 Project Structure**

```
dengue-guard/
│
├── index.html
├── app.html
├── about.html
├── contact.html
├── news.html
│
├── app.js
├── engine.js
│
├── chat.js
├── chat.css
├── chat-api.js
│
├── server.js
│
├── cookies.js
├── cookies.css
│
├── news.js
├── news.css
│
├── site.css
├── style.css
│
├── logo.svg
├── hero-banner.jpg
├── chatbot-avatar.png
│
├── media/
│
├── data/
│   ├── dataset.js
│   ├── model.js
│   └── metrics.js
│
├── lib/
│   └── plotly.min.js
│
├── train.py
├── requirements.txt
├── package.json
│
├── ARCHITECTURE.md
└── README.md
```

## **📊 Using Your Own Dataset**

Users can upload their own weekly dengue dataset through the dashboard.

Required CSV columns:

```
date,city,ward_id,population_density_sqkm,water_logging_risk_index,sanitation_score,avg_temp_c,rainfall_mm,relative_humidity_pct,dengue_cases
```

Optional columns:

```
max_temp_c,min_temp_c
```

Requirements:

- Dates must use `YYYY-MM-DD` format.
- Data should be recorded weekly.
- Each ward requires at least eight weeks of historical data.
- The existing trained model can be applied immediately without retraining.

## **🔬 Model Retraining**

Python is not required for normal dashboard usage.

To retrain the forecasting models:

```
pip install -r requirements.txt
python train.py
```

To update the browser models:

```
python train.py --write-app
```

The training process generates updated model artifacts and evaluation metrics.

## **🔐 Privacy & Offline Capabilities**

- Forecasting runs entirely in the browser.
- No external API is required for dengue predictions.
- Historical data and trained models are bundled with the application.
- The optional chatbot communicates with Gemini through the Node.js server.
- The application does not require an internet connection after the required files have been loaded.

## **⚠️ Limitations**

- Forecast accuracy depends on the quality and completeness of historical data.
- Current geographic coverage is limited to 60 wards across five city corporations.
- Dengue transmission can be influenced by factors not included in the model.
- High and Critical risk detection should be interpreted carefully because tier recall is modest.
- Predictions are estimates, not confirmed case counts or medical diagnoses.

Dengue Guard is designed as a **decision-support tool**, not a replacement for epidemiological surveillance or public health professionals.

## **🚀 Future Improvements**

- Expand coverage to more city corporations and districts.
- Integrate verified, regularly updated dengue surveillance data.
- Incorporate satellite imagery and environmental indicators.
- Improve detection of High and Critical risk wards.
- Develop automated early-warning notifications.
- Introduce multilingual support, including Bangla.
- Add mobile-friendly dashboards for field health workers.
- Integrate verified geographical boundary maps.

## **👥 Project Team**

**Team Name:** Tensor Titans

**Project Name:** Dengue Guard

**Category:** Artificial Intelligence & Machine Learning / Public Health

## **🤝 Contribution**

Contributions, suggestions, and improvements are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Submit a pull request.

## **📜 License**

This project is developed for hackathon evaluation and demonstration purposes.

## **❤️ Our Mission**

**Predict Early. Prepare Smarter. Protect Communities.**

Dengue Guard aims to transform dengue surveillance into proactive, data-driven prevention by helping communities and public health authorities identify risks before outbreaks escalate.

*Building a smarter and safer Bangladesh through Artificial Intelligence.*
