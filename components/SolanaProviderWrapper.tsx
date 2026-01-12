"use client";

import { FC, ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

export const SolanaProviderWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const endpoint = "https://api.devnet.solana.com";
  const wallets = [new PhantomWalletAdapter()];

  // @ts-ignore: React 19 type incompatibility with wallet-adapter
  return (
    <ConnectionProvider endpoint={endpoint}>
      {/* @ts-ignore: React 19 type incompatibility with wallet-adapter */}
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
