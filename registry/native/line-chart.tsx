import * as React from "react"
import { type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Circle, Path } from "react-native-svg"

import { ChartContainer, ChartLegend, chartColor, presetContainerProps, seriesTooltip, xScaleFor, type AxisSpec, type ChartFrame, type ChartPresetProps, type ChartSeries } from "@/components/glass/native/chart"
import { monotoneCurve, stepCurve } from "@/components/glass/native/chart-math"
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
 * your rows, unmodified; dragging across (or hovering) shows every series at
 * that x in a glass tooltip, and a screen reader steps through the rows. Nulls
 * are gaps.
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
    valueFormat?: (value: number) => string
    xFormat?: (value: XValue) => string
    legend?: boolean
    grid?: boolean
    points?: boolean
    curve?: "smooth" | "linear" | "step"
    style?: StyleProp<ViewStyle>
  }) {
  const ui = useUI()
  const colors = series.map((s, i) => s.color ?? chartColor(i, ui))
  const xs = data.map(x)
  const xSpec: AxisSpec = { values: xs, kind: xScaleFor(xs, "point"), format: xFormat as AxisSpec["format"] }
  const ySpec: AxisSpec = { values: series.flatMap((s) => data.map(s.value)), nice: true, grid, format: valueFormat as AxisSpec["format"] }
  const content = seriesTooltip(series, x, { xFormat, valueFormat, colors })
  const path = curve === "smooth" ? monotoneCurve.line : curve === "step" ? stepCurve.line : linearPath

  const render = (f: ChartFrame) => {
    const px = (d: Row) => f.x.map(x(d))
    return series.map((s, i) => {
      const pts = data.map((d) => {
        const v = s.value(d)
        return v == null ? null : ([px(d), f.y.map(v)] as [number, number])
      })
      const segs = runs(pts)
      return (
        <React.Fragment key={s.id}>
          {segs.map((run, r) => (run.length > 1 ? <Path key={r} d={path(run)} fill="none" stroke={colors[i]} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" /> : null))}
          {pts.map((p, j) =>
            p && (points || segs.some((run) => run.length === 1 && run[0] === p)) ? <Circle key={j} cx={p[0]} cy={p[1]} r={3} fill={colors[i]} stroke={ui.auroraBase} strokeWidth={1.5} /> : null
          )}
        </React.Fragment>
      )
    })
  }

  return (
    <ChartContainer
      ariaLabel={ariaLabel}
      height={height}
      x={xSpec}
      y={ySpec}
      render={render}
      targets={(f) => ({ kind: "x", at: data.map((d) => f.x.map(x(d))) })}
      dots={(f) => series.map((s, i) => ({ color: colors[i], y: data.map((d) => (s.value(d) == null ? null : f.y.map(s.value(d)))) }))}
      tooltip={(i, f) => {
        const row = data[i]
        const ys = series.map((s) => s.value(row)).filter((v): v is number => v != null)
        return { content: content(row), anchor: { x: f.x.map(x(row)), y: ys.length ? Math.min(...ys.map((v) => f.y.map(v))) : f.plot.top } }
      }}
      {...presetContainerProps(data, x, series, { selectedX, onSelect, onScrub, state, onRetry, stateLabels, accessibilityTable, axis, ariaLabel, valueFormat, xFormat })}
      legend={legend ? <ChartLegend items={series.map((s, i) => ({ label: s.label, color: colors[i] }))} /> : null}
      style={style}
      {...props}
    />
  )
}
