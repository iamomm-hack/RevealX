"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Coins, Star, Heart, ExternalLink, ArrowLeft, Trophy, TrendingUp } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"
import { getProfile, getInitials, type UserProfile } from "@/lib/user-profile-service"
import { timeCapsuleService, type Capsule, CATEGORY_NAMES } from "@/lib/contract-service"
import { toast } from "sonner"
import Link from "next/link"
import { ethers } from "ethers"

interface PageProps {
  params: Promise<{ address: string }>
}

export default function UserProfilePage({ params }: PageProps) {
  const { address: userAddress } = use(params)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [capsules, setCapsules] = useState<(Capsule & { likes: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [starring, setStarring] = useState(false)
  const [hasStarred, setHasStarred] = useState(false)
  const [starCount, setStarCount] = useState(0)
  
  const { isConnected, address: myAddress, provider } = useWallet()

  useEffect(() => {
    if (userAddress) {
      loadUserProfile()
    }
  }, [userAddress, myAddress])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      
      // Load profile from localStorage
      const p = getProfile(userAddress)
      setProfile(p)
      
      // Load capsules and stats from blockchain
      const rpcProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''
      
      if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) {
        console.warn("Invalid contract address configured:", CONTRACT_ADDRESS)
        setLoading(false)
        return
      }
      
      const CONTRACT_ABI = [
        "function getCapsule(uint256 _id) external view returns (tuple(uint256 id, address creator, address recipient, string ipfsCID, bytes encryptedKey, uint256 unlockTime, uint256 stakeAmount, bool isUnlocked, bool stakeReleased, string hint, uint8 actualCategory, bool isPublic, uint256 predictionPool))",
        "function nextCapsuleId() external view returns (uint256)",
        "function getCapsuleLikes(uint256 _id) external view returns (uint256)",
        "function getUserStars(address _user) external view returns (uint256)",
        "function hasStarredUser(address, address) external view returns (bool)"
      ]
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, rpcProvider)
      
      // Get star count
      try {
        const stars = await contract.getUserStars(userAddress)
        setStarCount(Number(stars))
      } catch (e) {
        console.log("Could not get stars:", e)
      }
      
      // Check if current user has starred this profile
      if (myAddress) {
        try {
          const starred = await contract.hasStarredUser(userAddress, myAddress)
          setHasStarred(starred)
        } catch (e) {
          console.log("Could not check starred status:", e)
        }
      }
      
      // Get user's public capsules
      const nextId = await contract.nextCapsuleId()
      const userCapsules: (Capsule & { likes: number })[] = []
      
      for (let i = 0; i < Number(nextId); i++) {
        try {
          const capsule = await contract.getCapsule(i)
          if (capsule.creator.toLowerCase() === userAddress.toLowerCase() && capsule.isPublic) {
            const likes = await contract.getCapsuleLikes(i)
            userCapsules.push({
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
              likes: Number(likes)
            })
          }
        } catch (e) {
          console.error(`Error loading capsule ${i}:`, e)
        }
      }
      
      setCapsules(userCapsules)
    } catch (error) {
      console.error("Failed to load profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStar = async () => {
    if (!isConnected || !myAddress) {
      toast.error("Connect wallet to star")
      return
    }
    
    if (myAddress.toLowerCase() === userAddress.toLowerCase()) {
      toast.error("Cannot star yourself")
      return
    }
    
    try {
      setStarring(true)
      if (provider) {
        await timeCapsuleService.initialize(provider)
      }
      
      if (hasStarred) {
        await timeCapsuleService.unstarUser(userAddress)
        setHasStarred(false)
        setStarCount(prev => prev - 1)
        toast.success("Unstarred user")
      } else {
        await timeCapsuleService.starUser(userAddress)
        setHasStarred(true)
        setStarCount(prev => prev + 1)
        toast.success("Starred user!")
      }
    } catch (error: any) {
      console.error("Star error:", error)
      toast.error(error?.message || "Failed to star")
    } finally {
      setStarring(false)
    }
  }

  const handleLikeCapsule = async (capsuleId: string) => {
    if (!isConnected || !provider) {
      toast.error("Connect wallet to like")
      return
    }
    
    try {
      await timeCapsuleService.initialize(provider)
      await timeCapsuleService.likeCapsule(capsuleId)
      toast.success("Liked!")
      loadUserProfile()
    } catch (error: any) {
      toast.error(error?.message || "Failed to like")
    }
  }

  const getTimeRemaining = (unlockTime: number) => {
    const now = Date.now() / 1000
    const remaining = unlockTime - now
    if (remaining <= 0) return "Unlocked"
    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link href="/profile">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>

      {/* User Header */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} />}
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getInitials(userAddress)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-2xl font-bold">{profile?.username || "Anonymous User"}</h1>
              {profile?.bio && <p className="text-muted-foreground">{profile.bio}</p>}
              
              <div className="flex items-center justify-center md:justify-start gap-2">
                <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                  {userAddress.slice(0, 10)}...{userAddress.slice(-8)}
                </code>
                <Button variant="ghost" size="icon" asChild>
                  <a href={`https://etherscan.io/address/${userAddress}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                  {starCount} Stars
                </Badge>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {capsules.length} Capsules
                </Badge>
              </div>
            </div>
            
            {/* Star Button */}
            {isConnected && myAddress?.toLowerCase() !== userAddress.toLowerCase() && (
              <Button 
                onClick={handleStar}
                disabled={starring}
                variant={hasStarred ? "default" : "outline"}
                className="gap-2"
              >
                <Star className={`h-4 w-4 ${hasStarred ? 'fill-yellow-400' : ''}`} />
                {starring ? "..." : hasStarred ? "Starred" : "Star"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Public Capsules */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Public Capsules</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-12 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : capsules.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No public capsules yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capsules.map(capsule => (
              <Card key={capsule.id} className="card-hover">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary">{CATEGORY_NAMES[capsule.actualCategory]}</Badge>
                    <Badge variant={capsule.isUnlocked ? "default" : "outline"}>
                      {getTimeRemaining(capsule.unlockTime)}
                    </Badge>
                  </div>
                  
                  <p className="font-medium italic">"{capsule.hint}"</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Coins className="h-4 w-4" />
                      {capsule.predictionPool} ETH pool
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleLikeCapsule(capsule.id)}
                    >
                      <Heart className="h-4 w-4" />
                      {capsule.likes}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
