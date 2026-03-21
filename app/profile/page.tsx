"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Clock, Coins, TrendingUp, Trophy, User, Copy, Check, ExternalLink, Edit, Camera, Star, Search } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"
import { getProfile, saveProfile, searchProfiles, getInitials, type UserProfile } from "@/lib/user-profile-service"
import { toast } from "sonner"
import Link from "next/link"

export default function ProfilePage() {
  const [copied, setCopied] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editForm, setEditForm] = useState({ username: "", bio: "", avatarUrl: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { isConnected, address, balance, connectWallet } = useWallet()
  
  // Mock stats - replace with real data from blockchain
  const [stats] = useState({
    capsulesCreated: 3,
    capsulesPending: 2,
    capsulesUnlocked: 1,
    totalPredictions: 12,
    correctPredictions: 8,
    totalEarnings: "0.25",
    totalStaked: "0.5",
    winRate: 66.7,
    stars: 5,
  })

  useEffect(() => {
    if (address) {
      const p = getProfile(address)
      setProfile(p)
      if (p) {
        setEditForm({ username: p.username, bio: p.bio, avatarUrl: p.avatarUrl })
      }
    }
  }, [address])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      const results = searchProfiles(query)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleSaveProfile = () => {
    if (!address) return
    
    const newProfile: UserProfile = {
      address,
      username: editForm.username,
      bio: editForm.bio,
      avatarUrl: editForm.avatarUrl,
      createdAt: profile?.createdAt || Date.now()
    }
    
    saveProfile(newProfile)
    setProfile(newProfile)
    setEditModalOpen(false)
    toast.success("Profile saved!")
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, avatarUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success("Address copied!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <User className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold">Connect Wallet</h2>
            <p className="text-muted-foreground">
              Connect your wallet to view your profile
            </p>
            <Button onClick={connectWallet} className="glow-primary">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Search Users */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by username or address..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 space-y-2">
              {searchResults.map((user) => (
                <Link href={`/user/${user.address}`} key={user.address}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                    <Avatar className="h-8 w-8">
                      {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                      <AvatarFallback>{getInitials(user.address)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.username || user.address.slice(0, 10) + "..."}</p>
                      <p className="text-xs text-muted-foreground">{user.address.slice(0, 10)}...</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Header */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} />}
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(address || "")}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-bold">{profile?.username || "Anonymous"}</h1>
                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex justify-center">
                        <div className="relative">
                          <Avatar className="h-20 w-20 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            {editForm.avatarUrl && <AvatarImage src={editForm.avatarUrl} />}
                            <AvatarFallback>{getInitials(address || "")}</AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Camera className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input 
                          value={editForm.username} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="Enter username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea 
                          value={editForm.bio} 
                          onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <Button className="w-full" onClick={handleSaveProfile}>Save Profile</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {profile?.bio && <p className="text-muted-foreground">{profile.bio}</p>}
              
              <div className="flex items-center justify-center md:justify-start gap-2">
                <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                  {address?.slice(0, 10)}...{address?.slice(-8)}
                </code>
                <Button variant="ghost" size="icon" onClick={copyAddress}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href={`https://etherscan.io/address/${address}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  <Coins className="h-4 w-4 mr-1" />
                  {parseFloat(balance || "0").toFixed(4)} ETH
                </Badge>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                  {stats.stars} Stars
                </Badge>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  <Trophy className="h-4 w-4 mr-1" />
                  {stats.winRate.toFixed(1)}% Win Rate
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 card-hover">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.capsulesCreated}</p>
            <p className="text-sm text-muted-foreground">Capsules Created</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 card-hover">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.totalPredictions}</p>
            <p className="text-sm text-muted-foreground">Predictions Made</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 card-hover">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.correctPredictions}</p>
            <p className="text-sm text-muted-foreground">Correct Predictions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 card-hover">
          <CardContent className="p-4 text-center">
            <Coins className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.totalEarnings} ETH</p>
            <p className="text-sm text-muted-foreground">Total Earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Tabs */}
      <Tabs defaultValue="capsules" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="capsules">My Capsules</TabsTrigger>
          <TabsTrigger value="predictions">My Predictions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="capsules" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Capsule Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span>Pending (Locked)</span>
                <Badge variant="secondary">{stats.capsulesPending}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span>Unlocked</span>
                <Badge variant="default">{stats.capsulesUnlocked}</Badge>
              </div>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/capsules'}>
                View All Capsules
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="predictions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prediction Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span>Total Predictions</span>
                <Badge variant="secondary">{stats.totalPredictions}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                <span>Correct (Won)</span>
                <Badge className="bg-green-500">{stats.correctPredictions}</Badge>
              </div>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/my-predictions'}>
                View All Predictions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
