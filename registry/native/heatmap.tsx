import * as React from "react"
import { View, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from "react-native"

import { heatmapWeeks, isoDate, monthLabels, parseDate, type HeatCell } from "@/components/glass/native/chart-math"
import { Press } from "@/components/glass/native/press"
import { alpha, GText, useUI, type UI } from "@/components/glass/native/ui"

const GAP = 3
const levels = (ui: UI) => [ui.fill, alpha(ui.primary, 0.25), alpha(ui.primary, 0.5), alpha(ui.primary, 0.75), ui.primary]

/**
 * Days as rounded cells in week columns, coloured by intensity — a contribution
 * graph. Values are numbers by ISO date; levels are quantised against the max.
 * Pass `onSelect` to make cells buttons.
 */
export function Heatmap({
  values,
  weeks = 26,
  weekStart = 1,
  today = isoDate(new Date()),
  max,
  cellSize = 16,
  onSelect,
  formatTitle = (c) => `${parseDate(c.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}${c.value ? ` · ${c.value}` : ""}`,
  style,
  ...props
}: Omit<ViewProps, "style"> & {
  values: Record<string, number>
  weeks?: number
  weekStart?: 0 | 1
  today?: string
  max?: number
  /** Largest a cell grows, in px — cells shrink below it to fit narrow containers. */
  cellSize?: number
  onSelect?: (date: string) => void
  formatTitle?: (cell: HeatCell) => string
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const fills = levels(ui)
  const [width, setWidth] = React.useState(0)
  const cols = heatmapWeeks(values, { today, weeks, weekStart, max })
  const months = monthLabels(cols)
  const days = Array.from({ length: 7 }, (_, r) => parseDate(cols[0][r].date).toLocaleDateString(undefined, { weekday: "short" }))
  const cell = width ? Math.max(4, Math.min(cellSize, (width - GAP * (weeks - 1)) / weeks)) : cellSize
  const label = (text: React.ReactNode) => (
    <GText style={{ fontSize: 10, lineHeight: 12 }} tone="muted" numberOfLines={1}>
      {text}
    </GText>
  )
  return (
    <View style={[{ flexDirection: "row", gap: 6 }, style]} {...props}>
      <View style={{ flexShrink: 0, gap: GAP, paddingTop: 14 + GAP }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {days.map((d, r) => (
          <View key={r} style={{ height: cell, justifyContent: "center" }}>
            {r % 2 === 0 ? label(d) : null}
          </View>
        ))}
      </View>
      <View style={{ flex: 1, minWidth: 0, flexDirection: "row", gap: GAP }} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {cols.map((col, w) => (
          <View key={col[0].date} style={{ width: cell, gap: GAP }}>
            <View style={{ height: 14, overflow: "visible" }}>{months[w] ? <View style={{ position: "absolute", left: 0, width: 40 }}>{label(months[w])}</View> : null}</View>
            {col.map((c) => {
              const box: ViewStyle = {
                width: cell,
                height: cell,
                borderRadius: 3,
                backgroundColor: c.future ? "transparent" : fills[c.level],
                borderWidth: c.today ? 2 : 0,
                borderColor: ui.primary,
              }
              return onSelect && !c.future ? (
                <Press key={c.date} accessibilityRole="button" accessibilityLabel={formatTitle(c)} onPress={() => onSelect(c.date)} squash={0.85} hover={1.25} style={box} />
              ) : (
                <View key={c.date} accessible={!c.future} accessibilityLabel={c.future ? undefined : formatTitle(c)} style={box} />
              )
            })}
          </View>
        ))}
      </View>
    </View>
  )
}

/** "Less ▢▢▢▢▢ More". */
export function HeatmapLegend({ less = "Less", more = "More", style, ...props }: Omit<ViewProps, "style"> & { less?: string; more?: string; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 4 }, style]} {...props}>
      <GText size="xs" tone="muted" style={{ marginRight: 4 }}>
        {less}
      </GText>
      {levels(ui).map((c, i) => (
        <View key={i} style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: c }} />
      ))}
      <GText size="xs" tone="muted" style={{ marginLeft: 4 }}>
        {more}
      </GText>
    </View>
  )
}
