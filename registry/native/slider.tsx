import * as React from "react"
import { I18nManager, Platform, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { Host, Slider as NativeSlider } from "@expo/ui"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { Glass } from "@/components/glass/native/glass"
import { haptics } from "@/components/glass/native/press"
import { GText, useUI, web } from "@/components/glass/native/ui"

type SliderProps = {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  /** Fires once when a drag ends (or is cancelled), and after each accessibility step. */
  onValueCommit?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  accessibilityLabel?: string
  "aria-label"?: string
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
  /** A bubble over the knob while dragging: `true` shows the number, or render your own. */
  valueBubble?: boolean | ((value: number) => React.ReactNode)
  /** Spoken value, e.g. (v) => `${v}%`. */
  formatValue?: (value: number) => string
  /**
   * iOS/Android render the system slider (`@expo/ui`) for one value with no ticks, neutral value,
   * bubble, commit handler or progress variant. `false` forces the glass one.
   */
  native?: boolean
}

const KNOB = 24

/** Snap `raw` to the step grid inside [min, max]. */
export function snap(raw: number, min: number, max: number, step: number) {
  const s = Math.round((raw - min) / step) * step + min
  return Math.min(max, Math.max(min, Number(s.toFixed(6))))
}

/**
 * The iOS 27 slider: a soft track, an accent range and a knob that swells into a glass lens while
 * dragged (NAT-31..34). One value or a range. Drags are horizontal-only so it sits in a ScrollView.
 * NAT-80: the system slider on iOS/Android for a plain single value.
 */
export function Slider({ minIcon, maxIcon, style, native = true, ...props }: SliderProps) {
  const plain =
    native && Platform.OS !== "web" && (props.value ?? props.defaultValue ?? [0]).length === 1 && !props.ticks && props.neutralValue === undefined && !props.valueBubble && !props.onValueCommit && (props.variant ?? "default") === "default"
  const Track = plain ? SystemSlider : SliderTrack
  if (!minIcon && !maxIcon) return <Track style={style} {...props} />
  return (
    <View style={[{ width: "100%", flexDirection: "row", alignItems: "center", gap: 12 }, style]}>
      {minIcon}
      <Track style={{ flex: 1, width: "auto" }} {...props} />
      {maxIcon}
    </View>
  )
}

function SystemSlider({ value, defaultValue, onValueChange, min = 0, max = 100, step = 1, disabled, accessibilityLabel, testID, style, ...props }: Omit<SliderProps, "minIcon" | "maxIcon">) {
  const ui = useUI()
  const [inner, setInner] = React.useState<number[]>(() => defaultValue ?? [min])
  const v = (value ?? inner)[0]
  return (
    <Host matchContents={{ vertical: true }} colorScheme={ui.scheme} seedColor={ui.primary} accessibilityLabel={accessibilityLabel ?? props["aria-label"]} style={[{ width: "100%", minHeight: 44, justifyContent: "center" }, style]}>
      <NativeSlider
        value={v}
        min={min}
        max={max}
        step={step}
        disabled={!!disabled}
        testID={testID}
        onValueChange={(n) => {
          const next = [snap(n, min, max, step)]
          if (next[0] === v) return
          setInner(next)
          onValueChange?.(next)
        }}
      />
    </Host>
  )
}

function SliderTrack({
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  accessibilityLabel,
  testID,
  style,
  variant = "default",
  ticks,
  neutralValue,
  valueBubble,
  formatValue,
  ...props
}: Omit<SliderProps, "minIcon" | "maxIcon" | "native">) {
  const ui = useUI()
  const label = accessibilityLabel ?? props["aria-label"]
  const [inner, setInner] = React.useState<number[]>(() => defaultValue ?? [min])
  const values = value ?? inner
  const [width, setWidth] = React.useState(0)
  const [active, setActive] = React.useState<number | null>(null)
  const rtl = I18nManager.isRTL

  // drag scratch (the thumb held, the values since the last render) — read only from gesture callbacks
  const drag = useSharedValue<{ thumb: number; last: number[] }>({ thumb: 0, last: [] })

  const span = Math.max(0, width - KNOB)
  // physical x of a value (RTL mirrors the track — NAT-32)
  const pos = (v: number) => {
    const p = ((v - min) / (max - min || 1)) * span
    return rtl ? span - p : p
  }
  const valueAt = (x: number) => {
    const frac = Math.min(1, Math.max(0, (x - KNOB / 2) / Math.max(1, span)))
    return snap(min + (rtl ? 1 - frac : frac) * (max - min), min, max, step)
  }

  const emit = (next: number[]) => {
    setInner(next)
    onValueChange?.(next)
  }
  const grab = (x: number) => {
    const v = valueAt(x)
    const thumb = values.reduce((best, cur, i) => (Math.abs(cur - v) < Math.abs(values[best] - v) || (cur === values[best] && v > cur) ? i : best), 0)
    drag.set({ thumb, last: values })
    setActive(thumb)
  }
  const move = (x: number) => {
    const { thumb: i, last } = drag.get()
    // during a drag `last` is fresher than props until the parent re-renders
    const next = [...(last.length ? last : values)]
    let v = valueAt(x)
    if (next[i - 1] !== undefined) v = Math.max(v, next[i - 1])
    if (next[i + 1] !== undefined) v = Math.min(v, next[i + 1])
    if (next[i] === v) return
    next[i] = v
    drag.set({ thumb: i, last: next })
    if (ticks) haptics.selection()
    emit(next)
  }
  const release = () => {
    setActive(null)
    const { thumb, last } = drag.get()
    if (last.length) onValueCommit?.(last)
    drag.set({ thumb, last: [] })
  }

  // Pan with offsets so a vertical scroll wins (NAT-31); a tap jumps the nearest knob.
  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(!disabled)
    .activeOffsetX([-8, 8])
    .failOffsetY([-8, 8])
    .onStart((e) => {
      grab(e.x - e.translationX)
      move(e.x)
    })
    .onUpdate((e) => move(e.x))
    // commit on end and on cancel, so a drag interrupted by a scroll still lands
    .onFinalize((_e, success) => {
      if (success || drag.get().last.length) release()
    })
  const tap = Gesture.Tap()
    .runOnJS(true)
    .enabled(!disabled)
    .onEnd((e) => {
      grab(e.x)
      move(e.x)
      release()
    })
  const gesture = Gesture.Race(pan, tap)

  const origin = neutralValue !== undefined && values.length === 1 ? pos(Math.min(max, Math.max(min, neutralValue))) : rtl ? span : 0
  const ends = values.length > 1 ? values.map(pos) : [origin, pos(values[0])]
  const lo = Math.min(...ends)
  const hi = Math.max(...ends)
  const marks = Array.isArray(ticks) ? ticks : ticks && (max - min) / step <= 20 ? Array.from({ length: Math.round((max - min) / step) + 1 }, (_, i) => min + i * step) : []
  const progress = variant === "progress"
  // VoiceOver/TalkBack steps by 10% of the range, on the step grid (NAT-34)
  const big = Math.max(step, snap(min + (max - min) / 10, min, max, step) - min)

  const nudge = (i: number, dir: 1 | -1) => {
    const next = [...values]
    next[i] = Math.min(next[i + 1] ?? max, Math.max(next[i - 1] ?? min, snap(next[i] + dir * big, min, max, step)))
    emit(next)
    onValueCommit?.(next)
  }

  return (
    <GestureDetector gesture={gesture}>
      <View
        testID={testID}
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        style={[{ width: "100%", minHeight: 44, justifyContent: "center", opacity: disabled ? 0.5 : 1 }, web({ cursor: disabled ? "default" : "pointer", touchAction: "pan-y", userSelect: "none" }), style]}
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
            x={pos(v)}
            pressed={active === i}
            value={v}
            min={values[i - 1] ?? min}
            max={values[i + 1] ?? max}
            label={values.length > 1 ? `${label ?? "Value"} ${i === 0 ? "minimum" : "maximum"}` : label}
            text={formatValue?.(v)}
            disabled={disabled}
            onNudge={(dir) => nudge(i, dir)}
            hidden={progress}
            bubble={active === i && valueBubble ? (typeof valueBubble === "function" ? valueBubble(v) : String(v)) : null}
          />
        ))}
      </View>
    </GestureDetector>
  )
}

function Knob({
  x,
  pressed,
  value,
  min,
  max,
  label,
  text,
  disabled,
  onNudge,
  hidden,
  bubble,
}: {
  x: number
  pressed: boolean
  value: number
  min: number
  max: number
  label?: string
  text?: string
  disabled?: boolean
  onNudge: (dir: 1 | -1) => void
  hidden?: boolean
  bubble: React.ReactNode
}) {
  const ui = useUI()
  const reduced = useReducedMotion()
  const scale = useSharedValue(1)
  React.useEffect(() => {
    // the lens: the knob swells while held (NAT-33)
    const to = pressed ? ui.motion.knobLensScale : 1
    scale.set(reduced ? to : withSpring(to, ui.motion.springConfig))
  }, [pressed, reduced, scale, ui.motion.knobLensScale, ui.motion.springConfig])
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: x }, { scale: scale.value }] }))
  return (
    <Animated.View
      pointerEvents="none"
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      aria-disabled={disabled}
      accessibilityValue={{ min, max, now: value, text: text ?? String(value) }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => onNudge(e.nativeEvent.actionName === "increment" ? 1 : -1)}
      // never faded: a thumbless (progress) knob is sized away, not hidden by opacity
      style={[{ position: "absolute", left: 0, width: hidden ? 0 : KNOB, height: hidden ? 0 : KNOB, borderRadius: KNOB / 2 }, anim]}
    >
      {pressed ? (
        // while dragged the knob is glass over the track
        <Glass variant="liquid" raised radius={KNOB / 2} style={{ flex: 1 }} />
      ) : (
        <View style={{ flex: 1, borderRadius: KNOB / 2, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: ui.glassBorder, shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 }} />
      )}
      {bubble != null ? (
        <View style={{ position: "absolute", bottom: KNOB + 10, left: KNOB / 2 - 40, width: 80, alignItems: "center" }}>
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: ui.foreground }}>
            {typeof bubble === "string" ? (
              <GText size="xs" weight="600" color={ui.scheme === "dark" ? "#000000" : "#FFFFFF"} style={{ fontVariant: ["tabular-nums"] }}>
                {bubble}
              </GText>
            ) : (
              bubble
            )}
          </View>
        </View>
      ) : null}
    </Animated.View>
  )
}
