import * as React from "react"
import { Animated, Pressable, StyleSheet, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from "react-native"
import * as Haptics from "expo-haptics"

const APressable = Animated.createAnimatedComponent(Pressable)

export type PressProps = Omit<PressableProps, "style"> & {
  haptic?: boolean
  squash?: number
  hover?: number
  /**
   * Dim on press (default). Pass `dim={canFade()}` when the Press wraps `<Glass>`:
   * Liquid Glass stops rendering under a fading ancestor, so on iOS 26 it gets
   * the squash and its own interactive response instead.
   */
  dim?: boolean
  style?: StyleProp<ViewStyle>
}

/**
 * Every tappable thing: a soft spring squash, a slight dim, a selection haptic
 * when asked, and a hover lift for pointers. Takes a plain style (Animated drops
 * Pressable's function-style form).
 */
export function Press({ haptic = false, squash = 0.97, hover = 1, dim = true, style, onPressIn, onPressOut, disabled, ...props }: PressProps) {
  const [scale] = React.useState(() => new Animated.Value(1))
  const [opacity] = React.useState(() => new Animated.Value(1))
  // the caller's opacity (a disabled dim) composes with the press dim instead of being replaced by it
  const base = StyleSheet.flatten(style)?.opacity
  const resting = typeof base === "number" ? base : 1
  const shown = React.useMemo(() => (resting === 1 ? opacity : Animated.multiply(opacity, resting)), [opacity, resting])
  const spring = (v: Animated.Value, toValue: number) => Animated.spring(v, { toValue, friction: 8, tension: 380, useNativeDriver: true }).start()
  return (
    <APressable
      disabled={disabled}
      onPressIn={(e: GestureResponderEvent) => {
        if (haptic && !disabled) Haptics.selectionAsync().catch(() => {})
        spring(scale, squash)
        if (dim) Animated.timing(opacity, { toValue: 0.72, duration: 80, useNativeDriver: true }).start()
        onPressIn?.(e)
      }}
      onPressOut={(e: GestureResponderEvent) => {
        spring(scale, 1)
        if (dim) Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start()
        onPressOut?.(e)
      }}
      onHoverIn={() => hover !== 1 && !disabled && spring(scale, hover)}
      onHoverOut={() => hover !== 1 && spring(scale, 1)}
      // not dimming: no animated opacity at all, so nothing fades the glass inside
      style={[style, dim ? { transform: [{ scale }], opacity: shown } : { transform: [{ scale }] }]}
      {...props}
    />
  )
}
