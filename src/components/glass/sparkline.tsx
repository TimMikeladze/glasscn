"use client"

import * as React from "react"
import { cn } from "cn"

import { areaPath, polylineLength, sanitizeId, scaleSeries, smoothPath } from "@/lib/glass-charts"

/** The drawing's width in viewBox units; the svg stretches it to the container. */
const W = 300

/**
 * A measure over time: a smooth stroke that draws itself, a soft gradient
 * beneath, the latest point lit. Gaps (`null`) are skipped. Scales to its
 * container's width; set the height with `height`.
 *
 * The line and area stretch with the container (the stroke keeps its width);
 * the dot is an HTML overlay placed by percentage, so it stays round at any
 * width and renders the same on the server. The draw-in dash is sized from the
 * measured width (a non-scaling stroke dashes in screen pixels).
 */
function Sparkline({
  data,
  height = 72,
  color = "var(--primary)",
  area = true,
  dot = true,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  data: (number | null | undefined)[]
  height?: number
  color?: string
  area?: boolean
  dot?: boolean
}) {
  const id = sanitizeId(React.useId())
  const ref = React.useRef<SVGSVGElement>(null)
  // the rendered width; until measured (and on the server) assume the drawing's own
  const [width, setWidth] = React.useState(W)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWidth(el.getBoundingClientRect().width || W)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const points = scaleSeries(data, W, height, 6)
  if (points.length < 2) {
    return (
      <div data-slot="sparkline" aria-hidden className={cn("relative w-full", className)} style={{ height, ...style }} {...props}>
        <svg ref={ref} data-slot="sparkline-svg" viewBox={`0 0 ${W} ${height}`} width="100%" height={height} preserveAspectRatio="none" className="block overflow-visible">
          <line x1={6} x2={W - 6} y1={height - 6} y2={height - 6} stroke="currentColor" strokeOpacity={0.15} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    )
  }
  const last = points[points.length - 1]
  const line = smoothPath(points)
  // on-screen length, overestimated: the dash only has to cover the curve
  const length = Math.ceil(polylineLength(points, width / W, 1) * 1.2)
  return (
    <div data-slot="sparkline" role="img" className={cn("relative w-full", className)} style={{ height, ...style }} {...props}>
      <svg ref={ref} data-slot="sparkline-svg" aria-hidden viewBox={`0 0 ${W} ${height}`} width="100%" height={height} preserveAspectRatio="none" className="block overflow-visible">
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
      </svg>
      {dot ? (
        <span
          data-slot="sparkline-dot"
          aria-hidden
          className="pointer-events-none absolute grid size-3.5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
          style={{ left: `${(last.x / W) * 100}%`, top: last.y, background: `color-mix(in oklch, ${color} 22%, transparent)` }}
        >
          <span className="size-2.5 rounded-full border-[1.5px] border-background" style={{ background: color }} />
        </span>
      ) : null}
    </div>
  )
}

export { Sparkline }
