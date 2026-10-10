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
