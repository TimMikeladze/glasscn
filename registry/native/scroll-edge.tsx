import * as React from "react"
import { type NativeScrollEvent, type NativeSyntheticEvent, type ViewProps } from "react-native"
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg"
import Animated, { runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { useUI } from "@/components/glass/native/ui"

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

// Opacity stops from the bar's edge (0) inward (1). Every variant fades to nothing at its inner
// end, so no edge cuts through a line of text. `automatic` holds near-uniform under a top bar
// (the 27 toolbar region) and fades sooner behind a floating bottom bar; `hard` keeps a firm
// strip with only a short feather.
const STOPS = {
  automatic: { top: [[0, 0.9], [0.6, 0.82], [1, 0]], bottom: [[0, 0.82], [0.45, 0.5], [1, 0]] },
  soft: { top: [[0, 0.6], [1, 0]], bottom: [[0, 0.6], [1, 0]] },
  hard: { top: [[0, 1], [0.85, 1], [1, 0]], bottom: [[0, 1], [0.85, 1], [1, 0]] },
} as const

/**
 * A diffuse region behind bars, so content scrolling under them stays out of the way of their
 * labels. `automatic` approximates the 27 treatment: near-uniform under a top bar, a shorter fade
 * behind a floating bottom bar. `soft` is a plain fade; `hard` a firm strip. System navigation
 * draws its own effect; this is the React Native approximation.
 * Absolutely positioned at the edge of its parent; show it with `visible` (e.g. `overTop` from
 * useScrollEdges) or drive it from a scroll value with `progress` (0 → 1). Never a parent of
 * glass, so fading it is safe.
 */
export function ScrollEdge({
  edge = "top",
  variant = "automatic",
  visible = true,
  progress,
  size = 80,
  style,
  ...props
}: ViewProps & { edge?: "top" | "bottom"; variant?: "automatic" | "soft" | "hard"; visible?: boolean; progress?: SharedValue<number>; size?: number }) {
  const ui = useUI()
  const reduced = useReducedMotion() || ui.motion.duration === 0
  const id = React.useId().replace(/:/g, "")
  const shown = useSharedValue(visible ? 1 : 0)
  React.useEffect(() => {
    shown.set(reduced ? (visible ? 1 : 0) : withTiming(visible ? 1 : 0, { duration: ui.motion.duration }))
  }, [visible, shown, ui.motion.duration, reduced])
  const fade = useAnimatedStyle(() => ({ opacity: progress ? Math.min(1, Math.max(0, progress.value)) : shown.value }))
  const stops = STOPS[variant][edge]
  return (
    <Animated.View
      pointerEvents="none"
      aria-hidden
      style={[{ position: "absolute", left: 0, right: 0, [edge]: 0, height: size }, fade, style]}
      {...props}
    >
      <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0,0,100,100">
        <Defs>
          <LinearGradient id={`edge-${id}`} x1="0" y1={edge === "top" ? "0" : "1"} x2="0" y2={edge === "top" ? "1" : "0"}>
            {stops.map(([offset, opacity]) => <Stop key={offset} offset={offset} stopColor={ui.glassSolid} stopOpacity={opacity} />)}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill={`url(#edge-${id})`} />
      </Svg>
    </Animated.View>
  )
}
