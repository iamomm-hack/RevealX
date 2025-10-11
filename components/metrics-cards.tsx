"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MetricsCards() {
  // NOTE: Placeholder data. Replace with real stats from your API/contract when available.
  const metrics = [
    { label: "Total Staked", value: "123,450", suffix: " TOK" },
    { label: "Active Predictors", value: "842" },
    { label: "Open Capsules", value: "267" },
    { label: "Reward Pool", value: "9,870", suffix: " TOK" },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <Card key={m.label} className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{m.label}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-semibold">
              {m.value}
              {m.suffix ? <span className="text-base text-muted-foreground"> {m.suffix}</span> : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
