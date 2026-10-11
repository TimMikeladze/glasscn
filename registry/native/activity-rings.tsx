import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming, type SharedValue } from "react-native-reanimated"
import Svg, { Circle, Defs, G, Mask, Path } from "react-native-svg"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { arcPath, polarPoint, ringLaps, ringRadii, sanitizeId } from "@/components/glass/native/chart-math"
import { useUI } from "@/components/glass/native/ui"

const APath = Animated.createAnimatedComponent(Path)
const ACircle = Animated.createAnimatedComponent(Circle)
const ease = Easing.bezier(0.16, 1, 0.3, 1)

export interface ActivityRing {
  /** Progress, 1 = one lap. Past 1 the ring keeps winding — any number of laps. */
  value: number
  /** Any colour. Defaults to the first three chart colours in order. */
  color?: string
  label?: string
  /** A glyph at the ring's start (twelve o'clock), sized to the stroke — an arrow, a flame. */
  icon?: React.ReactNode
}

/** Segments per lap for the angular gradient; enough that the steps don't show. */
const STEPS = 48

/** `a` mixed toward `b` by `t` (0–1), for `#rrggbb` colours; anything else comes back as `a`. */
function mix(a: string, b: string, t: number) {
  const hex = (c: string) => (/^#[0-9a-f]{6}$/i.test(c) ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : null)
  const x = hex(a)
  const y = hex(b)
  if (!x || !y) return a
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("")}`
}

/** A full circle as a path starting at twelve o'clock, so a dash draws clockwise from the top. */
const loop = (c: number, r: number) => `M${c},${c - r} A${r},${r} 0 1 1 ${c},${c + r} A${r},${r} 0 1 1 ${c},${c - r}`

/** A dash offset that sweeps in from `from` after `delay`, then eases to each new `to`. */
function useSweep(to: number, from: number, duration: number, delay: number, still: boolean): SharedValue<number> {
  const v = useSharedValue(still ? to : from)
  const first = React.useRef(true)
  React.useEffect(() => {
    if (still) v.set(to)
    else if (first.current) v.set(withDelay(delay, withTiming(to, { duration, easing: ease })))
    else v.set(withTiming(to, { duration: (duration * 2) / 3, easing: ease }))
    first.current = false
  }, [v, to, duration, delay, still])
  return v
}

function Ring({ ring, index, c, r, stroke, size, uid, duration, still }: { ring: ActivityRing; index: number; c: number; r: number; stroke: number; size: number; uid: string; duration: number; still: boolean }) {
  const ui = useUI()
  const color = ring.color ?? ui.charts[index % 3]
  const deep = mix(color, "#000000", 0.28)
  const light = mix(color, "#ffffff", 0.12)
  const { full, partial } = ringLaps(ring.value)
  const circumference = 2 * Math.PI * r
  const sweep = partial * Math.PI * 2
  const steps = Math.max(1, Math.ceil(STEPS * partial))
  const delay = full > 0 ? duration * 3 : 0
  const end = polarPoint(c, c, r, sweep)
  const mask = `ring-${uid}-${index}`
  // the closed laps underneath draw in first; then the partial sweeps over them
  const lap = useSweep(0, circumference, duration * 3, 0, still)
  const arc = useSweep(circumference * (1 - partial), circumference, duration * 6, delay, still)
  const shadow = useSweep(1, 0, duration, delay + duration * 5, still)
  const lapProps = useAnimatedProps(() => ({ strokeDashoffset: lap.value }))
  const arcProps = useAnimatedProps(() => ({ strokeDashoffset: arc.value }))
  const shadowProps = useAnimatedProps(() => ({ opacity: shadow.value * 0.35 }))
  return (
    <>
      <Circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeOpacity={0.2} strokeWidth={stroke} />
      {full > 0 ? <APath d={loop(c, r)} fill="none" stroke={light} strokeWidth={stroke} strokeDasharray={`${circumference} ${circumference}`} animatedProps={lapProps} /> : null}
      {partial > 0.001 ? (
        <>
          <Defs>
            <Mask id={mask} maskUnits="userSpaceOnUse" x={0} y={0} width={size} height={size}>
              {/* the sweep: a round-capped dash that draws in, revealing the gradient below */}
              <APath d={loop(c, r)} fill="none" stroke="#ffffff" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} animatedProps={arcProps} />
            </Mask>
          </Defs>
          {/* the leading cap casts a shadow onto the lap beneath it */}
          {full > 0 ? <ACircle cx={end.x} cy={end.y} r={stroke / 2 + stroke * 0.12} fill="#000000" animatedProps={shadowProps} /> : null}
          <G mask={`url(#${mask})`}>
            {/* the angular gradient: short butt-capped arcs stepping from deep to light, overlapping a hair so no seams show */}
            <Circle cx={c} cy={c - r} r={stroke / 2} fill={deep} />
            {Array.from({ length: steps }, (_, s) => {
              const a0 = (sweep * s) / steps
              const a1 = Math.min(sweep, (sweep * (s + 1)) / steps + 0.01)
              const t = steps === 1 ? 1 : s / (steps - 1)
              return <Path key={s} d={arcPath(c, c, r, a0, a1)} fill="none" stroke={mix(deep, light, t)} strokeWidth={stroke} />
            })}
            <Circle cx={end.x} cy={end.y} r={stroke / 2} fill={light} />
          </G>
        </>
      ) : null}
    </>
  )
}

/**
 * Concentric Activity rings, drawn to Apple's anatomy: a dim track, an angular
 * gradient from a deep start to a light end along the arc, round caps, and past
 * 100% the ring keeps winding over a closed lap with a shadow under the leading
 * cap. Each arc sweeps in from twelve o'clock on mount (Reanimated, on the UI
 * thread) and eases to new values; timing follows the theme's motion duration,
 * so `motion="still"` and Reduce Motion snap.
 */
export function ActivityRings({
  rings,
  size = 160,
  stroke = 16,
  gap = 4,
  style,
  accessibilityLabel,
  ...props
}: Omit<ViewProps, "children" | "style"> & { rings: ActivityRing[]; size?: number; stroke?: number; gap?: number; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  const still = useReducedMotion() || ui.motion.duration === 0
  const uid = sanitizeId(React.useId())
  const radii = ringRadii(size, stroke, gap, rings.length)
  const label = rings.map((r, i) => `${r.label ?? `Ring ${i + 1}`}: ${Math.round(r.value * 100)}%`).join(", ")
  const c = size / 2
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel ?? label} style={[{ width: size, height: size, flexShrink: 0 }, style]} {...props}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
        {radii.map((r, i) => (
          <Ring key={i} ring={rings[i]} index={i} c={c} r={r} stroke={stroke} size={size} uid={uid} duration={ui.motion.duration} still={still} />
        ))}
      </Svg>
      {radii.map((r, i) =>
        rings[i].icon ? (
          // dark on the ring colour, as Apple draws the arrows
          <View
            key={`icon-${i}`}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{ position: "absolute", left: c - stroke / 2, top: c - r - stroke / 2, width: stroke, height: stroke, alignItems: "center", justifyContent: "center", transform: [{ scale: 0.7 }] }}
          >
            {rings[i].icon}
          </View>
        ) : null
      )}
    </View>
  )
}
