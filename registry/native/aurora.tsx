import * as React from "react"
import { StyleSheet, View, useWindowDimensions, type LayoutChangeEvent } from "react-native"
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated"
import { Circle, Defs, RadialGradient, Stop, Svg } from "react-native-svg"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { useGlassTheme } from "@/components/glass/native/tokens"

const BLOBS = [
  { x: -0.25, y: -0.12, size: 1.25, dx: 40, dy: 30, ms: 17000 },
  { x: 0.45, y: 0.12, size: 1.05, dx: -36, dy: 44, ms: 21000 },
  { x: -0.1, y: 0.62, size: 1.2, dx: 30, dy: -38, ms: 19000 },
]

function Blob({ color, i, w, h, dark, still, speed }: { color: string; i: number; w: number; h: number; dark: boolean; still: boolean; speed: number }) {
  const id = React.useId().replace(/:/g, "")
  const t = useSharedValue(0)
  const b = BLOBS[i]
  const size = Math.max(w, 380) * b.size
  const ms = b.ms / Math.max(0.1, speed)
  React.useEffect(() => {
    if (still) {
      // Reduce Motion or paused: hold where it is
      cancelAnimation(t)
      return
    }
    t.set(withRepeat(withTiming(1, { duration: ms, easing: Easing.inOut(Easing.sin) }), -1, true))
    return () => cancelAnimation(t)
  }, [t, still, ms])
  const drift = useAnimatedStyle(() => ({
    transform: [{ translateX: t.value * b.dx }, { translateY: t.value * b.dy }, { scale: 1 + t.value * 0.08 }],
  }))
  return (
    <Animated.View style={[{ pointerEvents: "none", position: "absolute", left: b.x * w, top: b.y * h, width: size, height: size }, drift]}>
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

/**
 * The living ground behind glass: three palette blobs drifting over the base. Fills its parent and
 * sizes the blobs to it (onLayout — NAT-26). Reanimated on the UI thread; still under Reduce Motion
 * or a zero motion preset. `animate={false}` holds it still — e.g. while a ScrollView over it is dragged.
 */
export function Aurora({ animate = true }: { animate?: boolean } = {}) {
  const t = useGlassTheme()
  const still = useReducedMotion() || !animate || t.motion.duration === 0 || t.motion.auroraSpeed === 0
  const win = useWindowDimensions()
  const [box, setBox] = React.useState<{ width: number; height: number } | null>(null)
  const { width, height } = box ?? win
  return (
    <View
      onLayout={(e: LayoutChangeEvent) => {
        const { width: w, height: h } = e.nativeEvent.layout
        if (w && h && (w !== box?.width || h !== box?.height)) setBox({ width: w, height: h })
      }}
      style={[StyleSheet.absoluteFill, { pointerEvents: "none", backgroundColor: t.auroraBase, overflow: "hidden" }]}
    >
      {t.aurora.map((color, i) => (
        <Blob key={i} i={i} color={color} w={width} h={height} dark={t.scheme === "dark"} still={still} speed={t.motion.auroraSpeed || 1} />
      ))}
    </View>
  )
}
