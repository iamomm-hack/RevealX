"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, Trophy, Coins, Gift } from "lucide-react"

interface Notification {
  id: string
  type: "unlock" | "prediction" | "reward" | "capsule"
  title: string
  message: string
  time: string
  read: boolean
}

// Mock notifications - replace with real data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "unlock",
    title: "Capsule Unlocked!",
    message: "Your capsule 'Future Goals' is now unlocked",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "reward",
    title: "Reward Available",
    message: "You won 0.05 ETH from prediction!",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "prediction",
    title: "New Prediction",
    message: "Someone predicted on your capsule",
    time: "1 day ago",
    read: true,
  },
]

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "unlock": return <Clock className="h-4 w-4 text-blue-500" />
      case "reward": return <Gift className="h-4 w-4 text-green-500" />
      case "prediction": return <Trophy className="h-4 w-4 text-purple-500" />
      case "capsule": return <Coins className="h-4 w-4 text-amber-500" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem 
              key={notification.id} 
              className={`flex items-start gap-3 p-3 cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`}
            >
              <div className="mt-0.5">{getIcon(notification.type)}</div>
              <div className="flex-1 space-y-1">
                <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
              {!notification.read && (
                <div className="h-2 w-2 bg-primary rounded-full mt-1"></div>
              )}
            </DropdownMenuItem>
          ))
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center justify-center text-sm text-primary">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
