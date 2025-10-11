"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Loader2 } from "lucide-react"

import { ethers } from "ethers"

// Solana (Phantom)
import { useWallet as useSolWallet } from "@solana/wallet-adapter-react"
import { Connection } from "@solana/web3.js"
import { connection } from "./utils/solana" // <-- relative import

export function WalletButton() {
  const [copied, setCopied] = useState(false)
  const [isEth, setIsEth] = useState(false)
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [ethAddress, setEthAddress] = useState<string | null>(null)
  const [ethBalance, setEthBalance] = useState<string | null>(null)
  const [ethConnecting, setEthConnecting] = useState(false)

  // Solana hooks
  const { connect: connectSol, disconnect: disconnectSol, publicKey: solAddress, connected: solConnected } =
    useSolWallet()

  // Fetch Solana balance
  useEffect(() => {
    const fetchSolBalance = async () => {
      if (solAddress) {
        const lamports = await connection.getBalance(solAddress)
        setSolBalance(lamports / 1e9)
      } else {
        setSolBalance(null)
      }
    }
    fetchSolBalance()
  }, [solAddress, solConnected])

  // Track which wallet is connected
  useEffect(() => {
    if (ethAddress) setIsEth(true)
    else if (solConnected) setIsEth(false)
  }, [ethAddress, solConnected])

  // Ethereum connect
  const connectEth = async () => {
    try {
      setEthConnecting(true)
      if (!window.ethereum) return alert("MetaMask not installed")
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      setEthAddress(address)
      const balance = await provider.getBalance(address)
      setEthBalance(ethers.formatEther(balance))
    } catch (err) {
      console.error(err)
    } finally {
      setEthConnecting(false)
    }
  }

  const handleCopyAddress = async () => {
    const addr = isEth ? ethAddress : solAddress?.toString()
    if (addr) {
      await navigator.clipboard.writeText(addr)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const handleDisconnect = () => {
    if (isEth) setEthAddress(null)
    else disconnectSol()
  }

  // No wallet connected
  if (!ethAddress && !solConnected) {
    return (
      <div className="flex gap-2">
        <Button onClick={connectEth} disabled={ethConnecting} className="gap-2 glow-primary">
          {ethConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
          <span className="hidden sm:inline">{ethConnecting ? "Connecting..." : "Connect MetaMask"}</span>
        </Button>

        <Button onClick={() => connectSol()} className="gap-2 glow-primary">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect Phantom</span>
        </Button>
      </div>
    )
  }

  // Wallet connected
  const connectedAddress = isEth ? ethAddress : solAddress?.toString()
  const networkName = isEth ? "Ethereum" : "Solana"
  const balanceDisplay = isEth
    ? ethBalance
      ? `${parseFloat(ethBalance).toFixed(4)} ETH`
      : "Loading..."
    : solBalance !== null
    ? `${solBalance.toFixed(4)} SOL`
    : "Loading..."

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent"></div>
            <span className="hidden sm:inline font-mono text-sm">{formatAddress(connectedAddress!)}</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="font-mono text-sm">{balanceDisplay}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network</span>
            <Badge variant="secondary" className="text-xs">
              {networkName}
            </Badge>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyAddress} className="gap-2">
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <ExternalLink className="h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect} className="gap-2 text-destructive">
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
