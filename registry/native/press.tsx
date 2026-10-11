import * as React from "react"
import { Platform, Pressable, StyleSheet, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from "react-native"
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

/** Pressable's style-callback state, with hover (RN's own type lacks it in some versions). */
export type PressState = { pressed: boolean; hovered?: boolean }

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
  style?: StyleProp<ViewStyle> | ((state: PressState) => StyleProp<ViewStyle>)
  /**
   * Radix's `asChild`: render the single child (a Button, a custom pressable) instead of a
   * Press of its own, merging onPress / onLongPress and accessibility props into it — so a
   * trigger wrapping a Button doesn't nest two pressables (the inner one would swallow the tap).
   */
  asChild?: boolean
}

type Pressish = { onPress?: (e: GestureResponderEvent) => void; onLongPress?: (e: GestureResponderEvent) => void; style?: unknown }
const chain =
  <E,>(a?: (e: E) => void, b?: (e: E) => void) =>
  (e: E) => {
    a?.(e)
    b?.(e)
  }

/**
 * Every tappable thing: an elastic spring press (solid squashes wider-and-shorter,
 * liquid grows), an optional dim, a selection haptic when asked, and a hover lift.
 * Reanimated on the UI thread; none of it under Reduce Motion.
 */
export function Press(props: PressProps) {
  // triggers map string children into text first, so the single child may arrive in an array
  const only = props.asChild && typeof props.children !== "function" ? React.Children.toArray(props.children) : []
  if (only.length === 1 && React.isValidElement<Pressish>(only[0])) return <PressSlot {...props}>{only[0]}</PressSlot>
  return <PressView {...props} />
}

function PressSlot({ children, onPress, onLongPress, haptic, style, asChild: _a, squash: _s, hover: _h, liquid: _l, dim: _d, ...rest }: PressProps) {
  const child = children as React.ReactElement<Pressish>
  const own = typeof style === "function" ? style({ pressed: false, hovered: false }) : style
  return React.cloneElement(child, {
    // accessibility and state props from the trigger (aria-expanded, aria-haspopup…), the child's own win
    ...(rest as object),
    ...child.props,
    onPress: chain<GestureResponderEvent>(child.props.onPress, (e) => {
      if (haptic) haptics.selection()
      onPress?.(e)
    }),
    onLongPress: onLongPress || child.props.onLongPress ? chain(child.props.onLongPress, onLongPress ?? undefined) : undefined,
    style: own ? [own, child.props.style as StyleProp<ViewStyle>] : child.props.style,
  })
}

function PressView({ haptic = false, squash, hover = 1, liquid = false, dim = false, style, onPress, onPressIn, onPressOut, onHoverIn, onHoverOut, disabled, accessibilityRole = "button", asChild: _asChild, ...props }: PressProps) {
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
