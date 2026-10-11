"use client"

import * as React from "react"
import { cn } from "cn"
import { defineChart } from "@tanstack/charts"
import { pie, polar, radialArc } from "@tanstack/charts/polar"
import { tooltip } from "@tanstack/charts/tooltip"

import {
  ChartAlternative,
  ChartContainer,
  ChartLegend,
  chartColor,
  useChartAccessors,
  useControlRadius,
  type ChartAccessibility,
  type ChartStateLabels,
  type ChartStateValue,
} from "@/components/glass/chart"
import { CHART_COLORS, foldOther } from "@/lib/glass-charts"

/** A slice as drawn: one of your rows, or the folded "Other". */
interface Slice<Row> {
  index: number
  label: string
  value: number
  row: Row | null
}

/**
 * Parts of a whole — where the week's minutes went. Slices take the palette in
 * order, keyed by position (two rows may share a label); past eight, the smallest
 * fold into one "Other" slice so no colour repeats. Whatever you pass as children
 * sits in the hole (a total); selecting a slice (click, tap or Enter) puts its
 * label and value there instead and dims the rest.
 */
function DonutChart<Row extends object>({
  data,
  label: labelProp,
  value: valueProp,
  ariaLabel,
  height = 220,
  thickness = 0.28,
  valueFormat: valueFormatProp,
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
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onSelect"> & {
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
  /** Exact values for assistive tech: true (sr-only, default), "visible", or false. */
  accessibilityTable?: ChartAccessibility
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const radius = useControlRadius(ref)
  const [uncontrolled, setUncontrolled] = React.useState<number | null>(defaultSelectedIndex)
  const selected = selectedIndex === undefined ? uncontrolled : selectedIndex
  // stable accessors: a label/value accessor per series slot keeps inline functions from rebuilding the ring
  const stable = useChartAccessors<Row>({
    x: labelProp,
    series: [{ id: "value", label: "Value", value: valueProp }],
    valueFormat: valueFormatProp,
  })
  const label = stable.x as (d: Row) => string
  const value = stable.series[0].value as (d: Row) => number
  const valueFormat = stable.valueFormat

  const slices = React.useMemo<Slice<Row>[]>(() => {
    const { keep, other } = foldOther(data.map(value), CHART_COLORS)
    const kept = keep.map((i, n) => ({ index: n, label: label(data[i]), value: value(data[i]), row: data[i] }))
    return other == null ? kept : [...kept, { index: kept.length, label: otherLabel, value: other, row: null }]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, stable.key, otherLabel])
  const total = slices.reduce((sum, s) => sum + (Number.isFinite(s.value) ? s.value : 0), 0)
  const number = React.useMemo(() => new Intl.NumberFormat(locale), [locale])
  const percent = React.useMemo(() => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }), [locale])
  const fmt = React.useCallback((v: number) => (valueFormat ? valueFormat(v) : number.format(v)), [valueFormat, number])

  const definition = React.useMemo(() => {
    // pie() keeps each slice as `source[0]` beside its angles
    const arcs = pie(slices, { value: (s) => s.value, gapAngle: 0.035 })
    return defineChart({
      marks: [
        polar({
          inset: 4,
          marks: [
            radialArc(arcs, {
              innerRadius: ({ radius: r }) => r * (1 - Math.min(Math.max(thickness, 0.05), 1)),
              cornerRadius: Math.min(radius, 6),
              color: (d) => d.source[0].index,
              key: (d) => d.source[0].index,
              ...(selected == null
                ? null
                : { fill: (d: (typeof arcs)[number]) => (d.source[0].index === selected ? chartColor(selected) : `color-mix(in oklch, ${chartColor(d.source[0].index)} 30%, transparent)`) }),
            }),
          ],
          scales: { angle: null, radius: null },
        }),
      ],
      scales: { x: null, y: null },
      color: { domain: slices.map((s) => s.index), range: slices.map((s) => chartColor(s.index)) },
      tooltip: {
        use: tooltip,
        content: (points) => ({
          rows: points.map((p) => ({
            label: p.datum.source[0].label,
            value: `${fmt(p.datum.value)} · ${percent.format(p.datum.fraction)}`,
            color: chartColor(p.datum.source[0].index),
          })),
        }),
      },
    })
  }, [slices, thickness, radius, selected, fmt, percent])

  const select = (index: number | null) => {
    const next = index === selected ? null : index
    if (selectedIndex === undefined) setUncontrolled(next)
    onSelect?.(next == null ? null : (slices[next]?.row ?? null), next)
  }
  const current = selected == null ? null : slices[selected]
  const center = current ? (
    <>
      <span className="type-glass-display type-step-2 numeric-glass">{fmt(current.value)}</span>
      <span className="text-xs text-muted-foreground">
        {current.label} · {percent.format(total ? current.value / total : 0)}
      </span>
    </>
  ) : (
    children
  )

  return (
    <div ref={ref} data-slot="donut-chart" className={cn("grid w-full justify-items-center gap-3", className)} {...props}>
      <ChartContainer
        definition={definition}
        ariaLabel={ariaLabel}
        height={height}
        state={state ?? (data.length ? "ready" : "empty")}
        onRetry={onRetry}
        stateLabels={stateLabels}
        onSelect={(p) => select(p ? (p.datum as { source: readonly Slice<Row>[] }).source[0].index : null)}
      >
        {center ? (
          <div data-slot="donut-chart-center" aria-live="polite" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-foreground">
            {center}
          </div>
        ) : null}
      </ChartContainer>
      {legend ? (
        <ChartLegend
          className="justify-center"
          items={slices.map((s) => ({ label: s.label, color: chartColor(s.index), value: legendValues ? `${fmt(s.value)} · ${percent.format(total ? s.value / total : 0)}` : undefined }))}
        />
      ) : null}
      <ChartAlternative
        mode={accessibilityTable}
        data={slices}
        x={(s) => s.label}
        series={[
          { id: "value", label: "Value", value: (s) => s.value },
          { id: "share", label: "Share", value: (s) => (total ? s.value / total : 0), format: (v) => percent.format(v) },
        ]}
        valueFormat={(v) => fmt(v)}
        label={ariaLabel}
        summary={false}
      />
    </div>
  )
}

export { DonutChart }
