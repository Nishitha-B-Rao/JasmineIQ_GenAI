const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://jasmineiq-backend-586827445377.us-central1.run.app/api"

export async function fetchDashboard(variety: string = "Mallige", todayPrice?: number) {
  let url = `${API_BASE}/dashboard?variety=${variety}`
  if (todayPrice) url += `&today_price=${todayPrice}`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch dashboard")
  return res.json()
}

export async function fetchForecast(variety: string = "Mallige") {
  const res = await fetch(`${API_BASE}/forecast?variety=${variety}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch forecast")
  return res.json()
}

export async function fetchRevenue(atte: number, variety: string = "Mallige", todayPrice?: number) {
  let url = `${API_BASE}/revenue?atte=${atte}&variety=${variety}`
  if (todayPrice) url += `&today_price=${todayPrice}`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch revenue")
  return res.json()
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch analytics")
  return res.json()
}

export async function chatWithAssistant(message: string, context?: unknown, language: string = "en", mode: string = "market") {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context, language, mode }),
  })
  if (!res.ok) throw new Error("Failed to fetch chat")
  return res.json()
}
