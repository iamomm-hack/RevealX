"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers, BrowserProvider } from 'ethers';
import { timeCapsuleService } from './contract-service';
import { solanaTimeCapsuleService } from './solana-contract-service';
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

type Chain = 'ethereum' | 'solana'

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  network: string
  isConnecting: boolean
  provider: BrowserProvider | null
  signer: ethers.Signer | null
  chain: Chain
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  switchNetwork: (networkId: string) => Promise<void>
  setChain: (chain: Chain) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  // Solana hooks
  const { 
    connected: solConnected, 
    publicKey: solPublicKey, 
    disconnect: solDisconnect,
    select: solSelect,
    connect: solConnect,
    wallet: solWallet,
    wallets: solWallets
  } = useSolanaWallet();

  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    network: "unknown",
    isConnecting: false,
    provider: null,
    signer: null,
    chain: 'ethereum' // Default to Ethereum
  })

  // Sync Solana state when chain is 'solana'
  useEffect(() => {
    // If chain is solana, we sync state from adapter
    if (walletState.chain === 'solana') {
      if (solConnected && solPublicKey) {
        const getSolBalance = async () => {
          try {
            // @ts-ignore
            await solanaTimeCapsuleService.initialize({
              publicKey: solPublicKey,
              signTransaction: solWallet?.adapter.signTransaction,
              signAllTransactions: solWallet?.adapter.signAllTransactions,
            });

            // Need to access connection to get balance
            // We can create a temporary connection if needed, or rely on service if exposed
            // For now, simple fetch
            const bal = await solanaTimeCapsuleService['connection'].getBalance(solPublicKey);
            
            setWalletState(prev => ({
              ...prev,
              isConnected: true,
              address: solPublicKey.toString(),
              balance: (bal / LAMPORTS_PER_SOL).toString(),
              network: 'Devnet',
              isConnecting: false
            }));
          } catch (e) {
            console.error("Error fetching SOL balance:", e);
          }
        };
        getSolBalance();
      } else {
        setWalletState(prev => ({
          ...prev,
          isConnected: false,
          address: null,
          balance: null,
          isConnecting: false
        }));
      }
    } else {
      // If chain is ethereum, we check eth connection
      checkEthConnection();
    }
  }, [walletState.chain, solConnected, solPublicKey, solWallet]);

  const checkEthConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          await updateEthState(provider);
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    }
  };

  const updateEthState = async (provider: BrowserProvider) => {
    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      await timeCapsuleService.initialize(provider);

      setWalletState(prev => ({
        ...prev,
        isConnected: true,
        address,
        balance: ethers.formatEther(balance),
        network: network.name,
        isConnecting: false,
        provider,
        signer,
      }));
    } catch (error) {
      console.error('Failed to update wallet state:', error);
      throw error;
    }
  };

  const connectWallet = async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true }));

    if (walletState.chain === 'ethereum') {
      if (typeof window === 'undefined' || !window.ethereum) {
        alert('MetaMask is not installed.');
        setWalletState(prev => ({ ...prev, isConnecting: false }));
        return;
      }
      try {
        const provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        await updateEthState(provider);
        
        window.ethereum.on('accountsChanged', async (accounts: string[]) => {
            if (accounts.length === 0) disconnectEth();
            else await updateEthState(provider);
        });
        window.ethereum.on('chainChanged', () => window.location.reload());

      } catch (error) {
        console.error("Failed to connect ETH wallet:", error);
        setWalletState(prev => ({ ...prev, isConnecting: false }));
      }
    } else {
      // Connect Solana
      try {
        const phantom = solWallets.find(w => w.adapter.name === 'Phantom');
        if (phantom) {
          solSelect(phantom.adapter.name);
          await phantom.adapter.connect();
        } else {
           alert("Phantom wallet not found");
        }
      } catch (error) {
        console.error("Failed to connect Solana wallet:", error);
      } finally {
        setWalletState(prev => ({ ...prev, isConnecting: false }));
      }
    }
  }

  const disconnectEth = () => {
    setWalletState(prev => ({
        ...prev,
        isConnected: false,
        address: null,
        balance: null,
        network: "unknown",
        isConnecting: false,
        provider: null,
        signer: null,
      }));
  }

  const disconnectWallet = async () => {
    if (walletState.chain === 'ethereum') {
      disconnectEth();
    } else {
      await solDisconnect();
      setWalletState(prev => ({
        ...prev,
        isConnected: false,
        address: null,
        balance: null,
        isConnecting: false
      }));
    }
  }

  const switchNetwork = async (networkId: string) => {
    if (walletState.chain === 'ethereum' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networkId }],
        });
      } catch (error: any) {
        if (error.code === 4902) console.error('Network not added');
        throw error;
      }
    }
  }

  const setChain = (chain: Chain) => {
    // If we are connected on the new chain, state will update via useEffect
    // But we should reset state before switch
    setWalletState(prev => ({ 
        ...prev, 
        chain, 
        isConnected: false, 
        address: null 
    }));
  }

  return (
    <WalletContext.Provider
      value={{
        ...walletState,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        setChain
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
