"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers, BrowserProvider } from 'ethers';
import { timeCapsuleService } from './contract-service';
import { solanaTimeCapsuleService } from './solana-contract-service';
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "sonner";
import { getErrorMessage } from "./utils";

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

  // Check Ethereum connection on mount or when chain switches to ethereum
  useEffect(() => {
    if (walletState.chain === 'ethereum') {
      checkEthConnection();
    }
  }, [walletState.chain]);

  // Sync Solana state when chain is 'solana'
  useEffect(() => {
    if (walletState.chain === 'solana') {
      if (solConnected && solPublicKey) {
        const getSolBalance = async () => {
          try {
            // @ts-ignore
            await solanaTimeCapsuleService.initialize({
              publicKey: solPublicKey,
              // @ts-ignore - signTransaction exists on SignerWalletAdapter
              signTransaction: solWallet?.adapter.signTransaction,
              // @ts-ignore - signAllTransactions exists on SignerWalletAdapter
              signAllTransactions: solWallet?.adapter.signAllTransactions,
            });

            const bal = await solanaTimeCapsuleService['connection'].getBalance(solPublicKey);
            const addressStr = solPublicKey.toString();
            const balStr = (bal / LAMPORTS_PER_SOL).toString();

            setWalletState(prev => {
              if (
                prev.isConnected &&
                prev.address === addressStr &&
                prev.balance === balStr &&
                prev.network === 'Devnet' &&
                !prev.isConnecting
              ) {
                return prev;
              }
              return {
                ...prev,
                isConnected: true,
                address: addressStr,
                balance: balStr,
                network: 'Devnet',
                isConnecting: false
              };
            });
          } catch (e) {
            console.error("Error fetching SOL balance:", e);
          }
        };
        getSolBalance();
      } else {
        setWalletState(prev => {
          if (!prev.isConnected && prev.address === null && prev.balance === null && !prev.isConnecting) {
            return prev;
          }
          return {
            ...prev,
            isConnected: false,
            address: null,
            balance: null,
            isConnecting: false
          };
        });
      }
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

      const balStr = ethers.formatEther(balance);
      setWalletState(prev => {
        if (
          prev.isConnected &&
          prev.address === address &&
          prev.balance === balStr &&
          prev.network === network.name &&
          !prev.isConnecting
        ) {
          return prev;
        }
        return {
          ...prev,
          isConnected: true,
          address,
          balance: balStr,
          network: network.name,
          isConnecting: false,
          provider,
          signer,
        };
      });
    } catch (error) {
      console.error('Failed to update wallet state:', error);
      throw error;
    }
  };

  const connectWallet = async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true }));

    if (walletState.chain === 'ethereum') {
      if (typeof window === 'undefined' || !window.ethereum) {
        toast.error('MetaMask is not installed. Please install it to connect.');
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

        toast.success("Ethereum wallet connected successfully!");
      } catch (error) {
        console.error("Failed to connect ETH wallet:", error);
        toast.error(getErrorMessage(error, "Failed to connect MetaMask."));
        setWalletState(prev => ({ ...prev, isConnecting: false }));
      }
    } else {
      // Connect Solana
      try {
        // Fallback checks for window extension injection
        const phantomInjected = typeof window !== 'undefined' && (window as any).solana?.isPhantom;
        const solflareInjected = typeof window !== 'undefined' && (window as any).solflare?.isSolflare;

        const installed = solWallets.filter(
          w => w.readyState === 'Installed' || w.readyState === 'Loadable'
        );
        
        let phantom = installed.find(w => w.adapter.name === 'Phantom');
        let solflare = installed.find(w => w.adapter.name === 'Solflare');
        
        if (!phantom && phantomInjected) {
          phantom = solWallets.find(w => w.adapter.name === 'Phantom');
        }
        if (!solflare && solflareInjected) {
          solflare = solWallets.find(w => w.adapter.name === 'Solflare');
        }

        const wallet = phantom || solflare;
        
        if (wallet) {
          solSelect(wallet.adapter.name);
          // Wait for React to process the selection before connecting
          await new Promise(resolve => setTimeout(resolve, 300));
          try {
            await solConnect();
            toast.success(`${wallet.adapter.name} connected successfully!`);
          } catch (e) {
            // Auto-connect may handle it via the useEffect
            console.log("solConnect:", e);
            toast.error(`Failed to connect Solana wallet: ${getErrorMessage(e, "Connection failed")}`);
          }
        } else {
          // No wallet extension installed
          setWalletState(prev => ({ ...prev, isConnecting: false }));
          const install = window.confirm(
            "No Solana wallet extension detected!\n\nYou need Phantom or Solflare browser extension.\n\nClick OK to install Phantom, or Cancel for Solflare."
          );
          if (install) {
            window.open("https://phantom.app/", "_blank");
          } else {
            window.open("https://solflare.com/", "_blank");
          }
          return;
        }
      } catch (error) {
        console.error("Failed to connect Solana wallet:", error);
        toast.error(getErrorMessage(error, "Failed to connect Solana wallet"));
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
        // Network not added to MetaMask — auto-add it
        if (error.code === 4902) {
          const networks: Record<string, any> = {
            '0xaa36a7': {
              chainId: '0xaa36a7',
              chainName: 'Ethereum Sepolia',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
            '0x1': {
              chainId: '0x1',
              chainName: 'Ethereum Mainnet',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://ethereum-rpc.publicnode.com'],
              blockExplorerUrls: ['https://etherscan.io'],
            },
          };
          const networkParams = networks[networkId];
          if (networkParams) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkParams],
            });
          }
        } else {
          throw error;
        }
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
