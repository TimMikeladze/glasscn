import * as React from "react"
import { cn } from "cn"

import { drawEase, glassTime, rangeSpan } from "@/lib/glass-charts"

/**
 * Low-to-high capsules on a shared scale, one row each — Weather's ten-day
 * temperatures, Health's daily heart-rate range. The capsule shows its slice of
 * one gradient across the whole domain (cool → warm by default), so where a row
 * sits reads at a glance; `current` puts a dot on a row (now). Pure HTML — works
 * in Server Components, flips in RTL, and is a list screen readers read row by row.
 *
 *   <RangeChart data={days} label={(d) => d.day} low={(d) => d.min} high={(d) => d.max} current={(d) => d.now} valueFormat={(v) => `${v}°`} />
 */
function RangeChart<Row>({
  data,
  label,
  low,
  high,
  current,
  min,
  max,
  valueFormat = (v) => v.toLocaleString(),
  from = "var(--chart-5)",
  to = "var(--chart-1)",
  className,
  ...props
}: Omit<React.ComponentProps<"ul">, "children"> & {
  data: readonly Row[]
  label: (d: Row) => React.ReactNode
  low: (d: Row) => number
  high: (d: Row) => number
  /** A dot on the capsule (e.g. the current temperature); null for none. */
  current?: (d: Row) => number | null | undefined
  /** The shared domain; the data's extent by default. */
  min?: number
  max?: number
  valueFormat?: (value: number) => string
  /** Gradient ends, low → high. Any CSS colour. */
  from?: string
  to?: string
}) {
  const lows = data.map(low)
  const highs = data.map(high)
  const lo = min ?? Math.min(...lows, ...highs)
  const hi = max ?? Math.max(...lows, ...highs)
  return (
    <ul data-slot="range-chart" className={cn("grid gap-[calc(0.5rem*var(--glass-density))] text-sm numeric-glass", className)} {...props}>
      {data.map((d, i) => {
        const l = lows[i]
        const h = highs[i]
        const { start, width } = rangeSpan(l, h, lo, hi)
        const now = current?.(d)
        const dot = now == null || !Number.isFinite(now) ? null : rangeSpan(now, now, lo, hi).start
        // the capsule's window onto one gradient across the whole track
        const size = width > 0 ? (100 / width) * 100 : 100
        const position = width < 100 ? (start / (100 - width)) * 100 : 0
        return (
          <li key={i} data-slot="range-chart-row" className="grid grid-cols-[minmax(3rem,auto)_auto_minmax(0,1fr)_auto] items-center gap-3">
            <span className="truncate font-medium">{label(d)}</span>
            <span className="sr-only">
              {`low ${valueFormat(Math.min(l, h))}, high ${valueFormat(Math.max(l, h))}${dot === null ? "" : `, now ${valueFormat(now as number)}`}`}
            </span>
            <span aria-hidden data-slot="range-chart-low" className="min-w-[3ch] text-end text-muted-foreground">
              {valueFormat(Math.min(l, h))}
            </span>
            <span aria-hidden data-slot="range-chart-track" className="relative h-1.5 rounded-full bg-fill">
              <span
                data-slot="range-chart-range"
                data-glass-motion
                className="absolute inset-y-0 origin-left rounded-full rtl:origin-right"
                style={{
                  insetInlineStart: `${start}%`,
                  width: `max(${width}%, 0.375rem)`,
                  backgroundImage: `linear-gradient(to right, ${from}, ${to})`,
                  backgroundSize: `${size}% 100%`,
                  backgroundPosition: `${position}% 0`,
                  animation: `glass-grow ${glassTime(4)} ${drawEase} ${glassTime(i * 0.15)} both`,
                }}
              />
              {dot === null ? null : (
                <span
                  data-slot="range-chart-current"
                  className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full border-2 border-background bg-foreground ltr:-translate-x-1/2 rtl:translate-x-1/2"
                  style={{ insetInlineStart: `${dot}%` }}
                />
              )}
            </span>
            <span aria-hidden data-slot="range-chart-high" className="min-w-[3ch] font-medium">
              {valueFormat(Math.max(l, h))}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export { RangeChart }
