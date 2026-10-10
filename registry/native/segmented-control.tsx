import * as React from "react"
import { AccessibilityInfo, Animated, View, type LayoutChangeEvent, type LayoutRectangle, type StyleProp, type ViewProps, type ViewStyle } from "react-native"

import { Press } from "@/components/glass/native/press"
import { GText, useUI, web, type TextSize } from "@/components/glass/native/ui"

/** Whether the OS asks for reduced motion — read inside effects and handlers only. */
export function useReduceMotion() {
  const ref = React.useRef(false)
  React.useEffect(() => {
    let live = true
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (live) ref.current = v
      })
      .catch(() => {})
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", (v) => {
      ref.current = v
    })
    return () => {
      live = false
      sub?.remove?.()
    }
  }, [])
  return ref
}

/**
 * The native twin of use-sliding-indicator: items report their frame with
 * `register(value)` (onLayout), and an Animated box springs to the current one.
 */
export function useSlidingIndicator(current: string | undefined) {
  const ui = useUI()
  const [frames, setFrames] = React.useState<Record<string, LayoutRectangle>>({})
  const [box] = React.useState(() => ({ x: new Animated.Value(0), y: new Animated.Value(0), w: new Animated.Value(0), h: new Animated.Value(0) }))
  const placed = React.useRef(false)
  const reduce = useReduceMotion()
  const frame = current ? frames[current] : undefined
  const { x, y, width, height } = frame ?? { x: 0, y: 0, width: 0, height: 0 }

  React.useEffect(() => {
    if (!frame) return
    const to = [
      [box.x, x],
      [box.y, y],
      [box.w, width],
      [box.h, height],
    ] as const
    if (!placed.current || reduce.current) {
      placed.current = true
      to.forEach(([v, n]) => v.setValue(n))
      return
    }
    Animated.parallel(to.map(([v, n]) => Animated.spring(v, { toValue: n, ...ui.motion.spring, useNativeDriver: false }))).start()
  }, [frame, x, y, width, height, box, reduce, ui.motion.spring])

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

type Ctx = { value: string; select: (v: string) => void; register: (v: string) => (e: LayoutChangeEvent) => void; size: "sm" | "default" | "lg" }
const SegmentedContext = React.createContext<Ctx | null>(null)

type SegmentedControlProps = Omit<ViewProps, "children"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: "sm" | "default" | "lg"
  disabled?: boolean
  children?: React.ReactNode
}

/**
 * The iOS segmented control: a soft track with one raised thumb that slides
 * to the chosen segment. Always has a selection — tapping the chosen segment
 * again keeps it (unlike a toggle group).
 */
export function SegmentedControl({ value, defaultValue, onValueChange, size = "default", disabled, style, children, ...props }: SegmentedControlProps) {
  const ui = useUI()
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const current = value ?? inner
  const { register, style: thumb } = useSlidingIndicator(current)
  const select = React.useCallback(
    (v: string) => {
      if (disabled || !v) return
      setInner(v)
      onValueChange?.(v)
    },
    [disabled, onValueChange]
  )
  const height = { sm: 28, default: 36, lg: 44 }[size]
  const ctx = React.useMemo(() => ({ value: current, select, register, size }), [current, select, register, size])
  return (
    <SegmentedContext.Provider value={ctx}>
      <View
        accessibilityRole="radiogroup"
        aria-disabled={disabled}
        style={[{ flexDirection: "row", alignSelf: "flex-start", alignItems: "stretch", height, padding: 2, borderRadius: ui.radius.control, backgroundColor: ui.fill, opacity: disabled ? 0.5 : 1 }, style]}
        {...props}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            thumb,
            { borderRadius: ui.radius.control - 2, backgroundColor: ui.thumb },
            ui.scheme === "light" && { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
          ]}
        />
        {children}
      </View>
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
      aria-checked={on} aria-selected={on} aria-disabled={disabled}
      style={[
        { flexGrow: 1, flexShrink: 1, flexBasis: "auto", minWidth: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: ctx.size === "sm" ? 8 : 12, borderRadius: ui.radius.control - 2, opacity: disabled ? 0.4 : 1 },
        web({ cursor: disabled ? "default" : "pointer", userSelect: "none" }),
        style,
      ]}
      {...props}
    >
      {withGlyphs(children, { color, size: 16, text: ctx.size === "lg" ? "base" : ctx.size === "sm" ? "xs" : "sm", weight: on ? "600" : "500" })}
    </Press>
  )
}
