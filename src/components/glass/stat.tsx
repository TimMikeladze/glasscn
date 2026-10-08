import * as React from "react"
import { cn } from "cn"
import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"

import { glassVariants, type GlassVariantProps } from "@/lib/glass-variants"

/**
 * A figure on a glass tile.
 *
 *   <Stat>
 *     <StatIcon><FlameIcon /></StatIcon>
 *     <StatValue>12</StatValue>
 *     <StatLabel>Night chain</StatLabel>
 *     <StatTrend direction="up">+3</StatTrend>
 *   </Stat>
 */
function Stat({ className, intensity, tint, elevation, ...props }: React.ComponentProps<"div"> & GlassVariantProps) {
  return <div data-slot="stat" className={cn(glassVariants({ intensity, tint, elevation }), "flex min-w-0 flex-col gap-2 rounded-surface-sm p-[calc(1rem*var(--glass-density))]", className)} {...props} />
}

function StatIcon({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="stat-icon" className={cn("text-muted-foreground [&_svg:not([class*='size-'])]:size-4", className)} {...props} />
}

function StatValue({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stat-value" className={cn("truncate type-glass-display text-3xl", className)} {...props} />
}

function StatLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stat-label" className={cn("truncate text-sm text-muted-foreground", className)} {...props} />
}

function StatTrend({ className, direction = "up", children, ...props }: React.ComponentProps<"span"> & { direction?: "up" | "down" }) {
  return (
    <span
      data-slot="stat-trend"
      data-direction={direction}
      className={cn(
        "inline-flex w-fit items-center gap-0.5 rounded-badge px-1.5 py-0.5 text-xs font-semibold numeric-glass data-[direction=down]:bg-destructive/12 data-[direction=down]:text-destructive data-[direction=up]:bg-primary/14 data-[direction=up]:text-primary",
        className
      )}
      {...props}
    >
      {direction === "up" ? <ArrowUpRightIcon className="size-3" /> : <ArrowDownRightIcon className="size-3" />}
      {children}
    </span>
  )
}

export { Stat, StatIcon, StatValue, StatLabel, StatTrend }
