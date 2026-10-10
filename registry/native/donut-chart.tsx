import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Path } from "react-native-svg"

import { ChartContainer, ChartLegend, chartColor, type ChartFrame } from "@/components/glass/native/chart"
import { polarPoint } from "@/components/glass/native/chart-math"
import { GText, useUI } from "@/components/glass/native/ui"

const GAP = 0.035
const INSET = 4

/** An annular sector from `a0` to `a1` (radians, 0 = 12 o'clock, clockwise). */
function slicePath(cx: number, cy: number, inner: number, outer: number, a0: number, a1: number) {
  const f = (n: number) => n.toFixed(2)
  const large = a1 - a0 > Math.PI ? 1 : 0
  const o0 = polarPoint(cx, cy, outer, a0)
  const o1 = polarPoint(cx, cy, outer, a1)
  const i1 = polarPoint(cx, cy, inner, a1)
  const i0 = polarPoint(cx, cy, inner, a0)
  return `M${f(o0.x)},${f(o0.y)} A${f(outer)},${f(outer)} 0 ${large} 1 ${f(o1.x)},${f(o1.y)} L${f(i1.x)},${f(i1.y)} A${f(inner)},${f(inner)} 0 ${large} 0 ${f(i0.x)},${f(i0.y)} Z`
}

/**
 * Parts of a whole — where the week's minutes went. Slices take the palette
 * in order; whatever you pass as children sits in the hole (a total, a label).
 */
export function DonutChart<Row extends object>({
  data,
  label,
  value,
  ariaLabel,
  height = 220,
  thickness = 0.28,
  valueFormat,
  legend = true,
  children,
  style,
  ...props
}: Omit<ViewProps, "style"> & {
  data: readonly Row[]
  label: (d: Row) => string
  value: (d: Row) => number
  ariaLabel: string
  height?: number
  /** Ring width as a share of the radius, 0–1. */
  thickness?: number
  valueFormat?: (value: number) => string
  legend?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const values = data.map((d) => Math.max(0, value(d) || 0))
  const total = values.reduce((a, b) => a + b, 0)
  const present = values.filter((v) => v > 0).length
  const gap = present > 1 ? GAP : 0
  const sweep = Math.PI * 2 - gap * present
  const slices = values.reduce<{ start: number; end: number; fraction: number }[]>((acc, v) => {
    const start = acc.length ? acc[acc.length - 1].end + (values[acc.length - 1] > 0 ? gap : 0) : 0
    const a = total > 0 ? (v / total) * sweep : 0
    return [...acc, { start, end: start + a, fraction: total > 0 ? v / total : 0 }]
  }, [])
  const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 })
  const geometry = (f: ChartFrame) => {
    const outer = Math.max(1, Math.min(f.width, f.height) / 2 - INSET)
    return { cx: f.width / 2, cy: f.height / 2, outer, inner: outer * (1 - Math.min(Math.max(thickness, 0.05), 1)) }
  }

  const render = (f: ChartFrame) => {
    const g = geometry(f)
    return slices.map((s, i) =>
      s.end > s.start ? (
        <Path
          key={label(data[i])}
          d={slicePath(g.cx, g.cy, g.inner, f.focused === i ? g.outer + 3 : g.outer, s.start, Math.min(s.end, s.start + Math.PI * 2 - 1e-4))}
          fill={chartColor(i, ui)}
          opacity={f.focused === null || f.focused === i ? 1 : 0.6}
        />
      ) : null
    )
  }

  return (
    <View style={[{ width: "100%", alignItems: "center", gap: 12 }, style]} {...props}>
      <ChartContainer
        ariaLabel={ariaLabel}
        height={height}
        grow="sweep"
        render={render}
        hit={(p, f) => {
          const g = geometry(f)
          const dx = p.x - g.cx
          const dy = p.y - g.cy
          const r = Math.hypot(dx, dy)
          if (r < g.inner - 4 || r > g.outer + 6) return null
          const a = (Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2)
          const i = slices.findIndex((s) => a >= s.start && a <= s.end + gap)
          return i < 0 ? null : i
        }}
        tooltip={(i, f) => {
          const g = geometry(f)
          const s = slices[i]
          const v = values[i]
          return {
            content: { rows: [{ label: label(data[i]), value: `${valueFormat ? valueFormat(v) : v.toLocaleString("en-US")} · ${percent.format(s.fraction)}`, color: chartColor(i, ui) }] },
            anchor: polarPoint(g.cx, g.cy, g.outer, (s.start + s.end) / 2),
          }
        }}
      >
        {children ? (
          <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
            {typeof children === "string" || typeof children === "number" ? <GText font="display" size="2xl">{children}</GText> : children}
          </View>
        ) : null}
      </ChartContainer>
      {legend ? <ChartLegend style={{ justifyContent: "center" }} items={data.map((d, i) => ({ label: label(d), color: chartColor(i, ui) }))} /> : null}
    </View>
  )
}
