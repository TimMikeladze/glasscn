import * as React from "react"
import { cn } from "cn"

/**
 * A placeholder while content loads: a fill with a soft shimmer sweeping across (logical, so it
 * runs the other way in RTL). Still under reduced motion. Hidden from assistive tech — mark the
 * region that's loading `aria-busy` instead.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-control-sm bg-fill",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[glass-shimmer_1.6s_ease-in-out_infinite] after:bg-linear-to-r after:from-transparent after:via-fill-strong after:to-transparent rtl:after:animate-[glass-shimmer-rtl_1.6s_ease-in-out_infinite] motion-reduce:after:hidden",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
