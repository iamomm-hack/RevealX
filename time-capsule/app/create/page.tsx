"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Lock, Upload, Zap, AlertCircle, CheckCircle, Wallet, Coins } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"
import { timeCapsuleService, Category, CATEGORY_NAMES } from "@/lib/contract-service"
import { generateSymmetricKey, encryptContent, encryptSymmetricKey } from "@/lib/encryption-utils"
import { uploadToIPFS } from "@/lib/ipfs-service"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"

export default function CreateCapsulePage() {
  const [step, setStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [createdCapsuleId, setCreatedCapsuleId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    unlockDate: "",
    unlockTime: "",
    category: "8", // Default to Other
    recipient: "", // Empty = self
    stakeAmount: "0.01", // ETH
    hint: "", // Teaser for public capsules
    isPublic: false, // Visible in gallery
  })

  const { isConnected, address, connectWallet, signer } = useWallet()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateCapsule = async () => {
    if (!isConnected || !signer) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsCreating(true)

    try {
      // 1. Generate symmetric key and encrypt content
      const symmetricKey = generateSymmetricKey()
      const encryptedContent = encryptContent(formData.message, symmetricKey)

      // 2. Upload to IPFS
      toast.info("Uploading to IPFS...")
      const ipfsResult = await uploadToIPFS(encryptedContent, {
        title: formData.title,
        category: formData.category,
      })

      // 3. Encrypt symmetric key for recipient
      const recipientAddress = formData.recipient || address!
      const encryptedKey = await encryptSymmetricKey(symmetricKey, recipientAddress, signer)

      // 4. Calculate unix timestamp
      const unlockDateTime = new Date(`${formData.unlockDate}T${formData.unlockTime}`)
      const unlockTimestamp = Math.floor(unlockDateTime.getTime() / 1000)

      // 5. Create capsule on blockchain
      toast.info("Creating capsule on blockchain...")
      const capsuleId = await timeCapsuleService.createCapsule(
        recipientAddress,
        unlockTimestamp,
        ipfsResult.cid,
        encryptedKey,
        formData.stakeAmount,
        formData.hint,
        parseInt(formData.category) as Category,
        formData.isPublic
      )

      setCreatedCapsuleId(capsuleId)
      toast.success("Time Capsule created successfully!")
      setStep(4)
    } catch (error: any) {
      console.error("Failed to create capsule:", error)
      toast.error(getErrorMessage(error, "Failed to create capsule"))
    } finally {
      setIsCreating(false)
    }
  }

  const progress = (step / 4) * 100

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Create Time Capsule</h1>
        <p className="text-muted-foreground text-lg">
          Lock your message and funds in time - cryptographically secured, blockchain enforced
        </p>
        <Progress value={progress} className="w-full max-w-md mx-auto" />
      </div>

      {!isConnected && (
        <Card className="border-border bg-card border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Wallet className="h-12 w-12 text-primary mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  You need to connect your MetaMask wallet to create time capsules
                </p>
              </div>
              <Button onClick={connectWallet} className="glow-primary">
                Connect MetaMask
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && isConnected && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Step 1: Your Message
            </CardTitle>
            <CardDescription>Write the message you want to lock in time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span className="text-sm">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Capsule Title</Label>
              <Input
                id="title"
                placeholder="Give your capsule a memorable title..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                placeholder="Write your message that will be revealed in the future..."
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className="min-h-32 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category (What type of reveal?)</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_NAMES.map((name, index) => (
                    <SelectItem key={index} value={index.toString()}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hint">Hint / Teaser (for public capsules)</Label>
              <Input
                id="hint"
                placeholder="e.g., 'This will change my life...' or 'Big announcement coming!'"
                value={formData.hint}
                onChange={(e) => handleInputChange("hint", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This hint will be visible to everyone before unlock. The actual content stays hidden.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isPublic">Make this capsule public (visible in gallery for predictions)</Label>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!formData.title || !formData.message}
              className="w-full glow-primary"
            >
              Continue to Unlock Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Step 2: Time Lock \u0026 Staking
            </CardTitle>
            <CardDescription>Choose when to unlock and how much to stake</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unlockDate">Unlock Date</Label>
                <Input
                  id="unlockDate"
                  type="date"
                  value={formData.unlockDate}
                  onChange={(e) => handleInputChange("unlockDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unlockTime">Unlock Time</Label>
                <Input
                  id="unlockTime"
                  type="time"
                  value={formData.unlockTime}
                  onChange={(e) => handleInputChange("unlockTime", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stakeAmount">Stake Amount (ETH)</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="stakeAmount"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.stakeAmount}
                  onChange={(e) => handleInputChange("stakeAmount", e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your stake will be locked until the unlock time and returned to you when you open the capsule
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient (optional)</Label>
              <Input
                id="recipient"
                placeholder="0x... (leave empty for self)"
                value={formData.recipient}
                onChange={(e) => handleInputChange("recipient", e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!formData.unlockDate} className="flex-1 glow-primary">
                Continue to Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              Step 3: Review \u0026 Create
            </CardTitle>
            <CardDescription>Review your capsule before creating it on the blockchain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Title:</span>
                  <span>{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Unlock:</span>
                  <span>{new Date(`${formData.unlockDate}T${formData.unlockTime}`).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Stake:</span>
                  <span className="text-accent font-bold">{formData.stakeAmount} ETH</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary">Important</p>
                    <p className="text-muted-foreground">
                      Once created, your capsule cannot be modified. Your stake will be locked until the unlock time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleCreateCapsule} disabled={isCreating} className="flex-1 glow-primary">
                {isCreating ? "Creating..." : `Stake ${formData.stakeAmount} ETH \u0026 Create`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="text-center">
          <CardContent className="pt-8 space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Capsule Created Successfully!</h2>
              <p className="text-muted-foreground">
                Your time capsule has been encrypted and locked on the blockchain
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">Capsule ID:</p>
                <p className="font-mono font-bold">#{createdCapsuleId}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => {
                setStep(1)
                setFormData({
                  title: "",
                  message: "",
                  unlockDate: "",
                  unlockTime: "",
                  category: "8",
                  recipient: "",
                  stakeAmount: "0.01",
                  hint: "",
                  isPublic: false,
                })
              }} className="flex-1">
                Create Another
              </Button>
              <Link href="/capsules">
                <Button className="w-full glow-primary">View My Capsules</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
