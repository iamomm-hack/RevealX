import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Lock, User, Hash } from "lucide-react"

interface CapsulePreviewProps {
  formData: {
    title: string
    message: string
    unlockDate: string
    unlockTime: string
    category: string
    isPublic: boolean
  }
}

export function CapsulePreview({ formData }: CapsulePreviewProps) {
  const unlockDateTime = new Date(`${formData.unlockDate}T${formData.unlockTime || "00:00"}`)
  const daysUntilUnlock = Math.ceil((unlockDateTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Capsule Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{formData.title || "Untitled Capsule"}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {formData.category || "Uncategorized"}
            </Badge>
            <Badge variant={formData.isPublic ? "default" : "outline"} className="text-xs">
              {formData.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
        </div>

        {/* Encrypted Content Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            Encrypted Content
          </div>
          <div className="h-24 bg-muted/50 rounded-lg border border-dashed border-border flex items-center justify-center">
            <div className="text-center space-y-1">
              <Lock className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground font-mono">[ENCRYPTED - UNLOCKS IN {daysUntilUnlock} DAYS]</p>
            </div>
          </div>
        </div>

        {/* Unlock Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Unlock Date:</span>
            <span className="font-medium">
              {unlockDateTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {formData.unlockTime && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">Unlock Time:</span>
              <span className="font-medium">
                {unlockDateTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Technical Details */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">IPFS Hash:</span>
            <span className="font-mono text-xs">Qm...{Math.random().toString(36).substr(2, 8)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Creator:</span>
            <span className="font-mono text-xs">0x...{Math.random().toString(36).substr(2, 6)}</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
          <div className="text-2xl font-bold text-primary">{daysUntilUnlock}</div>
          <div className="text-sm text-muted-foreground">{daysUntilUnlock === 1 ? "day" : "days"} until unlock</div>
        </div>
      </CardContent>
    </Card>
  )
}
