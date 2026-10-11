"use client"

import * as React from "react"
import { cn } from "cn"
import { areaY, defineChart, lineY, ruleX } from "@tanstack/charts"
import { crosshair } from "@tanstack/charts/crosshair"
import { decorative } from "@tanstack/charts/mark/decorative"
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
import { monotoneCurve, sanitizeId, stackEdges, stepCurve } from "@/lib/glass-charts"

type XValue = string | number | Date

/**
 * Volume over an ordered x: each series a soft gradient that fades to the
 * baseline under a line. `stacked` piles the layers into a total — the tooltip
 * still reads each layer's own value from your row, top layer first. `stacked="expand"`
 * shows each layer's share (0–1) of the total. Mixed signs stack apart: positives
 * up from zero, negatives down.
 */
function AreaChart<Row>({
  data,
  x: xProp,
  series: seriesProp,
  ariaLabel,
  height = 240,
  stacked = false,
  valueFormat: valueFormatProp,
  xFormat: xFormatProp,
  legend = seriesProp.length > 1,
  grid = true,
  curve = "smooth",
  axis = "trailing",
  latestPoint = false,
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
  stacked?: boolean | "expand"
  valueFormat?: (value: number) => string
  xFormat?: (value: XValue) => string
  legend?: boolean
  grid?: boolean
  curve?: "smooth" | "linear" | "step"
  /** Which side the value axis sits on. Apple's charts put it trailing. */
  axis?: "leading" | "trailing"
  /** A dot on each series' last value. */
  latestPoint?: boolean
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
  // unique per chart, so two area charts on a page never share gradients
  const uid = sanitizeId(React.useId())
  const definition = React.useMemo(() => {
    const colors = series.map((s, i) => s.color ?? chartColor(i))
    const path = curve === "smooth" ? monotoneCurve : curve === "step" ? stepCurve : undefined
    // the bottom and top of layer i at row d: 0 → value, or the diverging running totals when stacked
    const edges = (d: Row, i: number) => {
      const values = series.map((s) => s.value(d))
      if (stacked === "expand") {
        const total = values.reduce<number>((sum, v) => sum + Math.abs(v ?? 0), 0) || 1
        return stackEdges(values.map((v) => (v == null ? v : Math.abs(v) / total)), i)
      }
      return stackEdges(values, i)
    }
    const bottom = (i: number) => (d: Row) => (stacked ? edges(d, i)[0] : 0)
    const top = (i: number) => (d: Row) => {
      const v = series[i].value(d)
      return v == null ? null : stacked ? edges(d, i)[1] : v
    }
    const lastRow = data[data.length - 1]
    const selected = selectedKey == null ? [] : [selectedIsDate ? new Date(selectedKey) : selectedKey]
    return defineChart({
      marks: [
        ...series.map((s, i) =>
          areaY(data, {
            id: s.id,
            x,
            y1: bottom(i),
            y2: top(i),
            z: () => s.id,
            color: () => s.id,
            fill: `url(#area-${uid}-${i})`,
            fillOpacity: 1,
            curve: path,
          })
        ),
        // the line rides the top edge; the area owns focus so the tooltip reads one point per series
        ...series.map((s, i) => decorative(lineY(data, { id: `${s.id}-line`, x, y: top(i), z: () => s.id, color: () => s.id, strokeWidth: 2, curve: path }))),
        ...(latestPoint && lastRow
          ? series.map((s, i) => decorative(lineY([lastRow], { id: `${s.id}-latest`, x, y: top(i), z: () => s.id, color: () => s.id, points: true, strokeWidth: 0 })))
          : []),
        ...(selected.length ? [ruleX(selected, { id: "selected", stroke: "var(--foreground)", strokeOpacity: 0.4, strokeWidth: 1 })] : []),
        crosshair({ x: true, y: false }),
      ],
      scales: {
        x: { scale: xScaleFor(data.map(x), "point"), axis: categoryAxisStyle(xFormat) },
        y: valueAxis({ grid, valueFormat: stacked === "expand" ? (valueFormat ?? ((v: number) => `${Math.round(v * 100)}%`)) : valueFormat, side }),
      },
      color: { domain: series.map((s) => s.id), range: colors },
      gradients: colors.map((color, i) => ({
        id: `area-${uid}-${i}`,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 1,
        stops: [
          { offset: 0, color, opacity: stacked ? 0.5 : 0.34 },
          { offset: 1, color, opacity: stacked ? 0.12 : 0.02 },
        ],
      })),
      focus: "group-x",
      maxFocusDistance: Number.POSITIVE_INFINITY,
      tooltip: {
        use: tooltip,
        anchor: "group-center",
        sort: stacked ? undefined : "color-domain",
        placement: ["top", "right", "left", "bottom"],
        // a stack reads top-down, as it's drawn
        content: seriesTooltip(series, x, { xFormat, valueFormat, reverse: Boolean(stacked) }),
      },
    })
    // `key` stands for the accessors' structure; they call your latest functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, data, key, stacked, grid, curve, side, latestPoint, selectedKey, selectedIsDate])

  return (
    <div ref={ref} data-slot="area-chart" className={cn("grid w-full gap-3", className)} {...props}>
      <ChartContainer
        definition={definition}
        ariaLabel={ariaLabel}
        height={height}
        idPrefix={`area-chart-${uid}`}
        state={state ?? (data.length ? "ready" : "empty")}
        onRetry={onRetry}
        stateLabels={stateLabels}
        onSelect={onSelect ? (p) => onSelect(p ? (p.datum as Row) : null) : undefined}
        onFocusChange={onScrub ? (p) => onScrub(p ? (p.datum as Row) : null) : undefined}
      />
      {legend ? <ChartLegend items={series.map((s, i) => ({ label: s.label, color: s.color ?? chartColor(i) }))} /> : null}
      <ChartAlternative mode={accessibilityTable} data={data} x={x} series={series} xFormat={xFormat} valueFormat={valueFormat} label={ariaLabel} />
    </div>
  )
}

export { AreaChart }
