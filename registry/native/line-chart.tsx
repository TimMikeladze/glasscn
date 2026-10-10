import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Circle, Line, Path } from "react-native-svg"

import { ChartContainer, ChartLegend, chartColor, nearest, seriesTooltip, xScaleFor, type AxisSpec, type ChartFrame, type ChartSeries } from "@/components/glass/native/chart"
import { monotoneCurve } from "@/components/glass/native/chart-math"
import { useUI } from "@/components/glass/native/ui"

type XValue = string | number | Date

/** Runs of consecutive present points — a null value breaks the line. */
function runs(points: readonly ([number, number] | null)[]): [number, number][][] {
  const out: [number, number][][] = []
  let run: [number, number][] = []
  for (const p of points) {
    if (p) run.push(p)
    else if (run.length) {
      out.push(run)
      run = []
    }
  }
  if (run.length) out.push(run)
  return out
}

/** A straight polyline through `pts`. */
const linearPath = (pts: readonly (readonly [number, number])[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ")

/**
 * Measures over an ordered x — days, weeks, sessions. One line per series over
 * your rows, unmodified; pressing (or hovering on web) shows every series at
 * that x in a glass tooltip. Nulls are gaps.
 */
export function LineChart<Row>({
  data,
  x,
  series,
  ariaLabel,
  height = 240,
  valueFormat,
  xFormat,
  legend = series.length > 1,
  grid = true,
  points = false,
  curve = "smooth",
  style,
  ...props
}: Omit<ViewProps, "children" | "style"> & {
  data: readonly Row[]
  x: (d: Row) => XValue
  series: readonly ChartSeries<Row>[]
  ariaLabel: string
  height?: number
  valueFormat?: (value: number) => string
  xFormat?: (value: XValue) => string
  legend?: boolean
  grid?: boolean
  points?: boolean
  curve?: "smooth" | "linear"
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const colors = series.map((s, i) => s.color ?? chartColor(i, ui))
  const xs = data.map(x)
  const xSpec: AxisSpec = { values: xs, kind: xScaleFor(xs, "point"), format: xFormat as AxisSpec["format"] }
  const ySpec: AxisSpec = { values: series.flatMap((s) => data.map(s.value)), nice: true, grid, format: valueFormat as AxisSpec["format"] }
  const content = seriesTooltip(series, x, { xFormat, valueFormat, colors })
  const path = curve === "smooth" ? monotoneCurve.line : linearPath

  const render = (f: ChartFrame) => {
    const px = (d: Row) => f.x.map(x(d))
    const at = f.focused === null ? null : data[f.focused]
    return (
      <>
        {at ? <Line x1={px(at)} x2={px(at)} y1={f.plot.top} y2={f.plot.bottom} stroke={ui.mutedForeground} strokeOpacity={0.5} strokeWidth={1} /> : null}
        {series.map((s, i) => {
          const pts = data.map((d) => {
            const v = s.value(d)
            return v == null ? null : ([px(d), f.y.map(v)] as [number, number])
          })
          return (
            <React.Fragment key={s.id}>
              {runs(pts).map((run, r) =>
                run.length > 1 ? <Path key={r} d={path(run)} fill="none" stroke={colors[i]} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" /> : null
              )}
              {pts.map((p, j) =>
                p && (points || j === f.focused || runs(pts).some((run) => run.length === 1 && run[0] === p)) ? (
                  <Circle key={j} cx={p[0]} cy={p[1]} r={j === f.focused ? 4.5 : 3} fill={colors[i]} stroke={ui.auroraBase} strokeWidth={1.5} />
                ) : null
              )}
            </React.Fragment>
          )
        })}
      </>
    )
  }

  return (
    <View style={[{ width: "100%", gap: 12 }, style]} {...props}>
      <ChartContainer
        ariaLabel={ariaLabel}
        height={height}
        x={xSpec}
        y={ySpec}
        render={render}
        hit={(p, f) => nearest(data.map((d) => f.x.map(x(d))), p.x)}
        tooltip={(i, f) => {
          const row = data[i]
          const ys = series.map((s) => s.value(row)).filter((v): v is number => v != null)
          return { content: content(row), anchor: { x: f.x.map(x(row)), y: ys.length ? Math.min(...ys.map((v) => f.y.map(v))) : f.plot.top } }
        }}
      />
      {legend ? <ChartLegend items={series.map((s, i) => ({ label: s.label, color: colors[i] }))} /> : null}
    </View>
  )
}
