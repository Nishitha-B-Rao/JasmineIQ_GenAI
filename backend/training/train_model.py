import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from google.cloud import bigquery
import joblib
import os
import sys

# Add parent directory to path to import shared logic if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def prepare_data(df):
    """Shared preprocessing logic"""
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values(by=['Variety', 'Date']).reset_index(drop=True)
    
    # Ensure all required features are present
    if "Year" not in df.columns:
        df["Year"] = df["Date"].dt.year
    if "DayOfYear" not in df.columns:
        df["DayOfYear"] = df["Date"].dt.dayofyear
        
    # Overwrite DayOfWeek to ensure it is an integer 0-6 (not a string like "Monday")
    df["DayOfWeek"] = df["Date"].dt.dayofweek
        
    if "RollingStd7" not in df.columns:
        df['RollingStd7'] = df.groupby('Variety')['Price_Atte'].transform(lambda x: x.rolling(7, min_periods=1).std())
        
    df['Is_Mallige'] = (df['Variety'] == 'Mallige').astype(int)
    
    # Fill NAs
    df = df.bfill()
    
    return df

def train():
    print("Fetching training data from BigQuery...")
    try:
        client = bigquery.Client()
        query = f"SELECT * FROM `{client.project}.jasmineiq.master_training_data` ORDER BY Variety, Date"
        df = client.query(query).to_dataframe()
    except Exception as e:
        print("BigQuery query failed, checking for local csv...", e)
        csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "master_training_dataset.csv")
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
        else:
            print("Proprietary dataset not found. Generating synthetic dummy data for local testing...")
            dates = pd.date_range(start="2026-01-01", periods=100)
            import numpy as np
            df = pd.DataFrame({
                "Date": list(dates) * 2,
                "Variety": ["Mallige"]*100 + ["Jaaji"]*100,
                "Price_Atte": np.random.randint(400, 1200, 200),
                "Year": 2026, "Month": 1, "Day": 1, "DayOfWeek": 0, "DayOfYear": 1,
                "Lag_1": 750, "Lag_7": 750, "RollingMean7": 750, "RollingStd7": 20,
                "Is_Mallige": [1]*100 + [0]*100
            })
    
    print("Preprocessing data...")
    df = prepare_data(df)
    
    df_train = df[df['Price_Atte'] > 0]
    
    features = ["Year", "Month", "DayOfWeek", "DayOfYear", "Lag_1", "Lag_7", "RollingMean7", "RollingStd7", "Is_Mallige"]
    X = df_train[features]
    y = df_train['Price_Atte']
    
    # Train-Test Split (Hold out last 60 days for evaluation)
    test_size = 60
    X_train, X_test = X[:-test_size], X[-test_size:]
    y_train, y_test = y[:-test_size], y[-test_size:]
    
    print(f"Training XGBoost model on {len(X_train)} rows...")
    model = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate model
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    import numpy as np
    
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print("\n--- Model Evaluation (60-Day Holdout) ---")
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    print(f"R² Score: {r2:.4f}")
    print("------------------------------------------\n")
    
    # Retrain on ALL data before saving for production
    print("Retraining on all available data for production...")
    model.fit(X, y)
    
    model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, "jasmine_model.pkl")
    joblib.dump(model, model_path)
    print(f"Model successfully saved to {model_path}")

if __name__ == "__main__":
    train()
