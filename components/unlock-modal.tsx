"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Unlock, Lock, Calendar, Users, Coins, Eye, Clock, Share, Download } from "lucide-react"
import type { TimeCapsule } from "@/lib/smart-contracts"

interface UnlockModalProps {
  capsule: TimeCapsule | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUnlockComplete: () => void
}

export function UnlockModal({ capsule, open, onOpenChange, onUnlockComplete }: UnlockModalProps) {
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [unlockedContent, setUnlockedContent] = useState<string | null>(null)

  if (!capsule) return null

  const isUnlocked = capsule.unlockDate <= Date.now()
  const unlockDate = new Date(capsule.unlockDate)
  const daysUntilUnlock = Math.ceil((capsule.unlockDate - Date.now()) / (1000 * 60 * 60 * 24))

  const handleUnlock = async () => {
    if (!isUnlocked) return

    setIsUnlocking(true)
    try {
      // Simulate decryption process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock decrypted content
      const mockContent = `This is the decrypted content of "${capsule.title}". 

This message was written on ${new Date(capsule.createdAt).toLocaleDateString()} and was meant to be revealed today.

Here's what I wanted to share with the future:

"Looking back at this moment, I hope the predictions I made came true. The world of Web3 and decentralized social networks has evolved so much since I wrote this. I'm curious to see how the community reacted to this capsule and whether people found it interesting or not.

Time capsules are such a fascinating way to connect with the future. It's like sending a message to yourself and the world at a specific point in time."

Thank you for being part of this journey!

- The Creator`

      setUnlockedContent(mockContent)
    } catch (error) {
      console.error("[v0] Failed to unlock capsule:", error)
    } finally {
      setIsUnlocking(false)
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
            {isUnlocked ? "This time capsule has been unlocked" : "This time capsule is still locked"}
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
                    <p className="font-medium">{capsule.predictionCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Total Staked</p>
                    <p className="font-medium">{capsule.totalStaked} MATIC</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary">{capsule.category}</Badge>
                {isUnlocked ? (
                  <Badge variant="default" className="gap-1 bg-accent text-accent-foreground">
                    <Unlock className="h-3 w-3" />
                    Unlocked
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
                      Click the button below to decrypt and view the content
                    </p>
                  </div>
                  <Button onClick={handleUnlock} disabled={isUnlocking} className="glow-primary">
                    {isUnlocking ? "Decrypting..." : "Unlock Content"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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
