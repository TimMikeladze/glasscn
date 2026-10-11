import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { RangeChart } from "@/components/glass/range-chart"

type Day = { day: string; low: number; high: number; now?: number }

const days: Day[] = [
  { day: "Today", low: 9, high: 17, now: 14 },
  { day: "Sun", low: 8, high: 15 },
  { day: "Mon", low: 6, high: 12 },
  { day: "Tue", low: 7, high: 16 },
  { day: "Wed", low: 11, high: 21 },
  { day: "Thu", low: 12, high: 22 },
  { day: "Fri", low: 10, high: 18 },
]

export default function RangeChartDemo() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>7-day forecast</CardTitle>
        <CardDescription>Lows and highs on one scale; the dot is now.</CardDescription>
      </CardHeader>
      <CardContent>
        <RangeChart data={days} label={(d) => d.day} low={(d) => d.low} high={(d) => d.high} current={(d) => d.now} valueFormat={(v) => `${v}°`} />
      </CardContent>
    </Card>
  )
}
