import * as React from "react"
import { cn } from "cn"

import { fraction, segmentAt, segments } from "@/lib/glass-charts"

const DEFAULT_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

/**
 * A range split into bands — a score scale, a budget — with an optional marker
 * at `marker`. `values` are band sizes in order; the marker sits on the same
 * scale (their running total), so `[50, 20, 30]` with `marker={62}` lands in the
 * second band.
 */
function CategoryBar({
  values,
  marker,
  colors = DEFAULT_COLORS,
  labels = true,
  markerLabel,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  values: number[]
  marker?: number
  /** One CSS colour per band; cycles. */
  colors?: string[]
  /** Show the band edges under the bar. */
  labels?: boolean
  /** Accessible text for the marker, e.g. "Score 62". */
  markerLabel?: string
}) {
  const segs = segments(values)
  const total = values.reduce((a, v) => a + (Number.isFinite(v) && v > 0 ? v : 0), 0)
  const at = marker === undefined ? null : fraction(marker, 0, total) * 100
  const active = at === null ? -1 : segmentAt(segs, at)
  const edges = values.reduce<number[]>((acc, v) => [...acc, (acc.at(-1) ?? 0) + (Number.isFinite(v) && v > 0 ? v : 0)], [])
  return (
    <div data-slot="category-bar" className={cn("grid gap-1.5", className)} {...props}>
      <div className="relative">
        {at === null ? null : (
          <div
            data-slot="category-bar-marker"
            role="img"
            aria-label={markerLabel ?? `${marker}`}
            className="absolute -top-1 -bottom-1 z-10 w-1 -translate-x-1/2 rounded-full bg-foreground ring-2 ring-background transition-[inset-inline-start] duration-(--glass-duration) ease-glass rtl:translate-x-1/2"
            style={{ insetInlineStart: `${at}%` }}
          />
        )}
        <div className="flex h-2 w-full gap-[calc(0.125rem*var(--glass-density))]">
          {segs.map((s, i) => (
            <div
              key={i}
              data-slot="category-bar-segment"
              data-active={i === active || undefined}
              className="h-full transition-opacity duration-(--glass-duration) ease-glass first:rounded-s-badge last:rounded-e-badge"
              style={{ width: `${s.width}%`, background: colors[i % colors.length], opacity: active === -1 || i === active ? 1 : 0.4 }}
            />
          ))}
        </div>
      </div>
      {labels ? (
        <div className="relative h-4 text-xs text-muted-foreground numeric-glass" aria-hidden>
          <span className="absolute start-0">0</span>
          {values.map((_, i) => {
            const left = segs[i].start + segs[i].width
            const last = i === values.length - 1
            // drop an inner edge that would collide with its neighbour or the end label
            if (!last && (left - (segs[i - 1] ? segs[i - 1].start + segs[i - 1].width : 0) < 8 || 100 - left < 8)) return null
            return (
              <span key={i} className={cn("absolute", last ? "end-0" : "-translate-x-1/2 rtl:translate-x-1/2")} style={last ? undefined : { insetInlineStart: `${left}%` }}>
                {edges[i]}
              </span>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export { CategoryBar }
