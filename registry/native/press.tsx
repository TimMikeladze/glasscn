import * as React from "react"
import { Platform, Pressable, StyleSheet, type GestureResponderEvent, type PressableProps, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated"
import * as Haptics from "expo-haptics"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { useUI } from "@/components/glass/native/ui"

const APressable = Animated.createAnimatedComponent(Pressable)

// ---- haptics: one switch for the app, no-op on the web ----

let hapticsOn = true
/** Turn every glasscn haptic off (e.g. from a settings screen). */
export function setHapticsEnabled(on: boolean) {
  hapticsOn = on
}
const can = () => hapticsOn && Platform.OS !== "web"

/** Typed haptics (NAT-20): selection changes, impacts, notifications. Never on scroll or press-in. */
export const haptics = {
  selection: () => can() && Haptics.selectionAsync().catch(() => {}),
  impact: (style: "light" | "medium" | "heavy" | "soft" | "rigid" = "light") =>
    can() && Haptics.impactAsync({ light: Haptics.ImpactFeedbackStyle.Light, medium: Haptics.ImpactFeedbackStyle.Medium, heavy: Haptics.ImpactFeedbackStyle.Heavy, soft: Haptics.ImpactFeedbackStyle.Soft, rigid: Haptics.ImpactFeedbackStyle.Rigid }[style]).catch(() => {}),
  notify: (type: "success" | "warning" | "error") =>
    can() && Haptics.notificationAsync({ success: Haptics.NotificationFeedbackType.Success, warning: Haptics.NotificationFeedbackType.Warning, error: Haptics.NotificationFeedbackType.Error }[type]).catch(() => {}),
}
export const useHaptics = () => haptics

export type PressProps = Omit<PressableProps, "style"> & {
  /** A selection haptic when the press lands (not on press-in, so scrolls never buzz). */
  haptic?: boolean
  /** Solid press squash; defaults to the theme's `pressScale`. */
  squash?: number
  /** Hover lift for pointers (web, iPad). */
  hover?: number
  /** Liquid glass grows on press (`pressGrow`) instead of squashing. */
  liquid?: boolean
  /**
   * Dim on press. Off by default; pass `dim={canFade()}` only when the Press doesn't
   * wrap Liquid Glass — glass stops rendering under a fading ancestor on iOS 26.
   */
  dim?: boolean
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
}

/**
 * Every tappable thing: an elastic spring press (solid squashes wider-and-shorter,
 * liquid grows), an optional dim, a selection haptic when asked, and a hover lift.
 * Reanimated on the UI thread; none of it under Reduce Motion.
 */
export function Press({ haptic = false, squash, hover = 1, liquid = false, dim = false, style, onPress, onPressIn, onPressOut, onHoverIn, onHoverOut, disabled, accessibilityRole = "button", ...props }: PressProps) {
  const ui = useUI()
  const still = useReducedMotion() || ui.motion.duration === 0
  const sx = useSharedValue(1)
  const sy = useSharedValue(1)
  const fade = useSharedValue(1)
  const [pressed, setPressed] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const spring = ui.motion.springConfig

  const to = (x: number, y: number) => {
    if (still) return
    sx.set(withSpring(x, spring))
    sy.set(withSpring(y, spring))
  }
  const down = () => {
    if (liquid) to(ui.motion.pressGrow, ui.motion.pressGrow)
    else {
      const s = squash ?? ui.motion.pressScale
      const k = ui.motion.pressStretch
      to(s * (1 + k), s * (1 - k))
    }
    if (dim) fade.set(withTiming(0.72, { duration: 80 }))
  }
  const up = () => {
    to(hovered ? hover : 1, hovered ? hover : 1)
    if (dim) fade.set(withTiming(1, { duration: 160 }))
  }

  const resolved = typeof style === "function" ? style({ pressed, hovered }) : style
  // a caller's resting opacity (a disabled dim) composes with the press dim
  const flat = StyleSheet.flatten(resolved)?.opacity
  const resting = typeof flat === "number" ? flat : 1
  const animated = useAnimatedStyle(() => (dim ? { transform: [{ scaleX: sx.value }, { scaleY: sy.value }], opacity: fade.value * resting } : { transform: [{ scaleX: sx.value }, { scaleY: sy.value }] }))

  return (
    <APressable
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      aria-disabled={disabled || undefined}
      onPress={(e: GestureResponderEvent) => {
        if (haptic && !disabled) haptics.selection()
        onPress?.(e)
      }}
      onPressIn={(e: GestureResponderEvent) => {
        setPressed(true)
        down()
        onPressIn?.(e)
      }}
      onPressOut={(e: GestureResponderEvent) => {
        setPressed(false)
        up()
        onPressOut?.(e)
      }}
      onHoverIn={(e) => {
        setHovered(true)
        if (hover !== 1 && !disabled) to(hover, hover)
        onHoverIn?.(e)
      }}
      onHoverOut={(e) => {
        setHovered(false)
        if (hover !== 1) to(1, 1)
        onHoverOut?.(e)
      }}
      style={[resolved, animated]}
      {...props}
    />
  )
}
