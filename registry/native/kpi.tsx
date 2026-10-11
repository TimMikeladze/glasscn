import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"

import { Stat, StatChart, StatDescription, StatLabel, StatSkeleton, StatTrend, StatValue, formatStat } from "@/components/glass/native/stat"
import { useUI } from "@/components/glass/native/ui"

export type KpiTrend = {
  /** The change itself, e.g. 0.12 for +12% or 340 for +340. Its sign sets the arrow. */
  value: number
  /** Format the change; a signed percentage of `value` by default. */
  format?: (value: number) => string
  /** Whether going up is good. Latency, cost, resting heart rate: `"down"`. */
  good?: "up" | "down"
}

const text = (node: React.ReactNode, wrap: (s: string) => React.ReactNode) => (typeof node === "string" || typeof node === "number" ? wrap(String(node)) : node)

/**
 * A key figure, ready-made from `Stat`: label, the value in compact notation,
 * a trend coloured by whether the change is good, a line of context and an
 * optional chart (a `Sparkline`) — or a skeleton while it loads.
 *
 *   <Kpi label="Active minutes" value={1284} trend={{ value: 0.12 }} description="vs last week" chart={<Sparkline data={week} height={40} />} />
 */
export function Kpi({
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
  style,
  ...props
}: Omit<ViewProps, "style" | "children"> & {
  label: React.ReactNode
  value: number
  /** Format the figure; compact notation in `locale` by default (12.4K). */
  format?: (value: number) => string
  locale?: string
  trend?: KpiTrend
  description?: React.ReactNode
  /** A glyph beside the label (a lucide-react-native icon). */
  icon?: React.ReactNode
  /** A small chart under the figure. */
  chart?: React.ReactNode
  loading?: boolean
  /** A fill tile inside a card (default) or material glass standing alone. */
  variant?: "fill" | "glass"
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  if (loading) return <StatSkeleton style={style} {...props} />
  const figure = format ? format(value) : formatStat(value, { locale })
  const direction = !trend || trend.value === 0 ? "flat" : trend.value > 0 ? "up" : "down"
  const good = trend?.good ?? "up"
  const sentiment = direction === "flat" ? "neutral" : direction === good ? "positive" : "negative"
  const change = trend ? (trend.format ? trend.format(trend.value) : new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }).format(trend.value)) : null
  return (
    <Stat variant={variant} style={style} {...props}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        {text(label, (s) => <StatLabel style={{ flexShrink: 1 }}>{s}</StatLabel>)}
        {icon ? (
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {React.isValidElement<{ color?: string; size?: number }>(icon) ? React.cloneElement(icon, { color: icon.props.color ?? ui.mutedForeground, size: icon.props.size ?? 16 }) : icon}
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: 8, rowGap: 4 }}>
        <StatValue accessibilityLabel={figure === String(value) ? undefined : `${figure} (${value.toLocaleString(locale)})`}>{figure}</StatValue>
        {change !== null ? (
          <StatTrend direction={direction} sentiment={sentiment}>
            {change}
          </StatTrend>
        ) : null}
      </View>
      {description ? text(description, (s) => <StatDescription>{s}</StatDescription>) : null}
      {chart ? <StatChart>{chart}</StatChart> : null}
    </Stat>
  )
}
