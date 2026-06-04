"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, AlertCircle, Clock, Target } from "lucide-react"
import type { TimeCapsule } from "@/lib/smart-contracts"
import { TimeCapsuleContract } from "@/lib/smart-contracts"

interface StakingModalProps {
  capsule: TimeCapsule | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStakeComplete: () => void
}

export function StakingModal({ capsule, open, onOpenChange, onStakeComplete }: StakingModalProps) {
  const [stakeAmount, setStakeAmount] = useState("")
  const [prediction, setPrediction] = useState<"popular" | "unpopular">("popular")
  const [isStaking, setIsStaking] = useState(false)

  if (!capsule) return null

  const handleStake = async () => {
    if (!stakeAmount || Number.parseFloat(stakeAmount) <= 0) return

    setIsStaking(true)
    try {
      await TimeCapsuleContract.stakePrediction(capsule.id, prediction, stakeAmount)
      onStakeComplete()
    } catch (error) {
      console.error("[v0] Failed to stake:", error)
    } finally {
      setIsStaking(false)
    }
  }

  const daysUntilUnlock = Math.ceil((capsule.unlockDate - Date.now()) / (1000 * 60 * 60 * 24))
  const potentialReward = Number.parseFloat(stakeAmount || "0") * 1.8 // Mock 80% potential return

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Stake on Prediction
          </DialogTitle>
          <DialogDescription>Predict the future popularity of this time capsule</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Capsule Info */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
            <h4 className="font-medium line-clamp-2">{capsule.title}</h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {daysUntilUnlock} days left
              </div>
              <Badge variant="secondary" className="text-xs">
                {capsule.category}
              </Badge>
            </div>
          </div>

          {/* Prediction Selection */}
          <Tabs value={prediction} onValueChange={(value) => setPrediction(value as "popular" | "unpopular")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="popular" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Popular
              </TabsTrigger>
              <TabsTrigger value="unpopular" className="gap-2">
                <TrendingDown className="h-4 w-4" />
                Unpopular
              </TabsTrigger>
            </TabsList>

            <TabsContent value="popular" className="space-y-3">
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-accent mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-accent">Betting on Popular</p>
                    <p className="text-muted-foreground">
                      You believe this capsule will be highly engaged when unlocked
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="unpopular" className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start gap-2">
                  <TrendingDown className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Betting on Unpopular</p>
                    <p className="text-muted-foreground">
                      You believe this capsule will have low engagement when unlocked
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Stake Amount */}
          <div className="space-y-2">
            <Label htmlFor="stake-amount">Stake Amount</Label>
            <div className="relative">
              <Input
                id="stake-amount"
                type="number"
                placeholder="0.0"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="pr-16"
                step="0.1"
                min="0"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">MATIC</div>
            </div>
            <div className="flex gap-2">
              {["0.1", "0.5", "1.0", "5.0"].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setStakeAmount(amount)}
                  className="text-xs"
                >
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Potential Reward */}
          {stakeAmount && Number.parseFloat(stakeAmount) > 0 && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">Potential Reward</span>
                <span className="font-mono text-sm">{potentialReward.toFixed(2)} MATIC</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Based on current odds and pool size</p>
            </div>
          )}

          {/* Warning */}
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Risk Warning</p>
                <p className="text-muted-foreground">
                  Staking involves risk. You may lose your entire stake if your prediction is incorrect.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleStake}
              disabled={!stakeAmount || Number.parseFloat(stakeAmount) <= 0 || isStaking}
              className="flex-1 glow-primary"
            >
              {isStaking ? "Staking..." : `Stake ${stakeAmount || "0"} MATIC`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
