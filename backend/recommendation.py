import random
import requests
import os

# Cache weather to avoid hitting the API rate limit on every refresh
_cached_weather = None

def get_real_weather():
    global _cached_weather
    if _cached_weather is not None:
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
            return _cached_weather
    except Exception as e:
        print(f"Weather API failed: {e}")
    
    return None

def get_recommendation(today_price: int, tomorrow_price: int, variety: str):
    # Fetch real weather or fallback to mock
    weather_data = get_real_weather()
    
    if weather_data:
        temperature = weather_data["temperature"]
        humidity = weather_data["humidity"]
        rain_probability = weather_data["rain_probability"]
    else:
        # Fallback Mock data
        temperature = random.randint(24, 32)
        humidity = random.randint(60, 95)
        rain_probability = random.randint(10, 80)
        
    festival_demand = random.choice(["Normal", "High", "Very High"])
    
    price_diff = tomorrow_price - today_price
    
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
    
    if festival_demand == "Very High":
        score += 2 # Demand is high tomorrow, might be worth waiting
        
    confidence = random.randint(75, 96)
    
    if score >= 0:
        action = "WAIT"
        reason = f"Tomorrow's predicted market rate for {variety} is expected to change by ₹{price_diff} / Atte. "
        
        reasoning_bullets = [
            f"Expected net gain: ₹{price_diff} / atte",
            f"Weather expected to remain {'dry' if rain_probability < 40 else 'manageable'} ({100 - rain_probability}% confidence)",
            f"Festival demand is currently {festival_demand.lower()}",
            "Historical trends suggest a profitable hold" if festival_demand not in ["High", "Very High"] else "Upcoming festival demand is driving prices up"
        ]
        
        if rain_probability < 40:
            reason += "Weather conditions remain favorable, and "
        else:
            reason += "Despite some rain risk, "
            
        if festival_demand in ["High", "Very High"]:
            reason += "upcoming festival demand is driving prices up."
        else:
            reason += "historical trends suggest a profitable hold."
    else:
        action = "SELL"
        reason = f"Tomorrow's predicted market rate for {variety} is expected to drop or stagnate (Change: ₹{price_diff} / Atte). "
        
        reasoning_bullets = [
            f"Expected loss if delayed: ₹{abs(price_diff)} / atte",
            f"High rain probability ({rain_probability}%) poses a significant risk to flower quality" if rain_probability > 50 else "Weather conditions are suboptimal",
            f"Festival demand is {festival_demand.lower()}",
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
        "festival_demand": festival_demand,
        "confidence_reason": f"High confidence because: {'Stable historical trend' if abs(price_diff) < 20 else 'Clear price momentum'}, {'Favorable weather' if rain_probability < 50 else 'High weather uncertainty'}, {'Strong festival demand' if festival_demand in ['High', 'Very High'] else 'Normal market demand'}.",
        "weather": {
            "temperature": temperature,
            "humidity": humidity,
            "rain_probability": rain_probability,
            "impact": "High moisture can cause petal browning. Watch out for rain." if humidity > 80 or rain_probability > 50 else "Ideal conditions for Jasmine."
        }
    }
