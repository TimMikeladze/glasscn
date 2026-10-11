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

/** Text children become the `title`, so a truncated figure or label can still be read in full. */
const titleOf = (children: React.ReactNode, title?: string) => title ?? (typeof children === "string" || typeof children === "number" ? String(children) : undefined)

function StatValue({ className, title, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="stat-value" title={titleOf(children, title)} className={cn("truncate type-glass-display type-step-3 numeric-glass", className)} {...props}>
      {children}
    </div>
  )
}

function StatLabel({ className, title, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="stat-label" title={titleOf(children, title)} className={cn("truncate type-step-n1 text-muted-foreground", className)} {...props}>
      {children}
    </div>
  )
}

/** Context for the figure — "vs last week", "of 10,000". */
function StatDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="stat-description" className={cn("type-step-n2 text-muted-foreground", className)} {...props} />
}

/** A slot for a small chart under the figure (a Sparkline); it fills the tile's width. */
function StatChart({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stat-chart" className={cn("-mx-1 mt-auto min-w-0", className)} {...props} />
}

/** A tile's placeholder while its figure loads: label, value and trend bars with a shimmer. */
function StatSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  const bar = "rounded-badge bg-fill motion-safe:animate-pulse"
  return (
    <div data-slot="stat-skeleton" role="status" aria-busy className={cn("flex min-w-0 flex-col gap-2 rounded-concentric bg-fill-subtle p-card-sm", className)} {...props}>
      <span className={cn(bar, "h-3 w-1/2")} />
      <span className={cn(bar, "h-7 w-2/3")} />
      <span className={cn(bar, "h-4 w-1/4")} />
      <span className="sr-only">Loading</span>
    </div>
  )
}

/**
 * A figure in compact notation for `locale` (12.4K, 3.1M) — what fits a tile.
 * Pass Intl options to change the unit (`{ style: "currency", currency: "USD" }`).
 */
function formatStat(value: number, { locale, compact = true, ...options }: Intl.NumberFormatOptions & { locale?: string; compact?: boolean } = {}) {
  if (!Number.isFinite(value)) return "–"
  return new Intl.NumberFormat(locale, compact ? { notation: "compact", maximumFractionDigits: 1, ...options } : options).format(value)
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

export { Stat, StatIcon, StatValue, StatLabel, StatTrend, StatDescription, StatChart, StatSkeleton, formatStat }
