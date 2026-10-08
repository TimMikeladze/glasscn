"use client"

import * as React from "react"
import { cn } from "cn"
import { defineChart } from "@tanstack/charts"
import { pie, polar, radialArc } from "@tanstack/charts/polar"
import { tooltip } from "@tanstack/charts/tooltip"

import { ChartContainer, ChartLegend, chartColor, useControlRadius } from "@/components/glass/chart"

/**
 * Parts of a whole — where the week's minutes went. Slices take the palette
 * in order; whatever you pass as children sits in the hole (a total, a label).
 */
function DonutChart<Row extends object>({
  data,
  label,
  value,
  ariaLabel,
  height = 220,
  thickness = 0.28,
  valueFormat,
  legend = true,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  data: readonly Row[]
  label: (d: Row) => string
  value: (d: Row) => number
  ariaLabel: string
  height?: number
  /** Ring width as a share of the radius, 0–1. */
  thickness?: number
  valueFormat?: (value: number) => string
  legend?: boolean
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const radius = useControlRadius(ref)

  const definition = React.useMemo(() => {
    const labels = data.map(label)
    const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 })
    // pie() keeps each row as `source[0]` beside its angles
    const slices = pie(data, { value, gapAngle: 0.035 })
    return defineChart({
      marks: [
        polar({
          inset: 4,
          marks: [
            radialArc(slices, {
              innerRadius: ({ radius: r }) => r * (1 - Math.min(Math.max(thickness, 0.05), 1)),
              cornerRadius: Math.min(radius, 6),
              color: (d) => label(d.source[0]),
              key: (d) => label(d.source[0]),
            }),
          ],
          scales: { angle: null, radius: null },
        }),
      ],
      scales: { x: null, y: null },
      color: { domain: labels, range: labels.map((_, i) => chartColor(i)) },
      tooltip: {
        use: tooltip,
        content: (points) => ({
          rows: points.map((p) => ({
            label: label(p.datum.source[0]),
            value: `${valueFormat ? valueFormat(p.datum.value) : p.datum.value.toLocaleString("en-US")} · ${percent.format(p.datum.fraction)}`,
            color: p.color,
          })),
        }),
      },
    })
  }, [data, label, value, thickness, valueFormat, radius])

  return (
    <div ref={ref} data-slot="donut-chart" className={cn("grid w-full justify-items-center gap-3", className)} {...props}>
      <ChartContainer definition={definition} ariaLabel={ariaLabel} height={height}>
        {children ? (
          <div data-slot="donut-chart-center" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-foreground">
            {children}
          </div>
        ) : null}
      </ChartContainer>
      {legend ? <ChartLegend className="justify-center" items={data.map((d, i) => ({ label: label(d), color: chartColor(i) }))} /> : null}
    </div>
  )
}

export { DonutChart }
