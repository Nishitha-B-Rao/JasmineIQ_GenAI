# JasmineIQ: Model Architecture & Prediction Pipeline

This document explains how JasmineIQ trains its forecasting model, how it ingests live market data via web scraping, and how it combines both to generate data-driven, real-time price predictions.

## 1. Model Training (Offline)

The core forecasting engine of JasmineIQ is powered by an **XGBoost Regressor**, trained offline on historical market data.

### Data Source
Historical price data for Udupi Jasmine (*Mallige* and *Jaaji*) is stored in **Google BigQuery** (`jasmineiq.master_training_data`). This centralized data warehouse acts as our single source of truth for all historical modeling.

### Feature Engineering
Flower prices are highly volatile and dependent on seasonality, festivals, and recent market trends. To capture this, we engineered several critical features before training the model:
- **Temporal Features:** `Year`, `Month`, `DayOfWeek`, `DayOfYear`. These capture seasonal supply changes (e.g., lower supply during heavy monsoons) and demand spikes (e.g., weekend weddings).
- **Lag Features:** `Lag_1` (yesterday's price) and `Lag_7` (the price exactly one week ago).
- **Rolling Windows:** `RollingMean7` and `RollingStd7` (the average and volatility over the past 7 days) to help the model understand short-term market momentum.
- **Categorical Variables:** `Is_Mallige` (binary flag to differentiate between the two distinct flower varieties).

### Training & Export
The XGBoost model is trained on these features to minimize forecasting error. Once trained, the model is serialized into a `.pkl` file (`jasmine_model.pkl`) using `joblib`. This allows the FastAPI backend to load the model instantly on startup without needing to retrain or heavily query the database on every request.

### Model Evaluation
To ensure the model generalizes well to unseen market conditions:
- **Historical Records**: 4,030
- **Evaluation**: 60-Day Holdout Validation

---

## 2. Live Data Ingestion (Web Scraping)

A major challenge in agricultural tech is that models trained on historical datasets quickly become "blind" to today's sudden market shifts. To solve this, JasmineIQ implements a **Live Web Scraper**.

### How it Works
Every time a user visits the dashboard, the FastAPI backend silently invokes our scraper module (`scraper.py`). 
- **Target:** It scrapes the live, daily-updated HTML tables from *The Canara Post* (a local Udupi news source that publishes the daily growers' association rates).
- **Extraction:** Using `BeautifulSoup4` and Regular Expressions, it dynamically locates the rows for *Mallige* and *Jaaji* and extracts the exact integer price for today.
- **Resiliency:** The scraper is wrapped in a 5-second timeout and robust `try/except` blocks. If the news site goes offline or changes its layout, the backend safely catches the error and falls back to the most recent price in the BigQuery dataset.

---

## 3. Live Inference (Prediction Generation)

This is where the offline model and the live scraper come together to create a powerful Decision Intelligence pipeline.

1. **Fetching the Baseline:** The user requests a forecast. The scraper instantly goes out to the internet and retrieves exactly what the flower is selling for *right now*.
2. **Dynamic Feature Injection:** The backend takes this scraped live price and forcefully overrides the `Lag_1` feature in our model. It also dynamically updates the 7-day rolling average (`RollingMean7`) in memory. 
3. **Forecasting:** The XGBoost model is fed this updated, real-time feature vector. Because the model now knows exactly what the market is doing *today*, it improves prediction relevance using the latest market observations rather than relying on stale dataset averages.
4. **Decision Output:** The predicted tomorrow price is passed to the Decision Engine, which compares it against the scraped today price to calculate the `expected_increase` and generate a `SELL` or `WAIT` recommendation.

### Summary of the Data Flow
```text
[The Canara Post (Web)] 
       ↓ (Scraped via BeautifulSoup)
[Live Today's Price: ₹630] 
       ↓ (Injected as Lag_1 feature)
[XGBoost Inference Engine] 
       ↓ (Analyzes Lags, Dates, Rolling Means)
[Tomorrow's Predicted Price: ₹669]
       ↓ (Delta Calculation)
[Decision: WAIT (+₹39 Profit)]
```
