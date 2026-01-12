"use client"

import { WalletButton } from "@/components/wallet-button"
import { ChainSwitcher } from "@/components/chain-switcher"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { useWallet } from "@/lib/wallet-context"

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

          {/* Wallet connection */}
          <WalletButton />
        </div>
      </div>
    </header>
  )
}

