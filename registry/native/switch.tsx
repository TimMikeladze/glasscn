import * as React from "react"
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native"
import * as Haptics from "expo-haptics"

import { useReduceMotion } from "@/components/glass/native/segmented-control"
import { useUI, web } from "@/components/glass/native/ui"

type SwitchProps = Omit<PressableProps, "style" | "children" | "onPress"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: "sm" | "default"
  style?: StyleProp<ViewStyle>
}

/** The iOS 27 switch: a wide capsule that fills with the accent and a capsule knob that springs across, stretching (a lens) while pressed. */
export function Switch({ checked, defaultChecked = false, onCheckedChange, size = "default", disabled, style, ...props }: SwitchProps) {
  const ui = useUI()
  const [inner, setInner] = React.useState(defaultChecked)
  const on = checked ?? inner
  const [pos] = React.useState(() => new Animated.Value(on ? 1 : 0))
  const reduce = useReduceMotion()
  const [press] = React.useState(() => new Animated.Value(0))
  const held = (to: number) => {
    if (reduce.current) return
    Animated.spring(press, { toValue: to, friction: 7, tension: 300, useNativeDriver: false }).start()
  }

  React.useEffect(() => {
    if (reduce.current) pos.setValue(on ? 1 : 0)
    else Animated.spring(pos, { toValue: on ? 1 : 0, friction: 9, tension: 260, useNativeDriver: false }).start()
  }, [on, pos, reduce])

  const [w, h, knobW, knob, travel] = size === "sm" ? [44, 20, 26, 16, 14] : [63, 28, 38, 24, 21]
  return (
    <Pressable
      accessibilityRole="switch"
      aria-checked={on} aria-disabled={!!disabled}
      disabled={disabled}
      onPressIn={() => held(1)}
      onPressOut={() => held(0)}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {})
        setInner(!on)
        onCheckedChange?.(!on)
      }}
      style={[{ width: w, height: h, opacity: disabled ? 0.5 : 1 }, web({ cursor: disabled ? "not-allowed" : "pointer" }), style]}
      {...props}
    >
      <Animated.View
        style={{
          flex: 1,
          padding: 2,
          borderRadius: h / 2,
          justifyContent: "center",
          backgroundColor: pos.interpolate({ inputRange: [0, 1], outputRange: [ui.fillStrong, ui.primary] }),
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            {
              width: knobW,
              height: knob,
              borderRadius: knob / 2,
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 2,
              transform: [
                { translateX: pos.interpolate({ inputRange: [0, 1], outputRange: [0, travel] }) },
                { scaleX: press.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
                { scaleY: press.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
              ],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  )
}
