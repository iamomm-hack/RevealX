"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Check, X, Coins, Gift } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"
import { timeCapsuleService, CATEGORY_NAMES, type Capsule, type Prediction } from "@/lib/contract-service"
import { toast } from "sonner"
import { ethers } from "ethers"

interface UserPrediction {
  capsuleId: string
  capsule: Capsule
  prediction: Prediction
  status: 'active' | 'won' | 'lost' | 'claimable'
}

export default function MyPredictionsPage() {
  const [predictions, setPredictions] = useState<UserPrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  
  const { isConnected, address, provider } = useWallet()

  useEffect(() => {
    if (isConnected && address) {
      loadUserPredictions()
    }
  }, [isConnected, address])

  const loadUserPredictions = async () => {
    try {
      setLoading(true)
      const rpcProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''
      
      const CONTRACT_ABI = [
        "function getCapsule(uint256 _id) external view returns (tuple(uint256 id, address creator, address recipient, string ipfsCID, bytes encryptedKey, uint256 unlockTime, uint256 stakeAmount, bool isUnlocked, bool stakeReleased, string hint, uint8 actualCategory, bool isPublic, uint256 predictionPool))",
        "function nextCapsuleId() external view returns (uint256)",
        "function getPredictionCount(uint256 _id) external view returns (uint256)",
        "function getPrediction(uint256 _id, uint256 _idx) external view returns (tuple(address predictor, uint8 guess, uint256 stakeAmount, bool claimed))",
        "function hasPredicted(uint256, address) external view returns (bool)"
      ]
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, rpcProvider)
      const nextId = await contract.nextCapsuleId()
      const userPredictions: UserPrediction[] = []
      
      for (let i = 0; i < Number(nextId); i++) {
        try {
          const hasPred = await contract.hasPredicted(i, address)
          if (hasPred) {
            const capsule = await contract.getCapsule(i)
            const predCount = await contract.getPredictionCount(i)
            
            // Find user's prediction
            for (let j = 0; j < Number(predCount); j++) {
              const pred = await contract.getPrediction(i, j)
              if (pred.predictor.toLowerCase() === address?.toLowerCase()) {
                let status: 'active' | 'won' | 'lost' | 'claimable' = 'active'
                
                if (capsule.isUnlocked) {
                  const isCorrect = Number(pred.guess) === Number(capsule.actualCategory)
                  if (isCorrect) {
                    status = pred.claimed ? 'won' : 'claimable'
                  } else {
                    status = 'lost'
                  }
                }
                
                userPredictions.push({
                  capsuleId: i.toString(),
                  capsule: {
                    id: capsule.id.toString(),
                    creator: capsule.creator,
                    recipient: capsule.recipient,
                    ipfsCID: capsule.ipfsCID,
                    encryptedKey: "",
                    unlockTime: Number(capsule.unlockTime),
                    stakeAmount: ethers.formatEther(capsule.stakeAmount),
                    isUnlocked: capsule.isUnlocked,
                    stakeReleased: capsule.stakeReleased,
                    hint: capsule.hint,
                    actualCategory: Number(capsule.actualCategory),
                    isPublic: capsule.isPublic,
                    predictionPool: ethers.formatEther(capsule.predictionPool),
                  },
                  prediction: {
                    predictor: pred.predictor,
                    guess: Number(pred.guess),
                    stakeAmount: ethers.formatEther(pred.stakeAmount),
                    claimed: pred.claimed,
                  },
                  status
                })
                break
              }
            }
          }
        } catch (e) {
          console.error(`Error loading prediction for capsule ${i}:`, e)
        }
      }
      
      setPredictions(userPredictions)
    } catch (error) {
      console.error("Failed to load predictions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClaimReward = async (capsuleId: string) => {
    try {
      setClaiming(capsuleId)
      if (provider) {
        await timeCapsuleService.initialize(provider)
      }
      await timeCapsuleService.claimReward(capsuleId)
      toast.success("Reward claimed!")
      loadUserPredictions()
    } catch (error: any) {
      console.error("Failed to claim:", error)
      toast.error(error?.message || "Failed to claim reward")
    } finally {
      setClaiming(null)
    }
  }

  const getTimeRemaining = (unlockTime: number) => {
    const now = Date.now() / 1000
    const remaining = unlockTime - now
    if (remaining <= 0) return "Unlockable"
    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const activePredictions = predictions.filter(p => p.status === 'active')
  const claimablePredictions = predictions.filter(p => p.status === 'claimable')
  const pastPredictions = predictions.filter(p => p.status === 'won' || p.status === 'lost')

  if (!isConnected) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Connect Wallet</h3>
            <p className="text-muted-foreground">Connect your wallet to view your predictions</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">My Predictions</h1>
        <p className="text-muted-foreground">Track your prediction stakes and rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{predictions.length}</p>
              <p className="text-sm text-muted-foreground">Total Predictions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{activePredictions.length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Gift className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold">{claimablePredictions.length}</p>
              <p className="text-sm text-muted-foreground">Claimable</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Check className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{pastPredictions.filter(p => p.status === 'won').length}</p>
              <p className="text-sm text-muted-foreground">Won</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claimable Rewards */}
      {claimablePredictions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Gift className="h-5 w-5 text-accent" />
            Claimable Rewards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claimablePredictions.map((p) => (
              <Card key={p.capsuleId} className="border-accent/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Capsule #{p.capsuleId}</p>
                      <p className="font-medium">"{p.capsule.hint}"</p>
                    </div>
                    <Badge className="bg-accent">Winner!</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Your Guess: {CATEGORY_NAMES[p.prediction.guess]}</span>
                    <span className="text-accent font-semibold">{p.prediction.stakeAmount} ETH staked</span>
                  </div>
                  <Button 
                    className="w-full glow-primary"
                    onClick={() => handleClaimReward(p.capsuleId)}
                    disabled={claiming === p.capsuleId}
                  >
                    {claiming === p.capsuleId ? "Claiming..." : "Claim Reward"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Predictions */}
      {activePredictions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Active Predictions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePredictions.map((p) => (
              <Card key={p.capsuleId}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Capsule #{p.capsuleId}</p>
                      <p className="font-medium italic">"{p.capsule.hint}"</p>
                    </div>
                    <Badge variant="secondary">{getTimeRemaining(p.capsule.unlockTime)}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Your Guess:</span>
                      <p className="font-medium">{CATEGORY_NAMES[p.prediction.guess]}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">Staked:</span>
                      <p className="font-medium text-accent">{p.prediction.stakeAmount} ETH</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Predictions */}
      {pastPredictions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Past Predictions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastPredictions.map((p) => (
              <Card key={p.capsuleId} className={p.status === 'won' ? 'border-green-500/50' : 'border-red-500/50'}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-muted-foreground">Capsule #{p.capsuleId}</p>
                    <Badge variant={p.status === 'won' ? 'default' : 'destructive'}>
                      {p.status === 'won' ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                      {p.status === 'won' ? 'Won' : 'Lost'}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Your Guess:</span>
                      <span>{CATEGORY_NAMES[p.prediction.guess]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actual:</span>
                      <span className="font-medium">{CATEGORY_NAMES[p.capsule.actualCategory]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Staked:</span>
                      <span>{p.prediction.stakeAmount} ETH</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : predictions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No Predictions Yet</h3>
              <p className="text-muted-foreground">Go to Explore and make your first prediction!</p>
            </div>
            <Button onClick={() => window.location.href = '/explore'}>
              Explore Capsules
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
