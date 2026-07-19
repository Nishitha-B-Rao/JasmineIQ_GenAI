"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, TrendingUp, Calculator, Bot, BarChart3, Leaf, Globe } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { Locale } from "@/lib/i18n"

const routes = [
  {
    i18nKey: "nav.dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    i18nKey: "nav.forecast",
    icon: TrendingUp,
    href: "/forecast",
  },
  {
    i18nKey: "nav.revenue",
    icon: Calculator,
    href: "/revenue",
  },
  {
    i18nKey: "nav.assistant",
    icon: Bot,
    href: "/assistant",
  },
  {
    i18nKey: "nav.analytics",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    i18nKey: "nav.sustainability",
    icon: Leaf,
    href: "/sustainability",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { locale, setLocale, t } = useLanguage()

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
                {t(route.i18nKey)}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-4 mt-auto border-t space-y-4">
        <div className="flex items-center justify-center space-x-2 bg-secondary/20 p-2 rounded-lg">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <button 
            onClick={() => setLocale("en")}
            className={cn("text-xs font-medium px-2 py-1 rounded", locale === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary")}
          >
            English
          </button>
          <span className="text-muted-foreground/30">|</span>
          <button 
            onClick={() => setLocale("kn")}
            className={cn("text-xs font-medium px-2 py-1 rounded", locale === "kn" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary")}
          >
            ಕನ್ನಡ
          </button>
        </div>
        <p className="text-xs text-center text-muted-foreground px-2">
          {t("nav.footer")}
        </p>
      </div>
    </div>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex items-center justify-around z-50 px-2 pb-safe">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            pathname === route.href ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          <route.icon className={cn("h-5 w-5", pathname === route.href ? "text-primary" : "text-muted-foreground")} />
          <span className="text-[10px] font-medium tracking-tight truncate w-full text-center px-1">
            {t(route.i18nKey)}
          </span>
        </Link>
      ))}
    </div>
  )
}
