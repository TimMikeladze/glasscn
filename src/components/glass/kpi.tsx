import * as React from "react"
import { cn } from "cn"

import { Stat, StatChart, StatDescription, StatLabel, StatSkeleton, StatTrend, StatValue, formatStat } from "@/components/glass/stat"

type KpiTrend = {
  /** The change itself, e.g. 0.12 for +12% or 340 for +340. Its sign sets the arrow. */
  value: number
  /** Format the change; a signed percentage of `value` by default. */
  format?: (value: number) => string
  /** Whether going up is good. Latency, cost, resting heart rate: `"down"`. */
  good?: "up" | "down"
}

/**
 * A key figure, ready-made from `Stat`: label, the value in compact notation,
 * a trend coloured by whether the change is good, a line of context and an
 * optional chart (a `Sparkline`) — or a skeleton while it loads.
 *
 *   <Kpi label="Active minutes" value={1284} trend={{ value: 0.12 }} description="vs last week" chart={<Sparkline data={week} height={40} />} />
 */
function Kpi({
  label,
  value,
  format,
  locale,
  trend,
  description,
  icon,
  chart,
  loading = false,
  variant,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  label: React.ReactNode
  value: number
  /** Format the figure; compact notation in `locale` by default (12.4K). */
  format?: (value: number) => string
  locale?: string
  trend?: KpiTrend
  description?: React.ReactNode
  icon?: React.ReactNode
  /** A small chart under the figure. */
  chart?: React.ReactNode
  loading?: boolean
  /** A fill tile inside a card (default) or glass standing alone. */
  variant?: "fill" | "glass"
}) {
  if (loading) return <StatSkeleton data-slot="kpi" className={className} {...props} />
  const figure = format ? format(value) : formatStat(value, { locale })
  const direction = !trend || trend.value === 0 ? "flat" : trend.value > 0 ? "up" : "down"
  const good = trend?.good ?? "up"
  const sentiment = direction === "flat" ? "neutral" : direction === good ? "positive" : "negative"
  const change = trend ? (trend.format ? trend.format(trend.value) : new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }).format(trend.value)) : null
  return (
    <Stat data-slot="kpi" variant={variant} className={cn("@container/kpi", className)} {...props}>
      <div className="flex items-center justify-between gap-2">
        <StatLabel>{label}</StatLabel>
        {icon ? <span className="shrink-0 text-muted-foreground [&_svg:not([class*='size-'])]:size-4">{icon}</span> : null}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <StatValue title={String(value)}>{figure}</StatValue>
        {change !== null ? (
          <StatTrend direction={direction} sentiment={sentiment}>
            {change}
          </StatTrend>
        ) : null}
      </div>
      {description ? <StatDescription>{description}</StatDescription> : null}
      {chart ? <StatChart>{chart}</StatChart> : null}
    </Stat>
  )
}

export { Kpi, type KpiTrend }
