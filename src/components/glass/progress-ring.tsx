import * as React from "react"
import { cn } from "cn"

import { ringArc } from "@/lib/glass-charts"

/**
 * One ring that closes around its content — a goal, a countdown, a seal.
 * `value` 0–1; the arc draws in on mount.
 */
function ProgressRing({
  value,
  size = 72,
  stroke,
  color = "var(--primary)",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { value: number; size?: number; stroke?: number; color?: string }) {
  const sw = stroke ?? Math.max(3, size * 0.075)
  const r = size / 2 - sw / 2
  const { circumference, offset } = ringArc(r, Math.min(1, value))
  return (
    <div
      data-slot="progress-ring"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(Math.min(1, Math.max(0, value)) * 100)}
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill={`color-mix(in oklch, ${color} 12%, transparent)`} stroke={color} strokeOpacity={0.2} strokeWidth={sw} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          data-glass-motion
          style={{
            ["--glass-draw-from" as string]: `${circumference}`,
            animation: "glass-draw 1s cubic-bezier(0.16,1,0.3,1) both",
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </svg>
      <div data-slot="progress-ring-content" className="relative flex items-center justify-center text-center type-glass-display" style={{ color }}>
        {children}
      </div>
    </div>
  )
}

export { ProgressRing }
