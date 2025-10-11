"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Lock, Upload, Zap, AlertCircle, CheckCircle, Wallet } from "lucide-react"
import { CapsulePreview } from "@/components/capsule-preview"
import { EncryptionStatus } from "@/components/encryption-status"
import { useWallet } from "@/lib/wallet-context"
import { TimeCapsuleContract } from "@/lib/smart-contracts"
import { encryptContent, generateIPFSHash } from "@/lib/encryption"

export default function CreateCapsulePage() {
  const [step, setStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    unlockDate: "",
    unlockTime: "",
    category: "",
    isPublic: true,
  })

  const { isConnected, address, connectWallet } = useWallet()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateCapsule = async () => {
    if (!isConnected) {
      await connectWallet()
      return
    }

    setIsCreating(true)

    try {
      const unlockDateTime = new Date(`${formData.unlockDate}T${formData.unlockTime}`)
      const encryptedContent = encryptContent(formData.message, unlockDateTime)
      const ipfsHash = generateIPFSHash()

      const capsuleId = await TimeCapsuleContract.createCapsule({
        title: formData.title,
        contentHash: ipfsHash,
        unlockDate: unlockDateTime,
        category: formData.category,
        isPublic: formData.isPublic,
      })

      console.log("[v0] Capsule created successfully:", capsuleId)
      setStep(4)
    } catch (error) {
      console.error("[v0] Failed to create capsule:", error)
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
          Lock your message in time and let the community predict its future impact
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
                  You need to connect your wallet to create time capsules on the blockchain
                </p>
              </div>
              <Button onClick={connectWallet} className="glow-primary">
                Connect Wallet to Continue
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
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                placeholder="Write your message that will be revealed in the future..."
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className="min-h-32 bg-input border-border resize-none"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formData.message.length} characters</span>
                <span>Max: 1000 characters</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="prediction">Prediction</SelectItem>
                  <SelectItem value="advice">Advice</SelectItem>
                  <SelectItem value="secret">Secret</SelectItem>
                  <SelectItem value="memory">Memory</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!formData.title || !formData.message || !formData.category}
              className="w-full glow-primary"
            >
              Continue to Unlock Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && isConnected && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Step 2: Unlock Settings
            </CardTitle>
            <CardDescription>Choose when your capsule will be unlocked</CardDescription>
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
                  className="bg-input border-border"
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
                  className="bg-input border-border"
                />
              </div>
            </div>

            {formData.unlockDate && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-accent" />
                  <span className="font-medium">Unlock Schedule</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your capsule will unlock on{" "}
                  <span className="font-medium text-foreground">
                    {new Date(formData.unlockDate + "T" + (formData.unlockTime || "00:00")).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: formData.unlockTime ? "numeric" : undefined,
                        minute: formData.unlockTime ? "2-digit" : undefined,
                      },
                    )}
                  </span>
                </p>
              </div>
            )}

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                Step 3: Review & Create
              </CardTitle>
              <CardDescription>Review your capsule before creating it on the blockchain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EncryptionStatus />

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <span className="text-sm font-medium">Encryption</span>
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    AES-256
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <span className="text-sm font-medium">Storage</span>
                  <Badge variant="secondary" className="gap-1">
                    <Upload className="h-3 w-3" />
                    IPFS
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <span className="text-sm font-medium">Network</span>
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    Polygon
                  </Badge>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary">Important</p>
                    <p className="text-muted-foreground">
                      Once created, your capsule cannot be modified or deleted. Make sure all details are correct.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleCreateCapsule} disabled={isCreating} className="flex-1 glow-primary">
                  {isCreating ? "Creating on Blockchain..." : "Create Capsule"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <CapsulePreview formData={formData} />
        </div>
      )}

      {step === 4 && (
        <Card className="border-border bg-card text-center">
          <CardContent className="pt-8 space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Capsule Created Successfully!</h2>
              <p className="text-muted-foreground">
                Your time capsule has been encrypted and stored on IPFS. The smart contract has been deployed on
                Polygon.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Capsule ID:</span>
                    <p className="font-mono">#TC-2024-001</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IPFS Hash:</span>
                    <p className="font-mono text-xs">Qm...abc123</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Create Another
                </Button>
                <Button className="flex-1 glow-primary">View My Capsules</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
