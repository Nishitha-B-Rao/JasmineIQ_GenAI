from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import joblib
import os
from model import get_forecast, get_analytics
from recommendation import get_recommendation
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
    
    is_live = False
    if today_price is None:
        scraped_price = get_live_price(variety)
        if scraped_price is not None:
            today_price = scraped_price
            is_live = True
    else:
        is_live = True
            
    forecast = get_forecast(ml_models["forecast"], variety, today_price_override=today_price)
    today = forecast["today_price"]
    tomorrow = forecast["tomorrow_price"]
    
    rec = get_recommendation(today, tomorrow, variety)
    
    return {
        "variety": variety,
        "today_price": today if is_live else "XXX",
        "tomorrow_price": tomorrow,
        "recommendation": rec["recommendation"],
        "reason": rec["reason"],
        "reasoning_bullets": rec.get("reasoning_bullets", []),
        "confidence": rec["confidence"],
        "confidence_reason": rec["confidence_reason"],
        "festival_demand": rec["festival_demand"],
        "expected_increase": rec["expected_increase"] if is_live else "XXX",
        "weather": rec["weather"]
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
def get_revenue(atte: int, variety: str = Query("Mallige"), today_price: int = Query(None)):
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
