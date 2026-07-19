"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/lib/LanguageContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Minus, CloudRain, ThermometerSun, Wind, AlertCircle, Sun, CheckCircle2, Activity, BrainCircuit, Info, Calendar } from "lucide-react"

export default function Dashboard() {
  const { t, locale } = useLanguage()
  const [variety, setVariety] = useState("Mallige")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(() => {
    let isActive = true
    setLoading(true)
    setError(null)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      if (isActive) controller.abort()
    }, 15000)
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://jasmineiq-backend-586827445377.us-central1.run.app/api"}/dashboard?variety=${variety}`, {
      cache: "no-store",
      signal: controller.signal
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch dashboard")
        return res.json()
      })
      .then(data => {
        if (isActive) setData(data)
      })
      .catch(err => {
        if (!isActive) return // Ignore errors if component unmounted
        if (err.name === 'AbortError') {
          setError(t("common.timeout"))
        } else {
          setError(t("common.error"))
        }
        console.error(err)
      })
      .finally(() => {
        clearTimeout(timeoutId)
        if (isActive) setLoading(false)
      })

    return () => {
      isActive = false
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [variety, t])

  useEffect(() => {
    const cleanup = loadDashboard()
    return cleanup
  }, [loadDashboard])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">{t("dashboard.title")}</h2>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
          <p className="text-xs text-muted-foreground italic mt-1">{t("dashboard.note")}</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            className="bg-card border border-input text-card-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 shadow-sm"
            value={variety}
            onChange={(e) => setVariety(e.target.value)}
          >
            <option value="Mallige">Mallige</option>
            <option value="Jaaji">Jaaji</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-56 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          
          {/* Smart Alert */}
          {Math.abs(data.expected_increase) > 50 && (
            <Card className="border-2 border-yellow-500 bg-yellow-500/10 mb-6 animate-in fade-in zoom-in-95 duration-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center text-yellow-700">
                  <AlertCircle className="w-5 h-5 mr-2" /> ⚠ {t("dashboard.smart_alert")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-800 font-medium">
                  {data.expected_increase > 0 ? t("rec.high_demand") : t("rec.price_decline")}
                </p>
                <div className="mt-2 text-2xl font-black text-yellow-900">
                  Potential {data.expected_increase > 0 ? "Profit Increase" : "Loss if delayed"}: ₹{Math.abs(data.expected_increase)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendation Card */}
          <Card className={`border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both ${data.recommendation === 'WAIT' ? 'border-primary bg-primary/5' : 'border-destructive bg-destructive/5'}`}>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="flex items-center text-3xl font-bold justify-center md:justify-start">
                {data.recommendation === 'WAIT' ? <TrendingUp className="w-8 h-8 mr-3 text-primary"/> : <AlertCircle className="w-8 h-8 mr-3 text-destructive"/>}
                <span className={`font-black ${data.recommendation === 'WAIT' ? 'text-primary' : 'text-destructive'}`}>
                  {data.recommendation === 'WAIT' ? t("rec.wait_full") : t("rec.sell_full")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Side: Core Numbers */}
                <div className="flex flex-col justify-center space-y-6">
                  <div className="text-center md:text-left">
                    <p className="text-sm font-medium text-muted-foreground mb-1">{t("rec.profit_diff")}</p>
                    <p className={`text-5xl font-black ${data.expected_increase >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {data.expected_increase >= 0 ? "+" : ""}₹{data.expected_increase}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">{t("rec.tomorrow_rate")}: <span className="font-bold text-foreground">₹{data.tomorrow_price}</span> / {t("rec.per_atte")}</p>
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-foreground flex items-center"><BrainCircuit className="w-4 h-4 mr-2 text-primary" /> {t("rec.confidence")}</span>
                      <span className="text-sm font-bold text-primary">{data.confidence}%</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${data.confidence > 85 ? 'bg-primary' : (data.confidence > 70 ? 'bg-yellow-500' : 'bg-red-500')}`} style={{ width: `${data.confidence}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Confidence Factors Checklist */}
                <div className="bg-background p-5 rounded-lg border shadow-sm">
                  <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center">
                    {t("rec.why_trust")}
                  </h3>
                  <ul className="space-y-3">
                    {data.confidence_factors && data.confidence_factors.map((factor: any, idx: number) => (
                      <li key={idx} className="flex items-start text-sm">
                        {factor.status === 'pass' && <CheckCircle2 className="w-5 h-5 mr-3 text-green-500 shrink-0 mt-0.5" />}
                        {factor.status === 'warn' && <AlertCircle className="w-5 h-5 mr-3 text-yellow-500 shrink-0 mt-0.5" />}
                        {factor.status === 'fail' && <AlertCircle className="w-5 h-5 mr-3 text-red-500 shrink-0 mt-0.5" />}
                        {factor.status === 'neutral' && <Minus className="w-5 h-5 mr-3 text-gray-400 shrink-0 mt-0.5" />}
                        <div>
                          <span className="font-semibold">{t(`factors.${factor.name.toLowerCase().replace(' ', '_')}`) || factor.name}: </span>
                          <span className="text-muted-foreground">{factor.detail}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Core Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                  {t("price.today_live")}
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">{data.is_live ? t("common.live") : t("common.estimated")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">₹{data.today_price}</div>
                <p className="text-sm text-muted-foreground mt-1">{t("rec.per_atte")}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/30 to-transparent border-secondary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                  {t("price.tomorrow_predicted")}
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">{t("common.estimated")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">₹{data.tomorrow_price}</div>
                <p className="text-sm text-muted-foreground mt-1">{t("rec.per_atte")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Intelligence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
            {/* Market Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Activity className="w-4 h-4 mr-2" /> {t("trend.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    data.market_trend?.direction === 'bullish' ? 'bg-green-100 text-green-800' :
                    data.market_trend?.direction === 'bearish' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {data.market_trend?.direction === 'bullish' ? '🟢' : data.market_trend?.direction === 'bearish' ? '🔴' : '🟡'} {data.market_trend?.label}
                  </span>
                </div>
                <div className="mt-3 text-2xl font-bold">
                  {data.market_trend?.change_percent > 0 ? '+' : ''}{data.market_trend?.change_percent}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Expected change</p>
              </CardContent>
            </Card>

            {/* Weather Impact */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <CloudRain className="w-4 h-4 mr-2" /> {t("weather.impact")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{data.weather.price_impact}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{t("weather.price_impact")}</p>
                <p className="text-xs text-muted-foreground mt-2 border-t pt-2 line-clamp-2">
                  {data.weather.price_impact_reason}
                </p>
              </CardContent>
            </Card>

            {/* Today's Insights */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Info className="w-4 h-4 mr-2" /> {t("insights.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.insights?.slice(0, 3).map((insight: string, idx: number) => (
                    <li key={idx} className="flex items-start text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 mt-1.5 shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>


          
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <p className="text-destructive font-medium">{error || t("common.error")}</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            {t("common.retry")}
          </button>
        </div>
      )}
    </div>
  )
}
