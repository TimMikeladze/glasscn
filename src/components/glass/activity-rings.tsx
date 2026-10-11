import * as React from "react"
import { cn } from "cn"

import { arcPath, drawEase, glassTime, polarPoint, ringLaps, ringRadii, sanitizeId } from "@/lib/glass-charts"

export interface ActivityRing {
  /** Progress, 1 = one lap. Past 1 the ring keeps winding — any number of laps. */
  value: number
  /** Any CSS colour. Defaults to `--chart-1`, `--chart-2`, `--chart-3` in order. */
  color?: string
  label?: string
  /** A glyph at the ring's start (twelve o'clock), sized to the stroke — an arrow, a flame. */
  icon?: React.ReactNode
}

/** Segments per lap for the angular gradient; enough that the steps don't show. */
const STEPS = 48

/**
 * Concentric Activity rings, drawn to Apple's anatomy: a dim track, an angular
 * gradient from a deep start to a light end along the arc, round caps, and past
 * 100% the ring keeps winding over a closed lap with a shadow under the leading
 * cap. Each arc sweeps in from twelve o'clock on mount — CSS only, so it works
 * in Server Components. Timing follows `--glass-duration` (×6 to draw), so
 * `motion-still` and reduced motion still them.
 */
function ActivityRings({
  rings,
  size = 160,
  stroke = 16,
  gap = 4,
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "children" | "stroke"> & { rings: ActivityRing[]; size?: number; stroke?: number; gap?: number }) {
  const uid = sanitizeId(React.useId())
  const radii = ringRadii(size, stroke, gap, rings.length)
  const label = rings.map((r, i) => `${r.label ?? `Ring ${i + 1}`}: ${Math.round(r.value * 100)}%`).join(", ")
  const c = size / 2
  return (
    <svg
      data-slot="activity-rings"
      role="img"
      aria-label={props["aria-label"] ?? label}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0 overflow-visible", className)}
      {...props}
    >
      {radii.map((r, i) => {
        const ring = rings[i]
        const color = ring.color ?? `var(--chart-${(i % 3) + 1})`
        const deep = `color-mix(in oklch, ${color} 72%, black)`
        const light = `color-mix(in oklch, ${color} 88%, white)`
        const { full, partial } = ringLaps(ring.value)
        const circumference = 2 * Math.PI * r
        const sweep = partial * Math.PI * 2
        const steps = Math.max(1, Math.ceil(STEPS * partial))
        const delay = full > 0 ? glassTime(3) : "0s"
        const end = polarPoint(c, c, r, sweep)
        const mask = `ring-${uid}-${i}`
        return (
          <g key={i} data-slot="activity-ring" data-laps={full + (partial > 0 ? 1 : 0)}>
            <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeOpacity={0.2} strokeWidth={stroke} />
            {full > 0 ? (
              // the closed laps underneath, at the end colour
              <circle
                data-slot="activity-ring-lap"
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke={light}
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                transform={`rotate(-90 ${c} ${c})`}
                data-glass-motion
                style={{ ["--glass-draw-from" as string]: `${circumference}`, animation: `glass-draw ${glassTime(3)} ${drawEase} both` }}
              />
            ) : null}
            {partial > 0.001 ? (
              <>
                <defs>
                  <mask id={mask} maskUnits="userSpaceOnUse" x={0} y={0} width={size} height={size}>
                    {/* the sweep: a round-capped dash that draws in, revealing the gradient below */}
                    <circle
                      cx={c}
                      cy={c}
                      r={r}
                      fill="none"
                      stroke="white"
                      strokeWidth={stroke}
                      strokeLinecap="round"
                      strokeDasharray={`${circumference} ${circumference}`}
                      strokeDashoffset={circumference * (1 - partial)}
                      transform={`rotate(-90 ${c} ${c})`}
                      data-glass-motion
                      style={{
                        ["--glass-draw-from" as string]: `${circumference}`,
                        animation: `glass-draw ${glassTime(6)} ${drawEase} ${delay} both`,
                        transition: `stroke-dashoffset ${glassTime(4)} ${drawEase}`,
                      }}
                    />
                  </mask>
                </defs>
                {full > 0 ? (
                  // the leading cap casts a shadow onto the lap beneath it
                  <circle
                    data-slot="activity-ring-cap-shadow"
                    cx={end.x}
                    cy={end.y}
                    r={stroke / 2}
                    fill={light}
                    data-glass-motion
                    style={{ filter: `drop-shadow(0 0 ${stroke * 0.18}px color-mix(in oklch, black 60%, transparent))`, animation: `glass-fade ${glassTime(1)} ease-out calc(${delay} + ${glassTime(5)}) both` }}
                  />
                ) : null}
                <g data-slot="activity-ring-arc" mask={`url(#${mask})`}>
                  {/* the angular gradient: short butt-capped arcs stepping from deep to light, overlapping a hair so no seams show */}
                  <circle cx={c} cy={c - r} r={stroke / 2} fill={deep} />
                  {Array.from({ length: steps }, (_, s) => {
                    const a0 = (sweep * s) / steps
                    const a1 = Math.min(sweep, (sweep * (s + 1)) / steps + 0.01)
                    const t = steps === 1 ? 1 : s / (steps - 1)
                    return <path key={s} d={arcPath(c, c, r, a0, a1)} fill="none" stroke={`color-mix(in oklch, ${light} ${Math.round(t * 100)}%, ${deep})`} strokeWidth={stroke} />
                  })}
                  <circle cx={end.x} cy={end.y} r={stroke / 2} fill={light} />
                </g>
              </>
            ) : null}
            {ring.icon ? (
              <foreignObject data-slot="activity-ring-icon" x={c - stroke / 2} y={c - r - stroke / 2} width={stroke} height={stroke} aria-hidden>
                {/* dark on the ring colour, as Apple draws the arrows */}
                <div className="flex size-full items-center justify-center [&_svg]:size-[70%]" style={{ color: "color-mix(in oklch, black 80%, transparent)" }}>
                  {ring.icon}
                </div>
              </foreignObject>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

export { ActivityRings }
