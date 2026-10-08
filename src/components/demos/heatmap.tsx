"use client"

import * as React from "react"

import { Heatmap, HeatmapLegend } from "@/components/glass/heatmap"

const today = "2026-10-08"

function nights() {
  const values: Record<string, number> = {}
  const d = new Date(`${today}T12:00:00`)
  for (let i = 0; i < 26 * 7; i++) {
    const x = new Date(d)
    x.setDate(d.getDate() - i)
    const v = (Math.sin(i * 1.3) + Math.cos(i * 0.37) + 1.2) * 1.6
    if (v > 0.9) values[x.toISOString().slice(0, 10)] = Math.round(v)
  }
  return values
}

export default function HeatmapDemo() {
  const values = React.useMemo(() => nights(), [])
  const [picked, setPicked] = React.useState<string | null>(null)
  return (
    <div className="grid w-full max-w-2xl gap-3">
      <Heatmap values={values} today={today} onSelect={setPicked} />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{picked ? `Picked ${picked}` : "Tap a night"}</span>
        <HeatmapLegend />
      </div>
    </div>
  )
}
