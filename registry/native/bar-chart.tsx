import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Path, Rect } from "react-native-svg"

import { ChartContainer, ChartLegend, chartColor, nearest, seriesTooltip, useControlRadius, type AxisSpec, type ChartFrame, type ChartSeries } from "@/components/glass/native/chart"
import { runningTotals } from "@/components/glass/native/chart-math"
import { useUI } from "@/components/glass/native/ui"

type XValue = string | number | Date

/**
 * A bar from `base` to `end` along the value axis, `thick` wide at `at` on the
 * category axis, its far end rounded by `r` (only when `round`).
 */
function barPath(horizontal: boolean, at: number, thick: number, base: number, end: number, r: number, round: boolean) {
  const f = (n: number) => n.toFixed(2)
  const len = Math.abs(end - base)
  const rr = round ? Math.max(0, Math.min(r, thick / 2, len)) : 0
  const dir = end >= base ? 1 : -1
  if (horizontal) {
    // x is the value axis
    const y0 = at
    const y1 = at + thick
    const xe = end
    return `M${f(base)},${f(y0)} L${f(xe - dir * rr)},${f(y0)} Q${f(xe)},${f(y0)} ${f(xe)},${f(y0 + rr)} L${f(xe)},${f(y1 - rr)} Q${f(xe)},${f(y1)} ${f(xe - dir * rr)},${f(y1)} L${f(base)},${f(y1)} Z`
  }
  const x0 = at
  const x1 = at + thick
  const ye = end
  const up = -dir
  return `M${f(x0)},${f(base)} L${f(x0)},${f(ye - up * rr)} Q${f(x0)},${f(ye)} ${f(x0 + rr)},${f(ye)} L${f(x1 - rr)},${f(ye)} Q${f(x1)},${f(ye)} ${f(x1)},${f(ye - up * rr)} L${f(x1)},${f(base)} Z`
}

/**
 * Amounts per category — days, habits, weeks. Several series sit side by side,
 * or pile up with `stacked`; `layout="horizontal"` turns it on its side for long
 * labels. Bar ends take the theme's corner radius.
 */
export function BarChart<Row>({
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
  style,
  ...props
}: Omit<ViewProps, "children" | "style"> & {
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
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const radius = Math.min(useControlRadius(), 8)
  const colors = series.map((s, i) => s.color ?? chartColor(i, ui))
  const horizontal = layout === "horizontal"
  const category = (d: Row) => {
    const v = x(d)
    return xFormat ? xFormat(v) : v instanceof Date ? v.toISOString().slice(0, 10) : String(v)
  }
  const grouped = !stacked && series.length > 1
  const cats: AxisSpec = { values: data.map(category), kind: "band", padding: grouped ? 0.2 : 0.32 }
  const totals = data.map((d) => runningTotals(series.map((s) => s.value(d))))
  const vals: AxisSpec = {
    values: stacked ? totals.map((t) => t[t.length - 1] ?? 0) : series.flatMap((s) => data.map(s.value)),
    nice: true,
    zero: true,
    grid,
    format: valueFormat as AxisSpec["format"],
  }
  const content = seriesTooltip(series, x, { xFormat, valueFormat, colors })
  const cat = (f: ChartFrame) => (horizontal ? f.y : f.x)
  const val = (f: ChartFrame) => (horizontal ? f.x : f.y)

  const render = (f: ChartFrame) => {
    const band = cat(f)
    const scale = val(f)
    const zero = scale.map(0)
    return (
      <>
        {f.focused !== null ? (
          horizontal ? (
            <Rect x={f.plot.left} y={band.map(category(data[f.focused]))} width={f.plot.width} height={band.bandwidth} fill={ui.fill} rx={radius} />
          ) : (
            <Rect x={band.map(category(data[f.focused]))} y={f.plot.top} width={band.bandwidth} height={f.plot.height} fill={ui.fill} rx={radius} />
          )
        ) : null}
        {data.map((d, j) => {
          const start = band.map(category(d))
          const bw = band.bandwidth
          // the last series with a value caps the stack: only it gets the rounded end
          const capIndex = stacked ? series.map((s) => s.value(d)).reduce<number>((acc, v, i) => (v ? i : acc), -1) : -1
          return series.map((s, i) => {
            const v = s.value(d)
            if (v == null || !Number.isFinite(v) || v === 0) return null
            let at = start
            let thick = bw
            if (grouped) {
              const slot = bw / series.length
              thick = Math.min(44, slot * (1 - 0.12))
              at = start + slot * i + (slot - thick) / 2
            } else if (bw > 44) {
              thick = 44
              at = start + (bw - 44) / 2
            }
            const lo = stacked ? totals[j][i] - v : 0
            const hi = stacked ? totals[j][i] : v
            return (
              <Path
                key={`${j}-${s.id}`}
                d={barPath(horizontal, at, thick, lo === 0 ? zero : scale.map(lo), scale.map(hi), radius, !stacked || i === capIndex)}
                fill={colors[i]}
                opacity={f.focused === null || f.focused === j ? 1 : 0.55}
              />
            )
          })
        })}
      </>
    )
  }

  return (
    <View style={[{ width: "100%", gap: 12 }, style]} {...props}>
      <ChartContainer
        ariaLabel={ariaLabel}
        height={height}
        x={horizontal ? vals : cats}
        y={horizontal ? cats : vals}
        grow={horizontal ? "x" : "y"}
        render={render}
        hit={(p, f) => {
          const band = cat(f)
          return nearest(
            data.map((d) => band.map(category(d)) + band.bandwidth / 2),
            horizontal ? p.y : p.x
          )
        }}
        tooltip={(i, f) => {
          const row = data[i]
          const band = cat(f)
          const mid = band.map(category(row)) + band.bandwidth / 2
          const peak = stacked ? (totals[i][totals[i].length - 1] ?? 0) : Math.max(0, ...series.map((s) => s.value(row) ?? 0))
          return { content: content(row), anchor: horizontal ? { x: f.x.map(peak), y: mid } : { x: mid, y: f.y.map(peak) } }
        }}
      />
      {legend ? <ChartLegend items={series.map((s, i) => ({ label: s.label, color: colors[i] }))} /> : null}
    </View>
  )
}
