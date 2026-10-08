import * as React from "react"
import { cn } from "cn"

import { ringArc, ringRadii } from "@/lib/glass-charts"

export interface ActivityRing {
  /** Progress, 0–1. Above 1 draws a second lap, like Apple's rings. */
  value: number
  /** Any CSS colour. Defaults to `--chart-1`, `--chart-2`, `--chart-3` in order. */
  color?: string
  label?: string
}

/**
 * Concentric Activity-style rings. Each arc sweeps in from twelve o'clock on
 * mount (CSS only — works in Server Components) and eases to new values.
 */
function ActivityRings({
  rings,
  size = 160,
  stroke = 16,
  gap = 4,
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "children" | "stroke"> & { rings: ActivityRing[]; size?: number; stroke?: number; gap?: number }) {
  const radii = ringRadii(size, stroke, gap, rings.length)
  const label = rings.map((r, i) => `${r.label ?? `Ring ${i + 1}`}: ${Math.round(r.value * 100)}%`).join(", ")
  return (
    <svg
      data-slot="activity-rings"
      role="img"
      aria-label={props["aria-label"] ?? label}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("-rotate-90 shrink-0", className)}
      {...props}
    >
      {radii.map((r, i) => {
        const ring = rings[i]
        const color = ring.color ?? `var(--chart-${(i % 3) + 1})`
        const { circumference, offset, lapOffset } = ringArc(r, ring.value)
        const arc = (dashoffset: number, extra?: React.CSSProperties) => (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashoffset}
            data-glass-motion
            style={{
              ["--glass-draw-from" as string]: `${circumference}`,
              animation: "glass-draw 1.2s cubic-bezier(0.16,1,0.3,1) both",
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)",
              ...extra,
            }}
          />
        )
        return (
          <g key={i} data-slot="activity-ring">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeOpacity={0.2} strokeWidth={stroke} />
            {ring.value > 0.001 ? arc(offset) : null}
            {lapOffset !== null ? arc(lapOffset, { opacity: 0.85, animationDelay: "0.9s" }) : null}
          </g>
        )
      })}
    </svg>
  )
}

export { ActivityRings }
