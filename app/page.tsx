import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Users, Zap, Plus, Timer } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-accent/20 p-8 border border-border">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 text-balance">Welcome to the Future of Social Predictions</h1>
          <p className="text-xl text-muted-foreground mb-6 text-pretty">
            Create time-locked messages, stake on their future popularity, and earn rewards in our decentralized social
            prediction market.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="gap-2 glow-primary">
              <Link href="/create" aria-label="Create your capsule">
                <Plus className="h-5 w-5" />
                Create Your Capsule
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="gap-2 bg-transparent">
              <Link href="/predictions" aria-label="Explore predictions">
                <TrendingUp className="h-5 w-5" />
                Explore Predictions
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capsules</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">1,247</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">89</div>
            <p className="text-xs text-muted-foreground">+5 new today</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2K TCT</div>
            <p className="text-xs text-muted-foreground">Across all predictions</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">Active predictors</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              Recent Capsules
            </CardTitle>
            <CardDescription>Latest time-locked messages from the community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: 1, title: "My 2025 Predictions", unlocks: "Dec 31, 2025", stakes: 45 },
              { id: 2, title: "Secret Recipe Reveal", unlocks: "Mar 15, 2025", stakes: 23 },
              { id: 3, title: "Investment Advice", unlocks: "Jun 1, 2025", stakes: 67 },
            ].map((capsule) => (
              <div
                key={capsule.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div>
                  <h4 className="font-medium">{capsule.title}</h4>
                  <p className="text-sm text-muted-foreground">Unlocks: {capsule.unlocks}</p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {capsule.stakes}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Top Predictions
            </CardTitle>
            <CardDescription>Most popular prediction markets right now</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: "Will hit 1000 likes?", pool: "234 TCT", odds: "2.4x" },
              { title: "Viral potential?", pool: "156 TCT", odds: "1.8x" },
              { title: "Community favorite?", pool: "89 TCT", odds: "3.2x" },
            ].map((prediction, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div>
                  <h4 className="font-medium">{prediction.title}</h4>
                  <p className="text-sm text-muted-foreground">Pool: {prediction.pool}</p>
                </div>
                <Badge variant="outline" className="text-accent border-accent">
                  {prediction.odds}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
