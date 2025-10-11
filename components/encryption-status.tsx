import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Database, Zap, CheckCircle, Clock } from "lucide-react"

export function EncryptionStatus() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          Security & Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Encryption Method */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Encryption</span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            AES-256
          </Badge>
        </div>

        {/* Storage Method */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Storage</span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            IPFS
          </Badge>
        </div>

        {/* Network */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Network</span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Polygon
          </Badge>
        </div>

        {/* Time Lock */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Time Lock</span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Smart Contract
          </Badge>
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-medium text-accent">End-to-End Security</p>
              <p className="text-muted-foreground">
                Your content is encrypted client-side before being stored on IPFS. Only the smart contract can decrypt
                it after the unlock date.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
