// Translation dictionary for English and Kannada

export type Locale = "en" | "kn"

const translations: Record<string, Record<Locale, string>> = {
  // Sidebar
  "nav.dashboard": { en: "Dashboard", kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" },
  "nav.forecast": { en: "Forecast", kn: "ಮುನ್ಸೂಚನೆ" },
  "nav.revenue": { en: "Revenue Calculator", kn: "ಆದಾಯ ಲೆಕ್ಕಾಚಾರ" },
  "nav.assistant": { en: "AI Assistant", kn: "AI ಸಹಾಯಕ" },
  "nav.analytics": { en: "Analytics", kn: "ವಿಶ್ಲೇಷಣೆ" },
  "nav.sustainability": { en: "Sustainable Farming", kn: "ಸುಸ್ಥಿರ ಕೃಷಿ" },
  "nav.footer": { en: "Built using Google Cloud + Gemini", kn: "Google Cloud + Gemini ಬಳಸಿ ನಿರ್ಮಿಸಲಾಗಿದೆ" },

  // Dashboard
  "dashboard.title": { en: "AI Decision Center", kn: "AI ನಿರ್ಧಾರ ಕೇಂದ್ರ" },
  "dashboard.subtitle": { en: "Intelligent market recommendations for Udupi Jasmine cultivators.", kn: "ಉಡುಪಿ ಮಲ್ಲಿಗೆ ಬೆಳೆಗಾರರಿಗೆ ಬುದ್ಧಿವಂತ ಮಾರುಕಟ್ಟೆ ಶಿಫಾರಸುಗಳು." },
  "dashboard.note": { en: "* Note: The price shown is for the cultivator. Actual market price might vary.", kn: "* ಸೂಚನೆ: ತೋರಿಸಿದ ಬೆಲೆ ಬೆಳೆಗಾರರಿಗಾಗಿ. ನಿಜವಾದ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಬೇರೆಯಾಗಬಹುದು." },
  "dashboard.smart_alert": { en: "Smart Alert", kn: "ಸ್ಮಾರ್ಟ್ ಎಚ್ಚರಿಕೆ" },

  // Recommendation
  "rec.wait": { en: "WAIT", kn: "ನಿಲ್ಲಿ" },
  "rec.sell": { en: "SELL TODAY", kn: "ಇಂದೇ ಮಾರಿ" },
  "rec.wait_full": { en: "🟢 WAIT", kn: "🟢 ನಿಲ್ಲಿ" },
  "rec.sell_full": { en: "🔴 SELL TODAY", kn: "🔴 ಇಂದೇ ಮಾರಿ" },
  "rec.profit_diff": { en: "Expected Profit Difference", kn: "ನಿರೀಕ್ಷಿತ ಲಾಭ ವ್ಯತ್ಯಾಸ" },
  "rec.tomorrow_rate": { en: "Tomorrow's Predicted Rate", kn: "ನಾಳಿನ ಅಂದಾಜು ದರ" },
  "rec.per_atte": { en: "per Atte", kn: "ಪ್ರತಿ ಅತ್ತೆಗೆ" },
  "rec.confidence": { en: "Model Confidence", kn: "ಮಾಡೆಲ್ ವಿಶ್ವಾಸ" },
  "rec.why_trust": { en: "Why should I trust this?", kn: "ಇದನ್ನು ಏಕೆ ನಂಬಬೇಕು?" },
  "rec.reason": { en: "Reason", kn: "ಕಾರಣ" },
  "rec.high_demand": { en: "High demand expected tomorrow. Waiting is highly recommended.", kn: "ನಾಳೆ ಹೆಚ್ಚಿನ ಬೇಡಿಕೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ. ಕಾಯುವುದು ಹೆಚ್ಚು ಶಿಫಾರಸು." },
  "rec.price_decline": { en: "Prices expected to decline significantly tomorrow. Secure your revenue today.", kn: "ನಾಳೆ ಬೆಲೆಗಳು ಗಣನೀಯವಾಗಿ ಕುಸಿಯುವ ನಿರೀಕ್ಷೆ. ಇಂದೇ ಆದಾಯ ಭದ್ರಪಡಿಸಿ." },

  // Price cards
  "price.today_live": { en: "Today's Live Rate", kn: "ಇಂದಿನ ನೇರ ದರ" },
  "price.tomorrow_predicted": { en: "Tomorrow's Predicted Rate", kn: "ನಾಳಿನ ಅಂದಾಜು ದರ" },

  // Weather
  "weather.summary": { en: "Weather Summary", kn: "ಹವಾಮಾನ ಸಾರಾಂಶ" },
  "weather.temp": { en: "Temp", kn: "ಉಷ್ಣಾಂಶ" },
  "weather.rain": { en: "Rain Prob", kn: "ಮಳೆ ಸಾಧ್ಯತೆ" },
  "weather.humidity": { en: "Humidity", kn: "ಆರ್ದ್ರತೆ" },
  "weather.impact": { en: "Weather Impact", kn: "ಹವಾಮಾನ ಪರಿಣಾಮ" },
  "weather.price_impact": { en: "Expected Price Impact", kn: "ನಿರೀಕ್ಷಿತ ಬೆಲೆ ಪರಿಣಾಮ" },

  // Decision factors
  "factors.price_trend": { en: "Price Trend", kn: "ಬೆಲೆ ಪ್ರವೃತ್ತಿ" },
  "factors.weather": { en: "Weather", kn: "ಹವಾಮಾನ" },
  "factors.festival": { en: "Festival Demand", kn: "ಹಬ್ಬದ ಬೇಡಿಕೆ" },
  "factors.ai_confidence": { en: "AI Confidence", kn: "AI ವಿಶ್ವಾಸ" },
  "factors.positive": { en: "Positive", kn: "ಸಕಾರಾತ್ಮಕ" },
  "factors.negative": { en: "Negative", kn: "ನಕಾರಾತ್ಮಕ" },
  "factors.stable": { en: "Stable", kn: "ಸ್ಥಿರ" },
  "factors.favorable": { en: "Favorable", kn: "ಅನುಕೂಲಕರ" },
  "factors.uncertain": { en: "Uncertain", kn: "ಅನಿಶ್ಚಿತ" },

  // Market trend
  "trend.title": { en: "Market Trend", kn: "ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿ" },
  "trend.bullish": { en: "Bullish", kn: "ತೇಜಿ" },
  "trend.stable": { en: "Stable", kn: "ಸ್ಥಿರ" },
  "trend.bearish": { en: "Bearish", kn: "ಮಂದಗತಿ" },
  "trend.slightly_bullish": { en: "Slightly Bullish", kn: "ಸ್ವಲ್ಪ ತೇಜಿ" },
  "trend.expected_increase": { en: "Expected Increase", kn: "ನಿರೀಕ್ಷಿತ ಹೆಚ್ಚಳ" },
  "trend.expected_decrease": { en: "Expected Decrease", kn: "ನಿರೀಕ್ಷಿತ ಕುಸಿತ" },

  // Insights
  "insights.title": { en: "Today's Insights", kn: "ಇಂದಿನ ಒಳನೋಟಗಳು" },

  // 7-day forecast
  "forecast.title": { en: "7-Day Price Projection", kn: "7-ದಿನ ಬೆಲೆ ಮುನ್ಸೂಚನೆ" },
  "forecast.day": { en: "Day", kn: "ದಿನ" },
  "forecast.date": { en: "Date", kn: "ದಿನಾಂಕ" },
  "forecast.price": { en: "Predicted Price", kn: "ಅಂದಾಜು ಬೆಲೆ" },
  "forecast.best_day": { en: "Best Selling Day", kn: "ಅತ್ಯುತ್ತಮ ಮಾರಾಟ ದಿನ" },
  "forecast.page_title": { en: "Price Forecast", kn: "ಬೆಲೆ ಮುನ್ಸೂಚನೆ" },
  "forecast.page_subtitle": { en: "XGBoost-powered 7-day price predictions for Udupi Jasmine.", kn: "ಉಡುಪಿ ಮಲ್ಲಿಗೆಗೆ XGBoost ಆಧಾರಿತ 7-ದಿನ ಬೆಲೆ ಮುನ್ಸೂಚನೆ." },

  // Revenue
  "revenue.title": { en: "Revenue Calculator", kn: "ಆದಾಯ ಲೆಕ್ಕಾಚಾರ" },
  "revenue.subtitle": { en: "Calculate your projected flower revenue based on quantity.", kn: "ಪ್ರಮಾಣವನ್ನು ಆಧರಿಸಿ ನಿಮ್ಮ ಹೂವಿನ ಆದಾಯವನ್ನು ಲೆಕ್ಕ ಹಾಕಿ." },
  "revenue.enter_atte": { en: "Enter Atte Quantity", kn: "ಅತ್ತೆ ಪ್ರಮಾಣ ನಮೂದಿಸಿ" },
  "revenue.calculate": { en: "Calculate", kn: "ಲೆಕ್ಕ ಹಾಕಿ" },
  "revenue.today": { en: "Today's Revenue", kn: "ಇಂದಿನ ಆದಾಯ" },
  "revenue.tomorrow": { en: "Tomorrow's Revenue", kn: "ನಾಳಿನ ಆದಾಯ" },
  "revenue.difference": { en: "Profit Difference", kn: "ಲಾಭ ವ್ಯತ್ಯಾಸ" },
  "revenue.equivalent": { en: "Equivalent", kn: "ಸಮಾನ" },
  "revenue.chendu": { en: "Chendu", kn: "ಚೆಂಡು" },
  "revenue.flowers": { en: "Flowers", kn: "ಹೂವುಗಳು" },

  // Analytics
  "analytics.title": { en: "Market Analytics", kn: "ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ" },
  "analytics.subtitle": { en: "Historical price statistics powered by BigQuery.", kn: "BigQuery ಆಧಾರಿತ ಐತಿಹಾಸಿಕ ಬೆಲೆ ಅಂಕಿಅಂಶಗಳು." },
  "analytics.avg": { en: "Average Price", kn: "ಸರಾಸರಿ ಬೆಲೆ" },
  "analytics.max": { en: "Highest Price", kn: "ಅತಿ ಹೆಚ್ಚು ಬೆಲೆ" },
  "analytics.min": { en: "Lowest Price", kn: "ಅತಿ ಕಡಿಮೆ ಬೆಲೆ" },
  "analytics.volatility": { en: "Volatility", kn: "ಏರಿಳಿತ" },

  // AI Assistant
  "assistant.title": { en: "AI Farmer Assistant", kn: "AI ರೈತ ಸಹಾಯಕ" },
  "assistant.subtitle": { en: "Ask questions about market trends, recommendations, and pricing.", kn: "ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿ, ಶಿಫಾರಸು ಮತ್ತು ಬೆಲೆ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ." },
  "assistant.greeting": { en: "Namaskara! I am your JasmineIQ Farmer Assistant. How can I help you maximize your flower revenue today?", kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ JasmineIQ ರೈತ ಸಹಾಯಕ. ಇಂದು ನಿಮ್ಮ ಹೂವಿನ ಆದಾಯವನ್ನು ಹೆಚ್ಚಿಸಲು ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?" },
  "assistant.placeholder": { en: "Type your question here...", kn: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..." },
  "assistant.error": { en: "Sorry, I am having trouble connecting to the network right now.", kn: "ಕ್ಷಮಿಸಿ, ಸಧ್ಯ ನೆಟ್‌ವರ್ಕ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ತೊಂದರೆಯಾಗುತ್ತಿದೆ." },

  // Quick actions
  "quick.why_wait": { en: "Why should I wait?", kn: "ನಾನು ಏಕೆ ಕಾಯಬೇಕು?" },
  "quick.sell_today": { en: "Should I sell today?", kn: "ಇಂದು ಮಾರಬೇಕೇ?" },
  "quick.weather": { en: "Weather impact on prices?", kn: "ಹವಾಮಾನ ಬೆಲೆ ಮೇಲೆ ಪರಿಣಾಮ?" },
  "quick.trend": { en: "Market trend this week?", kn: "ಈ ವಾರದ ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿ?" },
  "quick.festival": { en: "Festival effect on prices?", kn: "ಹಬ್ಬದ ಬೆಲೆ ಪರಿಣಾಮ?" },
  "quick.compost": { en: "How to make compost?", kn: "ಗೊಬ್ಬರ ಹೇಗೆ ತಯಾರಿಸುವುದು?" },
  "quick.earn_tomorrow": { en: "How much can I earn tomorrow?", kn: "ನಾಳೆ ಎಷ್ಟು ಗಳಿಸಬಹುದು?" },
  "quick.explain_rec": { en: "Explain today's recommendation.", kn: "ಇಂದಿನ ಶಿಫಾರಸನ್ನು ವಿವರಿಸಿ." },

  // Sustainability
  "sustain.title": { en: "Sustainable Farming", kn: "ಸುಸ್ಥಿರ ಕೃಷಿ" },
  "sustain.subtitle": { en: "Turn unsold jasmine into value. Learn composting, organic practices, and sustainability tips.", kn: "ಮಾರಾಟವಾಗದ ಮಲ್ಲಿಗೆಯನ್ನು ಮೌಲ್ಯವಾಗಿ ಪರಿವರ್ತಿಸಿ. ಕಾಂಪೋಸ್ಟ್, ಸಾವಯವ ಅಭ್ಯಾಸಗಳು ಮತ್ತು ಸುಸ್ಥಿರ ಸಲಹೆಗಳನ್ನು ಕಲಿಯಿರಿ." },
  "sustain.compost_title": { en: "Jasmine Composting", kn: "ಮಲ್ಲಿಗೆ ಕಾಂಪೋಸ್ಟ್" },
  "sustain.compost_desc": { en: "Convert unsold or wilted jasmine flowers into nutrient-rich compost for your garden.", kn: "ಮಾರಾಟವಾಗದ ಅಥವಾ ಬಾಡಿದ ಮಲ್ಲಿಗೆ ಹೂವುಗಳನ್ನು ಪೋಷಕಾಂಶಭರಿತ ಗೊಬ್ಬರವಾಗಿ ಪರಿವರ್ತಿಸಿ.",},
  "sustain.organic_title": { en: "Organic Farming", kn: "ಸಾವಯವ ಕೃಷಿ" },
  "sustain.organic_desc": { en: "Chemical-free cultivation techniques that improve soil health and flower quality.", kn: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಮತ್ತು ಹೂವಿನ ಗುಣಮಟ್ಟವನ್ನು ಸುಧಾರಿಸುವ ರಾಸಾಯನಿಕ-ಮುಕ್ತ ಕೃಷಿ ತಂತ್ರಗಳು." },
  "sustain.waste_title": { en: "Waste Recycling", kn: "ತ್ಯಾಜ್ಯ ಮರುಬಳಕೆ" },
  "sustain.waste_desc": { en: "Transform flower waste into natural dyes, incense, and essential oils.", kn: "ಹೂವಿನ ತ್ಯಾಜ್ಯವನ್ನು ನೈಸರ್ಗಿಕ ಬಣ್ಣ, ಧೂಪ ಮತ್ತು ಅಗತ್ಯ ತೈಲಗಳಾಗಿ ಪರಿವರ್ತಿಸಿ." },
  "sustain.ask_ai": { en: "Ask AI about sustainability", kn: "ಸುಸ್ಥಿರತೆ ಬಗ್ಗೆ AI ಗೆ ಕೇಳಿ" },

  // Common
  "common.loading": { en: "Loading...", kn: "ಲೋಡ್ ಆಗುತ್ತಿದೆ..." },
  "common.error": { en: "Failed to load data. Ensure backend is running.", kn: "ಡೇಟಾ ಲೋಡ್ ಆಗಲಿಲ್ಲ. ಬ್ಯಾಕೆಂಡ್ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಖಚಿತಪಡಿಸಿ." },
  "common.retry": { en: "Retry", kn: "ಮರುಪ್ರಯತ್ನಿಸಿ" },
  "common.timeout": { en: "Request timed out. The server might be waking up — please retry.", kn: "ವಿನಂತಿ ಸಮಯ ಮೀರಿದೆ. ಸರ್ವರ್ ಪ್ರಾರಂಭವಾಗುತ್ತಿರಬಹುದು — ದಯವಿಟ್ಟು ಮರುಪ್ರಯತ್ನಿಸಿ." },
  "common.live": { en: "LIVE", kn: "ನೇರ" },
  "common.estimated": { en: "ESTIMATED", kn: "ಅಂದಾಜು" },
}

export function getTranslation(key: string, locale: Locale): string {
  return translations[key]?.[locale] || translations[key]?.en || key
}

export const LOCALES: { code: Locale; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
]
