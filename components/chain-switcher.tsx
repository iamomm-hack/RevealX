"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export type Chain = 'ethereum' | 'solana'

interface ChainSwitcherProps {
  currentChain: Chain
  onChainChange: (chain: Chain) => void
}

const chains = {
  ethereum: {
    name: 'Ethereum',
    icon: '⟠',
    color: 'bg-blue-500'
  },
  solana: {
    name: 'Solana',
    icon: '◎',
    color: 'bg-purple-500'
  }
}

export function ChainSwitcher({ currentChain, onChainChange }: ChainSwitcherProps) {
  const current = chains[currentChain]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <span className={`w-2 h-2 rounded-full ${current.color}`}></span>
          {current.icon} {current.name}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(chains).map(([key, chain]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onChainChange(key as Chain)}
            className="gap-2 cursor-pointer"
          >
            <span className={`w-2 h-2 rounded-full ${chain.color}`}></span>
            <div className="font-medium">{chain.icon} {chain.name}</div>
            {currentChain === key && (
              <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Hook for chain state
export function useChain() {
  const [chain, setChain] = useState<Chain>('ethereum')
  return { chain, setChain }
}
