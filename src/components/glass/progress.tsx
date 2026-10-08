"use client"

import * as React from "react"
import { cn } from "cn"
import { Progress as ProgressPrimitive } from "radix-ui"

/** A capsule bar whose fill runs from the second chart colour into the accent. */
function Progress({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-fill", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 rounded-full bg-linear-to-r from-chart-2 to-primary transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value || 0))}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
