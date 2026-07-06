"use client"

import { useState, useEffect } from "react"
import { fetchAnalytics } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, TrendingDown, TrendingUp, Activity, Leaf, AlertTriangle, MinusCircle, CheckCircle, BrainCircuit } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const comparisonData = data ? [
    { name: "Average", Mallige: data.Mallige.avg, Jaaji: data.Jaaji.avg },
    { name: "Highest", Mallige: data.Mallige.max, Jaaji: data.Jaaji.max },
    { name: "Lowest", Mallige: data.Mallige.min, Jaaji: data.Jaaji.min }
  ] : []

  const renderVolatilityIcon = (volatility: string) => {
    if (volatility === "High") return <AlertTriangle className="w-5 h-5 mr-1 text-red-600" />
    if (volatility === "Medium") return <MinusCircle className="w-5 h-5 mr-1 text-yellow-600" />
    return <CheckCircle className="w-5 h-5 mr-1 text-green-600" />
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center">
          <BarChart3 className="w-8 h-8 mr-2" /> BigQuery Market Analytics
        </h2>
        <p className="text-muted-foreground">Deep dive into historical trends and variety comparisons powered by Google BigQuery.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : data ? (
        <div className="space-y-8">
          
          {/* AI Insight Summary */}
          <Card className="border-2 border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center text-primary">
                <BrainCircuit className="w-5 h-5 mr-2" /> AI Market Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground font-medium leading-relaxed">
                Based on historical data from BigQuery, Udupi Mallige exhibits significantly higher price ceilings (up to ₹{data.Mallige.max}) compared to Jaaji. Both varieties show {data.Mallige.volatility.toLowerCase()} volatility during the current season. Our model anticipates continued price fluctuations driven by upcoming local temple festivals and shifting weather patterns.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Mallige Card */}
            <Card className="border-t-4 border-t-primary shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center text-primary">
                  <Leaf className="w-5 h-5 mr-2" /> Mallige Market Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <p className="text-xs text-muted-foreground flex items-center mb-1"><TrendingUp className="w-4 h-4 mr-1 text-green-500"/> Highest Historical</p>
                  <p className="text-2xl font-bold">₹{data.Mallige.max} <span className="text-sm font-normal text-muted-foreground">/ Atte</span></p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <p className="text-xs text-muted-foreground flex items-center mb-1"><TrendingDown className="w-4 h-4 mr-1 text-red-500"/> Lowest Historical</p>
                  <p className="text-2xl font-bold">₹{data.Mallige.min} <span className="text-sm font-normal text-muted-foreground">/ Atte</span></p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <p className="text-xs text-muted-foreground flex items-center mb-1">Historical Average</p>
                  <p className="text-2xl font-bold">₹{data.Mallige.avg} <span className="text-sm font-normal text-muted-foreground">/ Atte</span></p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <p className="text-xs text-muted-foreground flex items-center mb-1">Market Volatility</p>
                  <p className="text-xl font-bold flex items-center">
                    {renderVolatilityIcon(data.Mallige.volatility)} {data.Mallige.volatility}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Jaaji Card */}
            <Card className="border-t-4 border-t-secondary shadow-sm bg-gradient-to-br from-secondary/5 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center text-yellow-700">
                  <Leaf className="w-5 h-5 mr-2 text-yellow-600" /> Jaaji Market Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-card rounded-lg border shadow-sm">
                  <p className="text-xs text-muted-foreground flex items-center mb-1"><TrendingUp className="w-4 h-4 mr-1 text-green-500"/> Highest Historical</p>
                  <p className="text-2xl font-bold">₹{data.Jaaji.max} <span className="text-sm font-normal text-muted-foreground">/ Atte</span></p>
                </div>
                <div className="p-4 bg-card rounded-lg border shadow-sm">
                  <p className="text-xs text-muted-foreground flex items-center mb-1"><TrendingDown className="w-4 h-4 mr-1 text-red-500"/> Lowest Historical</p>
                  <p className="text-2xl font-bold">₹{data.Jaaji.min} <span className="text-sm font-normal text-muted-foreground">/ Atte</span></p>
                </div>
                <div className="p-4 bg-card rounded-lg border shadow-sm">
                  <p className="text-xs text-muted-foreground flex items-center mb-1">Historical Average</p>
                  <p className="text-2xl font-bold">₹{data.Jaaji.avg} <span className="text-sm font-normal text-muted-foreground">/ Atte</span></p>
                </div>
                <div className="p-4 bg-card rounded-lg border shadow-sm">
                  <p className="text-xs text-muted-foreground flex items-center mb-1">Market Volatility</p>
                  <p className="text-xl font-bold flex items-center">
                    {renderVolatilityIcon(data.Jaaji.volatility)} {data.Jaaji.volatility}
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

          <Card className="shadow-md border-muted">
            <CardHeader>
              <CardTitle>Mallige vs Jaaji Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
                    <YAxis />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: "8px" }} />
                    <Legend />
                    <Bar dataKey="Mallige" fill="#166534" radius={[4, 4, 0, 0]} barSize={60} />
                    <Bar dataKey="Jaaji" fill="#fef08a" radius={[4, 4, 0, 0]} barSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-destructive">Failed to load analytics data.</div>
      )}
    </div>
  )
}
