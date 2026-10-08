/**
 * Pure maths behind the glasscn data components: ring arcs, smooth sparkline
 * paths and the heatmap grid. No React, no DOM — tested on its own.
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
