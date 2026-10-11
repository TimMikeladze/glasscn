import * as React from "react"
import { View, type StyleProp, type ViewStyle } from "react-native"
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { useUI } from "@/components/glass/native/ui"

type ProgressProps = {
  value?: number | null
  max?: number
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

/** A capsule bar whose fill runs from the second chart colour into the accent. */
export function Progress({ value, max = 100, accessibilityLabel, testID, style }: ProgressProps) {
  const ui = useUI()
  const pct = Math.min(100, Math.max(0, ((value ?? 0) / (max || 100)) * 100))
  const still = useReducedMotion() || ui.motion.duration === 0
  const fill = useSharedValue(pct)
  // React 19 ids carry «» / _r_ — keep only id-safe characters
  const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, "")

  React.useEffect(() => {
    fill.set(still ? pct : withTiming(pct, { duration: ui.motion.duration * 3.5, easing: Easing.out(Easing.cubic) }))
  }, [pct, fill, still, ui.motion.duration])
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value}%` }))

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={value == null ? undefined : { min: 0, max, now: value }}
      style={[{ width: "100%", height: 10, borderRadius: 999, overflow: "hidden", backgroundColor: ui.fill }, style]}
    >
      <Animated.View style={[{ height: "100%", borderRadius: 999, overflow: "hidden" }, fillStyle]}>
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={ui.charts[1]} />
              <Stop offset="1" stopColor={ui.primary} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
      </Animated.View>
    </View>
  )
}
