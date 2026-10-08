"use client"

import * as React from "react"
import { BookOpenIcon, BrainIcon, DumbbellIcon, FootprintsIcon, MoonIcon } from "lucide-react"

import { AreaChart } from "@/components/glass/area-chart"
import { BarList } from "@/components/glass/bar-list"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { createDataTableColumnHelper, DataTable, DataTableColumnHeader } from "@/components/glass/data-table"
import { DonutChart } from "@/components/glass/donut-chart"
import { Gauge } from "@/components/glass/gauge"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"

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

/** Deterministic demo days so the server and client agree. */
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
  col.accessor("activity", { header: ({ column }) => <DataTableColumnHeader column={column} title="Activity" />, cell: (info) => <span className="font-medium">{info.getValue()}</span> }),
  col.accessor("minutes", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Time" className="justify-end" />,
    cell: (info) => <div className="text-right">{info.getValue()} min</div>,
  }),
])

const getRowId = (s: Session) => s.id

/** Training analytics: stacked minutes over a range, the mix, recovery, top habits and recent sessions. */
export function Analytics01() {
  const [range, setRange] = React.useState("14")
  const data = React.useMemo(() => days(Number(range)), [range])
  const mix = React.useMemo(
    () => kinds.map((k) => ({ name: k.label, minutes: data.reduce((sum, d) => sum + k.value(d), 0) })),
    [data]
  )
  const total = mix.reduce((sum, m) => sum + m.minutes, 0)
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Active minutes</CardTitle>
          <CardDescription>By kind of training, per day</CardDescription>
          <CardAction>
            <SegmentedControl size="sm" value={range} onValueChange={setRange} aria-label="Range">
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
      <Card>
        <CardHeader>
          <CardTitle>The mix</CardTitle>
          <CardDescription>Last {range} days</CardDescription>
        </CardHeader>
        <CardContent>
          <DonutChart data={mix} label={(m) => m.name} value={(m) => m.minutes} valueFormat={(m) => `${m} min`} ariaLabel={`Active minutes by kind over the last ${range} days, ${total} in all`}>
            <span className="type-glass-display numeric-glass text-3xl">{Math.round(total / 60)}h</span>
            <span className="text-xs text-muted-foreground">active</span>
          </DonutChart>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recovery</CardTitle>
          <CardDescription>Ready to train hard</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Gauge value={78} target={70} label="Recovery">
            <span className="type-glass-display text-4xl">78</span>
            <span className="text-sm text-muted-foreground">goal 70</span>
          </Gauge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top habits</CardTitle>
          <CardDescription>Days kept this month</CardDescription>
        </CardHeader>
        <CardContent>
          <BarList data={habits} max={30} valueFormat={(v) => `${v}/30`} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
          <CardDescription>The last eight</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={sessions} getRowId={getRowId} pageSize={5} />
        </CardContent>
      </Card>
    </div>
  )
}
