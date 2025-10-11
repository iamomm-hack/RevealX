"use client"

import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { WalletButton } from "@/components/wallet-button"
import { NetworkSelector } from "@/components/network-selector"

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - breadcrumb or page title */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <p className="text-sm text-muted-foreground">Manage your time capsules</p>
          </div>
        </div>

        {/* Right side - actions */}
        <div className="flex items-center gap-4">
          {/* Network selector */}
          <div className="hidden sm:flex items-center gap-2">
            <NetworkSelector />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
              <span className="text-xs text-destructive-foreground font-bold">3</span>
            </div>
          </Button>

          {/* Wallet connection */}
          <WalletButton />
        </div>
      </div>
    </header>
  )
}
