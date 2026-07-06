# 🏗️ JasmineIQ Tech Stack Justification

When building a Decision Intelligence Platform for agriculture, the technology choices must prioritize speed, reliability, and the ability to process heavy analytical workloads seamlessly. 

Here is a breakdown of why we chose each piece of our technology stack for JasmineIQ.

---

## ☁️ 1. Data Warehouse & Storage
### Google BigQuery
**Why we chose it:**
- **Centralized Truth**: Instead of managing messy CSV files locally or dealing with traditional relational databases that struggle with analytics, BigQuery serves as our single source of truth.
- **SQL Analytics**: It allows us to offload heavy market aggregations (volatility, max/min prices, rolling averages) directly to the data warehouse layer via SQL, keeping the Python backend incredibly lightweight.
- **Scalability**: As we expand to include real-time weather APIs and multiple regional flower markets, BigQuery handles massive datasets effortlessly.

---

## 🧠 2. Machine Learning & AI
### XGBoost (Extreme Gradient Boosting)
**Why we chose it:**
- **Tabular Data Supremacy**: While Deep Learning (like LSTMs) is popular for time-series, XGBoost is mathematically proven to be vastly superior for structured, tabular data (prices, dates, categories).
- **Speed & Explainability**: XGBoost trains in seconds and provides clear feature importance. It easily handles our complex lag features and the one-hot encoded `Variety` column, allowing a single model to predict multiple flower types.

### Google Gemini Flash (Generative AI)
**Why we chose it:**
- **Context-Aware Explanations**: Farmers don't just want a "SELL" or "WAIT" signal; they want to know *why*. Gemini is injected with live BigQuery analytics, the current weather, and the XGBoost prediction to generate natural, localized, and highly accurate explanations.
- **Low Latency**: The "Flash" model was specifically chosen to ensure the chatbot responds instantly without making the user wait.

---

## ⚙️ 3. Backend Architecture
### FastAPI (Python)
**Why we chose it:**
- **Python Ecosystem**: Machine Learning (pandas, scikit-learn, XGBoost) is built on Python. We needed a backend that natively speaks the language of our data science models.
- **Performance**: FastAPI is asynchronous by default and significantly faster than older frameworks like Flask or Django.
- **Automatic Documentation**: It instantly generates Swagger UI docs, making it incredibly easy to test our Machine Learning endpoints during the hackathon.

### BeautifulSoup4 (Live Data Ingestion)
**Why we chose it:**
- **Robust HTML Parsing**: JasmineIQ requires live price data from local Udupi news sites like The Canara Post. BeautifulSoup effortlessly parses complex DOM structures and extracts exactly what we need.
- **Fail-Safe Implementation**: It runs on every request within a robust error-handling block, ensuring that if the news site layout changes or goes down, the backend seamlessly falls back to historical BigQuery averages without disrupting the user experience.

---

## 🎨 4. Frontend & User Interface
### Next.js 15 (React Framework)
**Why we chose it:**
- **Full-Stack Capabilities**: Next.js provides server-side rendering (SSR), making the initial dashboard load lightning fast—crucial for users in rural areas with spotty internet connections.
- **App Router**: The modern routing structure allows us to build distinct experiences (Dashboard, Forecast, Analytics) cleanly and modularly.

### Tailwind CSS & shadcn/ui
**Why we chose it:**
- **Premium Aesthetics**: We wanted the platform to look like a modern, enterprise-grade decision intelligence tool, not a basic prototype.
- **Rapid Prototyping**: Tailwind's utility classes combined with shadcn's accessible, pre-built components allowed us to build complex, responsive layouts (like the Dashboard and Chat UI) in hours rather than days.

### Recharts
**Why we chose it:**
- **React Native Integration**: Recharts renders native SVG charts that look beautiful, scale perfectly on mobile devices, and support custom tooltips for our price forecasting graphs.

---

## 🚀 5. Deployment & DevOps
### Google Cloud Run & Docker
**Why we chose it:**
- **Serverless Simplicity**: Managing raw servers (VMs) is time-consuming. Cloud Run allows us to containerize our frontend and backend via Docker and deploy them instantly.
- **Auto-Scaling**: If the platform goes viral during a price spike, Cloud Run scales from 0 to 1,000 instances automatically, meaning the site will never crash.
- **Microservices**: By decoupling the frontend and backend into two separate containers, they can scale independently based on their specific CPU/memory needs.

---

## 📊 6. Dataset Architecture

> **Note**: The actual dataset files (`.csv`) are proprietary to the Udupi Mallige app and are intentionally excluded from this repository. This section explains how the data was sourced and how the machine learning pipeline merges and engineers the features.

### A. Data Sources

JasmineIQ relies on three primary data pillars to build its predictive intelligence:

**1. Market Price Data (`dataset.csv`)**
- **Source**: Historical archives of local market rates in Udupi, primarily compiled from the daily price reports on *The Canara Post* and local agricultural APMC records.
- **Contents**: Daily prices (in INR per *Atte*) for both *Udupi Mallige* and *Jaaji* varieties spanning several years.

**2. Historical Weather Data (`historical_weather.csv`)**
- **Source**: OpenWeatherMap / Open-Meteo historical APIs.
- **Location**: Pinned specifically to the Udupi district coordinates.
- **Contents**: Daily aggregations of: `Rainfall_mm`, `Temperature_C`, `Humidity_Pct`

**3. Festival & Demand Calendar (`festival.csv`)**
- **Source**: Regional Hindu festival calendars.
- **Contents**: Maps specific dates to major festivals (e.g., Diwali, Dasara, Ugadi, Varamahalakshmi). It includes a `DemandMultiplier` metric since flower demand spikes exponentially during these periods.

### B. Data Merging & Feature Engineering

Before training the XGBoost model or uploading to Google BigQuery, the raw datasets undergo a strict merging and feature engineering pipeline using Pandas.

1. **Time-Series Alignment**: The base price dataset is set as the anchor. The weather and festival datasets are joined using a `Left Join` on the `Date` column.
2. **Festival Imputation**: Days without a corresponding festival in the calendar are marked as `NoFestival` with a baseline `DemandMultiplier` of `1.0`.

**Feature Engineering**:
- **Temporal Features**: `Year`, `Month`, `Quarter`, `DayOfWeek`, `WeekOfYear`, `IsWeekend`
- **Lag Features (Autoregression)**: `Lag_1` (previous day price), `Lag_7` (price exactly one week ago).
- **Rolling Windows**: `RollingMean7`, `RollingMean30`, `RollingStd7` (volatility).
- **Categorical Encoding**: `Is_Mallige` (binary flag allowing a single XGBoost model to train on both varieties).
- **Missing Data Handling**: Handled using backward-filling (`bfill()`) to ensure time-series continuity.

### C. Final Master Dataset (`master_training_dataset.csv`)

The final merged file results in a robust matrix containing all historical signals:
`Date, Variety, Price_Atte, Rainfall_mm, Temperature_C, Humidity_Pct, Festival, DemandMultiplier, Year, Month, Quarter, DayOfWeek, WeekOfYear, IsWeekend, Lag_1, Lag_7, RollingMean7, RollingMean30`

**BigQuery Ingestion**:
Once the `master_training_dataset.csv` is generated locally, the `setup_bq.py` script uploads the entire DataFrame directly to Google BigQuery under the table `jasmineiq.master_training_data`. This acts as the centralized analytical data warehouse used by the frontend dashboard and the Gemini Assistant to perform real-time market queries.
