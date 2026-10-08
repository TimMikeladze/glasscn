"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { DonutChart } from "@/components/glass/donut-chart"

interface Activity {
  name: string
  minutes: number
}

const week: Activity[] = [
  { name: "Run", minutes: 165 },
  { name: "Strength", minutes: 85 },
  { name: "Yoga", minutes: 105 },
  { name: "Walk", minutes: 140 },
  { name: "Swim", minutes: 40 },
]

const total = week.reduce((sum, a) => sum + a.minutes, 0)

export default function DonutChartDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Where the minutes went</CardTitle>
        <CardDescription>Active time this week</CardDescription>
      </CardHeader>
      <CardContent>
        <DonutChart
          data={week}
          label={(d) => d.name}
          value={(d) => d.minutes}
          valueFormat={(m) => `${m} min`}
          ariaLabel={`Active minutes this week by activity, ${total} minutes in all`}
        >
          <span className="type-glass-display numeric-glass text-3xl">{total}</span>
          <span className="text-xs text-muted-foreground">minutes</span>
        </DonutChart>
      </CardContent>
    </Card>
  )
}
