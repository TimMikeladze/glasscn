import * as React from "react"
import { AccessibilityInfo, Animated, Easing, Platform, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import Svg, { Circle } from "react-native-svg"

import { ringArc, ringRadii } from "@/components/glass/native/chart-math"
import { useUI } from "@/components/glass/native/ui"

// Animated sets collapsable={false}, which react-native-svg would pass to the DOM on web — strip it.
const ACircle = Animated.createAnimatedComponent(({ collapsable, ...p }: React.ComponentProps<typeof Circle> & { collapsable?: boolean }) => {
  void collapsable
  return <Circle {...p} />
})
const ease = Easing.bezier(0.16, 1, 0.3, 1)

export interface ActivityRing {
  /** Progress, 0–1. Above 1 draws a second lap, like Apple's rings. */
  value: number
  /** Any colour. Defaults to the first three chart colours in order. */
  color?: string
  label?: string
}

/** A dash offset that sweeps in from `from` on mount and eases to each new `to`. */
function useSweep(from: number, to: number, duration: number, delay: number) {
  const [v] = React.useState(() => new Animated.Value(from))
  React.useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (reduce) return v.setValue(to)
        anim = Animated.timing(v, { toValue: to, duration, delay, easing: ease, useNativeDriver: Platform.OS !== "web" })
        anim.start()
      })
    return () => anim?.stop()
  }, [v, to, duration, delay])
  return v
}

function Arc({ c, r, color, stroke, offset, circumference, delay, opacity }: { c: number; r: number; color: string; stroke: number; offset: number; circumference: number; delay: number; opacity?: number }) {
  const dash = useSweep(circumference, offset, 1200, delay)
  return (
    <ACircle
      cx={c}
      cy={c}
      r={r}
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeDasharray={`${circumference} ${circumference}`}
      strokeDashoffset={dash}
      opacity={opacity}
    />
  )
}

/**
 * Concentric Activity-style rings. Each arc sweeps in from twelve o'clock on
 * mount and eases to new values; past 1 a second lap draws over the first.
 */
export function ActivityRings({
  rings,
  size = 160,
  stroke = 16,
  gap = 4,
  style,
  accessibilityLabel,
  ...props
}: Omit<ViewProps, "children" | "style"> & { rings: ActivityRing[]; size?: number; stroke?: number; gap?: number; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  const radii = ringRadii(size, stroke, gap, rings.length)
  const label = rings.map((r, i) => `${r.label ?? `Ring ${i + 1}`}: ${Math.round(r.value * 100)}%`).join(", ")
  const c = size / 2
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? label}
      // twelve o'clock start: rotate the wrapper, not an svg group (invalid DOM props on web)
      style={[{ width: size, height: size, flexShrink: 0, transform: [{ rotate: "-90deg" }] }, style]}
      {...props}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {radii.map((r, i) => {
          const ring = rings[i]
          const color = ring.color ?? ui.charts[i % 3]
          const { circumference, offset, lapOffset } = ringArc(r, ring.value)
          return (
            <React.Fragment key={i}>
              <Circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeOpacity={0.2} strokeWidth={stroke} />
              {ring.value > 0.001 ? <Arc c={c} r={r} color={color} stroke={stroke} offset={offset} circumference={circumference} delay={0} /> : null}
              {lapOffset !== null ? <Arc c={c} r={r} color={color} stroke={stroke} offset={lapOffset} circumference={circumference} delay={900} opacity={0.85} /> : null}
            </React.Fragment>
          )
        })}
      </Svg>
    </View>
  )
}
