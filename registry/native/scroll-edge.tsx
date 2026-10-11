import * as React from "react"
import { View, type NativeScrollEvent, type NativeSyntheticEvent, type ViewProps } from "react-native"
import Animated, { runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated"

import { alpha, useUI } from "@/components/glass/native/ui"

/** The next minimized state from one scroll step (same rule as the web). */
export function nextMinimized(prev: boolean, from: number, to: number, { threshold = 8, offset = 48 } = {}) {
  "worklet"
  if (to <= offset) return false
  const delta = to - from
  if (delta > threshold) return true
  if (delta < -threshold) return false
  return prev
}

export type ScrollEdges = {
  /** Scrolling down (the bars fold); false at the top and when scrolling back up. */
  minimized: boolean
  /** Content under the top / bottom bar. */
  overTop: boolean
  overBottom: boolean
  /** The live offset on the UI thread — NavigationBar and custom bars animate from it. */
  scrollY: SharedValue<number>
  /** For a plain ScrollView / FlatList (`scrollEventThrottle={16}`). */
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
  /** For a Reanimated `Animated.ScrollView` / `Animated.FlatList`: runs on the UI thread. */
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>
}

/**
 * Scroll awareness for the bars: pass `onScroll` to your ScrollView (or
 * `scrollHandler` to an `Animated.ScrollView`), then read `minimized` (scrolling
 * down), `overTop` / `overBottom` and the `scrollY` shared value. Put the result in
 * `<ScrollEdgeProvider value={edges}>` and Dock / Toolbar (`minimizeBehavior="onScrollDown"`)
 * and NavigationBar follow it without props.
 */
export function useScrollEdges(): ScrollEdges {
  const scrollY = useSharedValue(0)
  const last = useSharedValue(0)
  const flags = useSharedValue({ minimized: false, overTop: false, overBottom: false })
  const [state, setState] = React.useState(flags.value)

  const step = React.useCallback(
    (y: number, height: number, content: number) => {
      "worklet"
      scrollY.set(y)
      const prev = flags.value
      const minimized = nextMinimized(prev.minimized, last.value, y)
      if (minimized !== prev.minimized || Math.abs(y - last.value) > 8) last.set(y)
      const overTop = y > 0
      const overBottom = y + height < content - 1
      if (minimized === prev.minimized && overTop === prev.overTop && overBottom === prev.overBottom) return
      const next = { minimized, overTop, overBottom }
      flags.set(next)
      runOnJS(setState)(next)
    },
    [scrollY, last, flags]
  )

  const scrollHandler = useAnimatedScrollHandler((e) => step(e.contentOffset.y, e.layoutMeasurement.height, e.contentSize.height))
  const onScroll = React.useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent
      // the same worklet, run on the JS thread (runOnJS inside is a plain call here)
      const y = contentOffset.y
      scrollY.set(y)
      const prev = flags.value
      const minimized = nextMinimized(prev.minimized, last.value, y)
      if (minimized !== prev.minimized || Math.abs(y - last.value) > 8) last.set(y)
      const next = { minimized, overTop: y > 0, overBottom: y + layoutMeasurement.height < contentSize.height - 1 }
      if (next.minimized === prev.minimized && next.overTop === prev.overTop && next.overBottom === prev.overBottom) return
      flags.set(next)
      setState(next)
    },
    [scrollY, last, flags]
  )
  return { ...state, scrollY, onScroll, scrollHandler }
}

const ScrollEdgeContext = React.createContext<ScrollEdges | null>(null)

/** Shares one screen's scroll state with the bars inside it (Dock, Toolbar, NavigationBar). */
export function ScrollEdgeProvider({ value, children }: { value: ScrollEdges; children?: React.ReactNode }) {
  return <ScrollEdgeContext.Provider value={value}>{children}</ScrollEdgeContext.Provider>
}

/** The nearest ScrollEdgeProvider's scroll state, or null. */
export function useScrollEdge() {
  return React.useContext(ScrollEdgeContext)
}

/**
 * The band that keeps a bar legible over content: `soft` fades out in steps (a
 * progressive veil), `hard` is a near-opaque strip. Absolutely positioned at the
 * edge of its parent; show it with `visible` (e.g. `overTop` from useScrollEdges)
 * or drive it from a scroll value with `progress` (0 → 1). Never a parent of glass,
 * so fading it is safe.
 */
export function ScrollEdge({
  edge = "top",
  variant = "soft",
  visible = true,
  progress,
  size = 80,
  style,
  ...props
}: ViewProps & { edge?: "top" | "bottom"; variant?: "soft" | "hard"; visible?: boolean; progress?: SharedValue<number>; size?: number }) {
  const ui = useUI()
  const base = ui.scheme === "dark" ? "#000000" : "#FFFFFF"
  const steps = variant === "hard" ? [0.88] : [0.55, 0.4, 0.26, 0.14, 0.05]
  const shown = useSharedValue(visible ? 1 : 0)
  React.useEffect(() => {
    shown.set(withTiming(visible ? 1 : 0, { duration: ui.motion.duration }))
  }, [visible, shown, ui.motion.duration])
  const fade = useAnimatedStyle(() => ({ opacity: progress ? Math.min(1, Math.max(0, progress.value)) : shown.value }))
  return (
    <Animated.View
      pointerEvents="none"
      aria-hidden
      style={[{ position: "absolute", left: 0, right: 0, [edge]: 0, height: size, flexDirection: edge === "top" ? "column" : "column-reverse" }, fade, style]}
      {...props}
    >
      {steps.map((a, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: alpha(base, a) }} />
      ))}
    </Animated.View>
  )
}
