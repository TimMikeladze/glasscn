import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"

import { Stat, StatLabel, StatTrend, StatValue } from "@/components/glass/native/stat"
import { GText, useUI } from "@/components/glass/native/ui"

/**
 * A key figure from Stat — the web's Kpi: label, the value in compact notation,
 * a trend coloured by whether going up is good, a line of context and a chart
 * slot, or a placeholder while it loads.
 */
export function Kpi({
  label,
  value,
  format,
  locale,
  trend,
  description,
  chart,
  loading = false,
  style,
  ...props
}: Omit<ViewProps, "style" | "children"> & {
  label: string
  value: number
  format?: (value: number) => string
  locale?: string
  trend?: { value: number; format?: (value: number) => string; good?: "up" | "down" }
  description?: string
  chart?: React.ReactNode
  loading?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  if (loading) {
    return (
      <Stat accessibilityLabel="Loading" style={style} {...props}>
        {[0.5, 0.7, 0.3].map((w, i) => (
          <View key={i} style={{ height: i === 1 ? 28 : 12, width: `${w * 100}%`, borderRadius: 6, backgroundColor: ui.fill }} />
        ))}
      </Stat>
    )
  }
  const figure = format ? format(value) : new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value)
  const change = trend ? (trend.format ? trend.format(trend.value) : new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }).format(trend.value)) : null
  const up = (trend?.value ?? 0) >= 0
  const good = (trend?.good ?? "up") === "up" ? up : !up
  return (
    <Stat style={style} {...props}>
      <StatLabel>{label}</StatLabel>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <StatValue>{figure}</StatValue>
        {change !== null ? (
          <StatTrend direction={up ? "up" : "down"} style={good ? undefined : { backgroundColor: "rgba(229,55,44,0.12)" }}>
            {change}
          </StatTrend>
        ) : null}
      </View>
      {description ? (
        <GText size="xs" tone="muted">
          {description}
        </GText>
      ) : null}
      {chart}
    </Stat>
  )
}
