import * as React from "react"
import { cn } from "cn"

import { areaPath, scaleSeries, smoothPath } from "@/lib/glass-charts"

/**
 * A measure over time: a smooth stroke that draws itself, a soft gradient
 * beneath, the latest point lit. Gaps (`null`) are skipped. Scales to its
 * container's width; set the height with `height`.
 */
function Sparkline({
  data,
  height = 72,
  color = "var(--primary)",
  area = true,
  dot = true,
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "children"> & {
  data: (number | null | undefined)[]
  height?: number
  color?: string
  area?: boolean
  dot?: boolean
}) {
  const id = React.useId().replace(/:/g, "")
  const W = 300
  const points = scaleSeries(data, W, height, 6)
  if (points.length < 2) {
    return (
      <svg data-slot="sparkline" viewBox={`0 0 ${W} ${height}`} width="100%" height={height} className={cn("overflow-visible", className)} aria-hidden {...props}>
        <line x1={6} x2={W - 6} y1={height - 6} y2={height - 6} stroke="currentColor" strokeOpacity={0.15} />
      </svg>
    )
  }
  const last = points[points.length - 1]
  const line = smoothPath(points)
  // overestimate the path length: the dash only has to cover it
  let length = 0
  for (let i = 1; i < points.length; i++) length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  length = Math.ceil(length * 1.2)
  return (
    <svg
      data-slot="sparkline"
      role="img"
      viewBox={`0 0 ${W} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className={cn("overflow-visible", className)}
      {...props}
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.32} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {area ? <path d={areaPath(points, height - 2)} fill={`url(#spark-${id})`} data-glass-motion style={{ animation: "glass-fade 0.7s ease-out 0.3s both" }} /> : null}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        strokeDasharray={`${length} ${length}`}
        strokeDashoffset={0}
        data-glass-motion
        style={{ ["--glass-draw-from" as string]: `${length}`, animation: "glass-draw 1.1s cubic-bezier(0.16,1,0.3,1) both" }}
      />
      {dot ? (
        <g data-slot="sparkline-dot">
          <circle cx={last.x} cy={last.y} r={7} fill={color} opacity={0.22} />
          <circle cx={last.x} cy={last.y} r={3.6} fill={color} stroke="var(--background)" strokeWidth={1.5} />
        </g>
      ) : null}
    </svg>
  )
}

export { Sparkline }
