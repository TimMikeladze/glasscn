import * as React from "react"
import { cn } from "cn"

/**
 * The living ground glass sits on: three soft palette blobs drifting over the
 * base colour. Pure CSS (radial gradients + transforms), so it costs no JS and
 * stops for `prefers-reduced-motion`. Colours come from `--aurora-1..3` and
 * `--aurora-base`; place it behind content with `fixed inset-0 -z-10` (the default).
 */
function Aurora({
  className,
  speed = 1,
  intensity = 1,
  animate = true,
  ...props
}: React.ComponentProps<"div"> & {
  /** Drift speed multiplier — 0.5 is slower, 2 is faster. */
  speed?: number
  /** Blob opacity, 0–1. */
  intensity?: number
  animate?: boolean
}) {
  const blob = (i: 1 | 2 | 3, position: string, size: string, duration: number) => (
    <div
      data-slot="aurora-blob"
      aria-hidden
      className={cn("absolute aspect-square rounded-full will-change-transform", position, size)}
      style={{
        background: `radial-gradient(closest-side, var(--aurora-${i}), color-mix(in oklch, var(--aurora-${i}) 55%, transparent) 45%, transparent)`,
        opacity: intensity,
        animation: animate ? `glass-aurora-${i} ${duration / speed}s ease-in-out infinite` : undefined,
      }}
    />
  )
  return (
    <div
      data-slot="aurora"
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-aurora-base", className)}
      {...props}
    >
      {blob(1, "-left-[25%] -top-[15%]", "w-[125%] min-w-[560px]", 34)}
      {blob(2, "left-[40%] top-[10%]", "w-[105%] min-w-[480px]", 42)}
      {blob(3, "-left-[10%] top-[55%]", "w-[120%] min-w-[540px]", 38)}
    </div>
  )
}

export { Aurora }
