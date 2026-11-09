import * as React from "react"
import { I18nManager, Platform, View, type AccessibilityActionEvent, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, type SharedValue } from "react-native-reanimated"
import { Host, Slider as NativeSlider } from "@expo/ui"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { Glass } from "@/components/glass/native/glass"
import { haptics } from "@/components/glass/native/press"
import { nativeControlTheme, useGlassThemeOptions } from "@/components/glass/native/tokens"
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
   * bubble, formatter, commit handler or progress variant. `false` forces the glass one.
   */
  native?: boolean
}

const KNOB = 24

/** Snap `raw` to the step grid inside [min, max]. */
export function snap(raw: number, min: number, max: number, step: number) {
  "worklet"
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
    native && Platform.OS !== "web" && (props.value ?? props.defaultValue ?? [0]).length === 1 && !props.ticks && props.neutralValue === undefined && !props.valueBubble && !props.formatValue && !props.onValueCommit && (props.variant ?? "default") === "default"
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
  const appearance = nativeControlTheme(ui, useGlassThemeOptions())
  const [inner, setInner] = React.useState<number[]>(() => defaultValue ?? [min])
  const v = (value ?? inner)[0]
  const label = accessibilityLabel ?? props["aria-label"]
  // The SwiftUI slider is the element VoiceOver reads; a label on the Host doesn't reach it, and
  // its own value is a raw 0–1 fraction. Name it and speak the value as a percentage of the range.
  const modifiers = React.useMemo(() => {
    if (Platform.OS !== "ios") return undefined
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const m = require("@expo/ui/swift-ui/modifiers") as typeof import("@expo/ui/swift-ui/modifiers")
    const percent = Math.round(((v - min) / Math.max(1e-9, max - min)) * 100)
    return [...(label ? [m.accessibilityLabel(label)] : []), m.accessibilityValue(`${percent}%`)]
  }, [label, v, min, max])
  return (
    <Host matchContents={{ vertical: true }} {...appearance} accessibilityLabel={label} style={[{ width: "100%", minHeight: 44, justifyContent: "center" }, style]}>
      <NativeSlider
        modifiers={modifiers}
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
  const live = useSharedValue(values)
  const moving = useSharedValue(false)
  React.useEffect(() => {
    if (!moving.get()) live.set(values)
  }, [values, live, moving])

  const span = Math.max(0, width - KNOB)
  // physical x of a value (RTL mirrors the track — NAT-32)
  const pos = (v: number) => {
    "worklet"
    const p = ((v - min) / (max - min || 1)) * span
    return rtl ? span - p : p
  }
  const valueAt = (x: number) => {
    "worklet"
    const frac = Math.min(1, Math.max(0, (x - KNOB / 2) / Math.max(1, span)))
    return snap(min + (rtl ? 1 - frac : frac) * (max - min), min, max, step)
  }

  const emit = (next: number[]) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }
  const grab = (x: number) => {
    "worklet"
    const v = valueAt(x)
    const initial = live.value
    const thumb = initial.reduce((best, cur, i) => (Math.abs(cur - v) < Math.abs(initial[best] - v) || (cur === initial[best] && v > cur) ? i : best), 0)
    drag.set({ thumb, last: initial })
    moving.set(true)
    runOnJS(setActive)(thumb)
  }
  const tick = haptics.selection
  const move = (x: number) => {
    "worklet"
    const { thumb: i, last } = drag.value
    const next = [...last]
    let v = valueAt(x)
    if (next[i - 1] !== undefined) v = Math.max(v, next[i - 1])
    if (next[i + 1] !== undefined) v = Math.min(v, next[i + 1])
    if (next[i] === v) return
    next[i] = v
    drag.set({ thumb: i, last: next })
    live.set(next)
    if (ticks) runOnJS(tick)()
    // Values notify on step changes; geometry never waits for React or the JS callback.
    runOnJS(emit)(next)
  }
  const release = (next: number[]) => {
    setActive(null)
    if (value === undefined) setInner(next)
    onValueCommit?.(next)
    live.set(value ?? next)
  }
  const finish = () => {
    "worklet"
    const { thumb, last } = drag.value
    if (!last.length) return
    moving.set(false)
    drag.set({ thumb, last: [] })
    runOnJS(release)(last)
  }

  // Pan with offsets so a vertical scroll wins (NAT-31); a tap jumps the nearest knob.
  const pan = Gesture.Pan()
    .withTestId(`${testID ?? "glass-slider"}-drag`)
    .enabled(!disabled)
    .activeOffsetX([-8, 8])
    .failOffsetY([-8, 8])
    .onStart((e) => {
      grab(e.x - e.translationX)
      move(e.x)
    })
    .onUpdate((e) => move(e.x))
    // commit on end and on cancel, so a drag interrupted by a scroll still lands
    .onFinalize(finish)
  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onEnd((e) => {
      grab(e.x)
      move(e.x)
      finish()
    })
  const gesture = Gesture.Race(pan, tap)

  const marks = Array.isArray(ticks) ? ticks : ticks && (max - min) / step <= 20 ? Array.from({ length: Math.round((max - min) / step) + 1 }, (_, i) => min + i * step) : []
  const progress = variant === "progress"
  const trackSize = useAnimatedStyle(() => ({ height: progress && moving.value ? 10 : 6 }))
  const fill = useAnimatedStyle(() => {
    const current = live.value
    const origin = neutralValue !== undefined && current.length === 1 ? pos(Math.min(max, Math.max(min, neutralValue))) : rtl ? span : 0
    const ends = current.length > 1 ? current.map(pos) : [origin, pos(current[0])]
    const lo = Math.min(...ends)
    return { left: lo, width: Math.max(0, Math.max(...ends) - lo) }
  })
  // VoiceOver/TalkBack steps by 10% of the range, on the step grid (NAT-34)
  const big = Math.max(step, snap(min + (max - min) / 10, min, max, step) - min)

  const nudge = (i: number, dir: 1 | -1) => {
    if (disabled) return
    const next = [...values]
    next[i] = Math.min(next[i + 1] ?? max, Math.max(next[i - 1] ?? min, snap(next[i] + dir * big, min, max, step)))
    emit(next)
    onValueCommit?.(next)
    live.set(value ?? next)
  }

  return (
    <GestureDetector gesture={gesture}>
      <View
        testID={testID}
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        style={[{ width: "100%", minHeight: 44, justifyContent: "center", opacity: disabled ? 0.5 : 1 }, web({ cursor: disabled ? "default" : "pointer", touchAction: "pan-y", userSelect: "none" }), style]}
      >
        <Animated.View pointerEvents="none" style={[{ marginHorizontal: KNOB / 2, borderRadius: 5, overflow: "hidden", backgroundColor: ui.fillStrong }, trackSize]}>
          <Animated.View style={[{ position: "absolute", top: 0, bottom: 0, backgroundColor: ui.primary }, fill]} />
        </Animated.View>
        {marks.map((m) => (
          <View key={m} pointerEvents="none" style={{ position: "absolute", left: KNOB / 2 + pos(m) - 2, width: 4, height: 4, borderRadius: 2, backgroundColor: ui.mutedForeground, opacity: 0.6 }} />
        ))}
        {values.map((v, i) => (
          <Knob
            key={i}
            position={pos}
            live={live}
            index={i}
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
  position,
  live,
  index,
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
  position: (value: number) => number
  live: SharedValue<number[]>
  index: number
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
    const to = pressed && !disabled && !reduced ? ui.motion.knobLensScale : 1
    scale.set(reduced ? to : withSpring(to, ui.motion.springConfig))
  }, [pressed, disabled, reduced, scale, ui.motion.knobLensScale, ui.motion.springConfig])
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: position(live.value[index]) }, { scale: scale.value }] }))
  const a11y = {
    accessible: true,
    accessibilityRole: "adjustable" as const,
    accessibilityLabel: label,
    "aria-disabled": disabled,
    accessibilityValue: { min, max, now: value, text: text ?? String(value) },
    accessibilityActions: [{ name: "increment" }, { name: "decrement" }],
    onAccessibilityAction: (e: AccessibilityActionEvent) => onNudge(e.nativeEvent.actionName === "increment" ? 1 : -1),
  }
  if (hidden)
    // thumbless (progress): the adjustable element covers the whole slider, since iOS drops
    // zero-size elements from the accessibility tree; the zero-size knob only carries the bubble
    return (
      <>
        <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} {...a11y} />
        <Animated.View pointerEvents="none" style={[{ position: "absolute", left: 0, width: 0, height: 0 }, anim]}>
          {bubble != null ? <Bubble bubble={bubble} /> : null}
        </Animated.View>
      </>
    )
  return (
    <Animated.View
      pointerEvents="none"
      {...a11y}
      style={[{ position: "absolute", left: 0, width: KNOB, height: KNOB, borderRadius: KNOB / 2 }, anim]}
    >
      {pressed && !disabled ? (
        // while dragged the knob is glass over the track
        <Glass variant="liquid" raised radius={KNOB / 2} style={{ flex: 1 }} />
      ) : (
        <View style={{ flex: 1, borderRadius: KNOB / 2, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: ui.glassBorder, shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 }} />
      )}
      {bubble != null ? <Bubble bubble={bubble} /> : null}
    </Animated.View>
  )
}

/** The value shown above a held knob. */
function Bubble({ bubble }: { bubble: React.ReactNode }) {
  const ui = useUI()
  return (
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
  )
}
