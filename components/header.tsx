"use client"

import { WalletButton } from "@/components/wallet-button"
import { ChainSwitcher } from "@/components/chain-switcher"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/wallet-context"
import { Book } from "lucide-react"
import Link from "next/link"

export function Header() {
  const { chain, setChain } = useWallet()

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
          {/* Chain Switcher */}
          <div className="hidden sm:flex items-center gap-2">
            <ChainSwitcher currentChain={chain} onChainChange={setChain} />
          </div>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Docs Link */}
          <Link href="/docs" className="relative group">
            <Button variant="ghost" size="icon" className="hover:bg-muted relative">
              <Book className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-destructive"></span>
            </Button>
          </Link>

          {/* Wallet connection */}
          <WalletButton />
        </div>
      </div>
    </header>
  )
}

