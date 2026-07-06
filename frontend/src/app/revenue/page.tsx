"use client"

import { useState, useEffect } from "react"
import { fetchRevenue } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calculator, ArrowRight, IndianRupee, Info } from "lucide-react"

export default function RevenueCalculator() {
  const [variety, setVariety] = useState("Mallige")
  const [atte, setAtte] = useState<string>("10")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCalculate = async () => {
    if (!atte || isNaN(Number(atte))) return
    
    setLoading(true)
    try {
      const res = await fetchRevenue(Number(atte), variety)
      setData(res)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleCalculate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variety])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Revenue Calculator</h2>
        <p className="text-muted-foreground">Calculate your potential earnings and profit difference.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Harvest Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Jasmine Variety</label>
              <select 
                className="mt-1 bg-card border border-input text-card-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 shadow-sm"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
              >
                <option value="Mallige">Mallige</option>
                <option value="Jaaji">Jaaji</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Harvest Quantity (Atte)</label>
              <Input 
                type="number" 
                value={atte} 
                onChange={(e) => setAtte(e.target.value)} 
                className="mt-1"
                min="1"
              />
            </div>

            <Button className="w-full" onClick={handleCalculate} disabled={loading}>
              <Calculator className="w-4 h-4 mr-2" />
              {loading ? "Calculating..." : "Calculate Revenue"}
            </Button>

            <div className="mt-4 p-3 bg-blue-50/50 text-blue-800 text-xs rounded-md border border-blue-100 flex items-start">
              <Info className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-blue-500" />
              <div>
                <strong>Measurement Guide:</strong>
                <p className="mt-1">1 Atte = 4 Chendu = 2,400 flowers.</p>
                <p>Prices are calculated per Atte.</p>
              </div>
            </div>
            
            {data && (
              <div className="pt-4 border-t space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Equivalent Chendu:</span>
                  <span className="font-semibold">{data.equivalent_chendu.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Equivalent Flowers:</span>
                  <span className="font-semibold">{data.equivalent_flowers.toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-muted/20 border-none shadow-inner">
          <CardContent className="p-6 h-full flex flex-col justify-center">
            {data ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-card border shadow-sm">
                    <p className="text-sm text-muted-foreground mb-1">
                      Selling Today
                      <span className="block text-xs opacity-70 mt-0.5">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </p>
                    <p className="text-3xl font-bold flex items-center text-primary mt-2">
                      <IndianRupee className="w-6 h-6 mr-1" />
                      {data.today_revenue === "XXX" ? "XXX" : data.today_revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border shadow-sm border-secondary/50">
                    <p className="text-sm text-muted-foreground mb-1">
                      Selling Tomorrow <span className="text-xs opacity-70">(Predicted)</span>
                      <span className="block text-xs opacity-70 mt-0.5">
                        {new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </p>
                    <p className="text-3xl font-bold flex items-center text-secondary-foreground mt-2">
                      <IndianRupee className="w-6 h-6 mr-1" />
                      {data.tomorrow_revenue.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-center">
                  <p className="text-lg font-medium text-foreground mb-2">Expected Profit Difference</p>
                  <p className={`text-4xl font-black flex items-center justify-center ${data.profit_difference === "XXX" ? "text-yellow-600" : (data.profit_difference >= 0 ? "text-green-600" : "text-red-500")}`}>
                    {data.profit_difference === "XXX" ? "" : (data.profit_difference >= 0 ? "+" : "-")}
                    <IndianRupee className="w-8 h-8 mx-1" />
                    {data.profit_difference === "XXX" ? "XXX" : Math.abs(data.profit_difference).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {data.profit_difference === "XXX" 
                      ? "Profit difference is unavailable without today's live price." 
                      : (data.profit_difference >= 0 
                          ? "You would earn more by waiting until tomorrow." 
                          : "You would lose money by waiting until tomorrow.")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Enter your harvest quantity and click calculate to see your potential revenue.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
