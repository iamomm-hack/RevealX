"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { 
  Book, 
  Layers, 
  ArrowRight, 
  Lock, 
  Database,
  Trophy,
  Users,
  Coins,
  FileCode,
  HelpCircle,
  Shield,
  Clock,
  CheckCircle2,
  TrendingUp,
  Image as ImageIcon
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const sections = [
  { id: "overview", label: "Overview", icon: <Book className="h-4 w-4" /> },
  { id: "architecture", label: "Architecture", icon: <Layers className="h-4 w-4" /> },
  { id: "time-capsules", label: "Time Capsules", icon: <Clock className="h-4 w-4" /> },
  { id: "encryption", label: "Encryption Flow", icon: <Lock className="h-4 w-4" /> },
  { id: "predictions", label: "Prediction Markets", icon: <Trophy className="h-4 w-4" /> },
  { id: "social", label: "Social & Leaderboard", icon: <Users className="h-4 w-4" /> },
  { id: "staking", label: "Staking & Vault", icon: <Coins className="h-4 w-4" /> },
  { id: "contracts", label: "Smart Contracts", icon: <FileCode className="h-4 w-4" /> },
  { id: "faq", label: "FAQ", icon: <HelpCircle className="h-4 w-4" /> },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview")

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200
      let currentSection = sections[0].id

      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element && element.offsetTop <= scrollPosition) {
          currentSection = section.id
        }
      }
      setActiveSection(currentSection)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations matching the screenshot */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute top-40 right-20 w-8 h-8 bg-yellow-400/20 rounded-md rotate-12 blur-sm pointer-events-none" />
      <div className="absolute top-60 right-10 w-24 h-24 border border-emerald-500/20 rounded-full pointer-events-none" />
      <div className="absolute bottom-40 left-20 w-6 h-6 bg-red-400/20 rounded-full blur-sm pointer-events-none" />
      
      <div className="container max-w-7xl mx-auto py-12 px-4 sm:px-6 relative z-10">
        
        {/* Header Section */}
        <div className="mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 text-emerald-500 text-sm font-medium mb-6">
            <Book className="h-4 w-4" />
            Documentation
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-foreground">
            RevealX <span className="text-emerald-500">Docs</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            RevealX is a decentralized time capsule protocol and prediction market. Securely lock your data, let the community speculate, and earn reputation through social interactions.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <Card className="sticky top-24 overflow-hidden border-border/50 shadow-sm p-2 bg-card/50 backdrop-blur">
              <nav className="flex flex-col gap-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${
                      activeSection === section.id 
                        ? "bg-emerald-500/10 text-emerald-500 font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {section.icon}
                      {section.label}
                    </div>
                    {activeSection === section.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                ))}
              </nav>
            </Card>
          </aside>

          {/* Main Content Areas */}
          <main className="flex-1 space-y-8 pb-32">
            
            {/* 1. Overview */}
            <section id="overview" className="scroll-mt-24">
              <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur">
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-md">
                      <Book className="h-5 w-5 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">What is RevealX?</h2>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">RevealX</strong> is a decentralized application built on EVM and Solana networks using smart contracts. It enables trustless data locking and prediction markets combining:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-emerald-500 font-medium">
                        <Lock className="h-5 w-5" /> Secure Encryption
                      </div>
                      <p className="text-sm text-muted-foreground">Client-side AES encryption ensures no one can read the locked files or text until the unlock time arrives.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-emerald-500 font-medium">
                        <Database className="h-5 w-5" /> Decentralized Storage
                      </div>
                      <p className="text-sm text-muted-foreground">Encrypted payloads are pinned permanently to IPFS via Pinata, meaning your data cannot be censored or deleted.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-emerald-500 font-medium">
                        <TrendingUp className="h-5 w-5" /> Prediction Markets
                      </div>
                      <p className="text-sm text-muted-foreground">Community members can stake funds on Public capsules, predicting what the locked content will ultimately reveal.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-emerald-500 font-medium">
                        <Users className="h-5 w-5" /> Social Reputation
                      </div>
                      <p className="text-sm text-muted-foreground">Gain stars and likes for engaging capsules. Become a top creator displayed on the global leaderboard.</p>
                    </div>
                  </div>

                  {/* Informational Banner */}
                  <div className="mt-8 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-sm flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
                    <p><strong className="text-emerald-600 dark:text-emerald-400">Network:</strong> Arbitrum Sepolia / Solana</p>
                    <p><strong className="text-emerald-600 dark:text-emerald-400">Language:</strong> Solidity / Rust</p>
                    <p><strong className="text-emerald-600 dark:text-emerald-400">Frontend:</strong> Next.js + TypeScript</p>
                    <p><strong className="text-emerald-600 dark:text-emerald-400">Storage:</strong> IPFS (Pinata)</p>
                  </div>
                </div>
              </Card>
            </section>

            {/* 2. Architecture */}
            <section id="architecture" className="scroll-mt-24">
              <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur">
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-md">
                      <Layers className="h-5 w-5 text-yellow-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">System Architecture</h2>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    RevealX uses a hybrid on-chain/off-chain architecture to handle data storage and verification securely:
                  </p>

                  <div className="pl-4 border-l-2 border-border space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 1. Client App (Next.js)
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">Handles MetaMask/Phantom connections, IPFS uploads, and all local encryption/decryption mathematically. Data leaves the browser only in encrypted form.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 2. IPFS Storage Layer
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">Files and text payloads are uploaded to IPFS networks and pinned for persistence. The returned CID is logged onto the smart contract.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 3. Blockchain Layer (TimeCapsule.sol)
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">The EVM/SVM contract stores the CID, encrypted AES-key, timestamps, and stakes. It enforces time-locks and prediction logic transparently.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* 3. Time Capsules */}
            <section id="time-capsules" className="scroll-mt-24">
              <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur">
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-md">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Time Capsule Lifecycle</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 border border-border rounded-xl">
                      <div className="text-2xl font-mono text-muted-foreground mb-4">01</div>
                      <h4 className="font-semibold mb-2">Create & Lock</h4>
                      <p className="text-sm text-muted-foreground">Select data, set an unlock date, pay a native stake, and deploy your capsule onto the public ledger.</p>
                    </div>
                    <div className="p-5 border border-border rounded-xl">
                      <div className="text-2xl font-mono text-muted-foreground mb-4">02</div>
                      <h4 className="font-semibold mb-2">Wait phase</h4>
                      <p className="text-sm text-muted-foreground">Data sits dormant. If Public, users can view hints and stake ETH/SOL predicting the data category.</p>
                    </div>
                    <div className="p-5 border border-border rounded-xl">
                      <div className="text-2xl font-mono text-muted-foreground mb-4">03</div>
                      <h4 className="font-semibold mb-2">Unlock & Reveal</h4>
                      <p className="text-sm text-muted-foreground">Once time passes, the creator triggers the unlock, getting their stake back and broadcasting the key.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* 4. Prediction Markets */}
            <section id="predictions" className="scroll-mt-24">
              <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur">
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-md">
                      <Trophy className="h-5 w-5 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Prediction Economics</h2>
                  </div>
                  
                  <p className="text-muted-foreground">
                    Public capsules act as micro-economies. When a creator drops a hint (e.g., "The image inside is a meme of X or Y"), users can bet.
                  </p>

                  <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Minimum Stake</span>
                      <Badge variant="outline">0.005 ETH / SOL</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">DAO Treasury Fee</span>
                      <Badge variant="outline">2% on winnings</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Winning Distribution</span>
                      <Badge variant="outline">Pro-rata to correct predictors</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

          </main>
        </div>
      </div>
    </div>
  )
}
