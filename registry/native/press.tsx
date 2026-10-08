import * as React from "react"
import { Animated, Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from "react-native"
import * as Haptics from "expo-haptics"

const APressable = Animated.createAnimatedComponent(Pressable)

/**
 * Every tappable thing: a soft spring squash, a slight dim, a selection haptic
 * when asked, and a hover lift for pointers. Takes a plain style (Animated drops
 * Pressable's function-style form).
 */
export function Press({
  haptic = false,
  squash = 0.97,
  hover = 1,
  style,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: Omit<PressableProps, "style"> & { haptic?: boolean; squash?: number; hover?: number; style?: StyleProp<ViewStyle> }) {
  const [scale] = React.useState(() => new Animated.Value(1))
  const [opacity] = React.useState(() => new Animated.Value(1))
  const spring = (v: Animated.Value, toValue: number) => Animated.spring(v, { toValue, friction: 8, tension: 380, useNativeDriver: true }).start()
  return (
    <APressable
      disabled={disabled}
      onPressIn={(e: GestureResponderEvent) => {
        if (haptic && !disabled) Haptics.selectionAsync().catch(() => {})
        spring(scale, squash)
        Animated.timing(opacity, { toValue: 0.72, duration: 80, useNativeDriver: true }).start()
        onPressIn?.(e)
      }}
      onPressOut={(e: GestureResponderEvent) => {
        spring(scale, 1)
        Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start()
        onPressOut?.(e)
      }}
      onHoverIn={() => hover !== 1 && !disabled && spring(scale, hover)}
      onHoverOut={() => hover !== 1 && spring(scale, 1)}
      style={[style, { transform: [{ scale }], opacity }]}
      {...props}
    />
  )
}
