"use client"

import { AreaChart } from "@/components/glass/area-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"

interface Night {
  night: string
  deep: number
  rem: number
  light: number
}

// Hours in each sleep stage, the last ten nights.
const nights: Night[] = [
  { night: "Sep 29", deep: 1.2, rem: 1.6, light: 3.9 },
  { night: "Sep 30", deep: 1.0, rem: 1.4, light: 3.6 },
  { night: "Oct 1", deep: 1.4, rem: 1.8, light: 4.1 },
  { night: "Oct 2", deep: 1.3, rem: 1.9, light: 4.3 },
  { night: "Oct 3", deep: 0.9, rem: 1.2, light: 3.4 },
  { night: "Oct 4", deep: 1.5, rem: 2.0, light: 4.4 },
  { night: "Oct 5", deep: 1.6, rem: 2.1, light: 4.2 },
  { night: "Oct 6", deep: 1.3, rem: 1.7, light: 3.8 },
  { night: "Oct 7", deep: 1.4, rem: 1.9, light: 4.0 },
  { night: "Oct 8", deep: 1.5, rem: 2.0, light: 4.1 },
]

const stages = [
  { id: "deep", label: "Deep", value: (d: Night) => d.deep },
  { id: "rem", label: "REM", value: (d: Night) => d.rem },
  { id: "light", label: "Light", value: (d: Night) => d.light },
]

export default function AreaChartDemo() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Sleep stages</CardTitle>
        <CardDescription>Hours per night, last 10 nights</CardDescription>
      </CardHeader>
      <CardContent>
        <AreaChart
          data={nights}
          x={(d) => d.night}
          series={stages}
          stacked
          valueFormat={(h) => `${h.toFixed(1)}h`}
          ariaLabel="Hours of deep, REM and light sleep per night over the last 10 nights, stacked"
        />
      </CardContent>
    </Card>
  )
}
