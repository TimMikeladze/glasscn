"use client"

import { BarChart } from "@/components/glass/bar-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"

interface Day {
  day: string
  run: number
  strength: number
  yoga: number
}

// Minutes trained this week, by kind.
const week: Day[] = [
  { day: "Mon", run: 32, strength: 0, yoga: 15 },
  { day: "Tue", run: 0, strength: 45, yoga: 0 },
  { day: "Wed", run: 41, strength: 0, yoga: 20 },
  { day: "Thu", run: 0, strength: 40, yoga: 10 },
  { day: "Fri", run: 28, strength: 0, yoga: 0 },
  { day: "Sat", run: 64, strength: 0, yoga: 25 },
  { day: "Sun", run: 0, strength: 0, yoga: 35 },
]

const kinds = [
  { id: "run", label: "Run", value: (d: Day) => d.run },
  { id: "strength", label: "Strength", value: (d: Day) => d.strength },
  { id: "yoga", label: "Yoga", value: (d: Day) => d.yoga },
]

export default function BarChartDemo() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Training</CardTitle>
        <CardDescription>Minutes this week · 395 total</CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart data={week} x={(d) => d.day} series={kinds} stacked valueFormat={(m) => `${m} min`} ariaLabel="Minutes of running, strength and yoga per day this week, stacked" />
      </CardContent>
    </Card>
  )
}
