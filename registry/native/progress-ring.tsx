import * as React from "react"
import { AccessibilityInfo, Animated, Easing, Platform, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import Svg, { Circle } from "react-native-svg"

import { ringArc } from "@/components/glass/native/chart-math"
import { alpha, GText, useUI } from "@/components/glass/native/ui"

// Animated sets collapsable={false}, which react-native-svg would pass to the DOM on web — strip it.
const ACircle = Animated.createAnimatedComponent(({ collapsable, ...p }: React.ComponentProps<typeof Circle> & { collapsable?: boolean }) => {
  void collapsable
  return <Circle {...p} />
})

/**
 * One ring that closes around its content — a goal, a countdown, a seal.
 * `value` 0–1; the arc draws in on mount and eases to new values.
 */
export function ProgressRing({
  value,
  size = 72,
  stroke,
  color,
  style,
  children,
  ...props
}: Omit<ViewProps, "style"> & { value: number; size?: number; stroke?: number; color?: string; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  const tone = color ?? ui.primary
  const sw = stroke ?? Math.max(3, size * 0.075)
  const r = size / 2 - sw / 2
  const { circumference, offset } = ringArc(r, Math.min(1, value))
  const [dash] = React.useState(() => new Animated.Value(circumference))
  React.useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (reduce) return dash.setValue(offset)
        anim = Animated.timing(dash, { toValue: offset, duration: 1000, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: Platform.OS !== "web" })
        anim.start()
      })
    return () => anim?.stop()
  }, [dash, offset])
  const now = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now }}
      style={[{ width: size, height: size, flexShrink: 0, alignItems: "center", justifyContent: "center" }, style]}
      {...props}
    >
      <View style={{ position: "absolute", top: 0, left: 0, width: size, height: size, transform: [{ rotate: "-90deg" }] }} pointerEvents="none">
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle cx={size / 2} cy={size / 2} r={r} fill={alpha(tone, 0.12)} stroke={tone} strokeOpacity={0.2} strokeWidth={sw} />
          <ACircle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={tone}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dash}
          />
        </Svg>
      </View>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        {typeof children === "string" || typeof children === "number" ? (
          <GText font="display" color={tone} size={size >= 96 ? "xl" : "base"}>
            {children}
          </GText>
        ) : (
          children
        )}
      </View>
    </View>
  )
}
