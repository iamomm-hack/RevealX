import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { WalletProvider } from "../lib/wallet-context";
import { SolanaProvider } from "../lib/solana-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "RevealX – Decentralized Time-Locked Prediction Protocol",
  description: "Create time-locked capsules with staking - cryptographically secured, blockchain enforced",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SolanaProvider>
          <WalletProvider>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <div className="flex-1 flex flex-col md:ml-64">
                <Header />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </div>
            <Toaster position="top-right" richColors />
          </WalletProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
