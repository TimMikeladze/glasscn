/**
 * Pure maths behind the glasscn data components: ring arcs, smooth sparkline
 * paths, the heatmap grid, bar-list widths, gauge arcs, category segments, and
 * the axis/stack/curve helpers behind the chart presets.
 * No React, no DOM — tested on its own.
 */

export interface Point {
  x: number
  y: number
}

/** Radii for concentric rings that fill `size`, outermost first. */
export function ringRadii(size: number, stroke: number, gap: number, count: number): number[] {
  const radii: number[] = []
  for (let i = 0; i < count; i++) {
    const r = size / 2 - stroke / 2 - i * (stroke + gap)
    if (r > stroke / 2) radii.push(r)
  }
  return radii
}

/**
 * A ring's stroke for a progress `value` (0..1, more than 1 laps like Activity).
 * Returns the circumference and the dash offsets for the first and second lap.
 */
export function ringArc(radius: number, value: number) {
  const circumference = 2 * Math.PI * radius
  const v = Math.max(0, Number.isFinite(value) ? value : 0)
  const lap1 = Math.min(1, v)
  const lap2 = Math.max(0, Math.min(1, v - 1))
  return {
    circumference,
    offset: circumference * (1 - lap1),
    lapOffset: lap2 > 0 ? circumference * (1 - lap2) : null,
  }
}

/** Scale values into a `width × height` box with `pad` inset; null/NaN values are skipped. */
export function scaleSeries(values: (number | null | undefined)[], width: number, height: number, pad = 4): Point[] {
  const present = values
    .map((v, i) => ({ v, i }))
    .filter((p): p is { v: number; i: number } => typeof p.v === "number" && Number.isFinite(p.v))
  if (!present.length) return []
  const lo = Math.min(...present.map((p) => p.v))
  const hi = Math.max(...present.map((p) => p.v))
  const span = hi === lo ? 1 : hi - lo
  const base = hi === lo ? lo - 0.5 : lo
  const n = Math.max(1, values.length - 1)
  return present.map(({ v, i }) => ({
    x: pad + (i / n) * (width - pad * 2),
    y: pad + (1 - (v - base) / span) * (height - pad * 2),
  }))
}

/** Length of the polyline through `points` after scaling x by `sx` and y by `sy` — a stretched path's on-screen length. */
export function polylineLength(points: Point[], sx = 1, sy = 1): number {
  let length = 0
  for (let i = 1; i < points.length; i++) length += Math.hypot((points[i].x - points[i - 1].x) * sx, (points[i].y - points[i - 1].y) * sy)
  return length
}

/** A smooth path through points: Catmull-Rom converted to cubic Béziers (tension ½). */
export function smoothPath(points: Point[]): string {
  if (!points.length) return ""
  const f = (n: number) => Number(n.toFixed(2))
  let d = `M${f(points[0].x)},${f(points[0].y)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    d += ` C${f(p1.x + (p2.x - p0.x) / 6)},${f(p1.y + (p2.y - p0.y) / 6)} ${f(p2.x - (p3.x - p1.x) / 6)},${f(p2.y - (p3.y - p1.y) / 6)} ${f(p2.x)},${f(p2.y)}`
  }
  return d
}

/** The closed area under a smooth path, down to `floor`. */
export function areaPath(points: Point[], floor: number): string {
  if (!points.length) return ""
  const last = points[points.length - 1]
  return `${smoothPath(points)} L${last.x},${floor} L${points[0].x},${floor} Z`
}

// ---- ids ----

/**
 * A React `useId()` (or any string) made safe for an SVG/HTML id and `url(#…)`
 * reference: React 18 ids carry `:`, React 19's carry `«»` or `_r_`; keep only
 * `[a-zA-Z0-9_-]`.
 */
export function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "")
}

// ---- heatmap ----

const pad2 = (n: number) => String(n).padStart(2, "0")
export const isoDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
export const parseDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}
export const addDays = (s: string, n: number) => {
  const d = parseDate(s)
  d.setDate(d.getDate() + n)
  return isoDate(d)
}

export interface HeatCell {
  date: string
  /** 0 = empty, 1–4 = intensity. */
  level: number
  value: number
  future: boolean
  today: boolean
}

/** Quantise a value into a level 0–4 against `max`. */
export function levelOf(value: number, max: number): number {
  if (!value || value <= 0 || max <= 0) return 0
  return Math.min(4, Math.max(1, Math.ceil((value / max) * 4)))
}

/**
 * Columns of weeks ending with the week containing `today`, aligned to `weekStart`
 * (0 = Sunday, 1 = Monday). `values` maps ISO dates to numbers.
 */
export function heatmapWeeks(values: Record<string, number>, opts: { today: string; weeks: number; weekStart?: 0 | 1; max?: number }): HeatCell[][] {
  const { today, weeks, weekStart = 1 } = opts
  const max = opts.max ?? Math.max(1, ...Object.values(values))
  const dow = parseDate(today).getDay()
  const back = (dow - weekStart + 7) % 7
  const first = addDays(today, -((weeks - 1) * 7 + back))
  const cols: HeatCell[][] = []
  for (let w = 0; w < weeks; w++) {
    const col: HeatCell[] = []
    for (let r = 0; r < 7; r++) {
      const date = addDays(first, w * 7 + r)
      const value = values[date] ?? 0
      col.push({ date, value, level: levelOf(value, max), future: date > today, today: date === today })
    }
    cols.push(col)
  }
  return cols
}

/** Short weekday names for the seven rows, starting at `weekStart` — the same on server and client for a given `locale`. */
export function weekdayLabels(weekStart: 0 | 1 = 1, locale = "en-US"): string[] {
  // 2024-01-07 is a Sunday; walk forward from it so the result never depends on today
  return Array.from({ length: 7 }, (_, r) => new Date(2024, 0, 7 + weekStart + r).toLocaleDateString(locale, { weekday: "short" }))
}

/** "Wed, Oct 8 · 3" — a heatmap cell's title, in `locale`. */
export function heatCellTitle(cell: HeatCell, locale = "en-US"): string {
  return `${parseDate(cell.date).toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" })}${cell.value ? ` · ${cell.value}` : ""}`
}

/** Month label for each column — the short month name when it changes from the column before. */
export function monthLabels(cols: HeatCell[][], locale = "en-US"): (string | null)[] {
  let prev = -1
  return cols.map((col) => {
    const m = parseDate(col[0].date).getMonth()
    const changed = m !== prev
    prev = m
    return changed ? parseDate(col[0].date).toLocaleString(locale, { month: "short" }) : null
  })
}

// ---- bar list ----

/** Each value's share of the largest (or of `max`), 0–100, for bar widths. Negative and non-finite values are 0. */
export function barShares(values: number[], max?: number): number[] {
  const clean = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0))
  const top = max ?? Math.max(0, ...clean)
  if (top <= 0) return clean.map(() => 0)
  return clean.map((v) => Math.min(100, (v / top) * 100))
}

// ---- gauge ----

/** Where `value` falls between `min` and `max`, clamped to 0–1. */
export function fraction(value: number, min = 0, max = 1): number {
  if (!Number.isFinite(value) || max === min) return 0
  return Math.min(1, Math.max(0, (value - min) / (max - min)))
}

/** A point on a circle; angle in radians, 0 = 12 o'clock, clockwise. */
export function polarPoint(cx: number, cy: number, r: number, angle: number): Point {
  return { x: cx + r * Math.sin(angle), y: cy - r * Math.cos(angle) }
}

/** An SVG arc from `start` to `end` (radians, 0 = 12 o'clock, clockwise). Empty when the sweep is 0. */
export function arcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  if (end - start <= 0) return ""
  const f = (n: number) => Number(n.toFixed(2))
  const a = polarPoint(cx, cy, r, start)
  const b = polarPoint(cx, cy, r, end)
  const large = end - start > Math.PI ? 1 : 0
  return `M${f(a.x)},${f(a.y)} A${f(r)},${f(r)} 0 ${large} 1 ${f(b.x)},${f(b.y)}`
}

// ---- category bar ----

export interface Segment {
  /** Left edge, % of the whole bar. */
  start: number
  /** Width, % of the whole bar. */
  width: number
}

/** Consecutive segments for `values` (sizes, not edges), as percentages of their sum. */
export function segments(values: number[]): Segment[] {
  const clean = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0))
  const total = clean.reduce((a, b) => a + b, 0)
  let start = 0
  return clean.map((v) => {
    const width = total > 0 ? (v / total) * 100 : 0
    const seg = { start, width }
    start += width
    return seg
  })
}

/** Index of the segment containing `at` (a % along the bar); the last segment owns 100%. */
export function segmentAt(segs: Segment[], at: number): number {
  for (let i = 0; i < segs.length; i++) if (at < segs[i].start + segs[i].width) return i
  return segs.length - 1
}

// ---- charts (area / bar / line presets) ----

/** Which kind of x axis a column of values wants: dates → time, numbers → linear, anything else → category. Gaps are skipped. */
export function axisKind(values: Iterable<unknown>): "time" | "linear" | "category" {
  for (const v of values) {
    if (v == null) continue
    if (v instanceof Date) return "time"
    return typeof v === "number" ? "linear" : "category"
  }
  return "category"
}

/** Running totals of a row's series values (gaps count as 0) — the top edge of each layer in a stack. */
export function runningTotals(values: (number | null | undefined)[]): number[] {
  let sum = 0
  return values.map((v) => (sum += typeof v === "number" && Number.isFinite(v) ? v : 0))
}

/** Layer i's [bottom, top] in a diverging stack: positives pile up from zero, negatives down. */
export function stackEdges(values: readonly (number | null | undefined)[], i: number): [number, number] {
  let up = 0
  let down = 0
  for (let j = 0; j < i; j++) {
    const v = values[j]
    if (typeof v !== "number" || !Number.isFinite(v)) continue
    if (v >= 0) up += v
    else down += v
  }
  const v = values[i] ?? 0
  return v >= 0 ? [up, up + v] : [down, down + v]
}

type XY = readonly (readonly [number, number])[]

/** Tangents for a monotone cubic through `pts` (Steffen's method, as d3's curveMonotoneX): never overshoots a peak. */
function monotoneTangents(pts: XY): number[] {
  const n = pts.length
  const slope = (i: number) => {
    const h = pts[i + 1][0] - pts[i][0]
    return h ? (pts[i + 1][1] - pts[i][1]) / h : 0
  }
  const t: number[] = []
  for (let i = 0; i < n; i++) {
    if (i === 0 || i === n - 1) continue
    const h0 = pts[i][0] - pts[i - 1][0]
    const h1 = pts[i + 1][0] - pts[i][0]
    const s0 = slope(i - 1)
    const s1 = slope(i)
    const p = h0 + h1 ? (s0 * h1 + s1 * h0) / (h0 + h1) : 0
    t[i] = (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0
  }
  if (n > 1) {
    const end = (a: number, b: number, inner: number | undefined) => {
      const h = pts[b][0] - pts[a][0]
      const s = h ? (pts[b][1] - pts[a][1]) / h : 0
      return inner === undefined ? s : (3 * s - inner) / 2
    }
    t[0] = end(0, 1, n > 2 ? t[1] : undefined)
    t[n - 1] = end(n - 2, n - 1, n > 2 ? t[n - 2] : undefined)
  }
  return t
}

/** The curve segments through `pts` (no leading move). */
function monotoneSegments(pts: XY): string {
  const f = (n: number) => Number(n.toFixed(2))
  const t = monotoneTangents(pts)
  let d = ""
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    const dx = (x1 - x0) / 3
    d += ` C${f(x0 + dx)},${f(y0 + dx * t[i])} ${f(x1 - dx)},${f(y1 - dx * t[i + 1])} ${f(x1)},${f(y1)}`
  }
  return d
}

/**
 * A smooth, monotone-in-x curve for chart lines and areas — the `{ line, area }`
 * contract TanStack Charts accepts as `curve`. Unlike Catmull-Rom it never
 * swings above a peak or below a trough, so the stroke stays honest to the data.
 */
export const monotoneCurve = {
  line(points: XY): string {
    if (!points.length) return ""
    const f = (n: number) => Number(n.toFixed(2))
    return `M${f(points[0][0])},${f(points[0][1])}${monotoneSegments(points)}`
  },
  area(top: XY, bottom: XY): string {
    if (!top.length) return ""
    const f = (n: number) => Number(n.toFixed(2))
    const back = [...bottom].reverse()
    const start = back[0] ?? top[top.length - 1]
    return `${monotoneCurve.line(top)} L${f(start[0])},${f(start[1])}${monotoneSegments(back)} Z`
  },
}

/**
 * Motion for the data components, from the theme's `--glass-duration` (200ms by
 * default; 0 under `motion-still` and reduced motion) so one token stills them all.
 * `glassTime(6)` is 1.2s at the default. The draw curve is an ease-out with no
 * overshoot: a dash offset that overshoots would open a gap at the arc's start.
 */
export const glassTime = (k: number) => `calc(var(--glass-duration, 200ms) * ${k})`
export const drawEase = "cubic-bezier(0.16,1,0.3,1)"

/** A CSS time (`200ms`, `0.2s`, `0`) in milliseconds; `fallback` when it can't be read. */
export function parseDuration(value: string | null | undefined, fallback = 200): number {
  const m = /^\s*(-?\d*\.?\d+)\s*(ms|s)?\s*$/i.exec(value ?? "")
  if (!m) return fallback
  const n = Number(m[1]) * (m[2]?.toLowerCase() === "s" ? 1000 : 1)
  return Number.isFinite(n) ? Math.max(0, n) : fallback
}

// ---- chart text alternatives ----

export interface SeriesSummary {
  count: number
  min: number
  max: number
  first: number
  latest: number
  /** Latest against first: up, down or flat (within 1% of the range). */
  trend: "up" | "down" | "flat"
}

/** Count, min, max, first, latest and trend of a column of values; null when nothing is plotted. */
export function summarize(values: readonly (number | null | undefined)[]): SeriesSummary | null {
  const present = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v))
  if (!present.length) return null
  const min = Math.min(...present)
  const max = Math.max(...present)
  const first = present[0]
  const latest = present[present.length - 1]
  const delta = latest - first
  const trend = Math.abs(delta) <= (max - min) * 0.01 ? "flat" : delta > 0 ? "up" : "down"
  return { count: present.length, min, max, first, latest, trend }
}

/** "Steps: 12 values, low 3,200, high 9,800, latest 7,400, trending up." */
export function summarySentence(label: string, s: SeriesSummary | null, format: (v: number) => string = (v) => v.toLocaleString()): string {
  if (!s) return `${label}: no data.`
  const trend = s.trend === "flat" ? "holding steady" : `trending ${s.trend}`
  return `${label}: ${s.count} ${s.count === 1 ? "value" : "values"}, low ${format(s.min)}, high ${format(s.max)}, latest ${format(s.latest)}, ${trend}.`
}

// ---- categorical ----

/** How many distinct series colours the theme has (`--chart-1..8`). */
export const CHART_COLORS = 8

/**
 * Keep the `limit - 1` largest slices in their order and fold the rest into one
 * "Other" slice, so a part-of-whole never repeats a colour. Returns indices into
 * `values` per kept slice, plus the folded total (null when nothing folds).
 */
export function foldOther(values: readonly number[], limit = CHART_COLORS): { keep: number[]; other: number | null; folded: number[] } {
  if (values.length <= limit) return { keep: values.map((_, i) => i), other: null, folded: [] }
  const ranked = values.map((v, i) => ({ v: Number.isFinite(v) ? v : 0, i })).sort((a, b) => b.v - a.v)
  const kept = new Set(ranked.slice(0, limit - 1).map((r) => r.i))
  const keep = values.map((_, i) => i).filter((i) => kept.has(i))
  const folded = values.map((_, i) => i).filter((i) => !kept.has(i))
  return { keep, other: folded.reduce((sum, i) => sum + (Number.isFinite(values[i]) ? values[i] : 0), 0), folded }
}

/** A band key for a category value: dates by local calendar day (never UTC), others as strings, made unique by row index. */
export function categoryKey(value: string | number | Date, index: number): string {
  const v = value instanceof Date ? isoDate(value) : String(value)
  return `${v}\u0000${index}`
}

/** The display part of a `categoryKey`. */
export function categoryLabel(key: string): string {
  const at = key.indexOf("\u0000")
  return at < 0 ? key : key.slice(0, at)
}

/** Intl compact figure: 12.4K, 3.1M — in `locale` (default: the runtime's). */
export function formatCompact(value: number, locale?: string, options?: Intl.NumberFormatOptions): string {
  if (!Number.isFinite(value)) return "–"
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1, ...options }).format(value)
}

// ---- range chart ----

/** Where a low–high capsule sits in a shared `[min, max]` domain, as start/width percentages (0–100). */
export function rangeSpan(low: number, high: number, min: number, max: number): { start: number; width: number } {
  const lo = Math.min(low, high)
  const hi = Math.max(low, high)
  const start = fraction(lo, min, max) * 100
  const end = fraction(hi, min, max) * 100
  return { start, width: Math.max(0, end - start) }
}

// ---- activity rings ----

/** A ring's laps for `value` (1 = one full lap): full laps drawn under, plus the partial arc on top (0–1). */
export function ringLaps(value: number): { full: number; partial: number } {
  const v = Math.max(0, Number.isFinite(value) ? value : 0)
  const full = Math.floor(v)
  const partial = v - full
  // an exact lap count reads as a closed ring, not an empty partial
  return full > 0 && partial < 1e-6 ? { full: full - 1, partial: 1 } : { full, partial }
}

// ---- data table ----

/** True when a click or key event inside a clickable row came from an interactive descendant (link, button, input…), which handles it itself. */
export function fromInteractive(target: EventTarget | null, row: Element): boolean {
  let el = target as Element | null
  while (el && el !== row) {
    if (el.matches?.("a[href],button,input,select,textarea,label,summary,[role=button],[role=checkbox],[role=menuitem],[role=link],[role=switch],[contenteditable=true]")) return true
    el = el.parentElement
  }
  return false
}

/** A step curve (value holds until the midpoint between samples) in the same `{ line, area }` contract as `monotoneCurve`. */
export const stepCurve = {
  line(points: XY): string {
    if (!points.length) return ""
    const f = (n: number) => Number(n.toFixed(2))
    let d = `M${f(points[0][0])},${f(points[0][1])}`
    for (let i = 1; i < points.length; i++) {
      const mid = (points[i - 1][0] + points[i][0]) / 2
      d += ` H${f(mid)} V${f(points[i][1])}`
    }
    return `${d} H${f(points[points.length - 1][0])}`
  },
  area(top: XY, bottom: XY): string {
    if (!top.length) return ""
    const back = [...bottom].reverse()
    const f = (n: number) => Number(n.toFixed(2))
    return `${stepCurve.line(top)} L${f(back[0]?.[0] ?? top[top.length - 1][0])},${f(back[0]?.[1] ?? 0)}${stepCurve.line(back).replace(/^M/, " L")} Z`
  },
}
