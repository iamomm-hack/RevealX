"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Users, Coins, Target, Filter } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"
import { TimeCapsuleContract, type TimeCapsule } from "@/lib/smart-contracts"
import { PredictionCard } from "@/components/prediction-card"
import { StakingModal } from "@/components/staking-modal"

export default function PredictionsPage() {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null)
  const [stakingModalOpen, setStakingModalOpen] = useState(false)
  const { isConnected, connectWallet } = useWallet()

  useEffect(() => {
    loadCapsules()
  }, [])

  const loadCapsules = async () => {
    try {
      const data = await TimeCapsuleContract.getCapsulesForPrediction()
      setCapsules(data)
    } catch (error) {
      console.error("[v0] Failed to load capsules:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStake = (capsule: TimeCapsule) => {
    if (!isConnected) {
      connectWallet()
      return
    }
    setSelectedCapsule(capsule)
    setStakingModalOpen(true)
  }

  const totalStaked = capsules.reduce((sum, capsule) => sum + Number.parseFloat(capsule.totalStaked), 0)
  const totalPredictions = capsules.reduce((sum, capsule) => sum + capsule.predictionCount, 0)

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Prediction Market</h1>
            <p className="text-muted-foreground">Stake on time capsules and predict their future popularity</p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">Total Staked</span>
              </div>
              <p className="text-2xl font-bold">{totalStaked.toFixed(1)} MATIC</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Active Markets</span>
              </div>
              <p className="text-2xl font-bold">{capsules.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">Total Predictions</span>
              </div>
              <p className="text-2xl font-bold">{totalPredictions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">Your Rewards</span>
              </div>
              <p className="text-2xl font-bold">24.7 MATIC</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wallet Connection */}
      {!isConnected && (
        <Card className="border-primary/20">
          <CardContent className="p-6 text-center space-y-4">
            <Target className="h-12 w-12 text-primary mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Connect to Start Predicting</h3>
              <p className="text-muted-foreground">Connect your wallet to stake on time capsules and earn rewards</p>
            </div>
            <Button onClick={connectWallet} className="glow-primary">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Prediction Markets */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Markets</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="ending-soon">Ending Soon</TabsTrigger>
          <TabsTrigger value="my-predictions">My Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-16 bg-muted rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-muted rounded flex-1"></div>
                      <div className="h-8 bg-muted rounded flex-1"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capsules.map((capsule) => (
                <PredictionCard key={capsule.id} capsule={capsule} onStake={handleStake} isConnected={isConnected} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capsules
              .sort((a, b) => b.predictionCount - a.predictionCount)
              .slice(0, 6)
              .map((capsule) => (
                <PredictionCard key={capsule.id} capsule={capsule} onStake={handleStake} isConnected={isConnected} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="ending-soon" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capsules
              .sort((a, b) => a.unlockDate - b.unlockDate)
              .slice(0, 6)
              .map((capsule) => (
                <PredictionCard key={capsule.id} capsule={capsule} onStake={handleStake} isConnected={isConnected} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="my-predictions" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Target className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No Predictions Yet</h3>
                <p className="text-muted-foreground">Start staking on time capsules to see your predictions here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Staking Modal */}
      <StakingModal
        capsule={selectedCapsule}
        open={stakingModalOpen}
        onOpenChange={setStakingModalOpen}
        onStakeComplete={() => {
          setStakingModalOpen(false)
          loadCapsules()
        }}
      />
    </div>
  )
}
