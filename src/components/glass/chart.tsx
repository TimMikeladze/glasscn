"use client"

/**
 * The chart host. This module owns the TanStack Charts renderer import for
 * every glass chart — it pulls in d3 pieces (scales, shapes, the motion
 * runtime) — so the presets and your own charts go through `ChartContainer`
 * rather than mounting `<Chart>` themselves.
 *
 * The host maps glass tokens onto the library's theme variables: series colours
 * from `--chart-1..5` (`--primary` as a sixth), a glass-strong tooltip, and
 * type inherited from the page. Palettes, schemes and `ThemeScope` re-theme a
 * chart without rebuilding its definition.
 */
import * as React from "react"
import { cn } from "cn"
import type { ChartPoint, ChartTooltipContent, ChartTooltipContentContext, ChartValue } from "@tanstack/charts"
import { motion } from "@tanstack/charts/motion"
import { Chart, type ChartProps } from "@tanstack/charts/react/core"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { scalePoint } from "@tanstack/charts/scales/point"
import { scaleUtc } from "d3-scale"

import { axisKind } from "@/lib/glass-charts"

/** Draws in once (bars grow, lines and areas rise, arcs sweep); snaps under reduced motion. */
const drawIn = motion({ initial: "always", transition: { type: "tween", duration: 900 } })
const still = motion({ initial: false })

/** The nth series colour, cycling through `--chart-1..5`. */
function chartColor(i: number) {
  return `var(--chart-${(((i % 5) + 5) % 5) + 1})`
}

/** One measure plotted by a preset: an accessor over your rows, a label for the legend and tooltip. */
interface ChartSeries<Row> {
  id: string
  label: string
  value: (d: Row) => number | null
  /** Any CSS colour; defaults to `chartColor(index)`. */
  color?: string
}

/** The x scale a preset needs for these values: UTC time for dates, linear for numbers, band (bars) or point (lines) for labels. */
function xScaleFor(values: Iterable<unknown>, categorical: "band" | "point") {
  const kind = axisKind(values)
  if (kind === "time") return scaleUtc
  if (kind === "linear") return scaleLinear
  return categorical === "band" ? () => scaleBand<string>().padding(0.24) : () => scalePoint<string>().padding(0.4)
}

/**
 * Tooltip content for the presets: the x as a heading, then one row per series
 * read straight from your row (so stacked layers show their own value, not the
 * running total). Points must carry the series id as their group (`z`).
 */
function seriesTooltip<Row>(
  series: readonly ChartSeries<Row>[],
  x: (d: Row) => string | number | Date,
  { xFormat, valueFormat }: { xFormat?: (value: string | number | Date) => string; valueFormat?: (value: number) => string }
) {
  const byId = new Map(series.map((s) => [s.id, s]))
  // read the heading from the row: on a horizontal chart the point's x is the value, not the category
  const heading = (v: string | number | Date, ctx: ChartTooltipContentContext) => (xFormat ? xFormat(v) : typeof v === "string" ? v : ctx.formatX(v))
  return (points: readonly ChartPoint<Row>[], ctx: ChartTooltipContentContext): ChartTooltipContent => {
    const first = points[0]
    return {
      title: first ? heading(x(first.datum), ctx) : undefined,
      rows: points.map((p) => {
        const s = byId.get(String(p.group))
        const v = s ? s.value(p.datum) : null
        // the series colour, not the point's paint (an area's paint is its gradient)
        const color = s ? (s.color ?? chartColor(series.indexOf(s))) : p.color
        return { label: s?.label ?? p.groupLabel, value: v == null ? "–" : valueFormat ? valueFormat(v) : ctx.formatY(v), color }
      }),
    }
  }
}

/**
 * The theme's inner control radius in px, measured inside `ref` so shape
 * presets (and a `ThemeScope` around the chart) round bars and slices too.
 * SVG geometry can't read a CSS variable, so it is resolved here and re-read
 * when the root's theme attributes or the page's stylesheets change.
 */
function useControlRadius(ref: React.RefObject<HTMLElement | null>, fallback = 8) {
  const [radius, setRadius] = React.useState(fallback)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => {
      const probe = document.createElement("span")
      probe.style.cssText = "position:absolute;visibility:hidden;border-radius:calc(var(--glass-radius-control) * 0.7)"
      el.appendChild(probe)
      const px = parseFloat(getComputedStyle(probe).borderTopLeftRadius)
      probe.remove()
      setRadius(Number.isFinite(px) ? px : fallback)
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true })
    observer.observe(document.head, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [ref, fallback])
  return radius
}

const hostClass = cn(
  "relative w-full font-glass-sans text-xs text-muted-foreground",
  // series colours
  "[--ts-chart-1:var(--chart-1)] [--ts-chart-2:var(--chart-2)] [--ts-chart-3:var(--chart-3)] [--ts-chart-4:var(--chart-4)] [--ts-chart-5:var(--chart-5)] [--ts-chart-6:var(--primary)]",
  // a glass-strong tooltip
  "[--ts-chart-tooltip-background:color-mix(in_oklch,var(--glass-tint)_var(--glass-opacity-strong),transparent)] [--ts-chart-tooltip-color:var(--popover-foreground)]",
  "[--ts-chart-tooltip-border:var(--glass-border-width)_solid_color-mix(in_oklch,var(--glass-border-color)_var(--glass-border-opacity),transparent)]",
  "[--ts-chart-tooltip-border-radius:var(--glass-radius-control)] [--ts-chart-tooltip-padding:0.5rem_0.75rem] [--ts-chart-tooltip-font:inherit]",
  "[--ts-chart-tooltip-shadow:0_6px_18px_color-mix(in_oklch,var(--glass-shadow-color)_var(--glass-shadow-opacity),transparent)]",
  "[&_.ts-chart-tooltip]:numeric-glass [&_.ts-chart-tooltip]:[-webkit-backdrop-filter:blur(var(--glass-blur))_saturate(var(--glass-saturate))] [&_.ts-chart-tooltip]:[backdrop-filter:blur(var(--glass-blur))_saturate(var(--glass-saturate))]",
  // the focus ring sits on the plot, not around the whole svg
  "[&_svg]:outline-none [&:has(svg:focus-visible)]:rounded-control-sm [&:has(svg:focus-visible)]:ring-(length:--glass-ring-width) [&:has(svg:focus-visible)]:ring-ring/50"
)

type ChartContainerProps<TDatum, TXValue extends ChartValue, TYValue extends ChartValue> = Omit<
  ChartProps<TDatum, TXValue, TYValue>,
  "renderer" | "className" | "style"
> & {
  className?: string
  style?: React.CSSProperties
  /** Overlaid on the chart (e.g. a donut's centre figure). */
  children?: React.ReactNode
  /** Draw in on mount (later data changes still glide). Reduced motion always snaps. */
  animate?: boolean
}

/**
 * Renders a TanStack Charts definition through the React adapter inside a
 * token-mapped host. `ariaLabel` is required: say what the chart shows.
 */
function ChartContainer<TDatum, TXValue extends ChartValue = ChartValue, TYValue extends ChartValue = ChartValue>({
  className,
  style,
  children,
  animate = true,
  ...props
}: ChartContainerProps<TDatum, TXValue, TYValue>) {
  return (
    <div data-slot="chart" className={cn(hostClass, className)} style={style}>
      <Chart renderer={animate ? drawIn : still} {...props} />
      {children}
    </div>
  )
}

/** A key: a swatch and a label per series. */
function ChartLegend({
  items,
  className,
  ...props
}: React.ComponentProps<"ul"> & { items: readonly { label: string; color?: string }[] }) {
  return (
    <ul data-slot="chart-legend" className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground", className)} {...props}>
      {items.map((item, i) => (
        <li key={item.label} data-slot="chart-legend-item" className="inline-flex items-center gap-1.5">
          <span data-slot="chart-legend-swatch" aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: item.color ?? chartColor(i) }} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

export { ChartContainer, ChartLegend, chartColor, seriesTooltip, useControlRadius, xScaleFor, type ChartSeries }
