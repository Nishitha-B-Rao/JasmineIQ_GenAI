"use client"

import { useState, useEffect } from "react"
import { fetchDashboard } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { TrendingUp, CloudRain, ThermometerSun, Wind, AlertCircle } from "lucide-react"
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
              <div className="flex flex-col items-center justify-center mb-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Expected Additional Income</p>
                <p className={`text-5xl font-black ${data.expected_increase >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {data.expected_increase >= 0 ? "+" : ""}₹{data.expected_increase}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Tomorrow's Predicted Rate: ₹{data.tomorrow_price} / Atte</p>
              </div>
              
              {/* Decision Factors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-background p-3 rounded-lg border text-center">
                  <p className="text-xs text-muted-foreground">Price Trend</p>
                  <p className="font-bold">{data.expected_increase > 0 ? "Positive" : data.expected_increase < 0 ? "Negative" : "Stable"}</p>
                </div>
                <div className="bg-background p-3 rounded-lg border text-center">
                  <p className="text-xs text-muted-foreground">Weather</p>
                  <p className="font-bold">{data.weather.rain_probability < 50 ? "Favorable" : "Uncertain"}</p>
                </div>
                <div className="bg-background p-3 rounded-lg border text-center">
                  <p className="text-xs text-muted-foreground">Festival Demand</p>
                  <p className="font-bold">{data.festival_demand || "Normal"}</p>
                </div>
                <div className="bg-background p-3 rounded-lg border text-center flex flex-col justify-center">
                  <p className="text-xs text-muted-foreground">AI Confidence</p>
                  <p className="font-bold text-primary">{data.confidence}%</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col bg-background p-4 rounded-lg border">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-bold text-foreground mr-3">Confidence: {data.confidence}%</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${data.confidence > 85 ? 'bg-primary' : 'bg-yellow-500'}`} style={{ width: `${data.confidence}%` }}></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  {data.confidence_reason || "Analyzed from historical BigQuery data and real-time market trends."}
                </p>
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
