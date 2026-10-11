"use client"

/**
 * The chart host. This module owns the TanStack Charts renderer import for
 * every glass chart — it pulls in d3 pieces (scales, shapes, the motion
 * runtime) — so the presets and your own charts go through `ChartContainer`
 * rather than mounting `<Chart>` themselves.
 *
 * The host maps glass tokens onto the library's theme variables: series colours
 * from `--chart-1..8`, a glass-strong tooltip, and type inherited from the page.
 * Palettes, schemes and `ThemeScope` re-theme a chart without rebuilding its
 * definition. It also carries what every chart needs besides marks: a loading,
 * empty and error state, and an exact-value alternative (`ChartDataTable`,
 * `ChartSummary`) for people who can't see the plot.
 */
import * as React from "react"
import { cn } from "cn"
import type { ChartAxisPresentationOptions, ChartPoint, ChartTooltipContent, ChartTooltipContentContext, ChartValue } from "@tanstack/charts"
import { motion } from "@tanstack/charts/motion"
import { Chart, type ChartProps } from "@tanstack/charts/react/core"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { scalePoint } from "@tanstack/charts/scales/point"
import { scaleUtc } from "d3-scale"

import { CHART_COLORS, axisKind, parseDuration, sanitizeId, summarize, summarySentence } from "@/lib/glass-charts"

const still = motion({ initial: false })

/**
 * Draws in once (bars grow, lines and areas rise, arcs sweep) over 4.5 × the
 * theme's `--glass-duration` (900ms at the default 200ms), read from the host when
 * the chart mounts — so `motion-still`, a `ThemeScope` with its own motion, and
 * reduced motion (which zeroes the duration) all snap. The library reads its
 * options when it mounts, after the host is in the DOM; the getters defer the read
 * until then. The host is found by id: the chart mounts in a layout effect, before
 * React attaches the host's ref.
 */
function useDrawIn(hostId: string) {
  const [renderer] = React.useState(() => {
    const ms = () => {
      const host = typeof document === "undefined" ? null : document.getElementById(hostId)
      return host ? parseDuration(getComputedStyle(host).getPropertyValue("--glass-duration")) * 4.5 : 900
    }
    return motion({
      get initial() {
        return ms() > 0 ? ("always" as const) : false
      },
      transition: {
        type: "tween",
        get duration() {
          return ms()
        },
      },
    })
  })
  return renderer
}

/** The nth series colour, cycling through `--chart-1..8`. Past eight, fold the rest into "Other" rather than repeat. */
function chartColor(i: number) {
  return `var(--chart-${(((i % CHART_COLORS) + CHART_COLORS) % CHART_COLORS) + 1})`
}

/** One measure plotted by a preset: an accessor over your rows, a label for the legend and tooltip. */
interface ChartSeries<Row> {
  id: string
  label: string
  value: (d: Row) => number | null
  /** Any CSS colour; defaults to `chartColor(index)`. */
  color?: string
  /** This series' own number format in the data table and summary; the chart's `valueFormat` otherwise. */
  format?: (value: number) => string
}

type XValue = string | number | Date

interface ChartAccessors<Row> {
  x: (d: Row) => XValue
  series: readonly ChartSeries<Row>[]
  valueFormat?: (value: number) => string
  xFormat?: (value: XValue) => string
}

/**
 * The accessors a preset was given, made stable: inline arrow functions (the
 * natural way to write `x={(d) => d.day}`) no longer rebuild the chart every
 * parent render. The returned functions call the latest ones you passed; they
 * change identity only when the *structure* does — series ids, labels, colours,
 * or whether a formatter is set. Swap data to redraw.
 */
function useChartAccessors<Row>(props: ChartAccessors<Row>): ChartAccessors<Row> & { key: string } {
  const latest = React.useRef(props)
  // before the library's layout effect reads the definition, so a data change and an accessor change land together
  React.useInsertionEffect(() => {
    latest.current = props
  })
  const key = [props.series.map((s) => `${s.id}\u0001${s.label}\u0001${s.color ?? ""}`).join("\u0002"), props.valueFormat ? 1 : 0, props.xFormat ? 1 : 0].join("|")
  const built = React.useMemo<ChartAccessors<Row>>(
    () => ({
      x: (d) => latest.current.x(d),
      series: props.series.map((s, i) => ({ id: s.id, label: s.label, color: s.color, format: s.format, value: (d: Row) => (latest.current.series[i] ?? s).value(d) })),
      valueFormat: props.valueFormat ? (v) => latest.current.valueFormat?.(v) ?? String(v) : undefined,
      xFormat: props.xFormat ? (v) => latest.current.xFormat?.(v) ?? String(v) : undefined,
    }),
    // rebuilt only when the structure changes; the wrappers read your latest functions through the ref, after render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  )
  return { ...built, key }
}

/** The x scale a preset needs for these values: UTC time for dates, linear for numbers, band (bars) or point (lines) for labels. */
function xScaleFor(values: Iterable<unknown>, categorical: "band" | "point") {
  const kind = axisKind(values)
  if (kind === "time") return scaleUtc
  if (kind === "linear") return scaleLinear
  return categorical === "band" ? () => scaleBand<string>().padding(0.24) : () => scalePoint<string>().padding(0.4)
}

/** Hairline grid, as Apple draws it: foreground at ~10%, no domain lines, no tick stubs. */
const gridStyle = { stroke: "var(--foreground)", strokeOpacity: 0.1, strokeWidth: 1 }

/**
 * The value axis, Apple-style: on the trailing side (right, or left in RTL), no
 * domain line, no tick stubs, hairline grid. `side` is the resolved physical side.
 */
function valueAxis(opts: { grid: boolean; valueFormat?: (v: number) => string; side?: "left" | "right" | "top" | "bottom"; zero?: boolean }) {
  return {
    scale: scaleLinear,
    nice: true,
    side: opts.side,
    grid: opts.grid ? gridStyle : false,
    axis: { line: false, ticks: { size: 0, padding: 6, ...(opts.valueFormat ? { format: opts.valueFormat } : null) } },
  } as const
}

/** The category / time axis: no domain line, no stubs. */
function categoryAxisStyle(format?: (v: XValue) => string): ChartAxisPresentationOptions {
  return { line: false, ticks: { size: 0, padding: 6, ...(format ? { format } : null) } }
}

/**
 * The physical side for the value axis: `trailing` is right in LTR and left in
 * RTL, read from the host's computed direction after mount (the server assumes LTR).
 */
function useAxisSide(ref: React.RefObject<HTMLElement | null>, axis: "leading" | "trailing" = "trailing"): "left" | "right" {
  const [rtl, setRtl] = React.useState(false)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (el) setRtl(getComputedStyle(el).direction === "rtl")
  }, [ref])
  return (axis === "trailing") !== rtl ? "right" : "left"
}

/**
 * Tooltip content for the presets: the x as a heading, then one row per series
 * read straight from your row (so stacked layers show their own value, not the
 * running total). Points must carry the series id as their group (`z`).
 */
function seriesTooltip<Row>(
  series: readonly ChartSeries<Row>[],
  x: (d: Row) => string | number | Date,
  { xFormat, valueFormat, reverse }: { xFormat?: (value: string | number | Date) => string; valueFormat?: (value: number) => string; reverse?: boolean; total?: boolean }
) {
  const byId = new Map(series.map((s) => [s.id, s]))
  // read the heading from the row: on a horizontal chart the point's x is the value, not the category
  const heading = (v: string | number | Date, ctx: ChartTooltipContentContext) => (xFormat ? xFormat(v) : typeof v === "string" ? v : ctx.formatX(v))
  return (points: readonly ChartPoint<Row>[], ctx: ChartTooltipContentContext): ChartTooltipContent => {
    const first = points[0]
    const rows = points.map((p) => {
      const s = byId.get(String(p.group))
      const v = s ? s.value(p.datum) : null
      // the series colour, not the point's paint (an area's paint is its gradient)
      const color = s ? (s.color ?? chartColor(series.indexOf(s))) : p.color
      return { label: s?.label ?? p.groupLabel, value: v == null ? "–" : valueFormat ? valueFormat(v) : ctx.formatY(v), color }
    })
    return { title: first ? heading(x(first.datum), ctx) : undefined, rows: reverse ? rows.reverse() : rows }
  }
}

/**
 * The theme's inner control radius in px, measured inside `ref` so shape
 * presets — and a `ThemeScope` around the chart — round bars and slices too.
 * SVG geometry can't read a CSS variable, so it is resolved here: in a layout
 * effect (before the first paint), and again when the root's theme attributes,
 * the page's stylesheets, the nearest `ThemeScope` (its attributes and the
 * `<style>` it writes) or the host's size change.
 */
function useControlRadius(ref: React.RefObject<HTMLElement | null>, fallback = 8) {
  const [radius, setRadius] = React.useState(fallback)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const PROBE = "data-chart-radius-probe"
    const read = () => {
      const probe = document.createElement("span")
      probe.setAttribute(PROBE, "")
      probe.style.cssText = "position:absolute;visibility:hidden;border-radius:calc(var(--glass-radius-control) * 0.7)"
      el.appendChild(probe)
      const px = parseFloat(getComputedStyle(probe).borderTopLeftRadius)
      probe.remove()
      const next = Number.isFinite(px) ? px : fallback
      setRadius((r) => (r === next ? r : next))
    }
    read()
    // the probe itself is a mutation inside an observed scope: ignore it, or this loops forever
    const isProbe = (n: Node) => n instanceof Element && n.hasAttribute(PROBE)
    const observer = new MutationObserver((records) => {
      if (records.every((r) => isProbe(r.target) || [...r.addedNodes, ...r.removedNodes].some(isProbe))) return
      read()
    })
    observer.observe(document.documentElement, { attributes: true })
    observer.observe(document.head, { childList: true, subtree: true, characterData: true })
    const scope = el.closest("[data-glass-scope]")
    if (scope) observer.observe(scope, { attributes: true, childList: true, subtree: true, characterData: true })
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(read)
    resize?.observe(el)
    return () => {
      observer.disconnect()
      resize?.disconnect()
    }
  }, [ref, fallback])
  return radius
}

const hostClass = cn(
  "relative w-full font-glass-sans text-xs text-muted-foreground",
  // series colours
  "[--ts-chart-1:var(--chart-1)] [--ts-chart-2:var(--chart-2)] [--ts-chart-3:var(--chart-3)] [--ts-chart-4:var(--chart-4)] [--ts-chart-5:var(--chart-5)] [--ts-chart-6:var(--chart-6)]",
  // a glass-strong tooltip
  "[--ts-chart-tooltip-background:color-mix(in_oklch,var(--glass-tint)_var(--glass-opacity-strong),transparent)] [--ts-chart-tooltip-color:var(--popover-foreground)]",
  "[--ts-chart-tooltip-border:var(--glass-border-width)_solid_color-mix(in_oklch,var(--glass-border-color)_var(--glass-border-opacity),transparent)]",
  "[--ts-chart-tooltip-border-radius:var(--glass-radius-control)] [--ts-chart-tooltip-padding:0.5rem_0.75rem] [--ts-chart-tooltip-font:inherit]",
  "[--ts-chart-tooltip-shadow:0_6px_18px_color-mix(in_oklch,var(--glass-shadow-color)_var(--glass-shadow-opacity),transparent)]",
  "[&_.ts-chart-tooltip]:numeric-glass [&_.ts-chart-tooltip]:[-webkit-backdrop-filter:blur(var(--glass-blur))_saturate(var(--glass-saturate))] [&_.ts-chart-tooltip]:[backdrop-filter:blur(var(--glass-blur))_saturate(var(--glass-saturate))]",
  // axis text is decoration for AT — the data table and summary carry the values
  "[&_svg_text]:select-none",
  // the focus outline (glass-focus) sits on the host, not around the bare svg
  "[&_svg:focus-visible]:outline-hidden [&:has(svg:focus-visible)]:rounded-control-sm [&:has(svg:focus-visible)]:outline-(length:--glass-ring-width) [&:has(svg:focus-visible)]:outline-offset-2 [&:has(svg:focus-visible)]:outline-ring [&:has(svg:focus-visible)]:outline-solid"
)

/** What a chart is showing: the plot, or a placeholder in its place. */
type ChartStateValue = "ready" | "loading" | "empty" | "error"

interface ChartStateLabels {
  loading?: string
  empty?: React.ReactNode
  error?: React.ReactNode
  retry?: string
}

const shimmer =
  "relative overflow-hidden after:absolute after:inset-0 after:-translate-x-full after:animate-[glass-shimmer_1.6s_ease-in-out_infinite] after:bg-linear-to-r after:from-transparent after:via-fill-strong after:to-transparent rtl:after:animate-[glass-shimmer-rtl_1.6s_ease-in-out_infinite] motion-reduce:after:hidden"

/**
 * The placeholder a chart (or a table, a widget) shows instead of data: skeleton
 * axes with a shimmer while loading, a quiet "No data for this range", or an
 * error with a retry. The same height as the plot, so nothing jumps.
 */
function ChartState({
  state,
  height,
  onRetry,
  labels,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { state: Exclude<ChartStateValue, "ready">; height?: number; onRetry?: () => void; labels?: ChartStateLabels }) {
  const loading = state === "loading"
  return (
    <div
      data-slot="chart-state"
      data-state={state}
      role={state === "error" ? "alert" : "status"}
      aria-busy={loading || undefined}
      className={cn("relative grid w-full place-items-center text-sm text-muted-foreground", className)}
      style={{ height, ...style }}
      {...props}
    >
      {/* skeleton axes: hairlines where the grid would be */}
      <div aria-hidden className="absolute inset-0 flex flex-col justify-between py-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-px w-full bg-separator" />
        ))}
      </div>
      {loading ? (
        <>
          <div aria-hidden className={cn("absolute inset-x-0 bottom-2 top-1/3 rounded-control-sm bg-fill-subtle", shimmer)} />
          <span className="sr-only">{labels?.loading ?? "Loading chart"}</span>
        </>
      ) : (
        <div className="relative flex flex-col items-center gap-2 rounded-control bg-background/70 px-pad py-2 text-center">
          <span>{state === "empty" ? (labels?.empty ?? "No data for this range") : (labels?.error ?? "Couldn't load this chart")}</span>
          {state === "error" && onRetry ? (
            <button type="button" onClick={onRetry} className="glass-focus rounded-button px-pad-sm py-1 text-sm font-medium text-primary hover:bg-fill">
              {labels?.retry ?? "Retry"}
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}

type ChartContainerProps<TDatum, TXValue extends ChartValue, TYValue extends ChartValue> = Omit<
  ChartProps<TDatum, TXValue, TYValue>,
  "renderer" | "className" | "style"
> & {
  className?: string
  style?: React.CSSProperties
  /** Overlaid on the chart (e.g. a donut's centre figure). */
  children?: React.ReactNode
  /** Draw in on mount (later data changes still glide). Timed by --glass-duration; reduced motion and motion-still snap. */
  animate?: boolean
  /** Show a placeholder instead of the plot. `ready` (default) draws the chart. */
  state?: ChartStateValue
  onRetry?: () => void
  stateLabels?: ChartStateLabels
}

/**
 * Renders a TanStack Charts definition through the React adapter inside a
 * token-mapped host. `ariaLabel` is required: say what the chart shows.
 * Server-rendered at `initialWidth` (640 by default) with ids from `useId`,
 * so hydration matches and the first paint doesn't jump.
 */
function ChartContainer<TDatum, TXValue extends ChartValue = ChartValue, TYValue extends ChartValue = ChartValue>({
  className,
  style,
  children,
  animate = true,
  state = "ready",
  onRetry,
  stateLabels,
  idPrefix,
  ...props
}: ChartContainerProps<TDatum, TXValue, TYValue>) {
  const raw = sanitizeId(React.useId())
  const id = `glass-chart-${raw}`
  const drawIn = useDrawIn(id)
  if (state !== "ready") {
    return (
      <div id={id} data-slot="chart" data-state={state} className={cn(hostClass, className)} style={style}>
        <ChartState state={state} height={props.height ?? 320} onRetry={onRetry} labels={stateLabels} aria-label={`${props.ariaLabel}: ${state}`} />
      </div>
    )
  }
  return (
    <div id={id} data-slot="chart" data-state="ready" className={cn(hostClass, className)} style={style}>
      <Chart renderer={animate ? drawIn : still} idPrefix={idPrefix ?? `ts-${raw}`} {...props} />
      {children}
    </div>
  )
}

/** A key: a swatch and a label per series. Lines get a dash, areas and bars a dot. */
function ChartLegend({
  items,
  shape = "dot",
  className,
  ...props
}: React.ComponentProps<"ul"> & { items: readonly { label: string; color?: string; value?: React.ReactNode }[]; shape?: "dot" | "line" }) {
  return (
    <ul data-slot="chart-legend" className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground", className)} {...props}>
      {items.map((item, i) => (
        <li key={`${i}-${item.label}`} data-slot="chart-legend-item" className="inline-flex items-center gap-1.5">
          <span
            data-slot="chart-legend-swatch"
            aria-hidden
            className={cn("shrink-0", shape === "line" ? "h-0.5 w-3 rounded-full" : "size-2.5 rounded-full")}
            style={{ background: item.color ?? chartColor(i) }}
          />
          {item.label}
          {item.value !== undefined ? <span className="font-medium text-foreground numeric-glass">{item.value}</span> : null}
        </li>
      ))}
    </ul>
  )
}

/**
 * The exact values behind a chart, as a real table: one row per datum, a column
 * per series. Hidden for sighted users by default (`visible={false}`), where
 * screen readers still read it; pass `visible` to show it, e.g. behind a toggle.
 */
function ChartDataTable<Row>({
  data,
  x,
  xLabel = "",
  series,
  xFormat,
  valueFormat,
  caption,
  visible = false,
  className,
  ...props
}: Omit<React.ComponentProps<"table">, "children"> & {
  data: readonly Row[]
  x: (d: Row) => XValue
  xLabel?: string
  series: readonly ChartSeries<Row>[]
  xFormat?: (value: XValue) => string
  valueFormat?: (value: number) => string
  caption?: React.ReactNode
  visible?: boolean
}) {
  const fx = (v: XValue) => (xFormat ? xFormat(v) : v instanceof Date ? v.toLocaleDateString() : String(v))
  const fv = (v: number | null, format = valueFormat) => (v == null ? "–" : format ? format(v) : v.toLocaleString())
  return (
    <table data-slot="chart-data-table" className={cn(visible ? "w-full text-sm numeric-glass" : "sr-only", className)} {...props}>
      {caption ? <caption className={cn(visible && "pb-2 text-start text-xs text-muted-foreground")}>{caption}</caption> : null}
      <thead>
        <tr className={cn(visible && "border-b border-separator text-xs text-muted-foreground")}>
          <th scope="col" className="py-1.5 text-start font-medium">
            {xLabel}
          </th>
          {series.map((s) => (
            <th key={s.id} scope="col" className="py-1.5 text-end font-medium">
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={i} className={cn(visible && "border-b border-separator last:border-0")}>
            <th scope="row" className="py-1.5 text-start font-normal">
              {fx(x(d))}
            </th>
            {series.map((s) => (
              <td key={s.id} className="py-1.5 text-end">
                {fv(s.value(d), s.format ?? valueFormat)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * One sentence per series — count, low, high, latest, trend — for screen
 * readers (sr-only by default) or as a visible caption under the chart.
 */
function ChartSummary<Row>({
  data,
  series,
  valueFormat,
  visible = false,
  className,
  ...props
}: Omit<React.ComponentProps<"p">, "children"> & { data: readonly Row[]; series: readonly ChartSeries<Row>[]; valueFormat?: (value: number) => string; visible?: boolean }) {
  const text = series.map((s) => summarySentence(s.label, summarize(data.map(s.value)), s.format ?? valueFormat)).join(" ")
  return (
    <p data-slot="chart-summary" className={cn(visible ? "text-xs text-muted-foreground" : "sr-only", className)} {...props}>
      {text}
    </p>
  )
}

/** `accessibilityTable` on every preset: `true` (default) renders the summary and table sr-only, `"visible"` shows them, `false` omits them. */
type ChartAccessibility = boolean | "visible"

function ChartAlternative<Row>({
  mode,
  data,
  x,
  series,
  xFormat,
  valueFormat,
  label,
  summary = true,
}: {
  /** Include the trend sentence (off for part-of-whole charts). */
  summary?: boolean
  mode: ChartAccessibility
  data: readonly Row[]
  x: (d: Row) => XValue
  series: readonly ChartSeries<Row>[]
  xFormat?: (value: XValue) => string
  valueFormat?: (value: number) => string
  label: string
}) {
  if (!mode) return null
  const visible = mode === "visible"
  return (
    <div data-slot="chart-alternative" className={cn(visible ? "grid gap-2" : "contents")}>
      {summary ? <ChartSummary data={data} series={series} valueFormat={valueFormat} visible={visible} /> : null}
      <ChartDataTable data={data} x={x} series={series} xFormat={xFormat} valueFormat={valueFormat} caption={label} visible={visible} />
    </div>
  )
}

export {
  ChartAlternative,
  ChartContainer,
  ChartDataTable,
  ChartLegend,
  ChartState,
  ChartSummary,
  categoryAxisStyle,
  chartColor,
  gridStyle,
  seriesTooltip,
  useAxisSide,
  useChartAccessors,
  useControlRadius,
  valueAxis,
  xScaleFor,
  type ChartAccessibility,
  type ChartSeries,
  type ChartStateLabels,
  type ChartStateValue,
  type XValue as ChartXValue,
}
