import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Path } from "react-native-svg"

import { ChartContainer, ChartDataTable, ChartLegend, chartColor, type ChartAccessibility, type ChartFrame, type ChartStateLabels, type ChartStateValue } from "@/components/glass/native/chart"
import { CHART_COLORS, foldOther, polarPoint } from "@/components/glass/native/chart-math"
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

/** A slice as drawn: one of your rows, or the folded "Other". */
type Slice<Row> = { row: Row | null; label: string; value: number; start: number; end: number; fraction: number }

/**
 * Parts of a whole — where the week's minutes went. Slices take the palette in
 * order; past eight, the smallest fold into one "Other" slice so no colour
 * repeats. Whatever you pass as children sits in the hole (a total, a label).
 * Tap a slice to select it; a screen reader steps through the slices.
 */
export function DonutChart<Row extends object>({
  data,
  label,
  value,
  ariaLabel,
  height = 220,
  thickness = 0.28,
  valueFormat,
  locale,
  otherLabel = "Other",
  legend = true,
  legendValues = false,
  selectedIndex,
  defaultSelectedIndex = null,
  onSelect,
  state,
  onRetry,
  stateLabels,
  accessibilityTable = true,
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
  /** BCP 47 locale for numbers and percentages; the runtime's by default. */
  locale?: string
  otherLabel?: string
  legend?: boolean
  /** Legend rows show each slice's value and share. */
  legendValues?: boolean
  /** The selected slice (index into the drawn slices) — controlled. */
  selectedIndex?: number | null
  defaultSelectedIndex?: number | null
  /** Called with the slice's row (null for "Other" or a clear) and its index. */
  onSelect?: (row: Row | null, index: number | null) => void
  state?: ChartStateValue
  onRetry?: () => void
  stateLabels?: ChartStateLabels
  /** Exact values for assistive tech: true ("View as table" action, default), "visible", or false. */
  accessibilityTable?: ChartAccessibility
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const [inner, setInner] = React.useState<number | null>(defaultSelectedIndex)
  const selected = selectedIndex !== undefined ? selectedIndex : inner
  const fmt = valueFormat ?? ((v: number) => v.toLocaleString(locale))
  const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 })

  const raw = data.map((d) => Math.max(0, value(d) || 0))
  const { keep, other } = foldOther(raw, CHART_COLORS)
  const parts = [...keep.map((i) => ({ row: data[i] as Row | null, label: label(data[i]), value: raw[i] })), ...(other !== null ? [{ row: null, label: otherLabel, value: other }] : [])]
  const total = parts.reduce((a, p) => a + p.value, 0)
  const present = parts.filter((p) => p.value > 0).length
  const gap = present > 1 ? GAP : 0
  const sweep = Math.PI * 2 - gap * present
  const slices = parts.reduce<Slice<Row>[]>((acc, p, i) => {
    const start = acc.length ? acc[i - 1].end + (acc[i - 1].value > 0 ? gap : 0) : 0
    const a = total > 0 ? (p.value / total) * sweep : 0
    return [...acc, { ...p, start, end: start + a, fraction: total > 0 ? p.value / total : 0 }]
  }, [])
  const geometry = (f: ChartFrame) => {
    const outer = Math.max(1, Math.min(f.width, f.height) / 2 - INSET)
    return { cx: f.width / 2, cy: f.height / 2, outer, inner: outer * (1 - Math.min(Math.max(thickness, 0.05), 1)) }
  }
  const select = (i: number | null) => {
    const next = i === null || i === selected ? null : i
    if (selectedIndex === undefined) setInner(next)
    onSelect?.(next === null ? null : slices[next].row, next)
  }

  const render = (f: ChartFrame) => {
    const g = geometry(f)
    return slices.map((s, i) =>
      s.end > s.start ? (
        <Path
          key={`${s.label}-${i}`}
          d={slicePath(g.cx, g.cy, g.inner, selected === i ? g.outer + 3 : g.outer, s.start, Math.min(s.end, s.start + Math.PI * 2 - 1e-4))}
          fill={chartColor(i, ui)}
          opacity={selected === null || selected === i ? 1 : 0.55}
        />
      ) : null
    )
  }
  const tableRows = slices.map((s) => ({ label: s.label, value: s.value, share: s.fraction }))

  return (
    <ChartContainer
      ariaLabel={ariaLabel}
      height={height}
      grow="sweep"
      render={render}
      highlight="none"
      targets={(f) => ({ kind: "angle", ...geometry(f), start: slices.map((s) => s.start), end: slices.map((s) => s.end) })}
      tooltip={(i, f) => {
        const g = geometry(f)
        const s = slices[i]
        return {
          content: { rows: [{ label: s.label, value: `${fmt(s.value)} · ${percent.format(s.fraction)}`, color: chartColor(i, ui) }] },
          anchor: polarPoint(g.cx, g.cy, g.outer, (s.start + s.end) / 2),
        }
      }}
      onSelect={select}
      state={state}
      onRetry={onRetry}
      stateLabels={stateLabels}
      accessibilityTable={accessibilityTable}
      table={
        accessibilityTable ? (
          <ChartDataTable
            data={tableRows}
            x={(r) => r.label}
            series={[
              { id: "value", label: "Value", value: (r) => r.value, format: fmt },
              { id: "share", label: "Share", value: (r) => r.share, format: (v) => percent.format(v) },
            ]}
            caption={ariaLabel}
          />
        ) : undefined
      }
      legend={
        legend ? (
          legendValues ? (
            <View accessibilityRole="list" style={{ gap: 6, alignSelf: "stretch" }}>
              {slices.map((s, i) => (
                <View key={`${s.label}-${i}`} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: chartColor(i, ui) }} />
                  <GText size="sm" style={{ flex: 1 }}>
                    {s.label}
                  </GText>
                  <GText size="sm" weight="600" style={{ fontVariant: ["tabular-nums"] }}>
                    {fmt(s.value)}
                  </GText>
                  <GText size="sm" tone="muted" style={{ minWidth: 40, textAlign: "right", fontVariant: ["tabular-nums"] }}>
                    {percent.format(s.fraction)}
                  </GText>
                </View>
              ))}
            </View>
          ) : (
            <ChartLegend style={{ justifyContent: "center" }} items={slices.map((s, i) => ({ label: s.label, color: chartColor(i, ui) }))} />
          )
        ) : null
      }
      style={[{ alignItems: "center" }, style]}
      {...props}
    >
      {children ? (
        <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
          {typeof children === "string" || typeof children === "number" ? (
            <GText font="display" size="2xl">
              {children}
            </GText>
          ) : (
            children
          )}
        </View>
      ) : null}
    </ChartContainer>
  )
}
