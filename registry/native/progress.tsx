import * as React from "react"
import { Animated, Easing, View, type StyleProp, type ViewStyle } from "react-native"
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg"

import { useReduceMotion } from "@/components/glass/native/segmented-control"
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
  const [fill] = React.useState(() => new Animated.Value(pct))
  const reduce = useReduceMotion()
  const id = React.useId().replace(/:/g, "")

  React.useEffect(() => {
    if (reduce.current) fill.setValue(pct)
    else Animated.timing(fill, { toValue: pct, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start()
  }, [pct, fill, reduce])

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={value == null ? undefined : { min: 0, max, now: value }}
      style={[{ width: "100%", height: 10, borderRadius: 999, overflow: "hidden", backgroundColor: ui.fill }, style]}
    >
      <Animated.View style={{ height: "100%", borderRadius: 999, overflow: "hidden", width: fill.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) }}>
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
