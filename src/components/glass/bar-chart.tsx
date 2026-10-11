"use client"

import * as React from "react"
import { cn } from "cn"
import { barX, barY, defineChart, group, type ChannelAccessorContext } from "@tanstack/charts"
import { scaleBand } from "@tanstack/charts/scales/band"
import { tooltip } from "@tanstack/charts/tooltip"

import {
  ChartAlternative,
  ChartContainer,
  ChartLegend,
  categoryAxisStyle,
  chartColor,
  seriesTooltip,
  useAxisSide,
  useChartAccessors,
  useControlRadius,
  valueAxis,
  type ChartAccessibility,
  type ChartSeries,
  type ChartStateLabels,
  type ChartStateValue,
} from "@/components/glass/chart"
import { categoryKey } from "@/lib/glass-charts"

type XValue = string | number | Date

/**
 * Amounts per category — days, habits, weeks. Several series sit side by side,
 * or pile up with `stacked` (a hairline separates the segments); `layout="horizontal"`
 * turns it on its side for long labels. Bars start at zero and their ends take the
 * theme's corner radius. Each row is its own band — two rows labelled "Mon" stay
 * two bars — and dates are keyed by their local day.
 */
function BarChart<Row>({
  data,
  x: xProp,
  series: seriesProp,
  ariaLabel,
  height = 240,
  stacked = false,
  layout = "vertical",
  valueFormat: valueFormatProp,
  xFormat: xFormatProp,
  legend = seriesProp.length > 1,
  grid = true,
  axis = "trailing",
  selectedX,
  onSelect,
  state,
  onRetry,
  stateLabels,
  accessibilityTable = true,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children" | "onSelect"> & {
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
  /** Which side the value axis sits on (vertical layout). Apple's charts put it trailing. */
  axis?: "leading" | "trailing"
  /** Highlights the bars at this x (the others dim) — controlled selection. */
  selectedX?: XValue | null
  /** A click, tap or Enter on a bar selects its row; null clears. */
  onSelect?: (row: Row | null) => void
  state?: ChartStateValue
  onRetry?: () => void
  stateLabels?: ChartStateLabels
  /** Exact values for assistive tech: true (sr-only, default), "visible", or false. */
  accessibilityTable?: ChartAccessibility
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const radius = useControlRadius(ref)
  const side = useAxisSide(ref, axis)
  const { x, series, valueFormat, xFormat, key } = useChartAccessors({ x: xProp, series: seriesProp, valueFormat: valueFormatProp, xFormat: xFormatProp })
  const selectedKey = selectedX == null ? null : selectedX instanceof Date ? selectedX.getTime() : selectedX

  const definition = React.useMemo(() => {
    // One mark over every series: your rows, repeated once per series, so the
    // library can group or stack them. The datum is still your row; the
    // position in the repeated list says which series it is.
    const rows = series.flatMap(() => data)
    const seriesIndex = (c: ChannelAccessorContext<Row>) => Math.floor(c.index / data.length)
    const seriesAt = (c: ChannelAccessorContext<Row>) => series[seriesIndex(c)]
    // the band: the row's own key (local day for dates), never its label — labels can repeat
    const keys = data.map((d, i) => categoryKey(x(d), i))
    const byKey = new Map(keys.map((k, i) => [k, x(data[i])]))
    const category = (_: Row, c: ChannelAccessorContext<Row>) => keys[c.index % data.length]
    const label = (k: string) => {
      const v = byKey.get(k)
      if (v === undefined) return k
      return xFormat ? xFormat(v) : v instanceof Date ? v.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : String(v)
    }
    const value = (d: Row, c: ChannelAccessorContext<Row>) => seriesAt(c).value(d)
    const id = (_: Row, c: ChannelAccessorContext<Row>) => seriesAt(c).id
    const barKey = (_: Row, c: ChannelAccessorContext<Row>) => `${seriesAt(c).id}:${c.index % data.length}`
    const colors = series.map((s, i) => s.color ?? chartColor(i))
    const isSelected = (d: Row) => {
      const v = x(d)
      return (v instanceof Date ? v.getTime() : v) === selectedKey
    }
    const shared = {
      z: id,
      color: id,
      key: barKey,
      layout: stacked || series.length < 2 ? undefined : group({ padding: 0.12 }),
      radius: { end: Math.min(radius, 8) },
      maxThickness: 44,
      ...(selectedKey == null
        ? null
        : { fill: (d: Row, c: ChannelAccessorContext<Row>) => (isSelected(d) ? colors[seriesIndex(c)] : `color-mix(in oklch, ${colors[seriesIndex(c)]} 35%, transparent)`) }),
      // a hairline in the ground colour between stacked segments (HIG)
      ...(stacked && series.length > 1 ? { stroke: "var(--background)", strokeWidth: 1 } : null),
    }
    const categories = { scale: () => scaleBand<string>().padding(series.length > 1 && !stacked ? 0.2 : 0.32), axis: categoryAxisStyle(label as (v: XValue) => string) }
    const common = {
      color: { domain: series.map((s) => s.id), range: colors },
      tooltip: {
        use: tooltip,
        anchor: "group-center" as const,
        sort: stacked ? undefined : ("color-domain" as const),
        placement: layout === "horizontal" ? (["right", "left", "top", "bottom"] as const) : (["top", "right", "left", "bottom"] as const),
        content: seriesTooltip(series, x, { xFormat, valueFormat, reverse: stacked }),
      },
    }
    return layout === "horizontal"
      ? defineChart({
          marks: [barX(rows, { y: category, x: value, ...shared })],
          scales: { x: valueAxis({ grid, valueFormat, side: "bottom" }), y: categories },
          focus: "group-y",
          ...common,
        })
      : defineChart({
          marks: [barY(rows, { x: category, y: value, ...shared })],
          scales: { x: categories, y: valueAxis({ grid, valueFormat, side }) },
          focus: "group-x",
          ...common,
        })
    // `key` stands for the accessors' structure; they call your latest functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, key, stacked, layout, grid, radius, side, selectedKey])

  return (
    <div ref={ref} data-slot="bar-chart" data-layout={layout} className={cn("grid w-full gap-3", className)} {...props}>
      <ChartContainer
        definition={definition}
        ariaLabel={ariaLabel}
        height={height}
        state={state ?? (data.length ? "ready" : "empty")}
        onRetry={onRetry}
        stateLabels={stateLabels}
        onSelect={onSelect ? (p) => onSelect(p ? (p.datum as Row) : null) : undefined}
      />
      {legend ? <ChartLegend items={series.map((s, i) => ({ label: s.label, color: s.color ?? chartColor(i) }))} /> : null}
      <ChartAlternative mode={accessibilityTable} data={data} x={x} series={series} xFormat={xFormat} valueFormat={valueFormat} label={ariaLabel} />
    </div>
  )
}

export { BarChart }
