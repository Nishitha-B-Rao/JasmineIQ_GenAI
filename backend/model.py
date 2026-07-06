import pandas as pd
import numpy as np
from xgboost import XGBRegressor
import os
import warnings
warnings.filterwarnings('ignore', category=FutureWarning)

from google.cloud import bigquery

# In-memory caches to speed up the dashboard (prevents querying BigQuery on every request)
_cached_df = None
_cached_analytics = None

def load_and_preprocess_data():
    global _cached_df
    if _cached_df is not None:
        return _cached_df
        
    try:
        client = bigquery.Client()
        query = f"SELECT * FROM `{client.project}.jasmineiq.master_training_data` ORDER BY Variety, Date"
        df = client.query(query).to_dataframe()
    except Exception as e:
        print("BigQuery query failed, falling back to dummy data:", e)
        dates = pd.date_range(start="2026-01-01", periods=30)
        df = pd.DataFrame({
            "Date": list(dates) * 2,
            "Variety": ["Mallige"]*30 + ["Jaaji"]*30,
            "Price_Atte": np.random.randint(500, 1000, 60),
            "Year": 2026, "Month": 1, "Day": 1, "DayOfWeek": 0, "DayOfYear": 1,
            "Lag_1": 700, "Lag_7": 700, "RollingMean7": 700, "RollingStd7": 10,
            "Is_Mallige": [1]*30 + [0]*30
        })
    
    df["Date"] = pd.to_datetime(df["Date"])
    _cached_df = df
    return _cached_df

def prepare_data_for_inference(df):
    # This just ensures we have the historical features to calculate lags from
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values(by=['Variety', 'Date']).reset_index(drop=True)
    return df

def get_forecast(model, variety="Mallige", today_price_override=None):
    if variety not in ["Mallige", "Jaaji"]:
        variety = "Mallige"
        
    df = load_and_preprocess_data()
    df_feat = prepare_data_for_inference(df)
    
    # Extract historical data for this variety
    df_variety = df_feat[df_feat['Variety'] == variety].copy()
    
    dataset_today = df_variety.iloc[-1]['Price_Atte'] if not df_variety.empty else 750
    today_price_val = today_price_override if today_price_override is not None else dataset_today
    
    # Forecast future dates
    from datetime import datetime
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    future_dates = pd.date_range(start=today, periods=8)[1:]
    
    # Iterative prediction for the next 7 days
    future_predictions = []
    current_rolling = df_variety.tail(7)['Price_Atte'].tolist()
    
    # Dampen extreme price swings for inference features to prevent wild predictions
    if len(current_rolling) > 1:
        # Use previous 6 days to find stable bounds
        stable_mean = np.mean(current_rolling[:-1])
        stable_std = np.std(current_rolling[:-1])
        max_allowed = stable_mean + (2 * stable_std) if stable_std > 0 else stable_mean * 1.5
        min_allowed = stable_mean - (2 * stable_std) if stable_std > 0 else stable_mean * 0.5
        inference_price = max(min_allowed, min(today_price_val, max_allowed))
    else:
        inference_price = today_price_val
        
    current_lag_1 = inference_price
    current_lag_7 = df_variety.iloc[-7]['Price_Atte'] if len(df_variety) >= 7 else current_lag_1
    
    if current_rolling:
        current_rolling[-1] = inference_price
    
    is_mallige = 1 if variety == "Mallige" else 0
    
    features = ["Year", "Month", "DayOfWeek", "DayOfYear", "Lag_1", "Lag_7", "RollingMean7", "RollingStd7", "Is_Mallige"]
    
    for date in future_dates:
        # Calculate rolling stats
        roll_mean = np.mean(current_rolling)
        roll_std = np.std(current_rolling) if len(current_rolling) > 1 else 0
        
        row = pd.DataFrame([{
            "Year": date.year,
            "Month": date.month,
            "DayOfWeek": date.dayofweek,
            "DayOfYear": date.dayofyear,
            "Lag_1": current_lag_1,
            "Lag_7": current_lag_7,
            "RollingMean7": roll_mean,
            "RollingStd7": roll_std,
            "Is_Mallige": is_mallige
        }])
        
        pred = model.predict(row[features])[0]
        future_predictions.append(int(pred))
        
        # Update lags for next iteration
        current_lag_7 = current_rolling.pop(0)
        current_rolling.append(pred)
        current_lag_1 = pred
        
    today_price = int(today_price_val)
    tomorrow_price = future_predictions[0]
    
    historical_chart = df_variety.tail(30)[["Date", "Price_Atte"]].copy()
    historical_chart["Date"] = historical_chart["Date"].dt.strftime("%Y-%m-%d")
    historical_chart = historical_chart.rename(columns={"Price_Atte": "Price"})
    
    forecast_chart = pd.DataFrame({
        "Date": future_dates.strftime("%Y-%m-%d"),
        "PredictedPrice": future_predictions
    })
    
    return {
        "today_price": today_price,
        "tomorrow_price": tomorrow_price,
        "historical_data": historical_chart.to_dict(orient="records"),
        "forecast_data": forecast_chart.to_dict(orient="records")
    }

def get_analytics():
    global _cached_analytics
    if _cached_analytics is not None:
        return _cached_analytics
        
    try:
        client = bigquery.Client()
        query = f"""
        SELECT 
            Variety,
            CAST(AVG(NULLIF(Price_Atte, 0)) AS INT64) as avg,
            CAST(MAX(Price_Atte) AS INT64) as max,
            CAST(MIN(NULLIF(Price_Atte, 0)) AS INT64) as min,
            STDDEV(Price_Atte) as stddev
        FROM `{client.project}.jasmineiq.master_training_data`
        GROUP BY Variety
        """
        df = client.query(query).to_dataframe()
        
        mallige_row = df[df['Variety'] == 'Mallige'].iloc[0] if not df[df['Variety'] == 'Mallige'].empty else None
        jaaji_row = df[df['Variety'] == 'Jaaji'].iloc[0] if not df[df['Variety'] == 'Jaaji'].empty else None
        
        return {
            "Mallige": {
                "avg": int(mallige_row['avg']) if mallige_row is not None else 0,
                "max": int(mallige_row['max']) if mallige_row is not None else 0,
                "min": int(mallige_row['min']) if mallige_row is not None else 0,
                "volatility": "High" if (mallige_row is not None and mallige_row['stddev'] > 100) else "Medium"
            },
            "Jaaji": {
                "avg": int(jaaji_row['avg']) if jaaji_row is not None else 0,
                "max": int(jaaji_row['max']) if jaaji_row is not None else 0,
                "min": int(jaaji_row['min']) if jaaji_row is not None else 0,
                "volatility": "High" if (jaaji_row is not None and jaaji_row['stddev'] > 100) else "Medium"
            }
        }
        _cached_analytics = result
        return result
    except Exception as e:
        print("BigQuery analytics query failed:", e)
        return {
            "Mallige": {"avg": 700, "max": 1200, "min": 300, "volatility": "High"},
            "Jaaji": {"avg": 350, "max": 600, "min": 200, "volatility": "Medium"}
        }
