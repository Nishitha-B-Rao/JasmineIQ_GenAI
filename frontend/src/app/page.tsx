"use client"

import { useState, useEffect } from "react"
import { fetchDashboard } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { TrendingUp, TrendingDown, Minus, CloudRain, ThermometerSun, Wind, AlertCircle, Sun, CheckCircle2, Activity, BrainCircuit } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function Dashboard() {
  const [variety, setVariety] = useState("Mallige")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchDashboard(variety)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [variety])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">AI Decision Center</h2>
          <p className="text-muted-foreground">Intelligent market recommendations for Udupi Jasmine cultivators.</p>
          <p className="text-xs text-muted-foreground italic mt-1">* Note: The price shown is for the cultivator. Actual market price might vary.</p>
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
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Smart Alert (Only visible for large price swings) */}
          {Math.abs(data.expected_increase) > 50 && (
            <Card className="border-2 border-yellow-500 bg-yellow-500/10 mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center text-yellow-700">
                  <AlertCircle className="w-5 h-5 mr-2" /> ⚠ Smart Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-800 font-medium">
                  {data.expected_increase > 0 
                    ? "High demand expected tomorrow. Waiting is highly recommended." 
                    : "Prices expected to decline significantly tomorrow. Secure your revenue today."}
                </p>
                <div className="mt-2 text-2xl font-black text-yellow-900">
                  Potential {data.expected_increase > 0 ? "Profit Increase" : "Loss if delayed"}: ₹{Math.abs(data.expected_increase)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendation Card At the Top */}
          <Card className={`border-2 shadow-lg ${data.recommendation === 'WAIT' ? 'border-primary bg-primary/5' : 'border-destructive bg-destructive/5'}`}>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="flex items-center text-3xl font-bold justify-center md:justify-start">
                {data.recommendation === 'WAIT' ? <TrendingUp className="w-8 h-8 mr-3 text-primary"/> : <AlertCircle className="w-8 h-8 mr-3 text-destructive"/>}
                <span className={`font-black ${data.recommendation === 'WAIT' ? 'text-primary' : 'text-destructive'}`}>
                  {data.recommendation === 'WAIT' ? '🟢 WAIT' : '🔴 SELL TODAY'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Side: Core Numbers & Confidence */}
                <div className="flex flex-col justify-center space-y-6">
                  <div className="text-center md:text-left">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Expected Profit Difference</p>
                    <p className={`text-5xl font-black ${data.expected_increase >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {data.expected_increase >= 0 ? "+" : ""}₹{data.expected_increase}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">Tomorrow's Predicted Rate: <span className="font-bold text-foreground">₹{data.tomorrow_price}</span> / Atte</p>
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-foreground flex items-center"><BrainCircuit className="w-4 h-4 mr-2 text-primary" /> Model Confidence</span>
                      <span className="text-sm font-bold text-primary">{data.confidence}%</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${data.confidence > 85 ? 'bg-primary' : (data.confidence > 70 ? 'bg-yellow-500' : 'bg-red-500')}`} style={{ width: `${data.confidence}%` }}></div>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mt-3">
                      <span className="font-bold">Reason:</span> {data.confidence_reason}
                    </p>
                  </div>
                </div>

                {/* Right Side: Reasoning Checklist */}
                <div className="bg-background p-5 rounded-lg border shadow-sm">
                  <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center">
                    Why should I trust this?
                  </h3>
                  <ul className="space-y-3">
                    {data.reasoning_bullets && data.reasoning_bullets.length > 0 ? (
                      data.reasoning_bullets.map((bullet: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm">
                          <CheckCircle2 className="w-5 h-5 mr-3 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground font-medium leading-relaxed">{bullet}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start text-sm text-muted-foreground">
                        <AlertCircle className="w-5 h-5 mr-3 text-yellow-500 shrink-0 mt-0.5" />
                        <span>Analyzed from historical BigQuery data and real-time market trends.</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              
              {/* Decision Factors Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t">
                <div className="bg-background p-3 rounded-lg border text-center flex flex-col items-center justify-center">
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    {data.expected_increase > 0 ? <TrendingUp className="w-4 h-4 mr-1 text-green-500"/> : data.expected_increase < 0 ? <TrendingDown className="w-4 h-4 mr-1 text-red-500"/> : <Minus className="w-4 h-4 mr-1 text-gray-500"/>} Price Trend
                  </div>
                  <p className="font-bold text-sm">{data.expected_increase > 0 ? "Positive" : data.expected_increase < 0 ? "Negative" : "Stable"}</p>
                </div>
                <div className="bg-background p-3 rounded-lg border text-center flex flex-col items-center justify-center">
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    {data.weather.rain_probability < 50 ? <Sun className="w-4 h-4 mr-1 text-orange-500"/> : <CloudRain className="w-4 h-4 mr-1 text-blue-500"/>} Weather
                  </div>
                  <p className="font-bold text-sm">{data.weather.rain_probability < 50 ? "Favorable" : "Uncertain"}</p>
                </div>
                <div className="bg-background p-3 rounded-lg border text-center flex flex-col items-center justify-center">
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <Activity className="w-4 h-4 mr-1 text-purple-500"/> Festival Demand
                  </div>
                  <p className="font-bold text-sm">{data.festival_demand || "Normal"}</p>
                </div>
                <div className="bg-background p-3 rounded-lg border text-center flex flex-col justify-center items-center">
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <BrainCircuit className="w-4 h-4 mr-1 text-primary"/> AI Confidence
                  </div>
                  <p className="font-bold text-sm text-primary">{data.confidence}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Live Rate
                  <span className="block text-xs opacity-70 mt-0.5">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">₹{data.today_price}</div>
                <p className="text-sm text-muted-foreground mt-1">per Atte</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/30 to-transparent border-secondary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tomorrow's Predicted Rate
                  <span className="block text-xs opacity-70 mt-0.5">
                    {new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">₹{data.tomorrow_price}</div>
                <p className="text-sm text-muted-foreground mt-1">per Atte</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <CloudRain className="w-4 h-4 mr-2" /> Weather Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center h-full pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <ThermometerSun className="w-6 h-6 text-orange-500 mb-1"/> 
                    <span className="font-bold">{data.weather.temperature}°C</span>
                    <span className="text-xs text-muted-foreground mt-1">Temp</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CloudRain className="w-6 h-6 text-blue-500 mb-1"/> 
                    <span className="font-bold">{data.weather.rain_probability}%</span>
                    <span className="text-xs text-muted-foreground mt-1">Rain Prob</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Wind className="w-6 h-6 text-gray-500 mb-1"/> 
                    <span className="font-bold">{data.weather.humidity}%</span>
                    <span className="text-xs text-muted-foreground mt-1">Humidity</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center text-destructive">Failed to load data. Ensure backend is running.</div>
      )}
    </div>
  )
}
