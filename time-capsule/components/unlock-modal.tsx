"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Unlock, Lock, Calendar, Users, Coins, Eye, Clock, Share, Download, Gift } from "lucide-react"
import type { TimeCapsule } from "@/lib/smart-contracts"
import { timeCapsuleService, CATEGORY_NAMES } from "@/lib/contract-service"
import { useWallet } from "@/lib/wallet-context"
import { toast } from "sonner"

interface UnlockModalProps {
  capsule: TimeCapsule | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUnlockComplete: () => void
}

export function UnlockModal({ capsule, open, onOpenChange, onUnlockComplete }: UnlockModalProps) {
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [unlockedContent, setUnlockedContent] = useState<string | null>(null)
  const { provider, address } = useWallet()

  if (!capsule) return null

  const isUnlocked = capsule.unlockDate <= Date.now()
  const unlockDate = new Date(capsule.unlockDate)
  const daysUntilUnlock = Math.ceil((capsule.unlockDate - Date.now()) / (1000 * 60 * 60 * 24))

  const handleUnlock = async () => {
    if (!isUnlocked || !provider) return

    setIsUnlocking(true)
    try {
      await timeCapsuleService.initialize(provider)
      await timeCapsuleService.unlockCapsule(capsule.id)
      
      toast.success("Capsule unlocked! Stake returned to recipient.")
      
      // Show decrypted content (in real app, would fetch from IPFS and decrypt)
      setUnlockedContent(`Your capsule "${capsule.title}" has been unlocked!\n\nCategory: ${CATEGORY_NAMES[(capsule as any).actualCategory] || 'Unknown'}\n\nYour staked amount has been returned.`)
      
      onUnlockComplete()
    } catch (error: any) {
      console.error("Failed to unlock capsule:", error)
      toast.error(error?.message || "Failed to unlock capsule")
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleClaimReward = async () => {
    if (!provider) return

    setIsClaiming(true)
    try {
      await timeCapsuleService.initialize(provider)
      await timeCapsuleService.claimReward(capsule.id)
      
      toast.success("Prediction reward claimed successfully!")
      onUnlockComplete()
    } catch (error: any) {
      console.error("Failed to claim reward:", error)
      toast.error(error?.message || "Failed to claim reward - maybe wrong prediction?")
    } finally {
      setIsClaiming(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: capsule.title,
        text: `Check out this unlocked time capsule: "${capsule.title}"`,
        url: window.location.href,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUnlocked ? (
              <Unlock className="h-5 w-5 text-accent" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
            {capsule.title}
          </DialogTitle>
          <DialogDescription>
            {isUnlocked ? "This time capsule can be unlocked" : "This time capsule is still locked"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Capsule Info */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(capsule.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">{isUnlocked ? "Unlocked" : "Unlocks"}</p>
                    <p className="font-medium">{unlockDate.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Predictions</p>
                    <p className="font-medium">{capsule.predictionCount || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Total Staked</p>
                    <p className="font-medium">{capsule.totalStaked} ETH</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary">{capsule.category}</Badge>
                {isUnlocked ? (
                  <Badge variant="default" className="gap-1 bg-accent text-accent-foreground">
                    <Unlock className="h-3 w-3" />
                    Ready to Unlock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    {daysUntilUnlock} days left
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                {isUnlocked ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                Content
              </h3>

              {!isUnlocked ? (
                <div className="p-6 rounded-lg bg-muted/50 border border-dashed border-border text-center space-y-3">
                  <Lock className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium">Content is still locked</p>
                    <p className="text-sm text-muted-foreground">This capsule will unlock in {daysUntilUnlock} days</p>
                  </div>
                </div>
              ) : unlockedContent ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <pre className="whitespace-pre-wrap text-sm font-sans">{unlockedContent}</pre>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 bg-transparent">
                      <Share className="h-3 w-3" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="p-6 rounded-lg bg-primary/10 border border-primary/20">
                    <Unlock className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="font-medium text-primary">Ready to unlock!</p>
                    <p className="text-sm text-muted-foreground">
                      Click the button below to unlock and claim your stake
                    </p>
                  </div>
                  <Button onClick={handleUnlock} disabled={isUnlocking} className="glow-primary">
                    {isUnlocking ? "Unlocking..." : "Unlock & Claim Stake"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Claim Prediction Reward Section */}
          {isUnlocked && (
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Gift className="h-4 w-4 text-accent" />
                  Claim Prediction Reward
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  If you made a correct prediction on this capsule, claim your reward!
                </p>
                <Button 
                  onClick={handleClaimReward} 
                  disabled={isClaiming}
                  variant="outline"
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  {isClaiming ? "Claiming..." : "Claim Prediction Reward"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
            {isUnlocked && !unlockedContent && (
              <Button onClick={handleUnlock} disabled={isUnlocking} className="flex-1 glow-primary">
                {isUnlocking ? "Unlocking..." : "Unlock Content"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
