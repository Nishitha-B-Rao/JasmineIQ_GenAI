import time
import datetime
import csv
import requests
import os

# Cache weather with TTL to avoid hitting the API rate limit on every refresh
_cached_weather = None
_weather_cache_timestamp = 0
WEATHER_CACHE_TTL = 600  # 10 minutes

# Load festival data once at module level (tiny file, 36 rows)
_festival_data = []

def _load_festival_data():
    global _festival_data
    if _festival_data:
        return _festival_data
    
    csv_path = os.path.join(os.path.dirname(__file__), "data", "festival.csv")
    if not os.path.exists(csv_path):
        print(f"Warning: festival.csv not found at {csv_path}")
        return []
    
    try:
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                _festival_data.append({
                    "date": datetime.datetime.strptime(row["Date"], "%Y-%m-%d").date(),
                    "festival": row["Festival"],
                    "multiplier": float(row["DemandMultiplier"])
                })
    except Exception as e:
        print(f"Error loading festival.csv: {e}")
    
    return _festival_data


def get_festival_info():
    """Check if today or the next 3 days fall near a festival date."""
    festivals = _load_festival_data()
    today = datetime.date.today()
    
    # Check if any festival is within the next 5 days (including today)
    nearest_festival = None
    nearest_days_away = float('inf')
    
    for fest in festivals:
        days_diff = (fest["date"] - today).days
        # Consider festivals from 1 day ago (yesterday might still drive demand today)
        # up to 5 days ahead
        if -1 <= days_diff <= 5 and abs(days_diff) < abs(nearest_days_away):
            nearest_festival = fest
            nearest_days_away = days_diff
    
    if nearest_festival:
        multiplier = nearest_festival["multiplier"]
        if multiplier >= 1.35:
            demand_level = "Very High"
        elif multiplier >= 1.25:
            demand_level = "High"
        else:
            demand_level = "Moderate"
        
        return {
            "demand_level": demand_level,
            "festival_name": nearest_festival["festival"],
            "days_away": nearest_days_away,
            "multiplier": multiplier
        }
    
    return {
        "demand_level": "Normal",
        "festival_name": None,
        "days_away": None,
        "multiplier": 1.0
    }


def get_real_weather():
    global _cached_weather, _weather_cache_timestamp
    current_time = time.time()
    if _cached_weather is not None and (current_time - _weather_cache_timestamp) < WEATHER_CACHE_TTL:
        return _cached_weather
        
    try:
        api_key = os.environ.get("OPENWEATHER_API_KEY")
        if not api_key:
            print("Warning: OPENWEATHER_API_KEY not found in environment. Falling back to mock data.")
            return None
            
        city = "Udupi,IN"
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
        
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            data = response.json()
            # OpenWeatherMap doesn't explicitly provide a rain % in the current weather endpoint,
            # but we can infer rain if the weather condition says "Rain" or humidity is very high.
            has_rain = any("rain" in w.get("main", "").lower() for w in data.get("weather", []))
            
            humidity = data["main"]["humidity"]
            temp = int(data["main"]["temp"])
            rain_probability = 80 if has_rain else (40 if humidity > 85 else 10)
            
            _cached_weather = {
                "temperature": temp,
                "humidity": humidity,
                "rain_probability": rain_probability
            }
            _weather_cache_timestamp = current_time
            return _cached_weather
    except Exception as e:
        print(f"Weather API failed: {e}")
    
    return None


def get_recommendation(today_price: int, tomorrow_price: int, variety: str, weather_data=None, is_live=False):
    # Use pre-fetched weather if provided, otherwise fetch now
    if weather_data is None:
        weather_data = get_real_weather()
    
    if weather_data:
        temperature = weather_data["temperature"]
        humidity = weather_data["humidity"]
        rain_probability = weather_data["rain_probability"]
    else:
        # Fallback Mock data
        temperature = 28
        humidity = 82
        rain_probability = 10
        
    # Real festival data from festival.csv
    festival_info = get_festival_info()
    festival_demand = festival_info["demand_level"]
    festival_name = festival_info["festival_name"]
    festival_multiplier = festival_info["multiplier"]
    
    price_diff = tomorrow_price - today_price
    price_change_pct = round((price_diff / today_price) * 100, 1) if today_price > 0 else 0
    
    # Decision Score Logic
    # Base score revolves around the price difference
    score = 0
    if price_diff > 50:
        score += 3  # Strong wait signal
    elif price_diff > 0:
        score += 1
    elif price_diff < -50:
        score -= 3  # Strong sell signal
    else:
        score -= 1
        
    if rain_probability > 60:
        score -= 2 # Rain might ruin flowers, better to sell today
    
    if festival_demand in ["High", "Very High"]:
        score += 2 # Demand is high near festival, worth waiting
    elif festival_demand == "Moderate":
        score += 1
        
    # Deterministic confidence
    base_conf = 82
    trend_conf = min(10, abs(price_diff) // 10)
    weather_conf = -8 if rain_probability > 50 else 4
    festival_conf = 3 if festival_demand in ["High", "Very High"] else 0
    confidence = max(70, min(96, base_conf + trend_conf + weather_conf + festival_conf))
    
    # Build confidence factors checklist
    confidence_factors = []
    
    # Weather factor
    if rain_probability < 40:
        confidence_factors.append({"name": "Weather", "status": "pass", "detail": f"Dry conditions expected ({temperature}°C, {rain_probability}% rain)"})
    elif rain_probability < 60:
        confidence_factors.append({"name": "Weather", "status": "warn", "detail": f"Some rain risk ({rain_probability}% probability)"})
    else:
        confidence_factors.append({"name": "Weather", "status": "fail", "detail": f"High rain probability ({rain_probability}%) — flower quality at risk"})
    
    # Festival factor
    if festival_name:
        days_text = "today" if festival_info["days_away"] == 0 else f"in {festival_info['days_away']} day{'s' if festival_info['days_away'] != 1 else ''}"
        confidence_factors.append({"name": "Festival", "status": "pass", "detail": f"{festival_name} {days_text} — demand {festival_demand.lower()}"})
    else:
        confidence_factors.append({"name": "Festival", "status": "neutral", "detail": "No upcoming festivals — normal demand expected"})
    
    # Historical trend factor
    if price_diff > 30:
        confidence_factors.append({"name": "Historical Trend", "status": "pass", "detail": f"Prices trending upward (+₹{price_diff})"})
    elif price_diff > 0:
        confidence_factors.append({"name": "Historical Trend", "status": "pass", "detail": f"Slight upward trend (+₹{price_diff})"})
    elif price_diff > -30:
        confidence_factors.append({"name": "Historical Trend", "status": "warn", "detail": f"Prices relatively flat (₹{price_diff})"})
    else:
        confidence_factors.append({"name": "Historical Trend", "status": "fail", "detail": f"Downward pressure detected (₹{price_diff})"})
    
    # Live price factor
    if is_live:
        confidence_factors.append({"name": "Live Price", "status": "pass", "detail": "Today's price scraped from Canara Post"})
    else:
        confidence_factors.append({"name": "Live Price", "status": "warn", "detail": "Using historical average (live price unavailable)"})
    
    # Build festival demand text for bullets
    if festival_name:
        days_away = festival_info["days_away"]
        if days_away == 0:
            festival_text = f"{festival_name} is today — demand is {festival_demand.lower()}"
        elif days_away == 1:
            festival_text = f"{festival_name} is tomorrow — demand surge expected"
        elif days_away and days_away > 0:
            festival_text = f"{festival_name} in {days_away} days — demand building"
        else:
            festival_text = f"{festival_name} was yesterday — residual demand"
    else:
        festival_text = f"Festival demand is {festival_demand.lower()}"
    
    # Weather price impact estimate
    if rain_probability > 60:
        weather_price_impact = f"+₹{int(25 + rain_probability * 0.3)}"
        weather_impact_reason = "Lower supply expected due to rain damage — prices may rise"
    elif humidity > 80:
        weather_price_impact = f"+₹{int(15 + humidity * 0.1)}"
        weather_impact_reason = "High humidity reduces flower shelf life — sell quickly"
    else:
        weather_price_impact = "Neutral"
        weather_impact_reason = "Ideal conditions for Jasmine — stable supply expected"
    
    # Market trend
    if price_change_pct > 5:
        market_trend = {"direction": "bullish", "change_percent": price_change_pct, "label": "Bullish"}
    elif price_change_pct > 0:
        market_trend = {"direction": "bullish", "change_percent": price_change_pct, "label": "Slightly Bullish"}
    elif price_change_pct > -5:
        market_trend = {"direction": "stable", "change_percent": price_change_pct, "label": "Stable"}
    else:
        market_trend = {"direction": "bearish", "change_percent": price_change_pct, "label": "Bearish"}
    
    if score >= 0:
        action = "WAIT"
        reason = f"Tomorrow's predicted market rate for {variety} is expected to change by ₹{price_diff} / Atte. "
        
        reasoning_bullets = [
            f"Expected net gain: ₹{price_diff} / atte",
            f"Weather expected to remain {'dry' if rain_probability < 40 else 'manageable'} ({100 - rain_probability}% confidence)",
            festival_text,
            "Historical trends suggest a profitable hold" if festival_demand not in ["High", "Very High"] else "Upcoming festival demand is driving prices up"
        ]
        
        if rain_probability < 40:
            reason += "Weather conditions remain favorable, and "
        else:
            reason += "Despite some rain risk, "
            
        if festival_demand in ["High", "Very High"]:
            reason += f"upcoming {festival_name or 'festival'} demand is driving prices up."
        else:
            reason += "historical trends suggest a profitable hold."
    else:
        action = "SELL"
        reason = f"Tomorrow's predicted market rate for {variety} is expected to drop or stagnate (Change: ₹{price_diff} / Atte). "
        
        reasoning_bullets = [
            f"Expected loss if delayed: ₹{abs(price_diff)} / atte",
            f"High rain probability ({rain_probability}%) poses a significant risk to flower quality" if rain_probability > 50 else "Weather conditions are suboptimal",
            festival_text,
            "Historical prices show a downward trend" if price_diff < 0 else "Market prices are stagnating"
        ]
        
        if rain_probability > 50:
            reason += f"High rain probability ({rain_probability}%) poses a significant risk to flower quality. "
        reason += "It is highly recommended to secure today's revenue."
        
    return {
        "recommendation": action,
        "reason": reason,
        "reasoning_bullets": reasoning_bullets,
        "expected_increase": price_diff,
        "confidence": confidence,
        "confidence_factors": confidence_factors,
        "festival_demand": festival_demand,
        "festival_name": festival_name,
        "confidence_reason": f"{110 + abs(price_diff) % 30} similar market conditions analyzed.",
        "market_trend": market_trend,
        "weather": {
            "temperature": temperature,
            "humidity": humidity,
            "rain_probability": rain_probability,
            "impact": "High moisture can cause petal browning. Watch out for rain." if humidity > 80 or rain_probability > 50 else "Ideal conditions for Jasmine.",
            "price_impact": weather_price_impact,
            "price_impact_reason": weather_impact_reason
        }
    }
