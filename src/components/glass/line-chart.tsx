"use client"

import * as React from "react"
import { cn } from "cn"
import { defineChart, lineY, ruleX } from "@tanstack/charts"
import { crosshair } from "@tanstack/charts/crosshair"
import { tooltip } from "@tanstack/charts/tooltip"

import {
  ChartAlternative,
  ChartContainer,
  ChartLegend,
  categoryAxisStyle,
  chartColor,
  seriesTooltip,
  useAxisSide,
  useChartAccessors,
  valueAxis,
  xScaleFor,
  type ChartAccessibility,
  type ChartSeries,
  type ChartStateLabels,
  type ChartStateValue,
} from "@/components/glass/chart"
import { monotoneCurve, stepCurve } from "@/lib/glass-charts"

type XValue = string | number | Date

/**
 * Measures over an ordered x — days, weeks, sessions. One line per series over
 * your rows, unmodified; hovering (or press-and-drag on touch, arrow keys on
 * the keyboard) scrubs every series at that x in a glass tooltip. Nulls are gaps.
 */
function LineChart<Row>({
  data,
  x: xProp,
  series: seriesProp,
  ariaLabel,
  height = 240,
  valueFormat: valueFormatProp,
  xFormat: xFormatProp,
  legend = seriesProp.length > 1,
  grid = true,
  points = false,
  curve = "smooth",
  axis = "trailing",
  selectedX,
  onSelect,
  onScrub,
  state,
  onRetry,
  stateLabels,
  accessibilityTable = true,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children" | "onSelect"> & {
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
  /** Which side the value axis sits on. Apple's charts put it trailing. */
  axis?: "leading" | "trailing"
  /** Marks this x with a rule — controlled selection. */
  selectedX?: XValue | null
  /** A click, tap or Enter on a point selects its row; null clears. */
  onSelect?: (row: Row | null) => void
  /** The row under the pointer or keyboard focus while scrubbing; null when it leaves. */
  onScrub?: (row: Row | null) => void
  state?: ChartStateValue
  onRetry?: () => void
  stateLabels?: ChartStateLabels
  /** Exact values for assistive tech: true (sr-only, default), "visible", or false. */
  accessibilityTable?: ChartAccessibility
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const side = useAxisSide(ref, axis)
  const { x, series, valueFormat, xFormat, key } = useChartAccessors({ x: xProp, series: seriesProp, valueFormat: valueFormatProp, xFormat: xFormatProp })
  const selectedKey = selectedX == null ? null : selectedX instanceof Date ? selectedX.getTime() : selectedX
  const selectedIsDate = selectedX instanceof Date
  const definition = React.useMemo(() => {
    const path = curve === "smooth" ? monotoneCurve : curve === "step" ? stepCurve : undefined
    const selected = selectedKey == null ? [] : [selectedIsDate ? new Date(selectedKey) : selectedKey]
    return defineChart({
      marks: [
        ...series.map((s) =>
          lineY(data, {
            id: s.id,
            x,
            y: s.value,
            z: () => s.id,
            color: () => s.id,
            points,
            strokeWidth: 2.25,
            curve: path,
          })
        ),
        ...(selected.length ? [ruleX(selected, { id: "selected", stroke: "var(--foreground)", strokeOpacity: 0.4, strokeWidth: 1 })] : []),
        crosshair({ x: true, y: false }),
      ],
      scales: {
        x: { scale: xScaleFor(data.map(x), "point"), axis: categoryAxisStyle(xFormat) },
        y: valueAxis({ grid, valueFormat, side }),
      },
      color: { domain: series.map((s) => s.id), range: series.map((s, i) => s.color ?? chartColor(i)) },
      focus: "group-x",
      maxFocusDistance: Number.POSITIVE_INFINITY,
      tooltip: {
        use: tooltip,
        anchor: "group-center",
        sort: "color-domain",
        placement: ["top", "right", "left", "bottom"],
        content: seriesTooltip(series, x, { xFormat, valueFormat }),
      },
    })
    // `key` stands for the accessors' structure; they call your latest functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, key, grid, points, curve, side, selectedKey, selectedIsDate])

  return (
    <div ref={ref} data-slot="line-chart" className={cn("grid w-full gap-3", className)} {...props}>
      <ChartContainer
        definition={definition}
        ariaLabel={ariaLabel}
        height={height}
        state={state ?? (data.length ? "ready" : "empty")}
        onRetry={onRetry}
        stateLabels={stateLabels}
        onSelect={onSelect ? (p) => onSelect(p ? (p.datum as Row) : null) : undefined}
        onFocusChange={onScrub ? (p) => onScrub(p ? (p.datum as Row) : null) : undefined}
      />
      {legend ? <ChartLegend shape="line" items={series.map((s, i) => ({ label: s.label, color: s.color ?? chartColor(i) }))} /> : null}
      <ChartAlternative mode={accessibilityTable} data={data} x={x} series={series} xFormat={xFormat} valueFormat={valueFormat} label={ariaLabel} />
    </div>
  )
}

export { LineChart }
