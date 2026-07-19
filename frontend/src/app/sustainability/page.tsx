"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/lib/LanguageContext"
import { chatWithAssistant } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Send, User, Leaf, Recycle, Droplets, ArrowRight } from "lucide-react"

const SUSTAINABILITY_ACTIONS = [
  { i18nKey: "quick.compost", text: "How to make compost?" },
  { i18nKey: "sustain.waste_title", text: "How to recycle jasmine?" },
  { i18nKey: "sustain.organic_title", text: "Organic farming tips?" }
]

export default function SustainabilityPage() {
  const { t, locale } = useLanguage()
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Initial greeting
  useEffect(() => {
    setMessages([{ role: 'bot', text: t("sustain.subtitle") }])
  }, [locale, t])

  const handleSend = async (text: string) => {
    if (!text.trim()) return
    
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput("")
    setLoading(true)
    
    try {
      const res = await chatWithAssistant(text, null, locale, "sustainability")
      setMessages(prev => [...prev, { role: 'bot', text: res.reply }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: t("common.error") }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      
      {/* Left Column: Info Cards */}
      <div className="md:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 pb-16 md:pb-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center mb-2">
            <Leaf className="w-8 h-8 mr-2 text-green-500" />
            {t("sustain.title")}
          </h2>
          <p className="text-muted-foreground text-sm">{t("sustain.subtitle")}</p>
        </div>

        <Card className="border-l-4 border-l-green-500 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Recycle className="w-5 h-5 mr-2 text-green-500" />
              {t("sustain.compost_title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("sustain.compost_desc")}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-blue-500" />
              {t("sustain.organic_title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("sustain.organic_desc")}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Leaf className="w-5 h-5 mr-2 text-amber-500" />
              {t("sustain.waste_title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("sustain.waste_desc")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: AI Chat */}
      <Card className="flex-1 flex flex-col overflow-hidden border-2 border-primary/20 shadow-md">
        <div className="bg-primary/5 p-3 border-b flex items-center justify-between">
          <span className="font-semibold text-sm flex items-center">
            <Bot className="w-4 h-4 mr-2 text-primary" />
            {t("sustain.ask_ai")}
          </span>
        </div>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex max-w-[85%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border rounded-tl-sm shadow-sm'}`}>
                {msg.role === 'bot' && <Bot className="w-4 h-4 mr-2 mt-1 text-green-600 shrink-0" />}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.role === 'user' && <User className="w-4 h-4 ml-2 mt-1 text-primary-foreground/80 shrink-0" />}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] rounded-2xl p-4 bg-card border rounded-tl-sm shadow-sm items-center space-x-2">
                <Bot className="w-5 h-5 mr-1 text-green-600 shrink-0" />
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
        
        <div className="p-3 bg-card border-t border-muted">
          <div className="flex flex-wrap gap-2 mb-3">
            {SUSTAINABILITY_ACTIONS.map((action, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSend(locale === 'en' ? action.text : t(action.i18nKey))}
                disabled={loading}
                className="text-xs flex items-center bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30 rounded-full px-3 py-1.5 transition-colors"
              >
                {t(action.i18nKey)}
                <ArrowRight className="w-3 h-3 ml-1 opacity-70" />
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Input 
              placeholder={t("assistant.placeholder")} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              className="flex-1 bg-background"
              disabled={loading}
            />
            <Button size="icon" onClick={() => handleSend(input)} disabled={loading || !input.trim()} className="bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
