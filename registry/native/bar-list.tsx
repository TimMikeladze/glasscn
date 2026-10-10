import * as React from "react"
import { AccessibilityInfo, Animated, Easing, Linking, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"

import { barShares } from "@/components/glass/native/chart-math"
import { Press } from "@/components/glass/native/press"
import { alpha, GText, useUI } from "@/components/glass/native/ui"

export interface BarListItem {
  name: React.ReactNode
  value: number
  /** Makes the row a link (opened with Linking). */
  href?: string
  icon?: React.ReactNode
  /** Stable key when `name` isn't a string. */
  key?: string
}

/** One bar, growing from the left once. Scale on the native driver, anchored left. */
function Bar({ share, color, index, radius }: { share: number; color: string; index: number; radius: number }) {
  const [grow] = React.useState(() => new Animated.Value(0))
  React.useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (reduce) return grow.setValue(1)
        anim = Animated.timing(grow, { toValue: 1, duration: 800, delay: index * 40, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true })
        anim.start()
      })
    return () => anim?.stop()
  }, [grow, index])
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: `${Math.max(share, 2)}%`,
        minWidth: 6,
        borderRadius: radius,
        backgroundColor: alpha(color, 0.22),
        transformOrigin: "left",
        transform: [{ scaleX: grow }],
      }}
    />
  )
}

/**
 * Ranked horizontal bars: label inside the bar, value at the end. Bars grow in
 * once; widths are shares of the largest value (or `max`). Sort the items
 * yourself — the list keeps your order.
 */
export function BarList({
  data,
  max,
  valueFormat = (v) => v.toLocaleString(),
  color,
  onSelect,
  style,
  ...props
}: Omit<ViewProps, "style"> & {
  data: BarListItem[]
  max?: number
  valueFormat?: (value: number) => React.ReactNode
  color?: string
  onSelect?: (item: BarListItem, index: number) => void
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const tone = color ?? ui.primary
  const radius = ui.radius.control * 0.7
  const shares = barShares(
    data.map((d) => d.value),
    max
  )
  return (
    <View accessibilityRole="list" style={[{ gap: 6 }, style]} {...props}>
      {data.map((item, i) => {
        const formatted = valueFormat(item.value)
        const body = (
          <>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Bar share={shares[i]} color={tone} index={i} radius={radius} />
              <View style={{ height: ui.control.sm, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10 }}>
                {item.icon ? <View style={{ flexShrink: 0 }}>{item.icon}</View> : null}
                {typeof item.name === "string" || typeof item.name === "number" ? (
                  <GText size="sm" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {item.name}
                  </GText>
                ) : (
                  item.name
                )}
              </View>
            </View>
            {typeof formatted === "string" || typeof formatted === "number" ? (
              <GText size="sm" weight="500" style={{ flexShrink: 0, fontVariant: ["tabular-nums"] }}>
                {formatted}
              </GText>
            ) : (
              formatted
            )}
          </>
        )
        const row: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: radius }
        const key = item.key ?? (typeof item.name === "string" ? item.name : i)
        const label = `${typeof item.name === "string" ? item.name : ""} ${typeof formatted === "string" || typeof formatted === "number" ? formatted : item.value}`.trim()
        const press = () => {
          onSelect?.(item, i)
          if (item.href) Linking.openURL(item.href).catch(() => {})
        }
        return (
          <View key={key} accessibilityRole="none">
            {item.href || onSelect ? (
              <Press accessibilityRole={item.href ? "link" : "button"} accessibilityLabel={label} onPress={press} squash={0.99} style={row}>
                {body}
              </Press>
            ) : (
              <View accessible accessibilityLabel={label} style={row}>
                {body}
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}
