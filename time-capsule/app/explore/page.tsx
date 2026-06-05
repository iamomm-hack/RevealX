"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Users, Coins, Eye, Lock, TrendingUp } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"
import { timeCapsuleService, Category, CATEGORY_NAMES, type Capsule } from "@/lib/contract-service"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"
import { ethers } from "ethers"

import { getJsonRpcProvider } from "@/lib/rpc-provider"

interface PublicCapsule extends Capsule {
  predictionCount?: number
}

export default function ExplorePage() {
  const [capsules, setCapsules] = useState<PublicCapsule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCapsule, setSelectedCapsule] = useState<PublicCapsule | null>(null)
  const [predictionModalOpen, setPredictionModalOpen] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [predictionData, setPredictionData] = useState({
    guess: "0",
    stakeAmount: "0.01"
  })
  
  const { isConnected, provider } = useWallet()

  useEffect(() => {
    loadPublicCapsules()
  }, [])

  const loadPublicCapsules = async () => {
    try {
      setLoading(true)
      const rpcProvider = getJsonRpcProvider()
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''
      
      if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) {
        console.warn("Invalid contract address configured:", CONTRACT_ADDRESS)
        setLoading(false)
        return
      }
      
      const CONTRACT_ABI = [
        "function getCapsule(uint256 _id) external view returns (tuple(uint256 id, address creator, address recipient, string ipfsCID, bytes encryptedKey, uint256 unlockTime, uint256 stakeAmount, bool isUnlocked, bool stakeReleased, string hint, uint8 actualCategory, bool isPublic, uint256 predictionPool))",
        "function nextCapsuleId() external view returns (uint256)",
        "function getPredictionCount(uint256 _id) external view returns (uint256)"
      ]
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, rpcProvider)
      const nextId = await contract.nextCapsuleId()
      const publicCapsules: PublicCapsule[] = []
      
      for (let i = 0; i < Number(nextId); i++) {
        try {
          const capsule = await contract.getCapsule(i)
          if (capsule.isPublic && !capsule.isUnlocked) {
            const predCount = await contract.getPredictionCount(i)
            publicCapsules.push({
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
              predictionCount: Number(predCount)
            })
          }
        } catch (e) {
          console.error(`Error loading capsule ${i}:`, e)
        }
      }
      setCapsules(publicCapsules)
    } catch (error) {
      console.error("Failed to load public capsules:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMakePrediction = async () => {
    if (!isConnected || !selectedCapsule) return
    
    try {
      setPredicting(true)
      if (provider) {
        await timeCapsuleService.initialize(provider)
      }
      
      await timeCapsuleService.makePrediction(
        selectedCapsule.id,
        parseInt(predictionData.guess) as Category,
        predictionData.stakeAmount
      )
      
      toast.success("Prediction submitted successfully!")
      setPredictionModalOpen(false)
      loadPublicCapsules()
    } catch (error: any) {
      console.error("Failed to make prediction:", error)
      toast.error(getErrorMessage(error, "Failed to submit prediction"))
    } finally {
      setPredicting(false)
    }
  }

  const openPredictionModal = (capsule: PublicCapsule) => {
    setSelectedCapsule(capsule)
    setPredictionModalOpen(true)
  }

  const getTimeRemaining = (unlockTime: number) => {
    const now = Date.now() / 1000
    const remaining = unlockTime - now
    if (remaining <= 0) return "Unlockable now"
    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)
    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Explore Public Capsules</h1>
        <p className="text-muted-foreground">
          Browse locked capsules, guess what's inside, and stake your prediction!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Eye className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{capsules.length}</p>
              <p className="text-sm text-muted-foreground">Public Capsules</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Coins className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold">
                {capsules.reduce((sum, c) => sum + parseFloat(c.predictionPool), 0).toFixed(3)} ETH
              </p>
              <p className="text-sm text-muted-foreground">Total Prediction Pool</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">
                {capsules.reduce((sum, c) => sum + (c.predictionCount || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Predictions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capsules Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-16 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : capsules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capsules.map((capsule) => (
            <Card key={capsule.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{CATEGORY_NAMES[capsule.actualCategory]}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Locked
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
                  <p className="text-sm italic">"{capsule.hint || "No hint provided..."}"</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{getTimeRemaining(capsule.unlockTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{capsule.predictionCount} predictions</span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <Coins className="h-4 w-4 text-accent" />
                    <span className="text-accent font-semibold">{capsule.predictionPool} ETH pool</span>
                  </div>
                </div>
                <Button 
                  className="w-full glow-primary" 
                  onClick={() => openPredictionModal(capsule)}
                  disabled={!isConnected}
                >
                  {isConnected ? "Make Prediction" : "Connect Wallet to Predict"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No Public Capsules Yet</h3>
              <p className="text-muted-foreground">Be the first to create a public capsule!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Modal */}
      <Dialog open={predictionModalOpen} onOpenChange={setPredictionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Your Prediction</DialogTitle>
            <DialogDescription>
              What do you think this capsule contains? Stake ETH on your guess!
            </DialogDescription>
          </DialogHeader>

          {selectedCapsule && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-sm font-medium mb-1">Creator's Hint:</p>
                <p className="italic">"{selectedCapsule.hint || "No hint"}"</p>
              </div>

              <div className="space-y-2">
                <Label>Your Prediction</Label>
                <Select 
                  value={predictionData.guess} 
                  onValueChange={(value) => setPredictionData(prev => ({ ...prev, guess: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="What's inside?" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_NAMES.map((name, index) => (
                      <SelectItem key={index} value={index.toString()}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Stake Amount (ETH)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.001"
                  value={predictionData.stakeAmount}
                  onChange={(e) => setPredictionData(prev => ({ ...prev, stakeAmount: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  If you guess correctly, you'll win a share of the losing predictions pool!
                </p>
              </div>

              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex justify-between items-center">
                  <span>Current Pool:</span>
                  <span className="font-bold text-accent">{selectedCapsule.predictionPool} ETH</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Predictions:</span>
                  <span>{selectedCapsule.predictionCount}</span>
                </div>
              </div>

              <Button 
                className="w-full glow-primary" 
                onClick={handleMakePrediction}
                disabled={predicting}
              >
                {predicting ? "Submitting..." : `Stake ${predictionData.stakeAmount} ETH & Predict`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
