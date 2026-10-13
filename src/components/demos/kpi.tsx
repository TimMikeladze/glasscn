"use client"

import { FootprintsIcon, HeartPulseIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/glass/card"
import { Kpi } from "@/components/glass/kpi"
import { Sparkline } from "@/components/glass/sparkline"

const steps = [6200, 7400, 5100, 8800, 9300, 7100, 10240]

export default function KpiDemo() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>This week</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 @lg:grid-cols-3">
        <Kpi label="Steps" icon={<FootprintsIcon />} value={54140} trend={{ value: 0.12 }} description="vs last week" chart={<Sparkline data={steps} height={36} dot={false} />} />
        {/* resting heart rate going down is the good direction */}
        <Kpi label="Resting HR" icon={<HeartPulseIcon />} value={58} format={(v) => `${v} bpm`} trend={{ value: -3, good: "down", format: (v) => `${v} bpm` }} description="7-day average" />
        <Kpi label="Active energy" value={0} loading />
      </CardContent>
    </Card>
  )
}
