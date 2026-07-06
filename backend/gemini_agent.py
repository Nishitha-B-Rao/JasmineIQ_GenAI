import os
from google import genai
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from model import get_analytics, get_forecast
from recommendation import get_recommendation
from scraper import get_live_price

load_dotenv()

# We expect GEMINI_API_KEY to be set in the environment. 
# For hackathon local dev, if it's not set, we'll return a mock response.

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

def get_chat_response(request: ChatRequest, model=None):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"reply": "API Key not configured. (Mock Reply) - This is a placeholder because GEMINI_API_KEY is not set. Your query was: " + request.message}
    
    try:
        client = genai.Client(api_key=api_key)
        
        context_str = ""
        if request.context:
            context_str = f"Current Session Context: {request.context}\n"
            
        try:
            analytics_data = get_analytics()
            context_str += f"\nBigQuery Market Analytics Data:\n{analytics_data}\n"
        except Exception:
            pass
            
        if model:
            try:
                # Add live dashboard data for today to context
                for variety in ["Mallige", "Jaaji"]:
                    today_price = get_live_price(variety)
                    is_live = today_price is not None
                    
                    forecast = get_forecast(model, variety, today_price_override=today_price)
                    rec = get_recommendation(forecast["today_price"], forecast["tomorrow_price"], variety)
                    context_str += f"\nToday's Dashboard Data for {variety}:\n"
                    
                    display_today = forecast['today_price'] if is_live else "Unavailable (Not yet updated for today)"
                    display_gain = rec['expected_increase'] if is_live else "Unavailable (Cannot calculate without today's price)"
                    
                    context_str += f"Live Price: {display_today} per Atte\n"
                    context_str += f"Predicted Price Tomorrow: {forecast['tomorrow_price']} per Atte\n"
                    context_str += f"Expected Gain: {display_gain}\n"
                    context_str += f"Weather: Temp {rec['weather']['temperature']}°C, Humidity {rec['weather']['humidity']}%, Rain Prob {rec['weather']['rain_probability']}%\n"
                    context_str += f"Recommendation: {rec['recommendation']}. {rec['reason']}\n"
            except Exception as e:
                print(f"Error fetching live dashboard data for context: {e}")
            
        system_prompt = (
            "You are an expert Agricultural Advisor for JasmineIQ, a Decision Intelligence Platform for Udupi Mallige and Jaaji cultivators. "
            "Farmers rely on you for intelligent, data-driven advice on whether to sell their harvest today or wait until tomorrow. "
            "You must explicitly use the provided context to justify your recommendations, quoting the specific Today's Live Price, Predicted Price, Expected Gain, Weather, Recommendation, and Market Analytics provided. "
            "Keep your responses concise, professional, and actionable, speaking directly to the farmer. "
            "CRITICAL: Do NOT use any markdown formatting, asterisks, or bold text in your response. Output plain text only. "
            "CRITICAL GUARDRAIL: If the user types gibberish (like 'asdfg'), single unrelated words (excluding common greetings like 'hi', 'hello', 'namaskara'), or asks about topics completely unrelated to agriculture or Jasmine prices, you MUST politely reply: 'I am sorry, I didn't quite catch that. How can I help you with your flower prices today?' Do not attempt to guess what they meant. "
            "Remember: 1 Atte = 4 Chendu = 2400 flowers. Prices are per Atte. Never use kilograms.\n\n"
            f"{context_str}"
        )
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[system_prompt, request.message]
        )
        
        return {"reply": response.text}
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return {"reply": "I am currently receiving too many requests. Please wait a moment and try again."}
        return {"reply": f"Error communicating with Gemini AI: {error_msg}"}
