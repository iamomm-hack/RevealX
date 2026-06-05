"use client"

import { useMemo, useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts"

// Mock data — replace with real on-chain/API data later
type Predictor = {
  id: string
  name: string
  address: string
  roi: number // percent
  winRate: number // percent
  totalStaked: number // tokens
  earnings: number // tokens
}

type Capsule = {
  id: string
  title: string
  creator: string
  unlocksIn: string
  totalStaked: number
  sentiment: "Popular" | "Unpopular"
}

const MOCK_PREDICTORS: Predictor[] = [
  { id: "u1", name: "0xAtlas", address: "0x1234...9abC", roi: 142, winRate: 68, totalStaked: 15420, earnings: 2240 },
  { id: "u2", name: "CrystalBall", address: "0xaA10...33dE", roi: 117, winRate: 65, totalStaked: 9800, earnings: 1755 },
  { id: "u3", name: "TimeSeer", address: "0x9Ff0...0021", roi: 96, winRate: 61, totalStaked: 12110, earnings: 1622 },
  { id: "u4", name: "ChainWhisper", address: "0x1b2c...fe77", roi: 84, winRate: 59, totalStaked: 8730, earnings: 1104 },
  { id: "u5", name: "EpochOne", address: "0x77aa...44cc", roi: 71, winRate: 57, totalStaked: 6200, earnings: 680 },
]

const getMockCapsules = (currentYear: number): Capsule[] => [
  {
    id: "c1",
    title: `AI Breakthrough in ${currentYear + 1}`,
    creator: "0x1234...9abC",
    unlocksIn: "12d 4h",
    totalStaked: 4820,
    sentiment: "Popular",
  },
  {
    id: "c2",
    title: "ETH to new ATH",
    creator: "0xaA10...33dE",
    unlocksIn: "6d 11h",
    totalStaked: 3990,
    sentiment: "Popular",
  },
  {
    id: "c3",
    title: "Social token boom",
    creator: "0x9Ff0...0021",
    unlocksIn: "2d 7h",
    totalStaked: 3410,
    sentiment: "Unpopular",
  },
  {
    id: "c4",
    title: "VR adoption slows",
    creator: "0x1b2c...fe77",
    unlocksIn: "19h",
    totalStaked: 2850,
    sentiment: "Unpopular",
  },
  {
    id: "c5",
    title: "Gas fees sub $1",
    creator: "0x77aa...44cc",
    unlocksIn: "4d 2h",
    totalStaked: 2715,
    sentiment: "Popular",
  },
]

export function LeaderboardTable() {
  const [tab, setTab] = useState<"predictors" | "capsules">("predictors")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const predictors = useMemo(() => {
    // sort by ROI desc, then earnings desc
    return [...MOCK_PREDICTORS].sort((a, b) => (b.roi !== a.roi ? b.roi - a.roi : b.earnings - a.earnings))
  }, [])

  const capsules = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return [...getMockCapsules(currentYear)].sort((a, b) => b.totalStaked - a.totalStaked)
  }, [])

  const predictorChartData = useMemo(() => {
    return predictors.slice(0, 5).map(p => ({
      name: p.name,
      ROI: p.roi,
    }))
  }, [predictors])

  const capsuleChartData = useMemo(() => {
    return capsules.slice(0, 5).map(c => ({
      title: c.title.length > 15 ? c.title.slice(0, 15) + "..." : c.title,
      Staked: c.totalStaked,
    }))
  }, [capsules])

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Table Card */}
        <Card className="lg:col-span-2 bg-card text-card-foreground">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <TabsList>
                <TabsTrigger value="predictors">Predictors</TabsTrigger>
                <TabsTrigger value="capsules">Capsules</TabsTrigger>
              </TabsList>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground pr-1">
                <span>Updated</span>
                <Badge variant="secondary">Live</Badge>
              </div>
            </div>

            <TabsContent value="predictors" className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Predictor</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                      <TableHead className="text-right">Win Rate</TableHead>
                      <TableHead className="text-right">Total Staked</TableHead>
                      <TableHead className="text-right">Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictors.map((p, idx) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{p.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{p.name}</div>
                              <div className="text-xs text-muted-foreground">{p.address}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn("font-medium", idx < 3 ? "text-emerald-500" : "")}>{p.roi}%</span>
                        </TableCell>
                        <TableCell className="text-right">{p.winRate}%</TableCell>
                        <TableCell className="text-right">{p.totalStaked.toLocaleString()} TOK</TableCell>
                        <TableCell className="text-right">{p.earnings.toLocaleString()} TOK</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="capsules" className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Capsule</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead className="text-right">Unlocks In</TableHead>
                      <TableHead className="text-right">Total Staked</TableHead>
                      <TableHead className="text-right">Sentiment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {capsules.map((c, idx) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell className="text-muted-foreground">{c.creator}</TableCell>
                        <TableCell className="text-right">{c.unlocksIn}</TableCell>
                        <TableCell className="text-right">{c.totalStaked.toLocaleString()} TOK</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={c.sentiment === "Popular" ? "default" : "secondary"}>{c.sentiment}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </CardContent>
        </Card>

        {/* Right: Chart Card */}
        <Card className="bg-card text-card-foreground p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {tab === "predictors" ? "Top Predictors ROI" : "Most Staked Capsules"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {tab === "predictors" 
                ? "Comparing return on investment (%) for top predictors." 
                : "Comparing total stake (TOK) for trending public capsules."}
            </p>
          </div>
          
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            {isMounted ? (
              tab === "predictors" ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={predictorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      cursor={false}
                      contentStyle={{ 
                        backgroundColor: "rgba(30, 30, 40, 0.95)", 
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        color: "#ffffff"
                      }}
                      formatter={(value) => [`${value}%`, "ROI"]}
                    />
                    <Bar dataKey="ROI" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                      {predictorChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : index === 1 ? "#3b82f6" : "#8b5cf6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={capsuleChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis 
                      dataKey="title" 
                      stroke="#888888" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      cursor={false}
                      contentStyle={{ 
                        backgroundColor: "rgba(30, 30, 40, 0.95)", 
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        color: "#ffffff"
                      }}
                      formatter={(value) => [`${value} TOK`, "Total Staked"]}
                    />
                    <Bar dataKey="Staked" fill="#ec4899" radius={[4, 4, 0, 0]}>
                      {capsuleChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#f59e0b" : index === 1 ? "#ec4899" : "#3b82f6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                Loading chart...
              </div>
            )}
          </div>
        </Card>
      </div>
    </Tabs>
  )
}
