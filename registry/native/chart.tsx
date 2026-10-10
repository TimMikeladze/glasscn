/**
 * The chart host for the native track. The web host renders TanStack Charts,
 * which draws DOM SVG and can't run on iOS or Android, so here the host owns a
 * small cartesian engine on react-native-svg instead: it measures its width,
 * builds the x and y scales, draws gridlines and tick labels, plays the
 * draw-in, and turns a touch (or a hover on web) into a focused row with a
 * glass tooltip. Presets and your own charts draw their marks through
 * `ChartContainer`'s `render` and read positions off the frame it hands them.
 */
import * as React from "react"
import { AccessibilityInfo, Animated, Easing, Platform, View, type GestureResponderEvent, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import Svg, { Line, Text as SvgText } from "react-native-svg"

import { axisKind } from "@/components/glass/native/chart-math"
import { Glass } from "@/components/glass/native/glass"
import { GText, useUI, type UI } from "@/components/glass/native/ui"

/** The nth series colour, cycling through the theme's five chart colours. */
export function chartColor(i: number, ui: UI) {
  return ui.charts[((i % 5) + 5) % 5]
}

/** `chartColor` bound to the current theme. */
export function useChartColor() {
  const ui = useUI()
  return React.useCallback((i: number) => chartColor(i, ui), [ui])
}

/** The theme's inner control radius — shape presets round bars and slices with it. */
export function useControlRadius() {
  return useUI().radius.control * 0.7
}

/** One measure plotted by a preset: an accessor over your rows, a label for the legend and tooltip. */
export interface ChartSeries<Row> {
  id: string
  label: string
  value: (d: Row) => number | null
  /** Any colour; defaults to `chartColor(index)`. */
  color?: string
}

/** What the glass tooltip shows: an optional heading and one row per series. */
export interface ChartTooltipContent {
  title?: string
  rows: { label: string; value: string; color?: string }[]
}

// ---- scales ----

export type ScaleKind = "band" | "point" | "linear" | "time"
export interface Tick {
  pos: number
  label: string
}
/** A position scale over pixels. `bandwidth` is 0 except for band scales. */
export interface Scale {
  kind: ScaleKind
  map: (v: unknown) => number
  bandwidth: number
  ticks: Tick[]
}

/** An axis the host builds: the raw values it spans, and how. */
export interface AxisSpec {
  values: readonly unknown[]
  /** Defaults from the values: dates → time, numbers → linear, labels → band. */
  kind?: ScaleKind
  /** Round the domain out to tidy ticks (linear and time). */
  nice?: boolean
  /** Always include 0 in a linear domain — bars and areas stand on it. */
  zero?: boolean
  grid?: boolean
  /** Tick label format; gets the raw value (number, Date or label). */
  format?: (v: never) => string
  /** Band padding (0–1) for band scales, outer padding for point scales. */
  padding?: number
  /** Hide this axis's labels. */
  hidden?: boolean
}

/** The x scale a preset wants for these values: time for dates, linear for numbers, band (bars) or point (lines) for labels. */
export function xScaleFor(values: Iterable<unknown>, categorical: "band" | "point"): ScaleKind {
  const kind = axisKind(values)
  return kind === "category" ? categorical : kind
}

function niceStep(span: number, count: number) {
  const raw = span / Math.max(1, count)
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  const err = raw / pow
  return (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1) * pow
}

const num = (v: number) => (Math.abs(v) >= 1000 ? v.toLocaleString() : String(Number(v.toFixed(2))))
const day = (v: Date) => v.toLocaleDateString(undefined, { month: "short", day: "numeric" })

function buildScale(spec: AxisSpec, range: [number, number], targetTicks: number): Scale {
  const kind = spec.kind ?? xScaleFor(spec.values, "band")
  const [r0, r1] = range
  const fmt = spec.format as ((v: unknown) => string) | undefined
  if (kind === "band" || kind === "point") {
    const cats: string[] = []
    for (const v of spec.values) {
      const s = String(v instanceof Date ? v.toISOString() : v)
      if (!cats.includes(s)) cats.push(s)
    }
    const labels = new Map<string, unknown>()
    for (const v of spec.values) labels.set(String(v instanceof Date ? v.toISOString() : v), v)
    const n = Math.max(1, cats.length)
    const pad = spec.padding ?? (kind === "band" ? 0.24 : 0.4)
    let step: number
    let start: number
    let bandwidth = 0
    if (kind === "band") {
      step = (r1 - r0) / Math.max(1, n - pad + pad * 2)
      bandwidth = step * (1 - pad)
      start = r0 + step * pad
    } else {
      step = n > 1 ? (r1 - r0) / (n - 1 + pad * 2) : 0
      start = n > 1 ? r0 + step * pad : (r0 + r1) / 2
    }
    const map = (v: unknown) => {
      const i = cats.indexOf(String(v instanceof Date ? v.toISOString() : v))
      return start + Math.max(0, i) * step
    }
    // thin labels so they never crowd: one every `every` categories
    const room = Math.abs(r1 - r0) / n
    const longest = Math.max(1, ...cats.map((c) => (fmt ? fmt(labels.get(c)) : c).length))
    const every = Math.max(1, Math.ceil((longest * 6.5 + 8) / Math.max(1, room)))
    const ticks = cats
      .map((c, i) => ({ pos: start + i * step + bandwidth / 2, label: fmt ? fmt(labels.get(c)) : c, i }))
      .filter((t) => t.i % every === 0)
      .map(({ pos, label }) => ({ pos, label }))
    return { kind, map, bandwidth, ticks }
  }
  const time = kind === "time"
  const nums = spec.values.map((v) => (v instanceof Date ? v.getTime() : typeof v === "number" ? v : NaN)).filter(Number.isFinite)
  let lo = nums.length ? Math.min(...nums) : 0
  let hi = nums.length ? Math.max(...nums) : 1
  if (spec.zero) {
    lo = Math.min(0, lo)
    hi = Math.max(0, hi)
  }
  if (lo === hi) {
    lo -= 1
    hi += 1
  }
  const step = niceStep(hi - lo, targetTicks)
  if (spec.nice && !time) {
    lo = Math.floor(lo / step) * step
    hi = Math.ceil(hi / step) * step
  }
  const map = (v: unknown) => {
    const n = v instanceof Date ? v.getTime() : Number(v)
    return r0 + ((n - lo) / (hi - lo)) * (r1 - r0)
  }
  const ticks: Tick[] = []
  if (time) {
    const count = Math.max(2, Math.min(targetTicks, 6))
    for (let i = 0; i < count; i++) {
      const t = lo + ((hi - lo) * i) / (count - 1)
      ticks.push({ pos: map(t), label: fmt ? fmt(new Date(t)) : day(new Date(t)) })
    }
  } else {
    for (let t = Math.ceil(lo / step) * step; t <= hi + step * 1e-9; t += step) {
      const v = Number(t.toFixed(10))
      ticks.push({ pos: map(v), label: fmt ? fmt(v) : num(v) })
    }
  }
  return { kind, map, bandwidth: 0, ticks }
}

/** The index of the position nearest `v`; null for none. */
export function nearest(positions: readonly number[], v: number): number | null {
  let best: number | null = null
  let dist = Infinity
  positions.forEach((p, i) => {
    const d = Math.abs(p - v)
    if (d < dist) {
      dist = d
      best = i
    }
  })
  return best
}

// ---- the host ----

/** What `render`, `hit` and `tooltip` read: the measured box, the plot inside it and its scales. */
export interface ChartFrame {
  width: number
  height: number
  plot: { left: number; top: number; right: number; bottom: number; width: number; height: number }
  x: Scale
  y: Scale
  /** The focused index (from `hit`), or null. */
  focused: number | null
}

const AXIS_FONT = 11
const IDENTITY: Scale = { kind: "linear", map: () => 0, bandwidth: 0, ticks: [] }

export type ChartContainerProps = Omit<ViewProps, "style" | "children"> & {
  /** Required: say what the chart shows. */
  ariaLabel: string
  height?: number
  /** The x axis; omit for charts without one (a donut). */
  x?: AxisSpec
  y?: AxisSpec
  /** Draw the marks (react-native-svg elements) for the measured frame. */
  render: (frame: ChartFrame) => React.ReactNode
  /** Which row a touch or hover at `p` focuses; null clears. */
  hit?: (p: { x: number; y: number }, frame: ChartFrame) => number | null
  /** Tooltip for the focused row, anchored at `anchor`. */
  tooltip?: (index: number, frame: ChartFrame) => { content: ChartTooltipContent; anchor: { x: number; y: number } } | null
  /** Called when focus moves. */
  onFocusChange?: (index: number | null) => void
  /** How the marks draw in: grow from the y or x baseline, or sweep round. */
  grow?: "y" | "x" | "sweep" | "none"
  /** Draw in on mount. Reduced motion always snaps. */
  animate?: boolean
  style?: StyleProp<ViewStyle>
  /** Overlaid on the chart (e.g. a donut's centre figure). */
  children?: React.ReactNode
}

/**
 * Renders a chart inside a token-mapped host: scales, gridlines and tick labels
 * from the theme, marks from `render`, a glass tooltip on press (and hover on
 * web). `ariaLabel` is required: say what the chart shows.
 */
export function ChartContainer({ ariaLabel, height = 240, x, y, render, hit, tooltip, onFocusChange, grow = "y", animate = true, style, children, ...props }: ChartContainerProps) {
  const ui = useUI()
  const [width, setWidth] = React.useState(0)
  const [focused, setFocused] = React.useState<number | null>(null)
  const [tipSize, setTipSize] = React.useState({ w: 120, h: 48 })
  const [progress] = React.useState(() => new Animated.Value(animate ? 0 : 1))

  React.useEffect(() => {
    if (!width || !animate) return
    let anim: Animated.CompositeAnimation | null = null
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (reduce) return progress.setValue(1)
        anim = Animated.timing(progress, { toValue: 1, duration: 900, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true })
        anim.start()
      })
    return () => anim?.stop()
  }, [width, animate, progress])

  // reserve room for the y labels and the x labels under the plot
  const frame = React.useMemo<ChartFrame | null>(() => {
    if (!width) return null
    const yProbe = y ? buildScale(y, [height, 0], 5) : null
    const left = y && !y.hidden ? Math.min(72, Math.max(16, ...yProbe!.ticks.map((t) => t.label.length * 6.4)) + 8) : 4
    const bottom = x && !x.hidden ? 22 : 4
    const top = 8
    const right = 8
    const plot = { left, top, right: width - right, bottom: height - bottom, width: Math.max(1, width - left - right), height: Math.max(1, height - top - bottom) }
    const xs = x ? buildScale(x, [plot.left, plot.right], Math.max(2, Math.floor(plot.width / 80))) : IDENTITY
    const ys = y ? buildScale(y, [plot.bottom, plot.top], Math.max(2, Math.floor(plot.height / 48))) : IDENTITY
    return { width, height, plot, x: xs, y: ys, focused: null }
  }, [width, height, x, y])

  const view = frame ? { ...frame, focused } : null
  const focus = (index: number | null) => {
    if (index === focused) return
    setFocused(index)
    onFocusChange?.(index)
  }
  const at = (px: number, py: number) => (view && hit ? hit({ x: px, y: py }, view) : null)
  const tip = view && focused !== null && tooltip ? tooltip(focused, view) : null

  // baseline the marks grow from: the value axis at 0 (clamped into the plot)
  const origin = (() => {
    if (!view) return "50% 50%"
    if (grow === "y") return `0px ${Math.min(view.plot.bottom, Math.max(view.plot.top, view.y.kind === "linear" ? view.y.map(0) : view.plot.bottom))}px`
    if (grow === "x") return `${Math.min(view.plot.right, Math.max(view.plot.left, view.x.kind === "linear" ? view.x.map(0) : view.plot.left))}px 0px`
    return "50% 50%"
  })()
  const transform =
    grow === "y"
      ? [{ scaleY: progress }]
      : grow === "x"
        ? [{ scaleX: progress }]
        : grow === "sweep"
          ? [{ rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ["-90deg", "0deg"] }) }, { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }]
          : []

  const pointer = Platform.OS === "web"
    ? {
        onPointerMove: (e: { nativeEvent: { offsetX?: number; offsetY?: number } }) => focus(at(e.nativeEvent.offsetX ?? 0, e.nativeEvent.offsetY ?? 0)),
        onPointerLeave: () => focus(null),
      }
    : {}
  const touch = (e: GestureResponderEvent) => focus(at(e.nativeEvent.locationX, e.nativeEvent.locationY))

  const tipLeft = tip && view ? Math.min(view.width - tipSize.w, Math.max(0, tip.anchor.x - tipSize.w / 2)) : 0
  const tipTop = tip ? (tip.anchor.y - tipSize.h - 10 >= 0 ? tip.anchor.y - tipSize.h - 10 : tip.anchor.y + 14) : 0

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={ariaLabel}
      style={[{ width: "100%", height }, style]}
      onLayout={(e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width))}
      {...props}
    >
      {view ? (
        <>
          <Svg width={view.width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
            {x?.grid
              ? view.x.ticks.map((t, i) => <Line key={`gx${i}`} x1={t.pos} x2={t.pos} y1={view.plot.top} y2={view.plot.bottom} stroke={ui.separator} strokeWidth={1} />)
              : null}
            {y?.grid
              ? view.y.ticks.map((t, i) => <Line key={`gy${i}`} x1={view.plot.left} x2={view.plot.right} y1={t.pos} y2={t.pos} stroke={ui.separator} strokeWidth={1} />)
              : null}
            {x && !x.hidden
              ? view.x.ticks.map((t, i) => (
                  <SvgText key={`tx${i}`} x={t.pos} y={height - 6} fontSize={AXIS_FONT} fill={ui.mutedForeground} textAnchor="middle">
                    {t.label}
                  </SvgText>
                ))
              : null}
            {y && !y.hidden
              ? view.y.ticks.map((t, i) => (
                  <SvgText key={`ty${i}`} x={view.plot.left - 6} y={t.pos + AXIS_FONT / 3} fontSize={AXIS_FONT} fill={ui.mutedForeground} textAnchor="end">
                    {t.label}
                  </SvgText>
                ))
              : null}
          </Svg>
          <Animated.View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, width: view.width, height, transformOrigin: origin, transform }}>
            <Svg width={view.width} height={height} style={{ overflow: "visible" }}>
              {render(view)}
            </Svg>
          </Animated.View>
          {children}
          {hit ? (
            <View
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, ...(Platform.OS === "web" ? ({ cursor: "crosshair" } as object) : {}) }}
              onStartShouldSetResponder={() => true}
              onResponderGrant={touch}
              onResponderMove={touch}
              onResponderTerminationRequest={() => true}
              {...pointer}
            />
          ) : null}
          {tip ? (
            <View
              pointerEvents="none"
              style={{ position: "absolute", left: tipLeft, top: tipTop }}
              onLayout={(e: LayoutChangeEvent) => {
                const { width: w, height: h } = e.nativeEvent.layout
                if (Math.abs(w - tipSize.w) > 1 || Math.abs(h - tipSize.h) > 1) setTipSize({ w, h })
              }}
            >
              <ChartTooltip content={tip.content} />
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  )
}

/** The glass tooltip: a heading, then a swatch, label and value per row. */
export function ChartTooltip({ content }: { content: ChartTooltipContent }) {
  const ui = useUI()
  return (
    <Glass radius={ui.radius.control} style={{ paddingHorizontal: 12, paddingVertical: 8, gap: 2, minWidth: 96 }}>
      {content.title ? (
        <GText size="xs" weight="600">
          {content.title}
        </GText>
      ) : null}
      {content.rows.map((r, i) => (
        <View key={`${r.label}-${i}`} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {r.color ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: r.color }} /> : null}
          <GText size="xs" tone="muted" style={{ flex: 1 }}>
            {r.label}
          </GText>
          <GText size="xs" weight="600" style={{ fontVariant: ["tabular-nums"], marginLeft: 8 }}>
            {r.value}
          </GText>
        </View>
      ))}
    </Glass>
  )
}

/**
 * Tooltip content for the presets: the x as a heading, then one row per series
 * read straight from your row (so stacked layers show their own value, not the
 * running total).
 */
export function seriesTooltip<Row>(
  series: readonly ChartSeries<Row>[],
  x: (d: Row) => string | number | Date,
  { xFormat, valueFormat, colors }: { xFormat?: (value: string | number | Date) => string; valueFormat?: (value: number) => string; colors: readonly string[] }
) {
  return (row: Row): ChartTooltipContent => {
    const v = x(row)
    return {
      title: xFormat ? xFormat(v) : v instanceof Date ? day(v) : typeof v === "number" ? num(v) : v,
      rows: series.map((s, i) => {
        const value = s.value(row)
        return { label: s.label, value: value == null ? "–" : valueFormat ? valueFormat(value) : num(value), color: colors[i] }
      }),
    }
  }
}

/** A key: a swatch and a label per series. */
export function ChartLegend({ items, style, ...props }: Omit<ViewProps, "style"> & { items: readonly { label: string; color?: string }[]; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  return (
    <View accessibilityRole="list" style={[{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 16, rowGap: 6 }, style]} {...props}>
      {items.map((item, i) => (
        <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color ?? chartColor(i, ui) }} />
          <GText size="xs" tone="muted">
            {item.label}
          </GText>
        </View>
      ))}
    </View>
  )
}
