"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Lock, Unlock, Coins, Plus } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"
import { TimeCapsuleContract, type TimeCapsule } from "@/lib/smart-contracts"
import { CapsuleCard } from "@/components/capsule-card"
import { UnlockModal } from "@/components/unlock-modal"
import Link from "next/link"

export default function CapsulesPage() {
  const [userCapsules, setUserCapsules] = useState<TimeCapsule[]>([])
  const [allCapsules, setAllCapsules] = useState<TimeCapsule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null)
  const [unlockModalOpen, setUnlockModalOpen] = useState(false)
  const { isConnected, address, connectWallet } = useWallet()

  useEffect(() => {
    if (isConnected && address) {
      loadCapsules()
    }
  }, [isConnected, address])

  const loadCapsules = async () => {
    if (!address) return

    try {
      const [userCaps, allCaps] = await Promise.all([
        TimeCapsuleContract.getUserCapsules(address),
        TimeCapsuleContract.getCapsulesForPrediction(),
      ])
      setUserCapsules(userCaps)
      setAllCapsules(allCaps)
    } catch (error) {
      console.error("[v0] Failed to load capsules:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = (capsule: TimeCapsule) => {
    setSelectedCapsule(capsule)
    setUnlockModalOpen(true)
  }

  const unlockedCapsules = userCapsules.filter((c) => c.unlockDate <= Date.now())
  const lockedCapsules = userCapsules.filter((c) => c.unlockDate > Date.now())
  const publicCapsules = allCapsules.filter((c) => c.isPublic)

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Time Capsules</h1>
          <p className="text-muted-foreground">Manage your time-locked messages and explore the community</p>
        </div>
        <Link href="/create">
          <Button className="gap-2 glow-primary">
            <Plus className="h-4 w-4" />
            Create Capsule
          </Button>
        </Link>
      </div>

      {/* Wallet Connection */}
      {!isConnected && (
        <Card className="border-primary/20">
          <CardContent className="p-6 text-center space-y-4">
            <Lock className="h-12 w-12 text-primary mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Connect to View Your Capsules</h3>
              <p className="text-muted-foreground">Connect your wallet to see your time capsules and unlock them</p>
            </div>
            <Button onClick={connectWallet} className="glow-primary">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      )}

      {isConnected && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Your Capsules</span>
                </div>
                <p className="text-2xl font-bold">{userCapsules.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Unlock className="h-4 w-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Unlocked</span>
                </div>
                <p className="text-2xl font-bold">{unlockedCapsules.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Still Locked</span>
                </div>
                <p className="text-2xl font-bold">{lockedCapsules.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Total Earned</span>
                </div>
                <p className="text-2xl font-bold">24.7 MATIC</p>
              </CardContent>
            </Card>
          </div>

          {/* Capsule Tabs */}
          <Tabs defaultValue="my-capsules" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="my-capsules">My Capsules</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
              <TabsTrigger value="locked">Locked</TabsTrigger>
              <TabsTrigger value="explore">Explore</TabsTrigger>
            </TabsList>

            <TabsContent value="my-capsules" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6 space-y-4">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-16 bg-muted rounded"></div>
                        <div className="h-8 bg-muted rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userCapsules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userCapsules.map((capsule) => (
                    <CapsuleCard key={capsule.id} capsule={capsule} onUnlock={handleUnlock} showOwnership={false} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center space-y-4">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">No Capsules Yet</h3>
                      <p className="text-muted-foreground">Create your first time capsule to get started</p>
                    </div>
                    <Link href="/create">
                      <Button className="glow-primary">Create Your First Capsule</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="unlocked" className="space-y-4">
              {unlockedCapsules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unlockedCapsules.map((capsule) => (
                    <CapsuleCard key={capsule.id} capsule={capsule} onUnlock={handleUnlock} showOwnership={false} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center space-y-4">
                    <Unlock className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">No Unlocked Capsules</h3>
                      <p className="text-muted-foreground">Your capsules will appear here when they unlock</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="locked" className="space-y-4">
              {lockedCapsules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lockedCapsules.map((capsule) => (
                    <CapsuleCard key={capsule.id} capsule={capsule} onUnlock={handleUnlock} showOwnership={false} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center space-y-4">
                    <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">No Locked Capsules</h3>
                      <p className="text-muted-foreground">Create time capsules to see them here</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="explore" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicCapsules.map((capsule) => (
                  <CapsuleCard key={capsule.id} capsule={capsule} onUnlock={handleUnlock} showOwnership={true} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Unlock Modal */}
      <UnlockModal
        capsule={selectedCapsule}
        open={unlockModalOpen}
        onOpenChange={setUnlockModalOpen}
        onUnlockComplete={() => {
          setUnlockModalOpen(false)
          loadCapsules()
        }}
      />
    </div>
  )
}
