"use client"

import * as React from "react"
import { cn } from "cn"
import { barX, barY, defineChart, group, type ChannelAccessorContext } from "@tanstack/charts"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"

import { ChartContainer, ChartLegend, chartColor, seriesTooltip, useControlRadius, type ChartSeries } from "@/components/glass/chart"

type XValue = string | number | Date

/**
 * Amounts per category — days, habits, weeks. Several series sit side by side,
 * or pile up with `stacked`; `layout="horizontal"` turns it on its side for long
 * labels. Bar ends take the theme's corner radius.
 */
function BarChart<Row>({
  data,
  x,
  series,
  ariaLabel,
  height = 240,
  stacked = false,
  layout = "vertical",
  valueFormat,
  xFormat,
  legend = series.length > 1,
  grid = true,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  data: readonly Row[]
  x: (d: Row) => XValue
  series: readonly ChartSeries<Row>[]
  ariaLabel: string
  height?: number
  stacked?: boolean
  layout?: "vertical" | "horizontal"
  valueFormat?: (value: number) => string
  xFormat?: (value: XValue) => string
  legend?: boolean
  grid?: boolean
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const radius = useControlRadius(ref)

  const definition = React.useMemo(() => {
    // One mark over every series: your rows, repeated once per series, so the
    // library can group or stack them. The datum is still your row; the
    // position in the repeated list says which series it is.
    const rows = series.flatMap(() => data)
    const seriesAt = (c: ChannelAccessorContext<Row>) => series[Math.floor(c.index / data.length)]
    const category = (d: Row) => {
      const v = x(d)
      return xFormat ? xFormat(v) : v instanceof Date ? v.toISOString().slice(0, 10) : String(v)
    }
    const value = (d: Row, c: ChannelAccessorContext<Row>) => seriesAt(c).value(d)
    const id = (_: Row, c: ChannelAccessorContext<Row>) => seriesAt(c).id
    const key = (_: Row, c: ChannelAccessorContext<Row>) => `${seriesAt(c).id}:${c.index % data.length}`
    const shared = {
      z: id,
      color: id,
      key,
      layout: stacked || series.length < 2 ? undefined : group({ padding: 0.12 }),
      radius: { end: Math.min(radius, 8) },
      maxThickness: 44,
    }
    const categories = { scale: () => scaleBand<string>().padding(series.length > 1 && !stacked ? 0.2 : 0.32) }
    const values = { scale: scaleLinear, nice: true, grid, axis: valueFormat ? { ticks: { format: valueFormat } } : undefined }
    const common = {
      color: { domain: series.map((s) => s.id), range: series.map((s, i) => s.color ?? chartColor(i)) },
      tooltip: {
        use: tooltip,
        anchor: "group-center" as const,
        sort: stacked ? undefined : ("color-domain" as const),
        placement: layout === "horizontal" ? (["right", "left", "top", "bottom"] as const) : (["top", "right", "left", "bottom"] as const),
        content: seriesTooltip(series, x, { xFormat, valueFormat }),
      },
    }
    return layout === "horizontal"
      ? defineChart({
          marks: [barX(rows, { y: category, x: value, ...shared })],
          scales: { x: values, y: categories },
          focus: "group-y",
          ...common,
        })
      : defineChart({
          marks: [barY(rows, { x: category, y: value, ...shared })],
          scales: { x: categories, y: values },
          focus: "group-x",
          ...common,
        })
  }, [data, x, series, stacked, layout, valueFormat, xFormat, grid, radius])

  return (
    <div ref={ref} data-slot="bar-chart" data-layout={layout} className={cn("grid w-full gap-3", className)} {...props}>
      <ChartContainer definition={definition} ariaLabel={ariaLabel} height={height} />
      {legend ? <ChartLegend items={series.map((s, i) => ({ label: s.label, color: s.color ?? chartColor(i) }))} /> : null}
    </div>
  )
}

export { BarChart }
