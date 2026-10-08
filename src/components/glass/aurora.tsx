import * as React from "react"
import { cn } from "cn"

/**
 * The living ground glass sits on: three soft palette blobs drifting over the
 * base colour. Pure CSS (radial gradients + transforms) — no JS, stills for
 * `prefers-reduced-motion`. Themed by `--aurora-1..3`, `--aurora-base`,
 * `--aurora-opacity`, `--aurora-scale`, `--aurora-speed` and `--aurora-blur`;
 * the props below override those for one instance. Fixed behind the page by
 * default (`fixed inset-0 -z-10`); pass `className="absolute"` to fill a container.
 */
function Aurora({
  className,
  style,
  speed,
  intensity,
  scale,
  blur,
  animate = true,
  ...props
}: React.ComponentProps<"div"> & {
  /** Drift speed multiplier (--aurora-speed). */
  speed?: number
  /** Blob opacity 0–1 (--aurora-opacity). */
  intensity?: number
  /** Blob size multiplier (--aurora-scale). */
  scale?: number
  /** Extra blur on the blobs, px (--aurora-blur). */
  blur?: number
  animate?: boolean
}) {
  const overrides: Record<string, string> = {}
  if (speed !== undefined) overrides["--aurora-speed"] = String(speed)
  if (intensity !== undefined) overrides["--aurora-opacity"] = `${intensity * 100}%`
  if (scale !== undefined) overrides["--aurora-scale"] = String(scale)
  if (blur !== undefined) overrides["--aurora-blur"] = `${blur}px`

  const blob = (i: 1 | 2 | 3, position: string, size: number, minPx: number, seconds: number) => (
    <div
      data-slot="aurora-blob"
      aria-hidden
      className={cn("absolute aspect-square rounded-full will-change-transform", position)}
      style={{
        width: `calc(${size}% * var(--aurora-scale, 1))`,
        minWidth: `calc(${minPx}px * var(--aurora-scale, 1))`,
        background: `radial-gradient(closest-side, var(--aurora-${i}), color-mix(in oklch, var(--aurora-${i}) 55%, transparent) 45%, transparent)`,
        opacity: "var(--aurora-opacity, 100%)",
        filter: "blur(var(--aurora-blur, 0px))",
        animation: animate ? `glass-aurora-${i} calc(${seconds}s / var(--aurora-speed, 1)) ease-in-out infinite` : undefined,
      }}
    />
  )
  return (
    <div
      data-slot="aurora"
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-aurora-base", className)}
      style={{ ...overrides, ...style }}
      {...props}
    >
      {blob(1, "-left-[25%] -top-[15%]", 125, 560, 34)}
      {blob(2, "left-[40%] top-[10%]", 105, 480, 42)}
      {blob(3, "-left-[10%] top-[55%]", 120, 540, 38)}
    </div>
  )
}

export { Aurora }
