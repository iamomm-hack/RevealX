"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Lock, Unlock, Eye, Users, Coins, Calendar, Heart } from "lucide-react"
import type { TimeCapsule } from "@/lib/smart-contracts"

interface CapsuleCardProps {
  capsule: TimeCapsule
  onUnlock: (capsule: TimeCapsule) => void
  onDelete?: (capsule: TimeCapsule) => void
  onLike?: (capsule: TimeCapsule) => void
  showOwnership: boolean
  isCreator?: boolean
  likes?: number
  hasLiked?: boolean
}

export function CapsuleCard({ capsule, onUnlock, onDelete, onLike, showOwnership, isCreator = false, likes = 0, hasLiked = false }: CapsuleCardProps) {
  const isUnlocked = capsule.unlockDate <= Date.now()
  const daysUntilUnlock = Math.ceil((capsule.unlockDate - Date.now()) / (1000 * 60 * 60 * 24))
  const unlockDate = new Date(capsule.unlockDate)

  return (
    <Card
      className={`border-border bg-card hover:border-primary/20 transition-colors ${isUnlocked ? "ring-1 ring-accent/20" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg line-clamp-2">{capsule.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {capsule.category}
              </Badge>
              {isUnlocked ? (
                <Badge variant="default" className="text-xs gap-1 bg-accent text-accent-foreground">
                  <Unlock className="h-3 w-3" />
                  Unlocked
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs gap-1">
                  <Lock className="h-3 w-3" />
                  {daysUntilUnlock}d left
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Unlock Progress */}
        {!isUnlocked && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time Progress</span>
              <span className="font-medium">
                {Math.max(
                  0,
                  Math.min(100, ((Date.now() - capsule.createdAt) / (capsule.unlockDate - capsule.createdAt)) * 100),
                ).toFixed(0)}
                %
              </span>
            </div>
            <Progress
              value={Math.max(
                0,
                Math.min(100, ((Date.now() - capsule.createdAt) / (capsule.unlockDate - capsule.createdAt)) * 100),
              )}
              className="h-2"
            />
          </div>
        )}

        {/* Unlock Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {isUnlocked ? "Unlocked" : "Unlocks"}:{" "}
            {unlockDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Content Preview */}
        <div className="p-3 rounded-lg bg-muted/50 border border-dashed border-border">
          {isUnlocked ? (
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-accent" />
              <span className="text-accent">Content available to view</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-mono">[ENCRYPTED CONTENT]</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{capsule.predictionCount} predictions</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{capsule.totalStaked} ETH</span>
          </div>
          {onLike && (
            <button 
              onClick={(e) => { e.stopPropagation(); onLike(capsule); }}
              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${hasLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`h-4 w-4 ${hasLiked ? 'fill-red-500' : ''}`} />
              <span>{likes}</span>
            </button>
          )}
        </div>

        {/* Owner Info */}
        {showOwnership && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
            <Users className="h-3 w-3" />
            <span>
              Creator: {capsule.creator.slice(0, 6)}...{capsule.creator.slice(-4)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => onUnlock(capsule)}
            variant={isUnlocked ? "default" : "outline"}
            className={`flex-1 gap-2 ${isUnlocked ? "glow-primary" : ""}`}
          >
            {isUnlocked ? (
              <>
                <Eye className="h-4 w-4" />
                View Content
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                View Details
              </>
            )}
          </Button>
          {isCreator && !isUnlocked && onDelete && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(capsule)
              }}
              variant="destructive"
              size="icon"
              title="Delete Capsule"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"/>
              </svg>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
