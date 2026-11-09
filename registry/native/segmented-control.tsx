import * as React from "react"
import { Platform, StyleSheet, View, type LayoutChangeEvent, type LayoutRectangle, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, type SharedValue } from "react-native-reanimated"
import { SegmentedControl as NativeSegmented } from "@expo/ui/community/segmented-control"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { Glass } from "@/components/glass/native/glass"
import { haptics, Press } from "@/components/glass/native/press"
import { nativeControlTheme, useGlassThemeOptions } from "@/components/glass/native/tokens"
import { GIcon, GText, useUI, web, type TextSize } from "@/components/glass/native/ui"

type Frames = Record<string, LayoutRectangle>

/** Availability is separate from geometry: disabled native views still deliver layout. */
export function useDisabledItems() {
  const [disabledItems, setDisabledItems] = React.useState<Record<string, boolean>>({})
  const setItemDisabled = React.useCallback((value: string, disabled: boolean) => {
    setDisabledItems((prev) => prev[value] === disabled ? prev : { ...prev, [value]: disabled })
  }, [])
  return { disabledItems, setItemDisabled }
}

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
export function useSlidingSelection(current: string | undefined, { radius, liveFrame }: { radius?: (frame: LayoutRectangle) => number; liveFrame?: SharedValue<LayoutRectangle | null> } = {}) {
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
    width: liveFrame?.value?.width ?? w.value,
    height: liveFrame?.value?.height ?? h.value,
    transform: [{ translateX: liveFrame?.value?.x ?? x.value }, { translateY: liveFrame?.value?.y ?? y.value }],
    // the thumb is never faded in: an absent frame hides it by size
    ...(radius ? { borderRadius: r.value } : null),
    ...(shown.value || liveFrame?.value ? null : { width: 0, height: 0 }),
  }))
  return { register, style, frames, ready: !!frame }
}

/** Wraps string children in GText and tints/sizes bare icon elements (lucide-react-native). */
export function withGlyphs(children: React.ReactNode, { color, size, text = "sm", weight, maxFontSizeMultiplier }: { color: string; size: number; text?: TextSize; weight?: "400" | "500" | "600" | "700"; maxFontSizeMultiplier?: number }) {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return (
        <GText size={text} weight={weight} color={color} numberOfLines={1} maxFontSizeMultiplier={maxFontSizeMultiplier} style={{ flexShrink: 1 }}>
          {child}
        </GText>
      )
    }
    if (React.isValidElement<{ color?: string; size?: number }>(child) && child.type !== React.Fragment && child.props.color === undefined) {
      return <GIcon color={color} size={size}>{child}</GIcon>
    }
    return child
  })
}

type Ctx = { value: string; select: (v: string) => void; register: (v: string) => (e: LayoutChangeEvent) => void; setItemDisabled: (value: string, disabled: boolean) => void; size: "sm" | "default" | "lg"; radius: number; scrubbing: boolean; disabled?: boolean; hold: (on: boolean) => void }
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
   * none is disabled, shape is unspecified and no accent is forced. The system owns
   * shape/accent on that path; explicit choices and `false` use the custom control.
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
export function SegmentedControl({ value, defaultValue, onValueChange, size = "default", shape, momentary = false, disabled, native = true, style, children, ...props }: SegmentedControlProps) {
  const { disabledItems, setItemDisabled } = useDisabledItems()
  const ui = useUI()
  const appearance = nativeControlTheme(ui, useGlassThemeOptions())
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const current = momentary ? "" : (value ?? inner)
  const select = React.useCallback(
    (v: string) => {
      if (disabled || !v || disabledItems[v]) return
      if (!momentary) setInner(v)
      onValueChange?.(v)
    },
    [disabled, disabledItems, momentary, onValueChange]
  )
  const height = { sm: 28, default: 36, lg: 44 }[size]
  // concentric: the thumb's radius is the track's minus its 2pt padding
  const radius = (shape ?? "capsule") === "capsule" ? Math.min(ui.radius.button, height / 2) : ui.radius.control
  const liveFrame = useSharedValue<LayoutRectangle | null>(null)
  const { register, style: thumb, frames } = useSlidingSelection(current, { liveFrame })
  const [scrubbing, setScrubbing] = React.useState(false)
  const lens = useSharedValue(1)
  const reduced = useReducedMotion() || ui.motion.duration === 0

  // drag-to-scrub (NAT-37): a pan that starts on the thumb moves the selection under the finger
  const scrub = useSharedValue(false)
  const boxes = useSharedValue<Frames>({})
  const selected = useSharedValue(current)
  React.useEffect(() => {
    boxes.set(Object.fromEntries(Object.entries(frames).filter(([key]) => !disabledItems[key])))
    if (!scrub.get()) selected.set(current)
  }, [frames, disabledItems, current, boxes, selected, scrub])
  const at = (x: number, y: number) => {
    "worklet"
    return Object.entries(boxes.value).find(([, f]) => x >= f.x && x <= f.x + f.width && y >= f.y - 8 && y <= f.y + f.height + 8)?.[0]
  }
  const changed = (v: string) => {
    haptics.selection()
    select(v)
  }
  const finish = () => {
    setScrubbing(false)
    liveFrame.set(null)
    selected.set(current)
  }
  const pan = Gesture.Pan()
    .enabled(!disabled && !momentary)
    .activeOffsetX([-8, 8])
    .failOffsetY([-8, 8])
    .onStart((e) => {
      selected.set(current)
      scrub.set(at(e.x - e.translationX, e.y - e.translationY) === current)
      if (!scrub.value) return
      runOnJS(setScrubbing)(true)
      if (!reduced) lens.set(withSpring(1.04, ui.motion.springConfig))
    })
    .onUpdate((e) => {
      if (!scrub.value) return
      const v = at(e.x, e.y)
      if (v && v !== selected.value) {
        selected.set(v)
        liveFrame.set(boxes.value[v])
        runOnJS(changed)(v)
      }
    })
    .onFinalize(() => {
      scrub.set(false)
      runOnJS(finish)()
      lens.set(reduced ? 1 : withSpring(1, ui.motion.springConfig))
    })
  const lensStyle = useAnimatedStyle(() => ({ transform: [{ scale: lens.value }] }))

  const ctx = React.useMemo(() => ({ value: current, select, register, setItemDisabled, size, radius, scrubbing, disabled, hold: setScrubbing }), [current, select, register, setItemDisabled, size, radius, scrubbing, disabled])

  const items = native && !momentary && shape === undefined && appearance.seedColor === undefined && Platform.OS !== "web" ? plainItems(children) : null
  if (items) {
    const index = items.findIndex((i) => i.value === current)
    const label = props.accessibilityLabel ?? props["aria-label"]
    if (Platform.OS === "ios")
      return (
        <SystemSegmented
          labels={items.map((i) => i.label)}
          index={index < 0 ? undefined : index}
          onSelect={(i) => select(items[i]?.value ?? "")}
          disabled={!!disabled}
          scheme={appearance.colorScheme}
          label={label}
          style={[{ minHeight: height, alignSelf: "stretch" }, style as StyleProp<ViewStyle>]}
          testID={props.testID}
        />
      )
    return (
      <NativeSegmented
        values={items.map((i) => i.label)}
        selectedIndex={index < 0 ? undefined : index}
        enabled={!disabled}
        appearance={appearance.colorScheme}
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
              { borderRadius: Math.max(0, radius - 2), backgroundColor: scrubbing ? "transparent" : ui.thumb },
              !scrubbing && ui.scheme === "light" && { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
            ]}
          >
            {scrubbing && !disabled ? <Glass variant="liquid" interactive raised={false} radius={Math.max(0, radius - 2)} style={StyleSheet.absoluteFill} /> : null}
          </Animated.View>
          {children}
        </View>
      </GestureDetector>
    </SegmentedContext.Provider>
  )
}

export function SegmentedControlItem({
  value,
  disabled: disabledProp,
  style,
  children,
  ...props
}: Omit<ViewProps, "children"> & { value: string; disabled?: boolean; children?: React.ReactNode; onPress?: () => void }) {
  const ui = useUI()
  const ctx = React.useContext(SegmentedContext)
  if (!ctx) throw new Error("SegmentedControlItem must be inside SegmentedControl")
  const disabled = disabledProp || ctx.disabled
  const setItemDisabled = ctx.setItemDisabled
  React.useEffect(() => {
    setItemDisabled(value, !!disabled)
    return () => setItemDisabled(value, true)
  }, [setItemDisabled, value, disabled])
  const on = ctx.value === value
  const color = on ? ui.foreground : ui.mutedForeground
  return (
    <Press
      haptic
      squash={1}
      disabled={disabled}
      onLayout={ctx.register(value)}
      onPress={() => ctx.select(value)}
      onPressIn={() => ctx.hold(true)}
      onPressOut={() => ctx.hold(false)}
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

/**
 * The iOS segmented control as a SwiftUI segmented Picker. The Picker's label is hidden by the
 * segmented style but named for VoiceOver, which the community wrapper leaves empty.
 */
function SystemSegmented({ labels, index, onSelect, disabled, scheme, label, style, testID }: { labels: string[]; index?: number; onSelect: (index: number) => void; disabled: boolean; scheme?: "light" | "dark"; label?: string; style?: StyleProp<ViewStyle>; testID?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const swift = require("@expo/ui/swift-ui") as typeof import("@expo/ui/swift-ui")
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("@expo/ui/swift-ui/modifiers") as typeof import("@expo/ui/swift-ui/modifiers")
  const modifiers = [m.pickerStyle("segmented"), ...(disabled ? [m.disabled()] : []), ...(scheme ? [m.environment("colorScheme", scheme)] : []), ...(label ? [m.accessibilityLabel(label)] : [])]
  return (
    <swift.Host matchContents={{ vertical: true }} style={style} ignoreSafeArea="all">
      <swift.Picker selection={index} onSelectionChange={(i: number) => onSelect(i)} modifiers={modifiers} label={label ?? ""} testID={testID}>
        {labels.map((text, i) => (
          <swift.Text key={i} modifiers={[m.tag(i)]}>
            {text}
          </swift.Text>
        ))}
      </swift.Picker>
    </swift.Host>
  )
}
