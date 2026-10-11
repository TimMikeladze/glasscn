import * as React from "react"
import { Platform, View, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { Easing, runOnJS, useAnimatedProps, useAnimatedReaction, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated"
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from "react-native-svg"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { areaPath, hitIndex, polylineLength, scaleSeries, smoothPath, sanitizeId, stepIndex } from "@/components/glass/native/chart-math"
import { useUI } from "@/components/glass/native/ui"

const APath = Animated.createAnimatedComponent(Path)
const ease = Easing.bezier(0.16, 1, 0.3, 1)

/**
 * A measure over time: a smooth stroke that draws itself, a soft gradient
 * beneath, the latest point lit. Gaps (`null`) are skipped. Scales to its
 * container's width; set the height with `height`.
 *
 * Pass `onScrub` to make it scrubbable: a horizontal drag (or hover) moves a dot
 * along the values on the UI thread and reports the index; a screen reader
 * swipes up and down through them.
 */
export function Sparkline({
  data,
  height = 72,
  color,
  area = true,
  dot = true,
  onScrub,
  style,
  onLayout,
  accessibilityLabel,
  ...props
}: Omit<ViewProps, "children" | "style"> & {
  data: (number | null | undefined)[]
  height?: number
  color?: string
  area?: boolean
  dot?: boolean
  /** Called with the scrubbed value's index, or null when the scrub ends. */
  onScrub?: (index: number | null) => void
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const tone = color ?? ui.primary
  const id = sanitizeId(React.useId())
  const still = useReducedMotion() || ui.motion.duration === 0
  const [width, setWidth] = React.useState(0)
  const draw = useSharedValue(still ? 1 : 0)
  const fade = useSharedValue(still ? 1 : 0)
  const focus = useSharedValue(-1)
  const measured = width > 0
  React.useEffect(() => {
    if (!measured) return
    if (still) {
      draw.set(1)
      fade.set(1)
      return
    }
    const d = ui.motion.duration
    draw.set(withTiming(1, { duration: Math.max(1, d * 5.5), easing: ease }))
    fade.set(withDelay(d * 1.5, withTiming(1, { duration: Math.max(1, d * 3.5), easing: Easing.out(Easing.quad) })))
  }, [measured, still, draw, fade, ui.motion.duration])

  const points = width ? scaleSeries(data, width, height, 6) : []
  // on-screen length, overestimated: the dash only has to cover the curve
  const length = Math.ceil(polylineLength(points) * 1.2)
  const strokeProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - draw.value) }))
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }))
  const last = points[points.length - 1]
  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: draw.value < 0.8 ? 0 : (draw.value - 0.8) / 0.2 }] }))

  // scrubbing: the index of each present value, and where it sits
  const present = data.map((v, i) => (typeof v === "number" && Number.isFinite(v) ? i : -1)).filter((i) => i >= 0)
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const report = (k: number) => onScrub?.(k < 0 ? null : (present[k] ?? null))
  useAnimatedReaction(
    () => focus.value,
    (now, prev) => {
      if (onScrub && prev !== null && now !== prev) runOnJS(report)(now)
    },
    [onScrub]
  )
  const gesture = (() => {
    const targets = { kind: "x" as const, at: xs }
    const move = (x: number) => {
      "worklet"
      const i = hitIndex(targets, x, 0)
      if (i !== focus.get()) focus.set(i)
    }
    const clear = () => {
      "worklet"
      focus.set(-1)
    }
    const pan = Gesture.Pan()
      .activeOffsetX([-6, 6])
      .failOffsetY([-12, 12])
      .onBegin((e) => move(e.x))
      .onUpdate((e) => move(e.x))
      .onFinalize(clear)
    const hover = Gesture.Hover()
      .onBegin((e) => move(e.x))
      .onUpdate((e) => move(e.x))
      .onFinalize(clear)
    return Gesture.Simultaneous(pan, hover)
  })()
  const scrubStyle = useAnimatedStyle(() => {
    const i = focus.value
    if (i < 0 || i >= xs.length) return { opacity: 0 }
    return { opacity: 1, transform: [{ translateX: xs[i] - 5 }, { translateY: ys[i] - 5 }] }
  })
  const [a11y, setA11y] = React.useState<number | null>(null)

  const measure = (e: LayoutChangeEvent) => {
    setWidth(Math.round(e.nativeEvent.layout.width))
    onLayout?.(e)
  }
  if (points.length < 2) {
    return (
      <View style={[{ width: "100%", height }, style]} onLayout={measure} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" {...props}>
        {width ? (
          <Svg width={width} height={height}>
            <Line x1={6} x2={width - 6} y1={height - 6} y2={height - 6} stroke={ui.foreground} strokeOpacity={0.15} />
          </Svg>
        ) : null}
      </View>
    )
  }
  const values = present.map((i) => data[i] as number)
  const label = accessibilityLabel ?? `Trend of ${values.length} values from ${values[0]} to ${values[values.length - 1]}, low ${Math.min(...values)}, high ${Math.max(...values)}`
  const step = (d: 1 | -1) => {
    const n = stepIndex(a11y, d, present.length)
    setA11y(n)
    focus.set(n ?? -1)
  }
  return (
    <View
      accessible
      accessibilityRole={onScrub ? "adjustable" : "image"}
      accessibilityLabel={label}
      accessibilityValue={onScrub && a11y !== null ? { text: String(values[a11y]) } : undefined}
      accessibilityActions={onScrub ? [{ name: "increment" }, { name: "decrement" }] : undefined}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === "increment" ? 1 : -1)}
      style={[{ width: "100%", height, overflow: "visible" }, style]}
      onLayout={measure}
      {...props}
    >
      {area ? (
        <Animated.View pointerEvents="none" style={[{ position: "absolute", top: 0, left: 0 }, fadeStyle]}>
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={tone} stopOpacity={0.32} />
                <Stop offset="1" stopColor={tone} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path d={areaPath(points, height - 2)} fill={`url(#spark-${id})`} />
          </Svg>
        </Animated.View>
      ) : null}
      <Svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }} pointerEvents="none">
        <APath d={smoothPath(points)} fill="none" stroke={tone} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${length} ${length}`} animatedProps={strokeProps} />
      </Svg>
      {dot && last ? (
        // the lit point pops in once the stroke reaches it
        <Animated.View pointerEvents="none" style={[{ position: "absolute", left: last.x - 7, top: last.y - 7, width: 14, height: 14 }, dotStyle]}>
          <Svg width={14} height={14}>
            <Circle cx={7} cy={7} r={7} fill={tone} opacity={0.22} />
            <Circle cx={7} cy={7} r={3.6} fill={tone} stroke={ui.auroraBase} strokeWidth={1.5} />
          </Svg>
        </Animated.View>
      ) : null}
      {onScrub ? (
        <>
          <Animated.View
            pointerEvents="none"
            style={[{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: tone, borderWidth: 1.5, borderColor: ui.auroraBase }, scrubStyle]}
          />
          <GestureDetector gesture={gesture}>
            <View collapsable={false} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, ...(Platform.OS === "web" ? ({ cursor: "crosshair" } as object) : {}) }} />
          </GestureDetector>
        </>
      ) : null}
    </View>
  )
}
