"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, TrendingUp, Calculator, Bot, BarChart3, Leaf } from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Forecast",
    icon: TrendingUp,
    href: "/forecast",
  },
  {
    label: "Revenue Calculator",
    icon: Calculator,
    href: "/revenue",
  },
  {
    label: "AI Assistant",
    icon: Bot,
    href: "/assistant",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card text-card-foreground border-r w-64 shadow-sm">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14 space-x-2 text-primary font-bold">
          <Leaf className="w-8 h-8" />
          <h1 className="text-2xl">JasmineIQ</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", pathname === route.href ? "text-primary" : "text-muted-foreground")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-4 mt-auto border-t">
        <p className="text-xs text-center text-muted-foreground">
          Built using Google Cloud + Gemini
        </p>
      </div>
    </div>
  )
}
