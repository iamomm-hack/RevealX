import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "../components/sidebar"
import { Header } from "../components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TimeCapsule - SocialFi dApp",
  description: "Create time-locked messages and predict their future popularity",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col md:ml-64">
            <Header />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
