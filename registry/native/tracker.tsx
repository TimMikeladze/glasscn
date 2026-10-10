import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"

import { Press } from "@/components/glass/native/press"
import { alpha, useUI, type UI } from "@/components/glass/native/ui"

export interface TrackerBlock {
  /** Read by screen readers and passed to `onSelect`. */
  title: string
  /** A status from `colors`; unknown statuses render as empty. */
  status?: string
  key?: string
}

/** The default status colours, from the theme. */
function defaultColors(ui: UI): Record<string, string> {
  return { done: ui.primary, partial: alpha(ui.primary, 0.45), missed: alpha(ui.foreground, 0.25), rest: ui.fill }
}

/**
 * A row of status blocks — uptime, a habit's last 30 days. Blocks stretch to
 * fill the width. Map your statuses to colours with `colors`.
 */
export function Tracker({
  data,
  colors,
  onSelect,
  style,
  ...props
}: Omit<ViewProps, "style"> & {
  data: TrackerBlock[]
  /** Status → colour (any colour string, e.g. `ui.charts[1]`). */
  colors?: Record<string, string>
  /** Tapping a block (the web shows its title on hover). */
  onSelect?: (block: TrackerBlock, index: number) => void
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const map = colors ?? defaultColors(ui)
  const radius = ui.radius.control * 0.7
  return (
    <View accessibilityRole="list" style={[{ flexDirection: "row", height: ui.control.sm, width: "100%", gap: 2 }, style]} {...props}>
      {data.map((b, i) => {
        const block: ViewStyle = {
          flex: 1,
          minWidth: 0,
          height: "100%",
          backgroundColor: (b.status && map[b.status]) || ui.fill,
          borderTopLeftRadius: i === 0 ? radius : 0,
          borderBottomLeftRadius: i === 0 ? radius : 0,
          borderTopRightRadius: i === data.length - 1 ? radius : 0,
          borderBottomRightRadius: i === data.length - 1 ? radius : 0,
        }
        return onSelect ? (
          <Press key={b.key ?? i} accessibilityRole="button" accessibilityLabel={b.title} onPress={() => onSelect(b, i)} squash={1} hover={1.1} style={block} />
        ) : (
          <View key={b.key ?? i} accessible accessibilityLabel={b.title} style={block} />
        )
      })}
    </View>
  )
}
