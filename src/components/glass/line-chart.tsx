"use client"

import * as React from "react"
import { cn } from "cn"
import { defineChart, lineY } from "@tanstack/charts"
import { crosshair } from "@tanstack/charts/crosshair"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"

import { ChartContainer, ChartLegend, chartColor, seriesTooltip, xScaleFor, type ChartSeries } from "@/components/glass/chart"
import { monotoneCurve } from "@/lib/glass-charts"

type XValue = string | number | Date

/**
 * Measures over an ordered x — days, weeks, sessions. One line per series over
 * your rows, unmodified; hovering shows every series at that x in a glass
 * tooltip. Nulls are gaps.
 */
function LineChart<Row>({
  data,
  x,
  series,
  ariaLabel,
  height = 240,
  valueFormat,
  xFormat,
  legend = series.length > 1,
  grid = true,
  points = false,
  curve = "smooth",
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  data: readonly Row[]
  x: (d: Row) => XValue
  series: readonly ChartSeries<Row>[]
  ariaLabel: string
  height?: number
  valueFormat?: (value: number) => string
  xFormat?: (value: XValue) => string
  legend?: boolean
  grid?: boolean
  points?: boolean
  curve?: "smooth" | "linear"
}) {
  const definition = React.useMemo(
    () =>
      defineChart({
        marks: [
          ...series.map((s) =>
            lineY(data, {
              id: s.id,
              x,
              y: s.value,
              z: () => s.id,
              color: () => s.id,
              points,
              strokeWidth: 2.25,
              curve: curve === "smooth" ? monotoneCurve : undefined,
            })
          ),
          crosshair({ x: true, y: false }),
        ],
        scales: {
          x: { scale: xScaleFor(data.map(x), "point"), axis: xFormat ? { ticks: { format: xFormat } } : undefined },
          y: { scale: scaleLinear, nice: true, grid, axis: valueFormat ? { ticks: { format: valueFormat } } : undefined },
        },
        color: { domain: series.map((s) => s.id), range: series.map((s, i) => s.color ?? chartColor(i)) },
        focus: "group-x",
        maxFocusDistance: Number.POSITIVE_INFINITY,
        tooltip: {
          use: tooltip,
          anchor: "group-center",
        sort: "color-domain",
          placement: ["top", "right", "left", "bottom"],
          content: seriesTooltip(series, x, { xFormat, valueFormat }),
        },
      }),
    [data, x, series, valueFormat, xFormat, grid, points, curve]
  )

  return (
    <div data-slot="line-chart" className={cn("grid w-full gap-3", className)} {...props}>
      <ChartContainer definition={definition} ariaLabel={ariaLabel} height={height} />
      {legend ? <ChartLegend items={series.map((s, i) => ({ label: s.label, color: s.color ?? chartColor(i) }))} /> : null}
    </div>
  )
}

export { LineChart }
