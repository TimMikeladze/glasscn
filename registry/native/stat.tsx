import * as React from "react"
import { I18nManager, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react-native"

import { Glass } from "@/components/glass/native/glass"
import { alpha, GText, useUI, type GTextProps } from "@/components/glass/native/ui"

type StatVariantProps = {
  /** A fill tile inside a card, or material glass standing alone. Defaults to glass when `intensity`, `tint` or `elevation` is set. */
  variant?: "fill" | "glass"
  /** Material thickness: subtle (quiet), default, strong. */
  intensity?: "default" | "strong" | "subtle"
  tint?: "none" | "primary" | "destructive"
  elevation?: "raised" | "flat"
}

/**
 * A figure on a tile.
 *
 *   <Stat>
 *     <StatIcon><Flame /></StatIcon>
 *     <StatValue>12</StatValue>
 *     <StatLabel>Night chain</StatLabel>
 *     <StatTrend direction="up">+3</StatTrend>
 *   </Stat>
 *
 * By default a tile is a fill — content inside a card isn't another pane.
 * Standing alone on the ground, make it glass: `variant="glass"` (or pass
 * `intensity`, `tint` or `elevation`), which is material glass, never liquid.
 */
export function Stat({ variant, intensity, tint, elevation, style, ...props }: Omit<ViewProps, "style"> & StatVariantProps & { style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  const v = variant ?? (intensity || tint || elevation ? "glass" : "fill")
  const box: ViewStyle = { minWidth: 0, flexDirection: "column", gap: 8, padding: ui.pad.sm }
  if (v === "fill") return <View style={[box, { borderRadius: Math.max(0, ui.radius.surface - 10), backgroundColor: ui.fill }, style]} {...props} />
  const wash = tint === "primary" ? alpha(ui.primary, 0.3) : tint === "destructive" ? alpha(ui.destructive, 0.3) : undefined
  return <Glass variant="material" intensity={intensity ?? "default"} radius={ui.radius.surface - 6} tint={wash} raised={elevation !== "flat"} style={[box, style]} {...props} />
}

/** The tile's icon: muted and 16px unless the icon sets its own. `color` replaces the web's text colour class. */
export function StatIcon({ color, children, style, ...props }: Omit<ViewProps, "style"> & { color?: string; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  const tone = color ?? ui.mutedForeground
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[{ flexDirection: "row" }, style]} {...props}>
      {React.Children.map(children, (child) =>
        React.isValidElement<{ color?: string; size?: number }>(child) ? React.cloneElement(child, { color: child.props.color ?? tone, size: child.props.size ?? 16 }) : child
      )}
    </View>
  )
}

/** The figure, in the display face. */
export function StatValue({ style, ...props }: GTextProps) {
  return <GText font="display" size="3xl" numberOfLines={1} style={[{ fontVariant: ["tabular-nums"] }, style]} {...props} />
}

/** What the figure counts. */
export function StatLabel({ style, ...props }: GTextProps) {
  return <GText size="sm" tone="muted" numberOfLines={1} style={style} {...props} />
}

/** Context for the figure — "vs last week", "of 10,000". */
export function StatDescription(props: GTextProps) {
  return <GText size="xs" tone="muted" {...props} />
}

/** A slot for a small chart under the figure (a Sparkline); it fills the tile's width. */
export function StatChart({ style, ...props }: ViewProps) {
  return <View style={[{ marginHorizontal: -4, marginTop: "auto", minWidth: 0 }, style]} {...props} />
}

/** A tile's placeholder while its figure loads: label, value and trend bars. */
export function StatSkeleton({ style, ...props }: Omit<ViewProps, "style" | "children"> & { style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel="Loading" aria-busy style={[{ minWidth: 0, gap: 8, padding: ui.pad.sm, borderRadius: Math.max(0, ui.radius.surface - 10), backgroundColor: ui.fill }, style]} {...props}>
      {[
        [12, "50%"],
        [28, "66%"],
        [16, "25%"],
      ].map(([h, w], i) => (
        <View key={i} style={{ height: h as number, width: w as `${number}%`, borderRadius: ui.radius.badge, backgroundColor: ui.fillStrong }} />
      ))}
    </View>
  )
}

/**
 * A figure in compact notation for `locale` (12.4K, 3.1M) — what fits a tile.
 * Pass Intl options to change the unit (`{ style: "currency", currency: "USD" }`).
 */
export function formatStat(value: number, { locale, compact = true, ...options }: Intl.NumberFormatOptions & { locale?: string; compact?: boolean } = {}) {
  if (!Number.isFinite(value)) return "–"
  return new Intl.NumberFormat(locale, compact ? { notation: "compact", maximumFractionDigits: 1, ...options } : options).format(value)
}

export type TrendDirection = "up" | "down" | "flat"
export type TrendSentiment = "positive" | "negative" | "neutral"
const SENTIMENT: Record<TrendDirection, TrendSentiment> = { up: "positive", down: "negative", flat: "neutral" }
const SPOKEN: Record<TrendDirection, string> = { up: "Increased", down: "Decreased", flat: "Unchanged" }
const ICON = { up: ArrowUpRight, down: ArrowDownRight, flat: ArrowRight }

/**
 * A change, as an arrow and a figure. `direction` is which way it moved;
 * `sentiment` is whether that's good — up is positive by default, but latency
 * going up isn't: `<StatTrend direction="up" sentiment="negative">`.
 */
export function StatTrend({
  direction = "up",
  sentiment,
  srLabel,
  children,
  style,
  ...props
}: Omit<ViewProps, "style"> & {
  direction?: TrendDirection
  /** Colour: positive (success), negative (destructive), neutral. Defaults from `direction`. */
  sentiment?: TrendSentiment
  /** Read before the figure by screen readers. Defaults to "Increased" / "Decreased" / "Unchanged". */
  srLabel?: string
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const feel = sentiment ?? SENTIMENT[direction]
  const tone = feel === "positive" ? ui.success : feel === "negative" ? ui.destructive : ui.mutedForeground
  const Icon = ICON[direction]
  const text = typeof children === "string" || typeof children === "number" ? String(children) : null
  return (
    <View
      accessible={text !== null}
      accessibilityLabel={text !== null ? `${srLabel ?? SPOKEN[direction]} ${text}` : undefined}
      style={[
        {
          flexDirection: "row",
          alignSelf: "flex-start",
          alignItems: "center",
          gap: 2,
          borderRadius: ui.radius.badge,
          paddingHorizontal: 6,
          paddingVertical: 2,
          backgroundColor: feel === "neutral" ? ui.fill : alpha(tone, feel === "negative" ? 0.12 : 0.14),
        },
        style,
      ]}
      {...props}
    >
      <View style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
        <Icon size={12} color={tone} />
      </View>
      {text !== null ? (
        <GText size="xs" weight="600" color={tone} style={{ fontVariant: ["tabular-nums"] }}>
          {text}
        </GText>
      ) : (
        children
      )}
    </View>
  )
}
