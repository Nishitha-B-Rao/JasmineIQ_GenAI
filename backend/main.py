from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor
import joblib
import os
from model import get_forecast, get_analytics, load_and_preprocess_data
from recommendation import get_recommendation, get_real_weather
from gemini_agent import get_chat_response, ChatRequest
from scraper import get_live_price

ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    model_path = os.path.join(os.path.dirname(__file__), "models", "jasmine_model.pkl")
    if os.path.exists(model_path):
        print(f"Loading offline model from {model_path}")
        ml_models["forecast"] = joblib.load(model_path)
    else:
        print(f"Warning: Model not found at {model_path}. Run train_model.py first!")
        ml_models["forecast"] = None
    
    # Pre-warm caches at startup to avoid cold-start latency on first request
    print("Pre-warming BigQuery data cache...")
    try:
        load_and_preprocess_data()
        print("BigQuery data cache warmed successfully.")
    except Exception as e:
        print(f"BigQuery pre-warm failed (will retry on first request): {e}")
    
    print("Pre-warming weather cache...")
    try:
        get_real_weather()
        print("Weather cache warmed successfully.")
    except Exception as e:
        print(f"Weather pre-warm failed (will retry on first request): {e}")
    
    yield
    ml_models.clear()

app = FastAPI(title="JasmineIQ Backend", lifespan=lifespan)

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/dashboard")
def get_dashboard(variety: str = Query("Mallige"), today_price: int = Query(None)):
    if ml_models.get("forecast") is None:
        raise HTTPException(status_code=503, detail="Model not trained. Please run training pipeline.")
    
    # Run scraper and weather API calls in parallel to cut latency
    is_live = False
    weather_data = None
    
    if today_price is None:
        with ThreadPoolExecutor(max_workers=2) as executor:
            scraper_future = executor.submit(get_live_price, variety)
            weather_future = executor.submit(get_real_weather)
            
            scraped_price = scraper_future.result()
            weather_data = weather_future.result()
        
        if scraped_price is not None:
            today_price = scraped_price
            is_live = True
    else:
        is_live = True
        weather_data = get_real_weather()
             
    forecast = get_forecast(ml_models["forecast"], variety, today_price_override=today_price)
    today = forecast["today_price"]
    tomorrow = forecast["tomorrow_price"]
    
    rec = get_recommendation(today, tomorrow, variety, weather_data=weather_data, is_live=is_live)
    
    # Build 7-day forecast with best selling day
    forecast_data = forecast.get("forecast_data", [])
    best_day = None
    best_price = -1
    for day in forecast_data:
        if day["PredictedPrice"] > best_price:
            best_price = day["PredictedPrice"]
            best_day = day["Date"]
    
    # Generate today's insights
    insights = []
    if rec["weather"]["rain_probability"] > 50:
        insights.append("Rain expected — consider selling today to avoid quality loss")
    elif rec["weather"]["rain_probability"] < 30:
        insights.append("Clear weather ahead — ideal conditions for jasmine")
    
    if rec.get("festival_name"):
        days = rec.get("festival_demand", "Normal")
        insights.append(f"Festival demand is {days.lower()} ({rec['festival_name']})")
    
    price_diff = tomorrow - today
    if today > 0:
        pct = round((price_diff / today) * 100, 1)
        if pct > 0:
            insights.append(f"Predicted price +{pct}% tomorrow")
        elif pct < 0:
            insights.append(f"Predicted price {pct}% tomorrow")
    
    insights.append(f"Recommendation confidence: {rec['confidence']}%")
    
    if best_day:
        from datetime import datetime
        try:
            best_dt = datetime.strptime(best_day, "%Y-%m-%d")
            insights.append(f"Best selling day this week: {best_dt.strftime('%A')}")
        except Exception:
            insights.append(f"Best selling day: {best_day}")
    
    return {
        "variety": variety,
        "today_price": today if is_live else "XXX",
        "tomorrow_price": tomorrow,
        "recommendation": rec["recommendation"],
        "reason": rec["reason"],
        "reasoning_bullets": rec.get("reasoning_bullets", []),
        "confidence": rec["confidence"],
        "confidence_reason": rec["confidence_reason"],
        "confidence_factors": rec.get("confidence_factors", []),
        "festival_demand": rec["festival_demand"],
        "festival_name": rec.get("festival_name"),
        "expected_increase": rec["expected_increase"] if is_live else "XXX",
        "weather": rec["weather"],
        "market_trend": rec.get("market_trend", {}),
        "forecast_data": forecast_data,
        "best_selling_day": best_day,
        "best_selling_price": best_price,
        "insights": insights,
        "is_live": is_live
    }

@app.get("/api/forecast")
def get_forecast_api(variety: str = Query("Mallige")):
    if ml_models.get("forecast") is None:
        raise HTTPException(status_code=503, detail="Model not trained.")
        
    scraped_price = get_live_price(variety)
    return get_forecast(ml_models["forecast"], variety, today_price_override=scraped_price)

@app.get("/api/analytics")
def get_analytics_api():
    return get_analytics()

@app.get("/api/revenue")
def get_revenue(atte: int = Query(..., ge=1), variety: str = Query("Mallige"), today_price: int = Query(None)):
    if ml_models.get("forecast") is None:
        raise HTTPException(status_code=503, detail="Model not trained.")
        
    is_live = False
    if today_price is None:
        scraped_price = get_live_price(variety)
        if scraped_price is not None:
            today_price = scraped_price
            is_live = True
    else:
        is_live = True
             
    forecast = get_forecast(ml_models["forecast"], variety, today_price_override=today_price)
    today_price_val = forecast["today_price"]
    tomorrow_price = forecast["tomorrow_price"]
    
    today_revenue = today_price_val * atte
    tomorrow_revenue = tomorrow_price * atte
    profit_diff = tomorrow_revenue - today_revenue
    
    chendu = atte * 4
    flowers = atte * 2400
    
    return {
        "today_revenue": today_revenue if is_live else "XXX",
        "tomorrow_revenue": tomorrow_revenue,
        "profit_difference": profit_diff if is_live else "XXX",
        "equivalent_chendu": chendu,
        "equivalent_flowers": flowers
    }

@app.post("/api/chat")
def chat_with_gemini(request: ChatRequest):
    return get_chat_response(request, ml_models.get("forecast"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
