import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { ArrowDownRight, ArrowUpRight } from "lucide-react-native"

import { Glass } from "@/components/glass/native/glass"
import { alpha, GText, useUI, type GTextProps } from "@/components/glass/native/ui"

type StatVariantProps = {
  /** Kept for parity with the web variants; the native surface has one frost. */
  intensity?: "default" | "strong" | "subtle"
  tint?: "none" | "primary" | "destructive"
  elevation?: "raised" | "flat"
}

/**
 * A figure on a glass tile.
 *
 *   <Stat>
 *     <StatIcon><Flame /></StatIcon>
 *     <StatValue>12</StatValue>
 *     <StatLabel>Night chain</StatLabel>
 *     <StatTrend direction="up">+3</StatTrend>
 *   </Stat>
 */
export function Stat({ intensity, tint = "none", elevation = "raised", style, ...props }: Omit<ViewProps, "style"> & StatVariantProps & { style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  void intensity // one frost natively; kept for the web API
  const wash = tint === "primary" ? alpha(ui.primary, 0.3) : tint === "destructive" ? alpha(ui.destructive, 0.3) : undefined
  return <Glass radius={ui.radius.surface - 6} tint={wash} raised={elevation === "raised"} style={[{ minWidth: 0, flexDirection: "column", gap: 8, padding: ui.pad.default }, style]} {...props} />
}

/** The tile's icon: muted and 16px unless the icon sets its own. `color` replaces the web's text colour class. */
export function StatIcon({ color, children, style, ...props }: Omit<ViewProps, "style"> & { color?: string; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  const tone = color ?? ui.mutedForeground
  return (
    <View style={[{ flexDirection: "row" }, style]} {...props}>
      {React.Children.map(children, (child) =>
        React.isValidElement<{ color?: string; size?: number }>(child) ? React.cloneElement(child, { color: child.props.color ?? tone, size: child.props.size ?? 16 }) : child
      )}
    </View>
  )
}

/** The figure, in the display face. */
export function StatValue({ style, ...props }: GTextProps) {
  return <GText font="display" size="3xl" numberOfLines={1} style={style} {...props} />
}

/** What the figure counts. */
export function StatLabel({ style, ...props }: GTextProps) {
  return <GText size="sm" tone="muted" numberOfLines={1} style={style} {...props} />
}

/** A change badge: up in the accent, down in red. */
export function StatTrend({ direction = "up", children, style, ...props }: Omit<ViewProps, "style"> & { direction?: "up" | "down"; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  const tone = direction === "down" ? ui.destructive : ui.primary
  const Arrow = direction === "up" ? ArrowUpRight : ArrowDownRight
  return (
    <View
      accessibilityLabel={typeof children === "string" ? `${direction === "up" ? "Up" : "Down"} ${children}` : undefined}
      style={[
        { flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 2, borderRadius: ui.radius.badge, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: alpha(tone, direction === "down" ? 0.12 : 0.14) },
        style,
      ]}
      {...props}
    >
      <Arrow size={12} color={tone} />
      {typeof children === "string" || typeof children === "number" ? (
        <GText size="xs" weight="600" color={tone} style={{ fontVariant: ["tabular-nums"] }}>
          {children}
        </GText>
      ) : (
        children
      )}
    </View>
  )
}
