"use client"

import * as React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { LineChart } from "@/components/glass/line-chart"

interface Checkin {
  day: Date
  mood: number
  energy: number | null
}

// Two weeks of evening check-ins, 1–10. A skipped evening is a gap.
const evenings: [number, number | null][] = [
  [6, 5], [7, 6], [5, 4], [6, 6], [8, 7], [8, 8], [7, 6],
  [6, 5], [5, null], [7, 6], [7, 7], [8, 7], [9, 8], [8, 8],
]
const checkins: Checkin[] = evenings.map(([mood, energy], i) => ({ day: new Date(Date.UTC(2026, 8, 24 + i)), mood, energy }))

const day = (d: string | number | Date) => (d instanceof Date ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) : String(d))

export default function LineChartDemo() {
  const [picked, setPicked] = React.useState<Checkin | null>(null)
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Mood &amp; energy</CardTitle>
        <CardDescription>{picked ? `${day(picked.day)}: mood ${picked.mood}/10, energy ${picked.energy ?? "–"}/10` : "Evening check-ins, last 14 days. Tap a day to pin it."}</CardDescription>
      </CardHeader>
      <CardContent>
        <LineChart
          data={checkins}
          x={(d) => d.day}
          series={[
            { id: "mood", label: "Mood", value: (d) => d.mood },
            { id: "energy", label: "Energy", value: (d) => d.energy },
          ]}
          xFormat={day}
          valueFormat={(v) => `${v}/10`}
          points
          selectedX={picked?.day ?? null}
          onSelect={setPicked}
          ariaLabel="Mood and energy check-ins over the last 14 days, scored 1 to 10"
        />
      </CardContent>
    </Card>
  )
}
