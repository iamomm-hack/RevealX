"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  Home, 
  Plus, 
  Clock, 
  TrendingUp, 
  Trophy, 
  Menu, 
  X, 
  Eye, 
  User, 
  Search,
  Rocket,
  Book,
  Key,
  Layers,
  Cpu,
  Coins,
  Shield,
  Award,
  Code,
  FileCode,
  Globe,
  HelpCircle
} from "lucide-react"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Create Capsule", href: "/create", icon: Plus },
  { name: "My Capsules", href: "/capsules", icon: Clock },
  { name: "Explore", href: "/explore", icon: Eye },
  { name: "My Predictions", href: "/my-predictions", icon: TrendingUp },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Profile", href: "/profile", icon: User },
]

const docsSections = [
  { id: "quick-start", name: "QUICK START", icon: Rocket },
  { id: "core-concepts", name: "CORE CONCEPTS", icon: Book },
  { id: "key-management", name: "KEY MANAGEMENT", icon: Key },
  { id: "smart-contracts-evm", name: "SMART CONTRACTS (EVM)", icon: Layers },
  { id: "smart-contracts-svm", name: "SMART CONTRACTS (SVM)", icon: Cpu },
  { id: "prediction-staking", name: "PREDICTION STAKING", icon: Coins },
  { id: "unlocks-reveals", name: "UNLOCKS & REVEALS", icon: Shield },
  { id: "social-reputation", name: "SOCIAL & REPUTATION", icon: Award },
  { id: "developer-sdk-evm", name: "DEVELOPER SDK (EVM)", icon: Code },
  { id: "developer-sdk-svm", name: "DEVELOPER SDK (SVM)", icon: FileCode },
  { id: "supported-networks", name: "SUPPORTED NETWORKS", icon: Globe },
  { id: "faq", name: "FAQ", icon: HelpCircle },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [docsActiveSection, setDocsActiveSection] = useState("quick-start")

  const isDocsPage = pathname === "/docs"

  useEffect(() => {
    const handleActiveChange = (e: Event) => {
      setDocsActiveSection((e as CustomEvent).detail)
    }
    window.addEventListener('active-docs-section-changed', handleActiveChange)
    return () => window.removeEventListener('active-docs-section-changed', handleActiveChange)
  }, [])

  const handleDocsSectionClick = (id: string) => {
    setDocsActiveSection(id)
    window.dispatchEvent(new CustomEvent('scroll-to-docs-section', { detail: id }))
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-border">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shadow-lg shadow-purple-500/20">
              <img src="/logo.png" alt="RevealX Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">RevealX</h1>
              <p className="text-xs text-muted-foreground">Prediction Protocol</p>
            </div>
          </div>

          {isDocsPage ? (
            /* Docs Navigation Mode with 115% Zoom */
            <nav 
              className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-none"
              style={{ zoom: 1.15 }}
            >
              {docsSections.map((section) => {
                const IconComponent = section.icon
                const isActive = docsActiveSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => handleDocsSectionClick(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-200 cursor-pointer text-left uppercase border",
                      isActive
                        ? "bg-primary/5 text-primary border-primary/50 shadow-[0_0_12px_rgba(168,85,247,0.1)]"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground border-transparent"
                    )}
                  >
                    <IconComponent className="h-4 w-4 shrink-0" />
                    <span className="truncate">{section.name}</span>
                  </button>
                )
              })}
            </nav>
          ) : (
            /* Main App Navigation Mode */
            <>
              {/* Search */}
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search capsules..."
                    className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground glow-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              {/* Stats */}
              <div className="p-4 border-t border-border">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Capsules</span>
                    <span className="font-medium text-accent">1,247</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Predictions</span>
                    <span className="font-medium text-primary">89</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Rewards</span>
                    <span className="font-medium text-accent">156.7 TCT</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
