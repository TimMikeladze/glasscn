import * as React from "react"
import { AccessibilityInfo, Animated, Easing, StyleSheet, View, useWindowDimensions } from "react-native"
import { Circle, Defs, RadialGradient, Stop, Svg } from "react-native-svg"

import { useGlassTheme } from "@/components/glass/native/tokens"

const BLOBS = [
  { x: -0.25, y: -0.12, size: 1.25, dx: 40, dy: 30, ms: 17000 },
  { x: 0.45, y: 0.12, size: 1.05, dx: -36, dy: 44, ms: 21000 },
  { x: -0.1, y: 0.62, size: 1.2, dx: 30, dy: -38, ms: 19000 },
]

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {})
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced)
    return () => sub.remove()
  }, [])
  return reduced
}

function Blob({ color, i, w, h, dark, still }: { color: string; i: number; w: number; h: number; dark: boolean; still: boolean }) {
  const id = React.useId().replace(/:/g, "")
  const [t] = React.useState(() => new Animated.Value(0))
  const b = BLOBS[i]
  const size = Math.max(w, 380) * b.size
  React.useEffect(() => {
    if (still) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: b.ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: b.ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [t, still, b.ms])
  return (
    <Animated.View
      style={{
        pointerEvents: "none",
        position: "absolute",
        left: b.x * w,
        top: b.y * h,
        width: size,
        height: size,
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, b.dx] }) },
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, b.dy] }) },
          { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
        ],
      }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`a${id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={dark ? 0.9 : 0.95} />
            <Stop offset="0.45" stopColor={color} stopOpacity={dark ? 0.45 : 0.55} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#a${id})`} />
      </Svg>
    </Animated.View>
  )
}

/** The living ground behind glass: three palette blobs drifting over the base. Fills its parent. */
export function Aurora() {
  const t = useGlassTheme()
  const still = useReducedMotion()
  const { width, height } = useWindowDimensions()
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none", backgroundColor: t.auroraBase, overflow: "hidden" }]}>
      {t.aurora.map((color, i) => (
        <Blob key={i} i={i} color={color} w={width} h={height} dark={t.scheme === "dark"} still={still} />
      ))}
    </View>
  )
}
