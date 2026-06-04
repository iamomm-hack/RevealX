"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, TrendingUp, TrendingDown, Users, Coins } from "lucide-react"
import type { TimeCapsule } from "@/lib/smart-contracts"

interface PredictionCardProps {
  capsule: TimeCapsule
  onStake: (capsule: TimeCapsule) => void
  isConnected: boolean
}

export function PredictionCard({ capsule, onStake, isConnected }: PredictionCardProps) {
  const daysUntilUnlock = Math.ceil((capsule.unlockDate - Date.now()) / (1000 * 60 * 60 * 24))
  const popularityScore = Math.random() * 100 // Mock popularity prediction

  // Mock prediction distribution
  const popularVotes = Math.floor(capsule.predictionCount * 0.6)
  const unpopularVotes = capsule.predictionCount - popularVotes
  const popularPercentage = capsule.predictionCount > 0 ? (popularVotes / capsule.predictionCount) * 100 : 50

  return (
    <Card className="border-border bg-card hover:border-primary/20 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-2">{capsule.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {capsule.category}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {daysUntilUnlock}d left
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Prediction Distribution */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Community Prediction</span>
            <span className="font-medium">{capsule.predictionCount} votes</span>
          </div>
          <Progress value={popularPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-accent">
              <TrendingUp className="h-3 w-3" />
              Popular: {popularPercentage.toFixed(0)}%
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingDown className="h-3 w-3" />
              Unpopular: {(100 - popularPercentage).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Staking Info */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Total Staked</span>
          </div>
          <span className="font-mono text-sm">{capsule.totalStaked} MATIC</span>
        </div>

        {/* AI Prediction Score */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">AI Prediction Score</span>
            <Badge variant="outline" className="text-xs">
              {popularityScore.toFixed(0)}% Popular
            </Badge>
          </div>
          <Progress value={popularityScore} className="h-1" />
        </div>

        {/* Staking Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStake(capsule)}
            disabled={!isConnected}
            className="gap-1 text-accent border-accent/20 hover:bg-accent/10"
          >
            <TrendingUp className="h-3 w-3" />
            Stake Popular
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStake(capsule)}
            disabled={!isConnected}
            className="gap-1 text-muted-foreground border-muted-foreground/20 hover:bg-muted/10"
          >
            <TrendingDown className="h-3 w-3" />
            Stake Unpopular
          </Button>
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Users className="h-3 w-3" />
          <span>
            Creator: {capsule.creator.slice(0, 6)}...{capsule.creator.slice(-4)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
