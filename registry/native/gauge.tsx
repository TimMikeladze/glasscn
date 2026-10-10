import * as React from "react"
import { AccessibilityInfo, Animated, Easing, Platform, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import Svg, { Line, Path } from "react-native-svg"

import { arcPath, fraction, polarPoint } from "@/components/glass/native/chart-math"
import { useUI } from "@/components/glass/native/ui"

// Animated sets collapsable={false}, which react-native-svg would pass to the DOM on web — strip it.
const APath = Animated.createAnimatedComponent(({ collapsable, ...p }: React.ComponentProps<typeof Path> & { collapsable?: boolean }) => {
  void collapsable
  return <Path {...p} />
})
const START = -Math.PI * 0.75
const SWEEP = Math.PI * 1.5

/**
 * A three-quarter meter: a soft track, an accent arc to `value` and an optional
 * `target` tick. Children sit in the bowl — the figure and a label.
 * The arc draws in once and eases to new values.
 */
export function Gauge({
  value,
  min = 0,
  max = 100,
  target,
  size = 160,
  stroke,
  color,
  label,
  style,
  children,
  ...props
}: Omit<ViewProps, "style"> & {
  value: number
  min?: number
  max?: number
  /** A goal marked with a tick on the track. */
  target?: number
  size?: number
  stroke?: number
  color?: string
  /** Accessible name, e.g. "Recovery". */
  label?: string
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const tone = color ?? ui.primary
  const sw = stroke ?? Math.max(6, size * 0.085)
  const c = size / 2
  const r = c - sw / 2
  const f = fraction(value, min, max)
  const full = r * SWEEP
  const track = arcPath(c, c, r, START, START + SWEEP)
  const tick = target === undefined ? null : START + SWEEP * fraction(target, min, max)
  const height = polarPoint(c, c, r, START).y + sw / 2
  // the full track is drawn and dashed to `f`, so new values glide along it
  const [dash] = React.useState(() => new Animated.Value(full))
  React.useEffect(() => {
    const to = full * (1 - f)
    let anim: Animated.CompositeAnimation | null = null
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (reduce) return dash.setValue(to)
        anim = Animated.timing(dash, { toValue: to, duration: 1000, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: Platform.OS !== "web" })
        anim.start()
      })
    return () => anim?.stop()
  }, [dash, full, f])
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
      style={[{ width: size, height, flexShrink: 0, alignItems: "center" }, style]}
      {...props}
    >
      <Svg width={size} height={height} style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }} pointerEvents="none">
        <Path d={track} fill="none" stroke={tone} strokeOpacity={0.16} strokeWidth={sw} strokeLinecap="round" />
        {f > 0 ? <APath d={track} fill="none" stroke={tone} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${full} ${full}`} strokeDashoffset={dash} /> : null}
        {tick === null ? null : (
          <Line
            x1={polarPoint(c, c, r - sw * 0.75, tick).x}
            y1={polarPoint(c, c, r - sw * 0.75, tick).y}
            x2={polarPoint(c, c, r + sw * 0.75, tick).x}
            y2={polarPoint(c, c, r + sw * 0.75, tick).y}
            stroke={ui.foreground}
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}
      </Svg>
      <View style={{ alignItems: "center", justifyContent: "center", paddingTop: size * 0.3 }}>{children}</View>
    </View>
  )
}
