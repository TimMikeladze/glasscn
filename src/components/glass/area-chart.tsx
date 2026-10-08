"use client"

import * as React from "react"
import { cn } from "cn"
import { areaY, defineChart, lineY } from "@tanstack/charts"
import { crosshair } from "@tanstack/charts/crosshair"
import { decorative } from "@tanstack/charts/mark/decorative"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"

import { ChartContainer, ChartLegend, chartColor, seriesTooltip, xScaleFor, type ChartSeries } from "@/components/glass/chart"
import { monotoneCurve, runningTotals } from "@/lib/glass-charts"

type XValue = string | number | Date

/**
 * Volume over an ordered x: each series a soft gradient that fades to the
 * baseline under a line. `stacked` piles the layers into a total — the tooltip
 * still reads each layer's own value from your row.
 */
function AreaChart<Row>({
  data,
  x,
  series,
  ariaLabel,
  height = 240,
  stacked = false,
  valueFormat,
  xFormat,
  legend = series.length > 1,
  grid = true,
  curve = "smooth",
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  data: readonly Row[]
  x: (d: Row) => XValue
  series: readonly ChartSeries<Row>[]
  ariaLabel: string
  height?: number
  stacked?: boolean
  valueFormat?: (value: number) => string
  xFormat?: (value: XValue) => string
  legend?: boolean
  grid?: boolean
  curve?: "smooth" | "linear"
}) {
  const definition = React.useMemo(() => {
    const colors = series.map((s, i) => s.color ?? chartColor(i))
    const path = curve === "smooth" ? monotoneCurve : undefined
    // the bottom and top of layer i at row d: 0 → value, or the running totals when stacked
    const bottom = (i: number) => (d: Row) => (stacked && i > 0 ? runningTotals(series.slice(0, i).map((s) => s.value(d)))[i - 1] : 0)
    const top = (i: number) => (d: Row) => {
      const v = series[i].value(d)
      return v == null ? null : stacked ? runningTotals(series.slice(0, i + 1).map((s) => s.value(d)))[i] : v
    }
    return defineChart({
      marks: [
        ...series.map((s, i) =>
          areaY(data, {
            id: s.id,
            x,
            y1: bottom(i),
            y2: top(i),
            z: () => s.id,
            color: () => s.id,
            fill: `url(#area-${i})`,
            fillOpacity: 1,
            curve: path,
          })
        ),
        // the line rides the top edge; the area owns focus so the tooltip reads one point per series
        ...series.map((s, i) => decorative(lineY(data, { id: `${s.id}-line`, x, y: top(i), z: () => s.id, color: () => s.id, strokeWidth: 2, curve: path }))),
        crosshair({ x: true, y: false }),
      ],
      scales: {
        x: { scale: xScaleFor(data.map(x), "point"), axis: xFormat ? { ticks: { format: xFormat } } : undefined },
        y: { scale: scaleLinear, nice: true, grid, axis: valueFormat ? { ticks: { format: valueFormat } } : undefined },
      },
      color: { domain: series.map((s) => s.id), range: colors },
      gradients: colors.map((color, i) => ({
        id: `area-${i}`,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 1,
        stops: [
          { offset: 0, color, opacity: stacked ? 0.5 : 0.34 },
          { offset: 1, color, opacity: stacked ? 0.12 : 0.02 },
        ],
      })),
      focus: "group-x",
      maxFocusDistance: Number.POSITIVE_INFINITY,
      tooltip: {
        use: tooltip,
        anchor: "group-center",
        sort: stacked ? undefined : "color-domain",
        placement: ["top", "right", "left", "bottom"],
        content: seriesTooltip(series, x, { xFormat, valueFormat }),
      },
    })
  }, [data, x, series, stacked, valueFormat, xFormat, grid, curve])

  return (
    <div data-slot="area-chart" className={cn("grid w-full gap-3", className)} {...props}>
      <ChartContainer definition={definition} ariaLabel={ariaLabel} height={height} />
      {legend ? <ChartLegend items={series.map((s, i) => ({ label: s.label, color: s.color ?? chartColor(i) }))} /> : null}
    </div>
  )
}

export { AreaChart }
