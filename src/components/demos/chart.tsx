"use client"

import * as React from "react"
import { defineChart, dot } from "@tanstack/charts"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { ChartContainer, ChartLegend, chartColor } from "@/components/glass/chart"

interface Night {
  date: string
  hours: number
  mood: number
  workout: boolean
}

// Sleep against next-day mood — any TanStack Charts definition works in the container.
const logged: [hours: number, mood: number, workout: boolean][] = [
  [5.8, 4, false], [6.2, 5, true], [6.9, 6, false], [7.4, 7, true], [7.1, 6, false], [8.0, 8, true], [6.5, 5, false],
  [7.8, 8, true], [8.3, 8, true], [5.5, 3, false], [7.0, 7, true], [7.6, 7, false], [6.8, 6, true], [8.1, 9, true],
]
const nights: Night[] = logged.map(([hours, mood, workout], i) => ({ date: `Sep ${17 + i}`, hours, mood, workout }))

export default function ChartDemo() {
  const definition = React.useMemo(
    () =>
      defineChart({
        marks: [
          dot(nights, {
            x: (d: Night) => d.hours,
            y: (d: Night) => d.mood,
            color: (d: Night) => (d.workout ? "Workout day" : "Rest day"),
            r: 5,
          }),
        ],
        scales: {
          x: { scale: scaleLinear, nice: true, grid: true, axis: { label: "Hours slept" } },
          y: { scale: scaleLinear, nice: true, grid: true, axis: { label: "Mood next day" } },
        },
        color: { domain: ["Workout day", "Rest day"], range: [chartColor(0), chartColor(1)] },
        tooltip: { use: tooltip, format: (p) => `${p.datum.date} · ${p.datum.hours}h · mood ${p.datum.mood}/10` },
      }),
    []
  )
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Sleep and mood</CardTitle>
        <CardDescription>Does a long night make a better day?</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <ChartContainer definition={definition} height={260} ariaLabel="Hours slept against next-day mood for 14 nights, coloured by whether it was a workout day" />
        <ChartLegend
          items={[
            { label: "Workout day", color: chartColor(0) },
            { label: "Rest day", color: chartColor(1) },
          ]}
        />
      </CardContent>
    </Card>
  )
}
