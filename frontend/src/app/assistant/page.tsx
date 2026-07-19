"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { chatWithAssistant } from "@/lib/api"
import { useLanguage } from "@/lib/LanguageContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Send, User, TrendingUp, CloudRain, Activity, HelpCircle, Leaf, ArrowRight } from "lucide-react"

const QUICK_ACTIONS = [
  {
    category: "Market",
    icon: TrendingUp,
    actions: [
      { i18nKey: "quick.sell_today", text: "Should I sell today?" },
      { i18nKey: "quick.why_wait", text: "Why should I wait?" },
    ]
  },
  {
    category: "Factors",
    icon: CloudRain,
    actions: [
      { i18nKey: "quick.weather", text: "Weather impact on prices?" },
      { i18nKey: "quick.festival", text: "Festival effect on prices?" },
    ]
  },
  {
    category: "Other",
    icon: HelpCircle,
    actions: [
      { i18nKey: "quick.trend", text: "Market trend this week?" },
      { i18nKey: "quick.explain_rec", text: "Explain today's recommendation." },
    ]
  }
]

export default function AssistantPage() {
  const { t, locale } = useLanguage()
  const router = useRouter()
  
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Initialize greeting on mount or language change
  useEffect(() => {
    setMessages([{ role: 'bot', text: t("assistant.greeting") }])
  }, [locale, t])

  // Auto-scroll logic
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (text: string) => {
    if (!text.trim()) return
    
    setShowSuggestions(false)
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput("")
    setLoading(true)
    
    try {
      const res = await chatWithAssistant(text, { date: new Date().toISOString() }, locale, "market")
      setMessages(prev => [...prev, { role: 'bot', text: res.reply }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: t("assistant.error") }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center">
          <Bot className="w-8 h-8 mr-2" />
          {t("assistant.title")}
        </h2>
        <p className="text-muted-foreground">{t("assistant.subtitle")}</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-2 border-primary/20 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
        <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-muted/10">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border rounded-tl-sm shadow-sm'}`}>
                {msg.role === 'bot' && <Bot className="w-5 h-5 mr-3 mt-1 text-primary shrink-0" />}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.role === 'user' && <User className="w-5 h-5 ml-3 mt-1 text-primary-foreground/80 shrink-0" />}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] rounded-2xl p-4 bg-card border rounded-tl-sm shadow-sm items-center space-x-2">
                <Bot className="w-5 h-5 mr-1 text-primary shrink-0" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </CardContent>
        
        <div className="p-4 bg-card border-t border-muted">
          {showSuggestions && (
            <div className="mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {QUICK_ACTIONS.map((cat, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                      <cat.icon className="w-3 h-3 mr-1" />
                      {cat.category}
                    </h4>
                    <div className="flex flex-col gap-2">
                      {cat.actions.map((action, aidx) => (
                        <button 
                          key={aidx} 
                          onClick={() => handleSend(locale === 'en' ? action.text : t(action.i18nKey))}
                          disabled={loading}
                          className="text-xs text-left bg-secondary/30 hover:bg-secondary/60 text-secondary-foreground border border-secondary/50 rounded-lg px-3 py-2 transition-colors flex justify-between items-center group"
                        >
                          <span>{t(action.i18nKey)}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Sustainability Route Action */}
              <div className="mt-4 pt-3 border-t">
                <button
                  onClick={() => router.push('/sustainability')}
                  className="text-xs w-full flex items-center justify-between bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30 rounded-lg px-3 py-2 transition-colors"
                >
                  <span className="flex items-center font-medium">
                    <Leaf className="w-4 h-4 mr-2" />
                    🌱 Compost Guide & Sustainability
                  </span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Input 
              placeholder={t("assistant.placeholder")} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              className="flex-1 bg-background"
              disabled={loading}
            />
            <Button size="icon" onClick={() => handleSend(input)} disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
