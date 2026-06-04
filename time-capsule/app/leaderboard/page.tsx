import { Suspense } from "react"
import type { Metadata } from "next"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { MetricsCards } from "@/components/metrics-cards"

export const metadata: Metadata = {
  title: "Leaderboard • Time Capsule",
  description: "Top predictors and most-staked capsules.",
}

export default async function LeaderboardPage() {
  return (
    <main className="min-h-dvh bg-background">
      <section className="px-4 md:px-8 py-6 md:py-10">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-balance">Leaderboard</h1>
          <p className="text-muted-foreground mt-2">See top predictors and the most-staked capsules.</p>
        </header>

        <Suspense fallback={<div className="text-muted-foreground">Loading metrics…</div>}>
          <MetricsCards />
        </Suspense>

        <div className="mt-6 md:mt-8">
          <Suspense fallback={<div className="text-muted-foreground">Loading leaderboard…</div>}>
            <LeaderboardTable />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
