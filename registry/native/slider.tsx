import * as React from "react"
import { Animated, PanResponder, type PanResponderInstance, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native"

import { useUI, web } from "@/components/glass/native/ui"

type SliderProps = {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  /** Fires once when a drag ends. */
  onValueCommit?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
  /** `progress` is thumbless (a scrubber); the track thickens while dragged. */
  variant?: "default" | "progress"
  /** Tick marks: `true` for one per step (up to 21), or the values to mark. */
  ticks?: boolean | number[]
  /** The range grows from this value instead of `min`. */
  neutralValue?: number
  /** Icons at the ends of the track. */
  minIcon?: React.ReactNode
  maxIcon?: React.ReactNode
}

const KNOB = 24

type Live = { values: number[]; min: number; max: number; step: number; width: number; disabled?: boolean; onValueChange?: (v: number[]) => void; onValueCommit?: (v: number[]) => void }

/** The drag handler: created once; reads props from `box.live` only while a gesture runs. */
type Gesture = { thumb: number; x0: number; page0: number; last: number[] }

function createPan(box: { live: Live; g: Gesture }, setInner: (v: number[]) => void, setActive: (i: number | null) => void) {
  const at = (x: number) => {
    const span = Math.max(1, box.live.width - KNOB)
    const frac = Math.min(1, Math.max(0, (x - KNOB / 2) / span))
    const raw = box.live.min + frac * (box.live.max - box.live.min)
    const snapped = Math.round((raw - box.live.min) / box.live.step) * box.live.step + box.live.min
    return Math.min(box.live.max, Math.max(box.live.min, Number(snapped.toFixed(6))))
  }
  const move = (x: number) => {
    // during a drag, `last` is fresher than props until the parent re-renders
    const next = [...(box.g.last.length ? box.g.last : box.live.values)]
    let v = at(x)
    if (next[box.g.thumb - 1] !== undefined) v = Math.max(v, next[box.g.thumb - 1])
    if (next[box.g.thumb + 1] !== undefined) v = Math.min(v, next[box.g.thumb + 1])
    if (next[box.g.thumb] === v) return
    next[box.g.thumb] = v
    box.g.last = next
    setInner(next)
    box.live.onValueChange?.(next)
  }
  // The responder is rebuilt every render, so movement is measured from the grant's pageX, not gestureState.
  return PanResponder.create({
    onStartShouldSetPanResponder: () => !box.live.disabled,
    onMoveShouldSetPanResponder: () => !box.live.disabled,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e) => {
      box.g.x0 = e.nativeEvent.locationX
      box.g.page0 = e.nativeEvent.pageX
      const v = at(box.g.x0)
      const vs = box.live.values
      box.g.thumb = vs.reduce((best, cur, i) => (Math.abs(cur - v) < Math.abs(vs[best] - v) || (cur === vs[best] && v > cur) ? i : best), 0)
      box.g.last = vs
      setActive(box.g.thumb)
      move(box.g.x0)
    },
    onPanResponderMove: (e) => move(box.g.x0 + (e.nativeEvent.pageX - box.g.page0)),
    onPanResponderRelease: () => {
      setActive(null)
      box.live.onValueCommit?.(box.g.last)
      box.g.last = []
    },
    onPanResponderTerminate: () => {
      setActive(null)
      box.g.last = []
    },
  })
}

/** A soft track, an accent range and white glass knobs. One value or a range. */
/** The iOS 27 slider: a soft track, an accent range and a knob that swells into a lens while dragged. */
export function Slider({ minIcon, maxIcon, style, ...props }: SliderProps) {
  if (!minIcon && !maxIcon) return <SliderTrack style={style} {...props} />
  return (
    <View style={[{ width: "100%", flexDirection: "row", alignItems: "center", gap: 12 }, style]}>
      {minIcon}
      <SliderTrack style={{ flex: 1, width: "auto" }} {...props} />
      {maxIcon}
    </View>
  )
}

function SliderTrack({ value, defaultValue, onValueChange, onValueCommit, min = 0, max = 100, step = 1, disabled, accessibilityLabel, testID, style, variant = "default", ticks, neutralValue }: Omit<SliderProps, "minIcon" | "maxIcon">) {
  const ui = useUI()
  const [inner, setInner] = React.useState<number[]>(() => defaultValue ?? [min])
  const values = value ?? inner
  const [width, setWidth] = React.useState(0)
  const [active, setActive] = React.useState<number | null>(null)

  // One responder for the component's life (rebuilding it mid-drag drops the gesture on iOS).
  // It reads the latest props from `box.live`, refreshed after every render.
  const [box] = React.useState(() => {
    const b: { live: Live; g: Gesture; pan: PanResponderInstance | null } = { live: { values, min, max, step, width, disabled, onValueChange, onValueCommit }, g: { thumb: 0, x0: 0, page0: 0, last: [] }, pan: null }
    b.pan = createPan(b, setInner, setActive)
    return b
  })
  React.useEffect(() => {
    // the responder must outlive renders, so it reads props from this box rather than a fresh closure
    // eslint-disable-next-line react-hooks/immutability
    box.live = { values, min, max, step, width, disabled, onValueChange, onValueCommit }
  })
  const pan = box.pan!

  const span = Math.max(0, width - KNOB)
  const pos = (v: number) => ((v - min) / (max - min || 1)) * span
  const origin = neutralValue !== undefined && values.length === 1 ? pos(Math.min(max, Math.max(min, neutralValue))) : 0
  const lo = values.length > 1 ? pos(Math.min(...values)) : Math.min(origin, pos(values[0]))
  const hi = values.length > 1 ? pos(Math.max(...values)) : Math.max(origin, pos(values[0]))
  const marks = Array.isArray(ticks) ? ticks : ticks && (max - min) / step <= 20 ? Array.from({ length: Math.round((max - min) / step) + 1 }, (_, i) => min + i * step) : []
  const progress = variant === "progress"

  const nudge = (i: number, dir: 1 | -1) => {
    const next = [...values]
    next[i] = Math.min(next[i + 1] ?? max, Math.max(next[i - 1] ?? min, next[i] + dir * step))
    setInner(next)
    onValueChange?.(next)
    onValueCommit?.(next)
  }

  return (
    <View
      testID={testID}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[{ width: "100%", height: KNOB, justifyContent: "center", opacity: disabled ? 0.5 : 1 }, web({ cursor: disabled ? "default" : "pointer", touchAction: "none", userSelect: "none" }), style]}
      {...pan.panHandlers}
    >
      <View pointerEvents="none" style={{ marginHorizontal: KNOB / 2, height: progress && active !== null ? 10 : 6, borderRadius: 5, overflow: "hidden", backgroundColor: ui.fillStrong }}>
        <View style={{ position: "absolute", top: 0, bottom: 0, left: lo, width: Math.max(0, hi - lo), backgroundColor: ui.primary }} />
      </View>
      {marks.map((m) => (
        <View key={m} pointerEvents="none" style={{ position: "absolute", left: KNOB / 2 + pos(m) - 2, width: 4, height: 4, borderRadius: 2, backgroundColor: ui.mutedForeground, opacity: 0.6 }} />
      ))}
      {values.map((v, i) => (
        <Knob
          key={i}
          left={pos(v)}
          pressed={active === i}
          value={v}
          min={values[i - 1] ?? min}
          max={values[i + 1] ?? max}
          label={values.length > 1 ? `${accessibilityLabel ?? "Value"} ${i === 0 ? "minimum" : "maximum"}` : accessibilityLabel}
          disabled={disabled}
          onNudge={(dir) => nudge(i, dir)}
          border={ui.glassBorder}
          hidden={progress}
        />
      ))}
    </View>
  )
}

function Knob({ left, pressed, value, min, max, label, disabled, onNudge, border, hidden }: { left: number; pressed: boolean; value: number; min: number; max: number; label?: string; disabled?: boolean; onNudge: (dir: 1 | -1) => void; border: string; hidden?: boolean }) {
  const [scale] = React.useState(() => new Animated.Value(1))
  React.useEffect(() => {
    // the lens: the knob swells while held (Apple's 1.15)
    Animated.spring(scale, { toValue: pressed ? 1.15 : 1, friction: 7, tension: 300, useNativeDriver: true }).start()
  }, [pressed, scale])
  return (
    <Animated.View
      pointerEvents="none"
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      aria-disabled={disabled}
      accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => onNudge(e.nativeEvent.actionName === "increment" ? 1 : -1)}
      style={{
        position: "absolute",
        left,
        width: KNOB,
        height: KNOB,
        borderRadius: KNOB / 2,
        backgroundColor: pressed ? "rgba(255,255,255,0.35)" : "#FFFFFF",
        opacity: hidden ? 0 : 1,
        borderWidth: 1,
        borderColor: border,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
        transform: [{ scale }],
      }}
    />
  )
}
