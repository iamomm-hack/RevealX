"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Simulate Web3 wallet functionality for demo purposes
interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  network: string
  isConnecting: boolean
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (networkId: string) => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    network: "polygon",
    isConnecting: false,
  })

  const connectWallet = async () => {
    setWalletState((prev) => ({ ...prev, isConnecting: true }))

    try {
      // Simulate wallet connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate successful connection
      const mockAddress = "0x" + Math.random().toString(16).substr(2, 40)
      const mockBalance = (Math.random() * 10).toFixed(4)

      setWalletState((prev) => ({
        ...prev,
        isConnected: true,
        address: mockAddress,
        balance: mockBalance,
        isConnecting: false,
      }))
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setWalletState((prev) => ({ ...prev, isConnecting: false }))
    }
  }

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      network: "polygon",
      isConnecting: false,
    })
  }

  const switchNetwork = async (networkId: string) => {
    // Simulate network switching
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setWalletState((prev) => ({ ...prev, network: networkId }))
  }

  return (
    <WalletContext.Provider
      value={{
        ...walletState,
        connectWallet,
        disconnectWallet,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
