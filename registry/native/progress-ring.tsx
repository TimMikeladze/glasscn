import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated"
import Svg, { Circle } from "react-native-svg"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { ringArc } from "@/components/glass/native/chart-math"
import { alpha, GText, useUI } from "@/components/glass/native/ui"

const ACircle = Animated.createAnimatedComponent(Circle)

/** A dash offset that draws in from `from` on mount, then eases to each new `to` — on the UI thread. */
function useDash(to: number, from: number, still: boolean, duration: number) {
  const v = useSharedValue(still ? to : from)
  const first = React.useRef(true)
  React.useEffect(() => {
    v.set(still ? to : withTiming(to, { duration: first.current ? duration * 5 : duration * 4, easing: Easing.bezier(0.16, 1, 0.3, 1) }))
    first.current = false
  }, [v, to, still, duration])
  return useAnimatedProps(() => ({ strokeDashoffset: v.value }))
}

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
  accessibilityLabel,
  ...props
}: Omit<ViewProps, "style"> & { value: number; size?: number; stroke?: number; color?: string; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  const tone = color ?? ui.primary
  const sw = stroke ?? Math.max(3, size * 0.075)
  const r = size / 2 - sw / 2
  const { circumference, offset } = ringArc(r, Math.min(1, value))
  const dash = useDash(offset, circumference, useReducedMotion() || ui.motion.duration === 0, ui.motion.duration)
  const now = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now }}
      accessibilityLabel={accessibilityLabel ?? `Progress ${now}%`}
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
            animatedProps={dash}
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
