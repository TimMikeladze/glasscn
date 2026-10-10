import * as React from "react"
import { View, type LayoutChangeEvent } from "react-native"
import { BookOpenIcon, BrainIcon, DumbbellIcon, FootprintsIcon, MoonIcon } from "lucide-react-native"

import { AreaChart } from "@/components/glass/native/area-chart"
import { BarList } from "@/components/glass/native/bar-list"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/native/card"
import { createDataTableColumnHelper, DataTable, DataTableColumnHeader } from "@/components/glass/native/data-table"
import { DonutChart } from "@/components/glass/native/donut-chart"
import { Gauge } from "@/components/glass/native/gauge"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/native/segmented-control"
import { GText } from "@/components/glass/native/ui"

interface Day {
  day: string
  cardio: number
  strength: number
  mobility: number
}

interface Session {
  id: string
  date: string
  activity: string
  minutes: number
}

/** Deterministic demo days so every render agrees. */
function days(n: number): Day[] {
  const end = Date.UTC(2026, 9, 8)
  return Array.from({ length: n }, (_, i) => {
    const t = n - 1 - i
    const date = new Date(end - t * 86_400_000)
    const wave = (k: number, s: number) => Math.max(0, Math.round(k + Math.sin(i * 0.9 + s) * k * 0.6 + Math.cos(i * 2.3 + s) * k * 0.3))
    return { day: date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" }), cardio: wave(34, 1), strength: wave(16, 2), mobility: wave(10, 3) }
  })
}

const kinds = [
  { id: "cardio", label: "Cardio", value: (d: Day) => d.cardio },
  { id: "strength", label: "Strength", value: (d: Day) => d.strength },
  { id: "mobility", label: "Mobility", value: (d: Day) => d.mobility },
]

const habits = [
  { name: "Walk 8k steps", value: 26, icon: <FootprintsIcon /> },
  { name: "Read 20 pages", value: 22, icon: <BookOpenIcon /> },
  { name: "Lights out by 11", value: 19, icon: <MoonIcon /> },
  { name: "Strength session", value: 12, icon: <DumbbellIcon /> },
  { name: "Meditate", value: 8, icon: <BrainIcon /> },
]

const sessions: Session[] = [
  { id: "1", date: "Oct 8", activity: "Run", minutes: 42 },
  { id: "2", date: "Oct 7", activity: "Yoga", minutes: 30 },
  { id: "3", date: "Oct 6", activity: "Ride", minutes: 95 },
  { id: "4", date: "Oct 5", activity: "Strength", minutes: 50 },
  { id: "5", date: "Oct 4", activity: "Walk", minutes: 35 },
  { id: "6", date: "Oct 3", activity: "Swim", minutes: 40 },
  { id: "7", date: "Oct 2", activity: "Run", minutes: 58 },
  { id: "8", date: "Oct 1", activity: "Strength", minutes: 45 },
]

const col = createDataTableColumnHelper<Session>()
const columns = col.columns([
  col.accessor("date", { header: "Day" }),
  col.accessor("activity", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Activity" />,
    cell: (info) => (
      <GText size="sm" weight="500">
        {info.getValue()}
      </GText>
    ),
  }),
  col.accessor("minutes", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Time" align="right" />,
    cell: (info) => (
      <GText size="sm" align="right" style={{ flex: 1, fontVariant: ["tabular-nums"] }}>
        {info.getValue()} min
      </GText>
    ),
  }),
])

const getRowId = (s: Session) => s.id

/** The web's `lg:` breakpoint, measured on the block's own width rather than the window. */
const WIDE = 1024

/** Training analytics: stacked minutes over a range, the mix, recovery, top habits and recent sessions. */
export function Analytics01() {
  const [range, setRange] = React.useState("14")
  const [width, setWidth] = React.useState(0)
  const data = React.useMemo(() => days(Number(range)), [range])
  const mix = React.useMemo(() => kinds.map((k) => ({ name: k.label, minutes: data.reduce((sum, d) => sum + k.value(d), 0) })), [data])
  const total = mix.reduce((sum, m) => sum + m.minutes, 0)
  const wide = width >= WIDE
  const row = { flexDirection: wide ? ("row" as const) : ("column" as const), gap: 16, alignItems: wide ? ("flex-start" as const) : ("stretch" as const) }
  const third = wide ? { flex: 1 } : null

  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={{ gap: 16 }}>
      <View style={row}>
        <Card style={wide ? { flex: 2 } : null}>
          <CardHeader>
            <CardTitle>Active minutes</CardTitle>
            <CardDescription>By kind of training, per day</CardDescription>
            <CardAction>
              <SegmentedControl size="sm" value={range} onValueChange={setRange} accessibilityLabel="Range">
                <SegmentedControlItem value="7">7d</SegmentedControlItem>
                <SegmentedControlItem value="14">14d</SegmentedControlItem>
                <SegmentedControlItem value="30">30d</SegmentedControlItem>
              </SegmentedControl>
            </CardAction>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={data}
              x={(d) => d.day}
              series={kinds}
              stacked
              height={260}
              valueFormat={(m) => `${m} min`}
              ariaLabel={`Active minutes per day over the last ${range} days, stacked by cardio, strength and mobility`}
            />
          </CardContent>
        </Card>
        <Card style={third}>
          <CardHeader>
            <CardTitle>The mix</CardTitle>
            <CardDescription>Last {range} days</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={mix} label={(m) => m.name} value={(m) => m.minutes} valueFormat={(m) => `${m} min`} ariaLabel={`Active minutes by kind over the last ${range} days, ${total} in all`}>
              <View style={{ alignItems: "center" }}>
                <GText font="display" size="3xl">
                  {Math.round(total / 60)}h
                </GText>
                <GText size="xs" tone="muted">
                  active
                </GText>
              </View>
            </DonutChart>
          </CardContent>
        </Card>
      </View>
      <View style={row}>
        <Card style={third}>
          <CardHeader>
            <CardTitle>Recovery</CardTitle>
            <CardDescription>Ready to train hard</CardDescription>
          </CardHeader>
          <CardContent style={{ alignItems: "center" }}>
            <Gauge value={78} target={70} label="Recovery">
              <GText font="display" size="4xl">
                78
              </GText>
              <GText size="sm" tone="muted">
                goal 70
              </GText>
            </Gauge>
          </CardContent>
        </Card>
        <Card style={third}>
          <CardHeader>
            <CardTitle>Top habits</CardTitle>
            <CardDescription>Days kept this month</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList data={habits} max={30} valueFormat={(v) => `${v}/30`} />
          </CardContent>
        </Card>
        <Card style={third}>
          <CardHeader>
            <CardTitle>Recent sessions</CardTitle>
            <CardDescription>The last eight</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={sessions} getRowId={getRowId} pageSize={5} minColumnWidth={72} />
          </CardContent>
        </Card>
      </View>
    </View>
  )
}
