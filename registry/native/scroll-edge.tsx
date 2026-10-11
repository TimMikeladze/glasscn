import * as React from "react"
import { View, type NativeScrollEvent, type NativeSyntheticEvent, type ViewProps } from "react-native"

import { alpha, useUI } from "@/components/glass/native/ui"

/** The next minimized state from one scroll step (same rule as the web). */
export function nextMinimized(prev: boolean, from: number, to: number, { threshold = 8, offset = 48 } = {}) {
  if (to <= offset) return false
  const delta = to - from
  if (delta > threshold) return true
  if (delta < -threshold) return false
  return prev
}

/**
 * Scroll awareness for the bars: pass `onScroll` to your ScrollView
 * (`scrollEventThrottle={16}`); read `minimized` (scrolling down) and
 * `overTop` / `overBottom` (content under the top / bottom bar).
 */
export function useScrollEdges() {
  const last = React.useRef(0)
  const [state, setState] = React.useState({ minimized: false, overTop: false, overBottom: false })
  const onScroll = React.useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent
    const y = contentOffset.y
    setState((prev) => {
      const minimized = nextMinimized(prev.minimized, last.current, y)
      if (minimized !== prev.minimized || Math.abs(y - last.current) > 8) last.current = y
      const overTop = y > 0
      const overBottom = y + layoutMeasurement.height < contentSize.height - 1
      return minimized === prev.minimized && overTop === prev.overTop && overBottom === prev.overBottom ? prev : { minimized, overTop, overBottom }
    })
  }, [])
  return { ...state, onScroll }
}

/**
 * The band that keeps a bar legible over content: `soft` fades out in steps (a
 * progressive veil), `hard` is a near-opaque strip. Absolutely positioned at the
 * edge of its parent; show it with `visible` (e.g. `overTop` from useScrollEdges).
 */
export function ScrollEdge({ edge = "top", variant = "soft", visible = true, size = 80, style, ...props }: ViewProps & { edge?: "top" | "bottom"; variant?: "soft" | "hard"; visible?: boolean; size?: number }) {
  const ui = useUI()
  const base = ui.scheme === "dark" ? "#000000" : "#FFFFFF"
  const steps = variant === "hard" ? [0.88] : [0.55, 0.4, 0.26, 0.14, 0.05]
  return (
    <View
      pointerEvents="none"
      aria-hidden
      style={[{ position: "absolute", left: 0, right: 0, [edge]: 0, height: size, opacity: visible ? 1 : 0, flexDirection: edge === "top" ? "column" : "column-reverse" }, style]}
      {...props}
    >
      {steps.map((a, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: alpha(base, a) }} />
      ))}
    </View>
  )
}
