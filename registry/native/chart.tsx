/**
 * The chart host for the native track. The web host renders TanStack Charts,
 * which draws DOM SVG and can't run on iOS or Android, so here the host owns a
 * small cartesian engine on react-native-svg instead: it measures its width,
 * builds the x and y scales, draws gridlines and tick labels, plays the
 * draw-in, and turns a touch (or a hover on web and iPad) into a focused row
 * with a glass tooltip. Presets and your own charts draw their marks through
 * `ChartContainer`'s `render` and read positions off the frame it hands them.
 *
 * Focus lives on the UI thread (NAT-67): the gesture hit-tests `targets` in a
 * worklet and moves the rule, focus dots and tooltip with animated styles, so a
 * drag never re-renders the plot; only the tooltip's text updates when the row
 * changes. The tooltip clears on lift. Screen readers get an `adjustable`
 * element that steps through the rows (NAT-66) and a "View as table" action.
 */
import * as React from "react"
import { PixelRatio, Platform, View, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { Easing, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import Svg, { Line, Text as SvgText } from "react-native-svg"

import { announce, useReducedMotion } from "@/components/glass/native/a11y"
import { axisKind, hitIndex, stepIndex, summarize, summarySentence, type ChartTargets } from "@/components/glass/native/chart-math"
import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { GText, useUI, type UI } from "@/components/glass/native/ui"

export type { ChartTargets }

/** The nth series colour, cycling through the theme's eight chart colours. */
export function chartColor(i: number, ui: UI) {
  return ui.charts[((i % 8) + 8) % 8]
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
  /** This series' own number format in the tooltip, data table and summary; the chart's `valueFormat` otherwise. */
  format?: (value: number) => string
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

function buildScale(spec: AxisSpec, range: [number, number], targetTicks: number, charW = 6.5): Scale {
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
    const every = Math.max(1, Math.ceil((longest * charW + 8) / Math.max(1, room)))
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

/** What `render`, `targets`, `tooltip` and `dots` read: the measured box, the plot inside it and its scales. */
export interface ChartFrame {
  width: number
  height: number
  plot: { left: number; top: number; right: number; bottom: number; width: number; height: number }
  x: Scale
  y: Scale
}

/** A placeholder instead of the plot: `ready` (default) draws the chart. */
export type ChartStateValue = "ready" | "loading" | "empty" | "error"
export interface ChartStateLabels {
  loading?: string
  empty?: string
  error?: string
  retry?: string
}

/**
 * `accessibilityTable` on every preset: `true` (default) puts the exact values
 * behind a "View as table" screen-reader action, `"visible"` shows the table under
 * the chart, `false` omits it.
 */
export type ChartAccessibility = boolean | "visible"

const AXIS_FONT = 11
const IDENTITY: Scale = { kind: "linear", map: () => 0, bandwidth: 0, ticks: [] }
const EMPTY_TIP: ChartTooltipContent = { rows: [] }
/** Marks a row with no anchor or dot in the arrays handed to the UI thread. */
const NONE = -99999

/** The tooltip as one sentence, for the screen reader's value. */
export function tooltipText(content: ChartTooltipContent): string {
  return [content.title, ...content.rows.map((r) => `${r.label} ${r.value}`)].filter(Boolean).join(", ")
}

export type ChartContainerProps = Omit<ViewProps, "style" | "children"> & {
  /** Required: say what the chart shows. */
  ariaLabel: string
  height?: number
  /** The x axis; omit for charts without one (a donut). */
  x?: AxisSpec
  y?: AxisSpec
  /** Which side the y labels sit on. Apple's charts put them trailing. */
  axis?: "leading" | "trailing"
  /** Draw the marks (react-native-svg elements) for the measured frame. Runs when the data or size changes, never per touch. */
  render: (frame: ChartFrame) => React.ReactNode
  /** Where each row sits, hit-tested on the UI thread. Omit for a static chart. */
  targets?: (frame: ChartFrame) => ChartTargets
  /** Tooltip for row `index`, anchored at `anchor`. */
  tooltip?: (index: number, frame: ChartFrame) => { content: ChartTooltipContent; anchor: { x: number; y: number } } | null
  /** What marks the focused row: a rule across the plot (default), the row's band, or nothing. */
  highlight?: "rule" | "band" | "none"
  /** Focus dots, one per series: the y of each row (null where there's no value); x is the tooltip anchor's. */
  dots?: (frame: ChartFrame) => { color: string; y: readonly (number | null)[] }[]
  /** A fixed rule at this row — controlled selection. */
  selected?: number | null
  /** Focus moved (drag, hover, screen-reader step); null when it clears. */
  onFocusChange?: (index: number | null) => void
  /** A tap (or the screen reader's activate) on a row; null when the tap misses. */
  onSelect?: (index: number | null) => void
  /** How the marks draw in: grow from the y or x baseline, or sweep round. */
  grow?: "y" | "x" | "sweep" | "none"
  /** Draw in on mount. Reduce Motion and `motion="still"` snap. */
  animate?: boolean
  /** Show a placeholder instead of the plot. */
  state?: ChartStateValue
  onRetry?: () => void
  stateLabels?: ChartStateLabels
  /** Under the plot, above any table: usually a `ChartLegend`. */
  legend?: React.ReactNode
  /** The exact-value alternative, usually a `ChartDataTable`. */
  table?: React.ReactNode
  accessibilityTable?: ChartAccessibility
  /** A sentence about the data (low, high, trend), read after the label. */
  summary?: string
  style?: StyleProp<ViewStyle>
  /** Overlaid on the chart (e.g. a donut's centre figure). */
  children?: React.ReactNode
}

/**
 * Renders a chart inside a token-mapped host: scales, gridlines and tick labels
 * from the theme, marks from `render`, a glass tooltip while pressing (and on
 * hover). `ariaLabel` is required: say what the chart shows.
 */
export function ChartContainer({
  ariaLabel,
  height = 240,
  x,
  y,
  axis = "leading",
  render,
  targets,
  tooltip,
  highlight = "rule",
  dots,
  selected = null,
  onFocusChange,
  onSelect,
  grow = "y",
  animate = true,
  state = "ready",
  onRetry,
  stateLabels,
  legend,
  table,
  accessibilityTable = true,
  summary,
  style,
  children,
  ...props
}: ChartContainerProps) {
  const ui = useUI()
  const still = useReducedMotion() || ui.motion.duration === 0
  const [width, setWidth] = React.useState(0)
  // tick labels follow Dynamic Type, within reason (NAT-68)
  const axisFont = Math.round(AXIS_FONT * Math.min(1.5, Math.max(1, PixelRatio.getFontScale())))
  const charW = axisFont * 0.62

  const frame = React.useMemo<ChartFrame | null>(() => {
    if (!width) return null
    const yProbe = y ? buildScale(y, [height, 0], 5) : null
    const labelW = y && !y.hidden ? Math.min(80, Math.max(16, ...yProbe!.ticks.map((t) => t.label.length * charW)) + 8) : 4
    const trailing = axis === "trailing"
    const bottom = x && !x.hidden ? axisFont + 11 : 4
    const top = 8
    const left = trailing ? 8 : labelW
    const right = trailing ? labelW : 8
    const plot = { left, top, right: width - right, bottom: height - bottom, width: Math.max(1, width - left - right), height: Math.max(1, height - top - bottom) }
    const xs = x ? buildScale(x, [plot.left, plot.right], Math.max(2, Math.floor(plot.width / 80)), charW) : IDENTITY
    const ys = y ? buildScale(y, [plot.bottom, plot.top], Math.max(2, Math.floor(plot.height / 48)), charW) : IDENTITY
    return { width, height, plot, x: xs, y: ys }
  }, [width, height, x, y, axis, axisFont, charW])

  // ---- what the UI thread reads: targets, anchors, dots ----
  const t = frame && targets ? targets(frame) : null
  const count = !t ? 0 : t.kind === "xy" ? t.x.length : t.kind === "angle" ? t.start.length : t.at.length
  const tips = frame && tooltip ? Array.from({ length: count }, (_, i) => tooltip(i, frame)) : []
  const ax = tips.map((tp) => tp?.anchor.x ?? NONE)
  const ay = tips.map((tp) => tp?.anchor.y ?? NONE)
  const rule = !t || t.kind === "angle" ? null : t.kind === "xy" ? t.x : t.at
  const vertical = !t || t.kind !== "y"
  const bandwidth = frame ? (vertical ? frame.x.bandwidth : frame.y.bandwidth) : 0
  const band = highlight === "band" && bandwidth > 0
  const dotRows = frame && dots ? dots(frame).map((d) => ({ color: d.color, y: d.y.map((v) => v ?? NONE) })) : []

  const focus = useSharedValue(-1)
  const progress = useSharedValue(animate && !still ? 0 : 1)
  const report = (i: number) => onFocusChange?.(i < 0 ? null : i)
  const pick = (i: number) => onSelect?.(i < 0 ? null : i)
  useAnimatedReaction(
    () => focus.value,
    (now, prev) => {
      if (onFocusChange && prev !== null && now !== prev) runOnJS(report)(now)
    },
    [onFocusChange]
  )

  const measured = width > 0
  React.useEffect(() => {
    if (!measured || !animate) return
    if (still) {
      progress.set(1)
      return
    }
    progress.set(withTiming(1, { duration: Math.max(1, ui.motion.duration * 4.5), easing: Easing.bezier(0.16, 1, 0.3, 1) }))
  }, [measured, animate, still, progress, ui.motion.duration])

  // ---- gestures: hit-test on the UI thread; lift clears (NAT-68) ----
  const live = count > 0 ? t : null
  const gesture = (() => {
    const move = (px: number, py: number) => {
      "worklet"
      if (!live) return
      const i = hitIndex(live, px, py)
      if (i !== focus.get()) focus.set(i)
    }
    const clear = () => {
      "worklet"
      focus.set(-1)
    }
    // horizontal drags scrub; vertical ones fall through to the ScrollView
    const pan = Gesture.Pan()
      .enabled(!!live)
      .activeOffsetX([-6, 6])
      .failOffsetY([-12, 12])
      .onBegin((e) => move(e.x, e.y))
      .onUpdate((e) => move(e.x, e.y))
      .onFinalize(clear)
    const tap = Gesture.Tap()
      .enabled(!!live && !!onSelect)
      .onEnd((e, ok) => {
        if (ok && live) runOnJS(pick)(hitIndex(live, e.x, e.y))
      })
    const hover = Gesture.Hover()
      .enabled(!!live)
      .onBegin((e) => move(e.x, e.y))
      .onUpdate((e) => move(e.x, e.y))
      .onFinalize(clear)
    return Gesture.Simultaneous(pan, tap, hover)
  })()

  // ---- animated overlays ----
  const growStyle = useAnimatedStyle(() => {
    const p = progress.value
    if (grow === "y") return { transform: [{ scaleY: p }] }
    if (grow === "x") return { transform: [{ scaleX: p }] }
    if (grow === "sweep") return { transform: [{ rotate: `${-90 * (1 - p)}deg` }, { scale: 0.7 + 0.3 * p }] }
    return {}
  })
  const ruleStyle = useAnimatedStyle(() => {
    const i = focus.value
    if (!rule || i < 0 || i >= rule.length || highlight === "none") return { opacity: 0 }
    const at = rule[i] - (band ? bandwidth / 2 : 0.5)
    return { opacity: 1, transform: vertical ? [{ translateX: at }, { translateY: 0 }] : [{ translateX: 0 }, { translateY: at }] }
  })

  // ---- screen readers: step the rows, announce each; a table on request (NAT-66) ----
  const [a11y, setA11y] = React.useState<number | null>(null)
  const [showTable, setShowTable] = React.useState(false)
  const describe = (i: number | null) => (i === null ? undefined : tips[i] ? tooltipText(tips[i]!.content) : undefined)
  const step = (d: 1 | -1) => {
    const n = stepIndex(a11y, d, count)
    setA11y(n)
    focus.set(n ?? -1)
  }
  const toggleTable = () => {
    setShowTable((v) => !v)
    announce(showTable ? "Table hidden" : "Table shown below the chart")
  }
  const actions = [
    ...(count ? [{ name: "increment" as const }, { name: "decrement" as const }] : []),
    ...(onSelect && count ? [{ name: "activate" as const }] : []),
    ...(table && accessibilityTable === true ? [{ name: "table", label: showTable ? "Hide table" : "View as table" }] : []),
  ]
  const keyboard =
    Platform.OS === "web" && count
      ? ({
          tabIndex: 0,
          onKeyDown: (e: { key: string; preventDefault: () => void }) => {
            const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0
            if (d) {
              e.preventDefault()
              step(d)
            } else if (e.key === "Escape") {
              setA11y(null)
              focus.set(-1)
            } else if (e.key === "Enter" && a11y !== null) onSelect?.(a11y)
          },
          onBlur: () => {
            setA11y(null)
            focus.set(-1)
          },
        } as object)
      : {}

  const plotBox =
    state !== "ready" ? (
      <ChartState state={state} height={height} onRetry={onRetry} labels={stateLabels} />
    ) : (
      <View
        accessible
        accessibilityRole={count ? "adjustable" : "image"}
        accessibilityLabel={ariaLabel}
        accessibilityHint={summary}
        accessibilityValue={a11y !== null ? { text: describe(a11y) } : undefined}
        accessibilityActions={actions.length ? actions : undefined}
        onAccessibilityAction={(e) => {
          const name = e.nativeEvent.actionName
          if (name === "increment") step(1)
          else if (name === "decrement") step(-1)
          else if (name === "activate" && a11y !== null) onSelect?.(a11y)
          else if (name === "table") toggleTable()
        }}
        style={{ width: "100%", height }}
        onLayout={(e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width))}
        {...keyboard}
      >
        {frame ? (
          <>
            <Svg width={frame.width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
              {x?.grid ? frame.x.ticks.map((tk, i) => <Line key={`gx${i}`} x1={tk.pos} x2={tk.pos} y1={frame.plot.top} y2={frame.plot.bottom} stroke={ui.separator} strokeWidth={1} />) : null}
              {y?.grid ? frame.y.ticks.map((tk, i) => <Line key={`gy${i}`} x1={frame.plot.left} x2={frame.plot.right} y1={tk.pos} y2={tk.pos} stroke={ui.separator} strokeWidth={1} />) : null}
              {x && !x.hidden
                ? frame.x.ticks.map((tk, i) => (
                    <SvgText key={`tx${i}`} x={tk.pos} y={height - 6} fontSize={axisFont} fill={ui.mutedForeground} textAnchor="middle">
                      {tk.label}
                    </SvgText>
                  ))
                : null}
              {y && !y.hidden
                ? frame.y.ticks.map((tk, i) => (
                    <SvgText
                      key={`ty${i}`}
                      x={axis === "trailing" ? frame.plot.right + 6 : frame.plot.left - 6}
                      y={tk.pos + axisFont / 3}
                      fontSize={axisFont}
                      fill={ui.mutedForeground}
                      textAnchor={axis === "trailing" ? "start" : "end"}
                    >
                      {tk.label}
                    </SvgText>
                  ))
                : null}
            </Svg>
            {selected !== null && rule && rule[selected] !== undefined ? (
              <View
                pointerEvents="none"
                style={
                  vertical
                    ? { position: "absolute", top: frame.plot.top, height: frame.plot.height, left: rule[selected] - 0.75, width: 1.5, backgroundColor: ui.primary }
                    : { position: "absolute", left: frame.plot.left, width: frame.plot.width, top: rule[selected] - 0.75, height: 1.5, backgroundColor: ui.primary }
                }
              />
            ) : null}
            {rule && band ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  vertical
                    ? { position: "absolute", left: 0, top: frame.plot.top, height: frame.plot.height, width: bandwidth }
                    : { position: "absolute", top: 0, left: frame.plot.left, width: frame.plot.width, height: bandwidth },
                  { backgroundColor: ui.fill, borderRadius: Math.min(8, ui.radius.control * 0.7) },
                  ruleStyle,
                ]}
              />
            ) : null}
            <Animated.View
              pointerEvents="none"
              style={[{ position: "absolute", top: 0, left: 0, width: frame.width, height, transformOrigin: originFor(grow, frame) }, growStyle]}
            >
              <Svg width={frame.width} height={height} style={{ overflow: "visible" }}>
                {render(frame)}
              </Svg>
            </Animated.View>
            {rule && !band && highlight === "rule" ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  vertical
                    ? { position: "absolute", left: 0, top: frame.plot.top, height: frame.plot.height, width: 1 }
                    : { position: "absolute", top: 0, left: frame.plot.left, width: frame.plot.width, height: 1 },
                  { backgroundColor: ui.mutedForeground },
                  ruleStyle,
                ]}
              />
            ) : null}
            {dotRows.map((d, s) => (
              <FocusDot key={s} focus={focus} x={ax} y={d.y} color={d.color} ring={ui.auroraBase} />
            ))}
            {children}
            {live ? (
              <GestureDetector gesture={gesture}>
                <View collapsable={false} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, ...(Platform.OS === "web" ? ({ cursor: "crosshair" } as object) : {}) }} />
              </GestureDetector>
            ) : null}
            {tooltip ? <FocusTooltip focus={focus} tips={tips} ax={ax} ay={ay} width={frame.width} /> : null}
          </>
        ) : null}
      </View>
    )

  const tableShown = !!table && state === "ready" && (accessibilityTable === "visible" || (accessibilityTable === true && showTable))
  return (
    <View style={[{ width: "100%", gap: 12 }, style]} {...props}>
      {plotBox}
      {legend}
      {tableShown ? table : null}
    </View>
  )
}

/** Where the marks grow from: the value axis at 0, clamped into the plot. */
function originFor(grow: ChartContainerProps["grow"], f: ChartFrame) {
  if (grow === "y") return `0px ${Math.min(f.plot.bottom, Math.max(f.plot.top, f.y.kind === "linear" ? f.y.map(0) : f.plot.bottom))}px`
  if (grow === "x") return `${Math.min(f.plot.right, Math.max(f.plot.left, f.x.kind === "linear" ? f.x.map(0) : f.plot.left))}px 0px`
  return "50% 50%"
}

type Focus = ReturnType<typeof useSharedValue<number>>

/** A series' dot at the focused row, moved on the UI thread. */
function FocusDot({ focus, x, y, color, ring }: { focus: Focus; x: readonly number[]; y: readonly number[]; color: string; ring: string }) {
  const style = useAnimatedStyle(() => {
    const i = focus.value
    if (i < 0 || i >= y.length || y[i] === NONE || x[i] === NONE) return { opacity: 0 }
    return { opacity: 1, transform: [{ translateX: x[i] - 5 }, { translateY: y[i] - 5 }] }
  })
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: color, borderWidth: 1.5, borderColor: ring }, style]}
    />
  )
}

/**
 * The tooltip, mounted once: its position follows focus on the UI thread; only
 * its text re-renders when the focused row changes.
 */
function FocusTooltip({
  focus,
  tips,
  ax,
  ay,
  width,
}: {
  focus: Focus
  tips: readonly ({ content: ChartTooltipContent } | null)[]
  ax: readonly number[]
  ay: readonly number[]
  width: number
}) {
  // the last row shown: kept while hidden, so the tooltip never empties mid-fade
  const [index, setIndex] = React.useState(-1)
  useAnimatedReaction(
    () => focus.value,
    (now, prev) => {
      if (now >= 0 && now !== prev) runOnJS(setIndex)(now)
    }
  )
  const w = useSharedValue(120)
  const h = useSharedValue(48)
  const style = useAnimatedStyle(() => {
    const i = focus.value
    if (i < 0 || i >= ax.length || ax[i] === NONE) return { opacity: 0 }
    const left = Math.min(width - w.value, Math.max(0, ax[i] - w.value / 2))
    const top = ay[i] - h.value - 10 >= 0 ? ay[i] - h.value - 10 : ay[i] + 14
    return { opacity: 1, transform: [{ translateX: left }, { translateY: top }] }
  })
  const content = (index >= 0 && tips[index]?.content) || EMPTY_TIP
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute", top: 0, left: 0 }, style]}
      onLayout={(e: LayoutChangeEvent) => {
        w.set(e.nativeEvent.layout.width)
        h.set(e.nativeEvent.layout.height)
      }}
    >
      <ChartTooltip content={content} />
    </Animated.View>
  )
}

/** The placeholder a chart shows while loading, when empty, or on error — hairlines where the grid would be. */
export function ChartState({
  state,
  height = 240,
  onRetry,
  labels,
  style,
  ...props
}: Omit<ViewProps, "children" | "style"> & { state: Exclude<ChartStateValue, "ready">; height?: number; onRetry?: () => void; labels?: ChartStateLabels; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  const loading = state === "loading"
  const text = loading ? (labels?.loading ?? "Loading chart") : state === "empty" ? (labels?.empty ?? "No data for this range") : (labels?.error ?? "Couldn't load this chart")
  return (
    <View
      accessibilityRole={state === "error" ? "alert" : "text"}
      accessibilityLabel={text}
      accessibilityLiveRegion="polite"
      aria-busy={loading || undefined}
      style={[{ width: "100%", height, alignItems: "center", justifyContent: "center" }, style]}
      {...props}
    >
      <View pointerEvents="none" style={{ position: "absolute", top: 8, bottom: 8, left: 0, right: 0, justifyContent: "space-between" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={{ height: 1, backgroundColor: ui.separator }} />
        ))}
      </View>
      {loading ? (
        <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 8, top: height / 3, borderRadius: ui.radius.control * 0.7, backgroundColor: ui.fill }} />
      ) : (
        <View style={{ alignItems: "center", gap: 8, paddingHorizontal: ui.pad.default, paddingVertical: 8, borderRadius: ui.radius.control, backgroundColor: ui.glassSolid }}>
          <GText size="sm" tone="muted" align="center">
            {text}
          </GText>
          {state === "error" && onRetry ? (
            <Press onPress={onRetry} dim style={{ paddingHorizontal: ui.pad.sm, paddingVertical: 4, borderRadius: ui.radius.button }} hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}>
              <GText size="sm" weight="600" tone="primary">
                {labels?.retry ?? "Retry"}
              </GText>
            </Press>
          ) : null}
        </View>
      )}
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
        const format = s.format ?? valueFormat
        return { label: s.label, value: value == null ? "–" : format ? format(value) : num(value), color: colors[i] }
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

type XValue = string | number | Date
const fx = (v: XValue, xFormat?: (value: XValue) => string) => (xFormat ? xFormat(v) : v instanceof Date ? v.toLocaleDateString() : String(v))

/**
 * The exact values behind a chart, as a table: a row per x, a column per series.
 * Presets render it under the chart with `accessibilityTable="visible"`, or on the
 * screen reader's "View as table" action.
 */
export function ChartDataTable<Row>({
  data,
  x,
  xLabel = "",
  series,
  xFormat,
  valueFormat,
  caption,
  style,
  ...props
}: Omit<ViewProps, "children" | "style"> & {
  data: readonly Row[]
  x: (d: Row) => XValue
  xLabel?: string
  series: readonly ChartSeries<Row>[]
  xFormat?: (value: XValue) => string
  valueFormat?: (value: number) => string
  caption?: React.ReactNode
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const fv = (v: number | null, format = valueFormat) => (v == null ? "–" : format ? format(v) : v.toLocaleString())
  const cell = { flex: 1, paddingVertical: 6 } as const
  return (
    <View role="table" style={style} {...props}>
      {caption ? (
        typeof caption === "string" ? (
          <GText size="xs" tone="muted" style={{ paddingBottom: 6 }}>
            {caption}
          </GText>
        ) : (
          caption
        )
      ) : null}
      <View role="row" style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: ui.separator }}>
        <GText role="columnheader" size="xs" tone="muted" weight="500" style={cell}>
          {xLabel}
        </GText>
        {series.map((s) => (
          <GText key={s.id} role="columnheader" size="xs" tone="muted" weight="500" align="right" style={cell}>
            {s.label}
          </GText>
        ))}
      </View>
      {data.map((d, i) => (
        <View key={i} role="row" style={{ flexDirection: "row", borderBottomWidth: i === data.length - 1 ? 0 : 1, borderBottomColor: ui.separator }}>
          <GText role="rowheader" size="sm" style={cell}>
            {fx(x(d), xFormat)}
          </GText>
          {series.map((s) => (
            <GText key={s.id} role="cell" size="sm" align="right" style={[cell, { fontVariant: ["tabular-nums"] }]}>
              {fv(s.value(d), s.format ?? valueFormat)}
            </GText>
          ))}
        </View>
      ))}
    </View>
  )
}

/** One sentence per series — count, low, high, latest, trend — as plain text. */
export function chartSummary<Row>(data: readonly Row[], series: readonly ChartSeries<Row>[], valueFormat?: (value: number) => string): string {
  return series.map((s) => summarySentence(s.label, summarize(data.map(s.value)), s.format ?? valueFormat)).join(" ")
}

/** `chartSummary` as visible caption text under a chart. */
export function ChartSummary<Row>({ data, series, valueFormat, ...props }: Omit<React.ComponentProps<typeof GText>, "children"> & { data: readonly Row[]; series: readonly ChartSeries<Row>[]; valueFormat?: (value: number) => string }) {
  return (
    <GText size="xs" tone="muted" {...props}>
      {chartSummary(data, series, valueFormat)}
    </GText>
  )
}

/** The props every cartesian preset shares with the web's. */
export interface ChartPresetProps<Row> {
  /** Marks this x with a rule — controlled selection. */
  selectedX?: XValue | null
  /** A tap (or the screen reader's activate) on a row selects it; null clears. */
  onSelect?: (row: Row | null) => void
  /** The row under the finger, pointer or screen-reader focus while scrubbing; null when it leaves. */
  onScrub?: (row: Row | null) => void
  state?: ChartStateValue
  onRetry?: () => void
  stateLabels?: ChartStateLabels
  /** Exact values for assistive tech: true ("View as table" action, default), "visible", or false. */
  accessibilityTable?: ChartAccessibility
  /** Which side the value axis sits on. Apple's charts put it trailing. */
  axis?: "leading" | "trailing"
}

/** The index of `selectedX` in `data` (compared by value, dates by time), or null. */
export function selectedIndex<Row>(data: readonly Row[], x: (d: Row) => XValue, selectedX: XValue | null | undefined): number | null {
  if (selectedX == null) return null
  const key = (v: XValue) => (v instanceof Date ? v.getTime() : v)
  const i = data.findIndex((d) => key(x(d)) === key(selectedX))
  return i < 0 ? null : i
}

/**
 * The `ChartContainer` props a cartesian preset passes through: controlled
 * selection, scrub and select callbacks mapped to rows, the state placeholder,
 * the summary sentence and the data table.
 */
export function presetContainerProps<Row>(
  data: readonly Row[],
  x: (d: Row) => XValue,
  series: readonly ChartSeries<Row>[],
  { selectedX, onSelect, onScrub, state, onRetry, stateLabels, accessibilityTable = true, axis = "trailing", ariaLabel, valueFormat, xFormat }: ChartPresetProps<Row> & { ariaLabel: string; valueFormat?: (value: number) => string; xFormat?: (value: XValue) => string }
): Partial<ChartContainerProps> {
  return {
    state,
    onRetry,
    stateLabels,
    accessibilityTable,
    axis,
    selected: selectedIndex(data, x, selectedX),
    onFocusChange: onScrub ? (i) => onScrub(i === null ? null : data[i]) : undefined,
    onSelect: onSelect ? (i) => onSelect(i === null ? null : data[i]) : undefined,
    summary: chartSummary(data, series, valueFormat),
    table: accessibilityTable ? <ChartDataTable data={data} x={x} series={series} xFormat={xFormat} valueFormat={valueFormat} caption={ariaLabel} /> : undefined,
  }
}
