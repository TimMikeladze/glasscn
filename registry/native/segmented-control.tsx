import * as React from "react"
import { Animated as RNAnimated, Platform, View, type LayoutChangeEvent, type LayoutRectangle, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { SegmentedControl as NativeSegmented } from "@expo/ui/community/segmented-control"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { haptics, Press } from "@/components/glass/native/press"
import { GText, useUI, web, type TextSize } from "@/components/glass/native/ui"

/**
 * @deprecated read `useReducedMotion()` from `native-a11y`. Kept for files that still read a ref.
 * A ref whose `.current` is the live Reduce Motion setting.
 */
export function useReduceMotion() {
  const reduced = useReducedMotion()
  const ref = React.useRef(reduced)
  React.useEffect(() => {
    ref.current = reduced
  }, [reduced])
  return ref
}

type Frames = Record<string, LayoutRectangle>

/** Frames reported by items' onLayout, keyed by value. */
function useFrames() {
  const [frames, setFrames] = React.useState<Frames>({})
  const register = React.useCallback(
    (value: string) => (e: LayoutChangeEvent) => {
      const l = e.nativeEvent.layout
      setFrames((prev) => {
        const p = prev[value]
        if (p && p.x === l.x && p.y === l.y && p.width === l.width && p.height === l.height) return prev
        return { ...prev, [value]: l }
      })
    },
    []
  )
  return { frames, register }
}

/**
 * The native twin of use-sliding-indicator on Reanimated (NAT-35): items report their frame with
 * `register(value)` (onLayout); render `<Animated.View style={style} />` from react-native-reanimated
 * and it springs to the current item — x, y, width, height and (with `radius`) corners.
 * Physical layout coordinates, so it follows RTL rows without flipping.
 */
export function useSlidingSelection(current: string | undefined, { radius }: { radius?: (frame: LayoutRectangle) => number } = {}) {
  const ui = useUI()
  const reduced = useReducedMotion()
  const { frames, register } = useFrames()
  const frame = current ? frames[current] : undefined
  const x = useSharedValue(0)
  const y = useSharedValue(0)
  const w = useSharedValue(0)
  const h = useSharedValue(0)
  const r = useSharedValue(0)
  const shown = useSharedValue(0)
  const placed = React.useRef(false)
  const spring = ui.motion.springConfig

  React.useEffect(() => {
    if (!frame) {
      shown.set(0)
      return
    }
    const to = [frame.x, frame.y, frame.width, frame.height, radius ? radius(frame) : 0]
    const vs = [x, y, w, h, r]
    const jump = !placed.current || reduced || ui.motion.duration === 0
    placed.current = true
    vs.forEach((v, i) => {
      v.set(jump ? to[i] : withSpring(to[i], spring))
    })
    shown.set(1)
  }, [frame, radius, reduced, spring, ui.motion.duration, x, y, w, h, r, shown])

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    top: 0,
    width: w.value,
    height: h.value,
    transform: [{ translateX: x.value }, { translateY: y.value }],
    // the thumb is never faded in: an absent frame hides it by size
    ...(radius ? { borderRadius: r.value } : null),
    ...(shown.value ? null : { width: 0, height: 0 }),
  }))
  return { register, style, frames, ready: !!frame }
}

/**
 * @deprecated RN `Animated` version kept so callers not yet on Reanimated keep working;
 * use `useSlidingSelection` (Reanimated) instead.
 */
export function useSlidingIndicator(current: string | undefined) {
  const { frames, register } = useFrames()
  const [box] = React.useState(() => ({ x: new RNAnimated.Value(0), y: new RNAnimated.Value(0), w: new RNAnimated.Value(0), h: new RNAnimated.Value(0) }))
  const placed = React.useRef(false)
  const reduced = useReducedMotion()
  const frame = current ? frames[current] : undefined
  React.useEffect(() => {
    if (!frame) return
    const to = [
      [box.x, frame.x],
      [box.y, frame.y],
      [box.w, frame.width],
      [box.h, frame.height],
    ] as const
    if (!placed.current || reduced) {
      placed.current = true
      to.forEach(([v, n]) => v.setValue(n))
      return
    }
    RNAnimated.parallel(to.map(([v, n]) => RNAnimated.spring(v, { toValue: n, friction: 9, tension: 200, useNativeDriver: false }))).start()
  }, [frame, box, reduced])
  const style: StyleProp<ViewStyle> = { position: "absolute", left: box.x as unknown as number, top: box.y as unknown as number, width: box.w as unknown as number, height: box.h as unknown as number, opacity: frame ? 1 : 0 }
  return { register, style, box, ready: !!frame }
}

/** Wraps string children in GText and tints/sizes bare icon elements (lucide-react-native). */
export function withGlyphs(children: React.ReactNode, { color, size, text = "sm", weight }: { color: string; size: number; text?: TextSize; weight?: "400" | "500" | "600" | "700" }) {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return (
        <GText size={text} weight={weight} color={color} numberOfLines={1}>
          {child}
        </GText>
      )
    }
    if (React.isValidElement<{ color?: string; size?: number }>(child) && child.type !== React.Fragment && child.props.color === undefined) {
      return React.cloneElement(child, { color, size: child.props.size ?? size })
    }
    return child
  })
}

type Ctx = { value: string; select: (v: string) => void; register: (v: string) => (e: LayoutChangeEvent) => void; size: "sm" | "default" | "lg"; radius: number; scrubbing: boolean }
const SegmentedContext = React.createContext<Ctx | null>(null)

type SegmentedControlProps = Omit<ViewProps, "children"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: "sm" | "default" | "lg"
  /** `capsule` (Apple's default) or `rounded` (the control radius). */
  shape?: "capsule" | "rounded"
  /** Segments act as buttons: a press calls onValueChange and nothing stays selected. */
  momentary?: boolean
  disabled?: boolean
  /**
   * iOS/Android render the system control (`@expo/ui`) when every segment is plain text and
   * none is disabled. `false` forces the glass one everywhere.
   */
  native?: boolean
  children?: React.ReactNode
}

type Item = { value: string; label: string }
/** Plain-text segments the system control can show, or null when any segment needs ours. */
function plainItems(children: React.ReactNode): Item[] | null {
  const items: Item[] = []
  let ok = true
  React.Children.forEach(children, (c) => {
    if (!ok) return
    if (!React.isValidElement<{ value: string; disabled?: boolean; children?: React.ReactNode }>(c) || c.type !== SegmentedControlItem || c.props.disabled) {
      ok = false
      return
    }
    const kids = React.Children.toArray(c.props.children)
    if (!kids.length || !kids.every((k) => typeof k === "string" || typeof k === "number")) {
      ok = false
      return
    }
    items.push({ value: c.props.value, label: kids.join("") })
  })
  return ok && items.length ? items : null
}

/**
 * The iOS segmented control: a soft track with one raised thumb that slides
 * to the chosen segment, concentric with the track. Always has a selection —
 * tapping the chosen segment again keeps it (unlike a toggle group).
 * Drag from the thumb to scrub across segments. `momentary` makes the segments plain actions.
 * NAT-80: the system control on iOS/Android for plain text segments.
 */
export function SegmentedControl({ value, defaultValue, onValueChange, size = "default", shape = "capsule", momentary = false, disabled, native = true, style, children, ...props }: SegmentedControlProps) {
  const ui = useUI()
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const current = momentary ? "" : (value ?? inner)
  const select = React.useCallback(
    (v: string) => {
      if (disabled || !v) return
      if (!momentary) setInner(v)
      onValueChange?.(v)
    },
    [disabled, momentary, onValueChange]
  )
  const height = { sm: 28, default: 36, lg: 44 }[size]
  // concentric: the thumb's radius is the track's minus its 2pt padding
  const radius = shape === "capsule" ? Math.min(ui.radius.button, height / 2) : ui.radius.control
  const { register, style: thumb, frames } = useSlidingSelection(current)
  const [scrubbing, setScrubbing] = React.useState(false)
  const lens = useSharedValue(1)
  const reduced = useReducedMotion()

  // drag-to-scrub (NAT-37): a pan that starts on the thumb moves the selection under the finger
  const scrub = useSharedValue(false)
  const at = (x: number, y: number) => Object.entries(frames).find(([, f]) => x >= f.x && x <= f.x + f.width && y >= f.y - 8 && y <= f.y + f.height + 8)?.[0]
  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(!disabled && !momentary)
    .activeOffsetX([-8, 8])
    .failOffsetY([-8, 8])
    .onStart((e) => {
      scrub.set(at(e.x, e.y) === current)
      if (!scrub.get()) return
      setScrubbing(true)
      if (!reduced) lens.set(withSpring(1.04, ui.motion.springConfig))
    })
    .onUpdate((e) => {
      if (!scrub.get()) return
      const v = at(e.x, e.y)
      if (v && v !== (value ?? inner)) {
        haptics.selection()
        select(v)
      }
    })
    .onFinalize(() => {
      scrub.set(false)
      setScrubbing(false)
      lens.set(withSpring(1, ui.motion.springConfig))
    })
  const lensStyle = useAnimatedStyle(() => ({ transform: [{ scale: lens.value }] }))

  const ctx = React.useMemo(() => ({ value: current, select, register, size, radius, scrubbing }), [current, select, register, size, radius, scrubbing])

  const items = native && !momentary && Platform.OS !== "web" ? plainItems(children) : null
  if (items) {
    const index = items.findIndex((i) => i.value === current)
    return (
      <NativeSegmented
        values={items.map((i) => i.label)}
        selectedIndex={index < 0 ? undefined : index}
        enabled={!disabled}
        appearance={ui.scheme}
        onChange={(e) => select(items[e.nativeEvent.selectedSegmentIndex]?.value ?? "")}
        style={[{ minHeight: height, alignSelf: "stretch" }, style as StyleProp<ViewStyle>]}
        testID={props.testID}
      />
    )
  }

  return (
    <SegmentedContext.Provider value={ctx}>
      <GestureDetector gesture={pan}>
        <View
          accessibilityRole="radiogroup"
          aria-disabled={disabled}
          // 44pt touch target around a shorter track (NAT-23)
          hitSlop={{ top: Math.max(0, (44 - height) / 2), bottom: Math.max(0, (44 - height) / 2) }}
          style={[{ flexDirection: "row", alignSelf: "flex-start", alignItems: "stretch", minHeight: height, padding: 2, borderRadius: radius, backgroundColor: ui.fill, opacity: disabled ? 0.5 : 1 }, style]}
          {...props}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              thumb,
              lensStyle,
              { borderRadius: Math.max(0, radius - 2), backgroundColor: scrubbing ? ui.knob : ui.thumb },
              ui.scheme === "light" && { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
            ]}
          />
          {children}
        </View>
      </GestureDetector>
    </SegmentedContext.Provider>
  )
}

export function SegmentedControlItem({
  value,
  disabled,
  style,
  children,
  ...props
}: Omit<ViewProps, "children"> & { value: string; disabled?: boolean; children?: React.ReactNode; onPress?: () => void }) {
  const ui = useUI()
  const ctx = React.useContext(SegmentedContext)
  if (!ctx) throw new Error("SegmentedControlItem must be inside SegmentedControl")
  const on = ctx.value === value
  const color = on ? ui.foreground : ui.mutedForeground
  return (
    <Press
      haptic
      squash={1}
      disabled={disabled}
      onLayout={ctx.register(value)}
      onPress={() => ctx.select(value)}
      accessibilityRole="radio"
      aria-checked={on}
      aria-selected={on}
      aria-disabled={disabled}
      style={[
        { flexGrow: 1, flexShrink: 1, flexBasis: "auto", minWidth: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: ctx.size === "sm" ? 8 : 12, borderRadius: ctx.radius - 2, opacity: disabled ? 0.4 : 1 },
        web({ cursor: disabled ? "default" : "pointer", userSelect: "none" }),
        style,
      ]}
      {...props}
    >
      {withGlyphs(children, { color, size: 16, text: ctx.size === "lg" ? "base" : ctx.size === "sm" ? "xs" : "sm", weight: on ? "600" : "500" })}
    </Press>
  )
}
