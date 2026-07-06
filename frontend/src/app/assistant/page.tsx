"use client"

import { useState } from "react"
import { chatWithAssistant } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Send, User } from "lucide-react"

const SUGGESTED_QUESTIONS = [
  "Should I sell my Mallige today?",
  "Why is today's price low?",
  "Explain today's recommendation.",
  "Will rain affect tomorrow's prices?",
  "How much can I earn tomorrow?",
  "What is the price trend this month?"
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Namaskara! I am your JasmineIQ Farmer Assistant. How can I help you maximize your flower revenue today?' }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async (text: string) => {
    if (!text.trim()) return
    
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput("")
    setLoading(true)
    
    try {
      const res = await chatWithAssistant(text, { date: new Date().toISOString() })
      setMessages(prev => [...prev, { role: 'bot', text: res.reply }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I am having trouble connecting to the network right now." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center">
          <Bot className="w-8 h-8 mr-2" />
          AI Farmer Assistant
        </h2>
        <p className="text-muted-foreground">Ask questions about market trends, recommendations, and pricing.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-2 border-primary/20 shadow-md">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border rounded-tl-sm shadow-sm'}`}>
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
        </CardContent>
        
        <div className="p-4 bg-card border-t border-muted">
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-xs bg-secondary/30 hover:bg-secondary/60 text-secondary-foreground border border-secondary/50 rounded-full px-3 py-1.5 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Type your question here..." 
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
