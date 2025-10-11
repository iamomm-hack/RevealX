"use client"

import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Circle } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"

const networks = [
  { id: "polygon", name: "Polygon", color: "bg-purple-500" },
  { id: "ethereum", name: "Ethereum", color: "bg-blue-500" },
  { id: "arbitrum", name: "Arbitrum", color: "bg-cyan-500" },
  { id: "optimism", name: "Optimism", color: "bg-red-500" },
]

export function NetworkSelector() {
  const { network, switchNetwork, isConnected } = useWallet()

  const currentNetwork = networks.find((n) => n.id === network) || networks[0]

  if (!isConnected) {
    return (
      <Badge variant="outline" className="gap-2">
        <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
        Not Connected
      </Badge>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge variant="outline" className="gap-2 cursor-pointer hover:bg-muted/50">
          <div className={`w-2 h-2 rounded-full ${currentNetwork.color}`}></div>
          {currentNetwork.name}
          <ChevronDown className="h-3 w-3" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {networks.map((net) => (
          <DropdownMenuItem key={net.id} onClick={() => switchNetwork(net.id)} className="gap-2">
            <div className={`w-2 h-2 rounded-full ${net.color}`}></div>
            {net.name}
            {net.id === network && <Circle className="h-3 w-3 ml-auto fill-current" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
