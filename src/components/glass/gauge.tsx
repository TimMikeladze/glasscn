import * as React from "react"
import { cn } from "cn"

import { arcPath, fraction, polarPoint } from "@/lib/glass-charts"

const START = -Math.PI * 0.75
const SWEEP = Math.PI * 1.5

/**
 * A three-quarter meter: a soft track, an accent arc to `value` and an optional
 * `target` tick. Children sit in the bowl — the figure and a label.
 * Server-component safe; the arc draws in once.
 */
function Gauge({
  value,
  min = 0,
  max = 100,
  target,
  size = 160,
  stroke,
  color = "var(--primary)",
  label,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  value: number
  min?: number
  max?: number
  /** A goal marked with a tick on the track. */
  target?: number
  size?: number
  stroke?: number
  color?: string
  /** Accessible name, e.g. "Recovery". */
  label?: string
}) {
  const sw = stroke ?? Math.max(6, size * 0.085)
  const c = size / 2
  const r = c - sw / 2
  const f = fraction(value, min, max)
  const end = START + SWEEP * f
  const track = arcPath(c, c, r, START, START + SWEEP)
  // the drawn arc, measured for the draw-in dash
  const length = r * SWEEP * f
  const tick = target === undefined ? null : START + SWEEP * fraction(target, min, max)
  const height = c + polarPoint(c, c, r, START).y - c + sw / 2
  return (
    <div
      data-slot="gauge"
      role="meter"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("relative inline-flex shrink-0 justify-center", className)}
      style={{ width: size, height }}
      {...props}
    >
      <svg width={size} height={height} viewBox={`0 0 ${size} ${height}`} className="absolute inset-0 overflow-visible" aria-hidden>
        <path d={track} fill="none" stroke={color} strokeOpacity={0.16} strokeWidth={sw} strokeLinecap="round" />
        {f > 0 ? (
          <path
            data-slot="gauge-arc"
            d={arcPath(c, c, r, START, end)}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={`${length} ${length}`}
            data-glass-motion
            style={{ ["--glass-draw-from" as string]: `${length}`, animation: "glass-draw 1s cubic-bezier(0.16,1,0.3,1) both" }}
          />
        ) : null}
        {tick === null ? null : (
          <line
            data-slot="gauge-target"
            x1={polarPoint(c, c, r - sw * 0.75, tick).x}
            y1={polarPoint(c, c, r - sw * 0.75, tick).y}
            x2={polarPoint(c, c, r + sw * 0.75, tick).x}
            y2={polarPoint(c, c, r + sw * 0.75, tick).y}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div data-slot="gauge-content" className="relative flex flex-col items-center justify-center text-center" style={{ paddingTop: size * 0.3 }}>
        {children}
      </div>
    </div>
  )
}

export { Gauge }
