"use client"

import * as React from "react"
import { BookOpenIcon, CheckIcon, FlameIcon, MoreHorizontalIcon } from "lucide-react"

import { ActivityRings } from "@/components/glass/activity-rings"
import { Button } from "@/components/glass/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/glass/dropdown-menu"
import { Heatmap, HeatmapLegend } from "@/components/glass/heatmap"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { Sparkline } from "@/components/glass/sparkline"
import { Stat, StatIcon, StatLabel, StatTrend, StatValue } from "@/components/glass/stat"

/** A deterministic demo series so server and client agree. */
function series(n: number, seed: number, base: number, swing: number) {
  return Array.from({ length: n }, (_, i) => Math.round((base + Math.sin(i * 0.7 + seed) * swing + Math.cos(i * 1.9 + seed) * swing * 0.5) * 10) / 10)
}

function demoDays(today: string) {
  const values: Record<string, number> = {}
  const d = new Date(`${today}T12:00:00`)
  for (let i = 0; i < 39 * 7; i++) {
    const x = new Date(d)
    x.setDate(d.getDate() - i)
    const v = (Math.sin(i * 1.3) + Math.cos(i * 0.37) + 1.2) * 1.6
    if (v > 0.9) values[x.toISOString().slice(0, 10)] = Math.round(v)
  }
  return values
}

/** Rings, figures, a heatmap and a measure — a dashboard in glass. */
export function Dashboard01({ today = "2026-10-08" }: { today?: string }) {
  const [range, setRange] = React.useState("30")
  const values = React.useMemo(() => demoDays(today), [today])
  const data = React.useMemo(() => series(range === "7" ? 7 : range === "30" ? 30 : 90, 2, 7, 1.6), [range])
  return (
    <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
          <CardDescription>Three rings, closing as the day goes.</CardDescription>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Ring options">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit goals</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <ActivityRings
            size={148}
            rings={[
              { value: 0.72, label: "Chain" },
              { value: 0.43, label: "Week" },
              { value: 1.18, label: "Kept" },
            ]}
          />
          <dl className="grid gap-3 text-sm">
            {[
              ["Chain", "18 of 25 nights", "var(--chart-1)"],
              ["This week", "3 of 7", "var(--chart-2)"],
              ["Kept", "118%", "var(--chart-3)"],
            ].map(([k, v, color]) => (
              <div key={k}>
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ background: color }} />
                  {k}
                </dt>
                <dd className="font-glass-heading text-xl font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Stat>
          <StatIcon className="text-primary">
            <FlameIcon />
          </StatIcon>
          <StatValue className="text-primary">18</StatValue>
          <StatLabel>Chain</StatLabel>
        </Stat>
        <Stat>
          <StatIcon>
            <BookOpenIcon />
          </StatIcon>
          <StatValue>311</StatValue>
          <StatLabel>Nights</StatLabel>
          <StatTrend>12%</StatTrend>
        </Stat>
        <Stat>
          <StatIcon>
            <CheckIcon />
          </StatIcon>
          <StatValue>71%</StatValue>
          <StatLabel>Kept</StatLabel>
          <StatTrend direction="down">3%</StatTrend>
        </Stat>
        <Card size="sm" className="col-span-3">
          <CardHeader>
            <CardTitle>Sleep</CardTitle>
            <CardDescription>
              <span className="font-glass-heading text-2xl font-bold text-foreground tabular-nums">{data[data.length - 1]}</span> hours last night
            </CardDescription>
            <CardAction>
              <SegmentedControl size="sm" value={range} onValueChange={setRange} aria-label="Range">
                <SegmentedControlItem value="7">7d</SegmentedControlItem>
                <SegmentedControlItem value="30">30d</SegmentedControlItem>
                <SegmentedControlItem value="90">90d</SegmentedControlItem>
              </SegmentedControl>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Sparkline key={range} data={data} height={64} />
          </CardContent>
        </Card>
      </div>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Last 39 weeks</CardTitle>
          <CardDescription>Every night written, brighter when the promise was kept.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Heatmap values={values} today={today} weeks={39} cellSize={22} />
          <HeatmapLegend className="self-end" />
        </CardContent>
      </Card>
    </div>
  )
}
