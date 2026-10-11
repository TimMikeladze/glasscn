import * as React from "react"
import { type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Defs, LinearGradient, Path, Stop } from "react-native-svg"

import { ChartContainer, ChartLegend, chartColor, presetContainerProps, seriesTooltip, xScaleFor, type AxisSpec, type ChartFrame, type ChartPresetProps, type ChartSeries } from "@/components/glass/native/chart"
import { monotoneCurve, runningTotals, sanitizeId, stepCurve } from "@/components/glass/native/chart-math"
import { useUI } from "@/components/glass/native/ui"

type XValue = string | number | Date
type Pt = [number, number]

const linear = {
  line: (pts: readonly (readonly [number, number])[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" "),
  area: (top: readonly (readonly [number, number])[], bottom: readonly (readonly [number, number])[]) =>
    `${linear.line(top)} ${[...bottom]
      .reverse()
      .map(([x, y]) => `L${x.toFixed(2)},${y.toFixed(2)}`)
      .join(" ")} Z`,
}

/**
 * Volume over an ordered x: each series a soft gradient that fades to the
 * baseline under a line. `stacked` piles the layers into a total — the tooltip
 * still reads each layer's own value from your row.
 */
export function AreaChart<Row>({
  data,
  x,
  series,
  ariaLabel,
  height = 240,
  stacked = false,
  valueFormat,
  xFormat,
  legend = series.length > 1,
  grid = true,
  curve = "smooth",
  selectedX,
  onSelect,
  onScrub,
  state,
  onRetry,
  stateLabels,
  accessibilityTable,
  axis,
  style,
  ...props
}: Omit<ViewProps, "children" | "style"> &
  ChartPresetProps<Row> & {
  data: readonly Row[]
  x: (d: Row) => XValue
  series: readonly ChartSeries<Row>[]
  ariaLabel: string
  height?: number
  stacked?: boolean
  valueFormat?: (value: number) => string
  xFormat?: (value: XValue) => string
  legend?: boolean
  grid?: boolean
  curve?: "smooth" | "linear" | "step"
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const id = sanitizeId(React.useId())
  const colors = series.map((s, i) => s.color ?? chartColor(i, ui))
  const path = curve === "smooth" ? monotoneCurve : curve === "step" ? stepCurve : linear
  // the bottom and top of layer i at row d: 0 → value, or the running totals when stacked
  const bottom = (i: number, d: Row) => (stacked && i > 0 ? runningTotals(series.slice(0, i).map((s) => s.value(d)))[i - 1] : 0)
  const top = (i: number, d: Row) => {
    const v = series[i].value(d)
    return v == null ? null : stacked ? runningTotals(series.slice(0, i + 1).map((s) => s.value(d)))[i] : v
  }
  const xs = data.map(x)
  const xSpec: AxisSpec = { values: xs, kind: xScaleFor(xs, "point"), format: xFormat as AxisSpec["format"] }
  const ySpec: AxisSpec = { values: series.flatMap((_, i) => data.map((d) => top(i, d))), nice: true, zero: true, grid, format: valueFormat as AxisSpec["format"] }
  const content = seriesTooltip(series, x, { xFormat, valueFormat, colors })

  const render = (f: ChartFrame) => {
    const px = (d: Row) => f.x.map(x(d))
    return (
      <>
        <Defs>
          {colors.map((c, i) => (
            <LinearGradient key={i} id={`area-${id}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={c} stopOpacity={stacked ? 0.5 : 0.34} />
              <Stop offset="1" stopColor={c} stopOpacity={stacked ? 0.12 : 0.02} />
            </LinearGradient>
          ))}
        </Defs>
        {series.map((s, i) => {
          // split into runs where the layer has a value
          const layers: { top: Pt[]; bottom: Pt[] }[] = []
          let cur: { top: Pt[]; bottom: Pt[] } | null = null
          for (const d of data) {
            const t = top(i, d)
            if (t == null) {
              cur = null
              continue
            }
            if (!cur) layers.push((cur = { top: [], bottom: [] }))
            cur.top.push([px(d), f.y.map(t)])
            cur.bottom.push([px(d), f.y.map(bottom(i, d))])
          }
          return (
            <React.Fragment key={s.id}>
              {layers.map((l, r) =>
                l.top.length > 1 ? (
                  <React.Fragment key={r}>
                    <Path d={path.area(l.top, l.bottom)} fill={`url(#area-${id}-${i})`} />
                    <Path d={path.line(l.top)} fill="none" stroke={colors[i]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </React.Fragment>
                ) : null
              )}
            </React.Fragment>
          )
        })}
      </>
    )
  }

  return (
    <ChartContainer
      ariaLabel={ariaLabel}
      height={height}
      x={xSpec}
      y={ySpec}
      render={render}
      targets={(f) => ({ kind: "x", at: data.map((d) => f.x.map(x(d))) })}
      dots={(f) => series.map((_, i) => ({ color: colors[i], y: data.map((d) => top(i, d)).map((t) => (t == null ? null : f.y.map(t))) }))}
      tooltip={(i, f) => {
        const row = data[i]
        const tops = series.map((_, s) => top(s, row)).filter((v): v is number => v != null)
        return { content: content(row), anchor: { x: f.x.map(x(row)), y: tops.length ? Math.min(...tops.map((v) => f.y.map(v))) : f.plot.top } }
      }}
      {...presetContainerProps(data, x, series, { selectedX, onSelect, onScrub, state, onRetry, stateLabels, accessibilityTable, axis, ariaLabel, valueFormat, xFormat })}
      legend={legend ? <ChartLegend items={series.map((s, i) => ({ label: s.label, color: colors[i] }))} /> : null}
      style={style}
      {...props}
    />
  )
}
