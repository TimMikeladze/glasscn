"use client"

import * as React from "react"
import { cn } from "cn"

import { areaPath, drawEase, glassTime, polylineLength, sanitizeId, scaleSeries, smoothPath } from "@/lib/glass-charts"

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
 *
 * Pass `onScrub` to make it scrubbable: pointer (or press-and-drag on touch) and
 * the arrow keys move a dot along the values and report the index.
 */
function Sparkline({
  data,
  height = 72,
  color = "var(--primary)",
  area = true,
  dot = true,
  onScrub,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  data: (number | null | undefined)[]
  height?: number
  color?: string
  area?: boolean
  dot?: boolean
  /** Called with the scrubbed value's index, or null when the scrub ends. */
  onScrub?: (index: number | null) => void
}) {
  const [active, setActive] = React.useState<number | null>(null)
  const scrub = (index: number | null) => {
    setActive(index)
    onScrub?.(index)
  }
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
  // named by default from the data; pass aria-label to say what it measures
  const values = data.filter((v): v is number => typeof v === "number")
  const label = `Trend of ${values.length} values from ${values[0]} to ${values[values.length - 1]}, low ${Math.min(...values)}, high ${Math.max(...values)}`
  const line = smoothPath(points)
  // index of the nearest value to a fraction along the width
  const nearest = (f: number) => {
    const n = Math.max(1, data.length - 1)
    let best = 0
    let dist = Infinity
    data.forEach((v, i) => {
      if (typeof v !== "number") return
      const d = Math.abs(i / n - f)
      if (d < dist) {
        dist = d
        best = i
      }
    })
    return best
  }
  const scrubbed = active == null || typeof data[active] !== "number" ? null : points[data.slice(0, active).filter((v) => typeof v === "number").length]
  const interactive = onScrub
    ? {
        tabIndex: 0,
        "aria-valuetext": active != null && typeof data[active] === "number" ? String(data[active]) : undefined,
        onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
          const r = e.currentTarget.getBoundingClientRect()
          const f = (e.clientX - r.left) / (r.width || 1)
          scrub(nearest(getComputedStyle(e.currentTarget).direction === "rtl" ? 1 - f : f))
        },
        onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => e.currentTarget.setPointerCapture?.(e.pointerId),
        onPointerLeave: () => scrub(null),
        onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => (e.pointerType === "touch" ? scrub(null) : undefined),
        onBlur: () => scrub(null),
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          const step = { ArrowRight: 1, ArrowLeft: -1, Home: -Infinity, End: Infinity }[e.key]
          if (step === undefined) return
          e.preventDefault()
          const from = active ?? (step > 0 ? -1 : data.length)
          let i = Math.min(data.length - 1, Math.max(0, Number.isFinite(step) ? from + step : step > 0 ? data.length - 1 : 0))
          while (i > 0 && i < data.length - 1 && typeof data[i] !== "number") i += step > 0 ? 1 : -1
          scrub(i)
        },
      }
    : null
  // on-screen length, overestimated: the dash only has to cover the curve
  const length = Math.ceil(polylineLength(points, width / W, 1) * 1.2)
  return (
    <div
      data-slot="sparkline"
      role="img"
      aria-label={props["aria-labelledby"] ? undefined : label}
      className={cn("relative w-full", onScrub && "glass-focus touch-pan-y rounded-control-sm", className)}
      style={{ height, ...style }}
      {...interactive}
      {...props}
    >
      <svg ref={ref} data-slot="sparkline-svg" aria-hidden viewBox={`0 0 ${W} ${height}`} width="100%" height={height} preserveAspectRatio="none" className="block overflow-visible">
        <defs>
          <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={0.32} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {area ? <path d={areaPath(points, height - 2)} fill={`url(#spark-${id})`} data-glass-motion style={{ animation: `glass-fade ${glassTime(3.5)} ease-out ${glassTime(1.5)} both` }} /> : null}
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
          style={{ ["--glass-draw-from" as string]: `${length}`, animation: `glass-draw ${glassTime(5.5)} ${drawEase} both` }}
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
      {scrubbed ? (
        <>
          <span data-slot="sparkline-rule" aria-hidden className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-foreground/30" style={{ left: `${(scrubbed.x / W) * 100}%` }} />
          <span
            data-slot="sparkline-scrub"
            aria-hidden
            className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-background"
            style={{ left: `${(scrubbed.x / W) * 100}%`, top: scrubbed.y, background: color }}
          />
        </>
      ) : null}
    </div>
  )
}

export { Sparkline }
