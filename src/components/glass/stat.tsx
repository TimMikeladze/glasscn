import * as React from "react"
import { cn } from "cn"
import { ArrowDownRightIcon, ArrowRightIcon, ArrowUpRightIcon } from "lucide-react"

import { glassVariants, type GlassVariantProps } from "@/lib/glass-variants"

/**
 * A figure on a tile.
 *
 *   <Card><CardContent className="grid grid-cols-3 gap-3">
 *     <Stat>
 *       <StatIcon><FlameIcon /></StatIcon>
 *       <StatValue>12</StatValue>
 *       <StatLabel>Night chain</StatLabel>
 *       <StatTrend direction="up">+3</StatTrend>
 *     </Stat>
 *   </CardContent></Card>
 *
 * By default a tile is a fill with a corner concentric to its container — content
 * inside a card isn't another pane. Standing alone on the ground, make it glass:
 * `variant="glass"` (or pass `intensity`, `tint` or `elevation`).
 */
function Stat({
  className,
  variant,
  intensity,
  tint,
  elevation,
  ...props
}: React.ComponentProps<"div"> & Omit<GlassVariantProps, "variant"> & { variant?: "fill" | "glass" }) {
  const v = variant ?? (intensity || tint || elevation ? "glass" : "fill")
  return (
    <div
      data-slot="stat"
      data-variant={v}
      className={cn(
        "flex min-w-0 flex-col gap-2 p-card-sm",
        v === "glass" ? cn(glassVariants({ intensity, tint, elevation }), "rounded-surface-sm") : "rounded-concentric bg-fill-subtle",
        className
      )}
      {...props}
    />
  )
}

function StatIcon({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="stat-icon" className={cn("text-muted-foreground [&_svg:not([class*='size-'])]:size-4", className)} {...props} />
}

function StatValue({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stat-value" className={cn("truncate type-glass-display type-step-3", className)} {...props} />
}

function StatLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stat-label" className={cn("truncate type-step-n1 text-muted-foreground", className)} {...props} />
}

type TrendDirection = "up" | "down" | "flat"
type TrendSentiment = "positive" | "negative" | "neutral"

const SENTIMENT: Record<TrendDirection, TrendSentiment> = { up: "positive", down: "negative", flat: "neutral" }
const SPOKEN: Record<TrendDirection, string> = { up: "Increased", down: "Decreased", flat: "Unchanged" }
const ICON = { up: ArrowUpRightIcon, down: ArrowDownRightIcon, flat: ArrowRightIcon }

/**
 * A change, as an arrow and a figure. `direction` is which way it moved;
 * `sentiment` is whether that's good — up is positive by default, but latency
 * going up isn't: `<StatTrend direction="up" sentiment="negative">`.
 */
function StatTrend({
  className,
  direction = "up",
  sentiment,
  srLabel,
  children,
  ...props
}: React.ComponentProps<"span"> & {
  direction?: TrendDirection
  /** Colour: positive (success), negative (destructive), neutral. Defaults from `direction`. */
  sentiment?: TrendSentiment
  /** Read before the figure by screen readers. Defaults to "Increased" / "Decreased" / "Unchanged". */
  srLabel?: string
}) {
  const Icon = ICON[direction]
  return (
    <span
      data-slot="stat-trend"
      data-direction={direction}
      data-sentiment={sentiment ?? SENTIMENT[direction]}
      className={cn(
        "inline-flex w-fit items-center gap-0.5 rounded-badge px-1.5 py-0.5 text-xs font-semibold numeric-glass",
        "data-[sentiment=positive]:bg-success/14 data-[sentiment=positive]:text-success-ink",
        "data-[sentiment=negative]:bg-destructive/12 data-[sentiment=negative]:text-destructive-ink",
        "data-[sentiment=neutral]:bg-fill data-[sentiment=neutral]:text-muted-foreground",
        className
      )}
      {...props}
    >
      <Icon aria-hidden className="size-3 rtl:-scale-x-100" />
      <span className="sr-only">{srLabel ?? SPOKEN[direction]} </span>
      {children}
    </span>
  )
}

export { Stat, StatIcon, StatValue, StatLabel, StatTrend }
