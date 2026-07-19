"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/LanguageContext"
import { fetchForecast } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

const CustomDot = (props: any) => {
  const { cx, cy, index } = props;
  if (index === 0) {
    return (
      <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="#eab308" viewBox="0 0 1024 1024">
        <path d="M512 851.68l-265.856 161.472 68.608-301.632L79.04 496l308.288-26.688L512 192l124.672 277.312L944.96 496l-235.712 215.52 68.608 301.632z" />
      </svg>
    );
  }
  return <circle cx={cx} cy={cy} r={4} stroke="#eab308" strokeWidth={2} fill="white" />;
};

export default function ForecastPage() {
  const { t, locale } = useLanguage()
  const [variety, setVariety] = useState("Mallige")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchForecast(variety)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [variety])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">{t("forecast.page_title")}</h2>
          <p className="text-muted-foreground">{t("forecast.page_subtitle")}</p>
        </div>
        <select 
          className="bg-card border border-input text-card-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 shadow-sm"
          value={variety}
          onChange={(e) => setVariety(e.target.value)}
        >
          <option value="Mallige">Mallige</option>
          <option value="Jaaji">Jaaji</option>
        </select>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      ) : data ? (
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-6 bg-card p-3 rounded-xl border shadow-sm animate-in fade-in zoom-in-95 duration-500 delay-100 fill-mode-both">
            <div className="flex items-center text-sm font-bold text-muted-foreground">
              <span className="text-[#166534] mr-2 text-xl">●</span> Current Price (Historical)
            </div>
            <div className="flex items-center text-sm font-bold text-muted-foreground">
              <span className="text-yellow-500 mr-2 text-xl">★</span> Predicted Tomorrow (Forecast)
            </div>
          </div>

          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
            <CardHeader>
              <CardTitle>Historical Prices (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.historical_data}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#166534" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#166534" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis 
                      dataKey="Date" 
                      tick={{ fontSize: 12 }} 
                      tickFormatter={(val) => new Date(val).toLocaleDateString(locale === 'kn' ? 'kn-IN' : 'en-IN', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString(locale === 'kn' ? 'kn-IN' : 'en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    />
                    <Area type="monotone" dataKey="Price" stroke="#166534" fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/50 bg-secondary/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
            <CardHeader>
              <CardTitle>AI Prediction (Next 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.forecast_data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis 
                      dataKey="Date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(val) => new Date(val).toLocaleDateString(locale === 'kn' ? 'kn-IN' : 'en-IN', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "8px", border: "1px solid #fef08a" }} 
                      labelFormatter={(label) => new Date(label).toLocaleDateString(locale === 'kn' ? 'kn-IN' : 'en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    />
                    <Line type="monotone" dataKey="PredictedPrice" stroke="#eab308" strokeWidth={3} dot={<CustomDot />} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Projection Table */}
          {data.forecast_data && data.forecast_data.length > 0 && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {t("forecast.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">{t("forecast.date")}</th>
                        <th className="px-4 py-3">{t("forecast.price")}</th>
                        <th className="px-4 py-3 rounded-tr-lg">{t("dashboard.smart_alert")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.forecast_data.map((row: any, idx: number) => {
                        // Dynamically find best day if not provided
                        const bestDay = data.best_selling_day || data.forecast_data.reduce((max: any, obj: any) => obj.PredictedPrice > max.PredictedPrice ? obj : max, data.forecast_data[0]).Date;
                        const isBestDay = row.Date === bestDay
                        return (
                          <tr key={idx} className={`border-b last:border-0 ${isBestDay ? 'bg-primary/5' : ''}`}>
                            <td className="px-4 py-3 font-medium">
                              {new Date(row.Date).toLocaleDateString(locale === 'kn' ? 'kn-IN' : 'en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 font-bold">₹{row.PredictedPrice}</td>
                            <td className="px-4 py-3 text-xs">
                              {isBestDay && (
                                <span className="flex items-center text-primary font-bold">
                                  ⭐ {t("forecast.best_day")}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center text-destructive">{t("common.error")}</div>
      )}
    </div>
  )
}
