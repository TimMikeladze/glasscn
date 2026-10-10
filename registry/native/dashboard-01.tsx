import * as React from "react"
import { View, type LayoutChangeEvent } from "react-native"
import { BookOpenIcon, CheckIcon, FlameIcon, MoreHorizontalIcon } from "lucide-react-native"

import { ActivityRings } from "@/components/glass/native/activity-rings"
import { buttonVariants } from "@/components/glass/native/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/native/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/glass/native/dropdown-menu"
import { Heatmap, HeatmapLegend } from "@/components/glass/native/heatmap"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/native/segmented-control"
import { Sparkline } from "@/components/glass/native/sparkline"
import { Stat, StatIcon, StatLabel, StatTrend, StatValue } from "@/components/glass/native/stat"
import { GText, useUI } from "@/components/glass/native/ui"

/** A deterministic demo series so every render agrees. */
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

/** The web's `md:` breakpoint, measured on the block's own width rather than the window. */
const WIDE = 768

/** Rings, figures, a heatmap and a measure — a dashboard in glass. */
export function Dashboard01({ today = "2026-10-08", onMenuSelect }: { today?: string; onMenuSelect?: (item: "edit-goals" | "share") => void }) {
  const ui = useUI()
  const [range, setRange] = React.useState("30")
  const [width, setWidth] = React.useState(0)
  const values = React.useMemo(() => demoDays(today), [today])
  const data = React.useMemo(() => series(range === "7" ? 7 : range === "30" ? 30 : 90, 2, 7, 1.6), [range])
  const wide = width >= WIDE
  const trigger = buttonVariants(ui, { variant: "ghost", size: "icon-sm" })
  const legend: [string, string, string][] = [
    ["Chain", "18 of 25 nights", ui.charts[0]],
    ["This week", "3 of 7", ui.charts[1]],
    ["Kept", "118%", ui.charts[2]],
  ]

  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={{ gap: 16 }}>
      <View style={{ flexDirection: wide ? "row" : "column", gap: 16 }}>
        <Card style={wide ? { flex: 1.1 } : undefined}>
          <CardHeader>
            <CardTitle>Today</CardTitle>
            <CardDescription>Three rings, closing as the day goes.</CardDescription>
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger accessibilityLabel="Ring options" style={trigger.container}>
                  <MoreHorizontalIcon color={trigger.color} size={trigger.iconSize} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onMenuSelect?.("edit-goals")}>Edit goals</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onMenuSelect?.("share")}>Share</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardHeader>
          <CardContent style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
            <ActivityRings
              size={148}
              rings={[
                { value: 0.72, label: "Chain" },
                { value: 0.43, label: "Week" },
                { value: 1.18, label: "Kept" },
              ]}
            />
            <View style={{ gap: 12, flexShrink: 1 }}>
              {legend.map(([k, v, color]) => (
                <View key={k} accessible accessibilityLabel={`${k}: ${v}`}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
                    <GText size="xs" weight="600" tone="muted">
                      {k}
                    </GText>
                  </View>
                  <GText size="lg" font="heading" style={{ fontVariant: ["tabular-nums"] }}>
                    {v}
                  </GText>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        <View style={[{ gap: 16 }, wide ? { flex: 1 } : null]}>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <Stat style={{ flex: 1 }}>
              <StatIcon color={ui.primary}>
                <FlameIcon />
              </StatIcon>
              <StatValue color={ui.primary}>18</StatValue>
              <StatLabel>Chain</StatLabel>
            </Stat>
            <Stat style={{ flex: 1 }}>
              <StatIcon>
                <BookOpenIcon />
              </StatIcon>
              <StatValue>311</StatValue>
              <StatLabel>Nights</StatLabel>
              <StatTrend>12%</StatTrend>
            </Stat>
            <Stat style={{ flex: 1 }}>
              <StatIcon>
                <CheckIcon />
              </StatIcon>
              <StatValue>71%</StatValue>
              <StatLabel>Kept</StatLabel>
              <StatTrend direction="down">3%</StatTrend>
            </Stat>
          </View>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Sleep</CardTitle>
              <CardDescription>
                <GText size="2xl" font="heading" style={{ fontVariant: ["tabular-nums"] }}>
                  {data[data.length - 1]}
                </GText>{" "}
                hours last night
              </CardDescription>
              <CardAction>
                <SegmentedControl size="sm" value={range} onValueChange={setRange} accessibilityLabel="Range">
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
        </View>
      </View>

      <Card>
        <CardHeader>
          <CardTitle>Last 39 weeks</CardTitle>
          <CardDescription>Every night written, brighter when the promise was kept.</CardDescription>
        </CardHeader>
        <CardContent style={{ gap: 12 }}>
          <Heatmap values={values} today={today} weeks={39} cellSize={22} />
          <HeatmapLegend style={{ alignSelf: "flex-end" }} />
        </CardContent>
      </Card>
    </View>
  )
}
