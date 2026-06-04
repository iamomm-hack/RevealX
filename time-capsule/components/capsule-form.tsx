"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Lock, Upload } from "lucide-react"
import { encryptContent, generateIPFSHash } from "@/lib/encryption"

interface CapsuleFormData {
  title: string
  content: string
  unlockDate: string
  unlockTime: string
  category: string
  isPublic: boolean
  attachments: File[]
}

interface CapsuleFormProps {
  onSubmit: (data: CapsuleFormData & { encryptedContent: string; ipfsHash: string }) => void
  onPreview: (data: CapsuleFormData) => void
}

export function CapsuleForm({ onSubmit, onPreview }: CapsuleFormProps) {
  const [formData, setFormData] = useState<CapsuleFormData>({
    title: "",
    content: "",
    unlockDate: "",
    unlockTime: "",
    category: "",
    isPublic: true,
    attachments: [],
  })

  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      // Simulate encryption and IPFS storage
      const unlockDateTime = new Date(`${formData.unlockDate}T${formData.unlockTime}`)
      const encryptedContent = encryptContent(formData.content, unlockDateTime)
      const ipfsHash = generateIPFSHash()

      // Simulate blockchain transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      onSubmit({
        ...formData,
        encryptedContent,
        ipfsHash,
      })
    } catch (error) {
      console.error("Failed to create capsule:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...files] }))
  }

  const minDate = new Date().toISOString().split("T")[0]

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Create Time Capsule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Capsule Title</Label>
            <Input
              id="title"
              placeholder="Give your time capsule a memorable title..."
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Message to the Future</Label>
            <Textarea
              id="content"
              placeholder="Write your message, thoughts, predictions, or memories..."
              className="min-h-32"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              required
            />
          </div>

          {/* Unlock Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unlock-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Unlock Date
              </Label>
              <Input
                id="unlock-date"
                type="date"
                min={minDate}
                value={formData.unlockDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, unlockDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unlock-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Unlock Time
              </Label>
              <Input
                id="unlock-time"
                type="time"
                value={formData.unlockTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, unlockTime: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal Reflection</SelectItem>
                <SelectItem value="prediction">Future Prediction</SelectItem>
                <SelectItem value="memory">Memory Preservation</SelectItem>
                <SelectItem value="goal">Goal Setting</SelectItem>
                <SelectItem value="message">Message to Future Self</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Attachments (Optional)
            </Label>
            <Input
              id="attachments"
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.txt"
              onChange={handleFileUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {formData.attachments.length > 0 && (
              <div className="text-sm text-muted-foreground">{formData.attachments.length} file(s) selected</div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onPreview(formData)}
              disabled={!formData.title || !formData.content}
              className="flex-1"
            >
              Preview Capsule
            </Button>
            <Button
              type="submit"
              disabled={
                isCreating || !formData.title || !formData.content || !formData.unlockDate || !formData.unlockTime
              }
              className="flex-1"
            >
              {isCreating ? "Creating Capsule..." : "Create & Lock Capsule"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
