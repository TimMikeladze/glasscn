import * as React from "react"
import { View, type LayoutChangeEvent, type LayoutRectangle, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { runOnJS, useSharedValue } from "react-native-reanimated"

import { useInsets } from "@/components/glass/native/dialog"
import { Glass, GlassEffectGroup } from "@/components/glass/native/glass"
import { Press, haptics } from "@/components/glass/native/press"
import { useScrollEdge } from "@/components/glass/native/scroll-edge"
import { SearchField } from "@/components/glass/native/search-field"
import { useSlidingSelection, withGlyphs } from "@/components/glass/native/segmented-control"
import { GText, useUI, web } from "@/components/glass/native/ui"

/**
 * The floating tab bar for in-screen bars (for app-level tabs, use the `tabs-layout`
 * recipe's NativeTabs): a liquid capsule of destinations with a pill that slides to
 * the current one, count badges, drag-to-scrub, and a tinted round action beside it.
 *
 *   <Dock minimizeBehavior="onScrollDown">
 *     <DockBar value={tab} onValueChange={setTab}>
 *       <DockItem value="today"><MoonIcon />Today</DockItem>
 *       …
 *     </DockBar>
 *     <DockAction accessibilityLabel="Write"><PenIcon /></DockAction>
 *   </Dock>
 *
 * `minimizeBehavior="onScrollDown"` folds the bar to its current item while the
 * enclosing ScrollEdgeProvider's content scrolls down (`minimized` drives it by hand);
 * a DockAccessory sits above the bar, inline beside it when minimized (`usePlacement()`).
 */
type Placement = "expanded" | "inline"
type DockCtxValue = { minimized: boolean; placement: Placement; compact: boolean; setSearching: (on: boolean) => void }
const DockOuter = React.createContext<DockCtxValue>({ minimized: false, placement: "expanded", compact: false, setSearching: () => {} })

/** Where a DockAccessory sits: above the bar or inline beside the minimized bar. */
export function usePlacement(): Placement {
  return React.useContext(DockOuter).placement
}

export type DockProps = ViewProps & {
  /** `fixed` floats it over the bottom safe area; `static` lays it out in place. */
  position?: "fixed" | "static"
  /** `onScrollDown`: fold to the current item while the ScrollEdgeProvider's content scrolls down. */
  minimizeBehavior?: "never" | "onScrollDown"
  /** Fold it by hand (wins over `minimizeBehavior`). */
  minimized?: boolean
  /** `compact`: icon and label side by side in shorter items. */
  layout?: "default" | "compact"
}

export function Dock({ position = "fixed", minimizeBehavior = "never", minimized: minimizedProp, layout = "default", style, children, ...props }: DockProps) {
  // without a SafeAreaProvider the insets are zero, never a throw (NAT-40)
  const insets = useInsets()
  const edges = useScrollEdge()
  const [searching, setSearching] = React.useState(false)
  const scrolled = minimizedProp ?? (minimizeBehavior === "onScrollDown" && !!edges?.minimized)
  const minimized = scrolled || searching
  const ctx = React.useMemo<DockCtxValue>(() => ({ minimized, placement: minimized ? "inline" : "expanded", compact: layout === "compact", setSearching }), [minimized, layout])
  return (
    <DockOuter.Provider value={ctx}>
      <GlassEffectGroup
        spacing={12}
        pointerEvents="box-none"
        style={[
          { flexDirection: "row", flexWrap: minimized ? "nowrap" : "wrap", alignItems: "center", justifyContent: "center", gap: 12, rowGap: 8, paddingHorizontal: 12, zIndex: 40 },
          position === "fixed" && { position: "absolute", left: 0, right: 0, bottom: Math.max(16, insets.bottom) },
          style,
        ]}
        {...props}
      >
        {children}
      </GlassEffectGroup>
    </DockOuter.Provider>
  )
}

/** A companion strip (now playing, a draft) above the bar; inline beside it when the dock is minimized. */
export function DockAccessory({ style, ...props }: ViewProps) {
  const ui = useUI()
  const placement = usePlacement()
  return (
    <Glass
      variant="liquid"
      radius={ui.radius.button}
      style={[
        { height: ui.control.lg, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: ui.pad.sm },
        placement === "expanded" ? { order: -1, width: "100%", maxWidth: 448 } : { flex: 1, maxWidth: 320 },
        style,
      ] as StyleProp<ViewStyle>}
      {...props}
    />
  )
}

/** The search tab: a round glass button that opens into a field; the bar folds while it's open. */
export function DockSearch(props: Omit<React.ComponentProps<typeof SearchField>, "minimized" | "placement">) {
  const { setSearching } = React.useContext(DockOuter)
  return <SearchField minimized {...props} onFocus={(e) => (setSearching(true), props.onFocus?.(e))} onCancel={() => (setSearching(false), props.onCancel?.())} style={{ flexShrink: 1 }} />
}

type Ctx = { value: string; shown: string; select: (v: string) => void; register: (v: string) => (e: LayoutChangeEvent) => void }
const DockContext = React.createContext<Ctx | null>(null)

type DockBarProps = Omit<ViewProps, "children"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
}

/** Which item's frame holds `x` (bar coordinates), or null. */
export function itemAt(frames: Record<string, Pick<LayoutRectangle, "x" | "width">>, x: number): string | null {
  "worklet"
  for (const key of Object.keys(frames)) {
    const f = frames[key]
    if (x >= f.x && x <= f.x + f.width) return key
  }
  return null
}

/**
 * The tab capsule. Tap an item, or drag across the bar to scrub: the pill follows the
 * finger with a tick per item, and the one under it is chosen when you lift.
 */
export function DockBar({ value, defaultValue, onValueChange, accessibilityLabel, style, children, ...props }: DockBarProps) {
  const ui = useUI()
  const outer = React.useContext(DockOuter)
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const current = value ?? inner
  const [scrub, setScrub] = React.useState<string | null>(null)
  const shown = scrub ?? current
  const { register, style: pill, frames } = useSlidingSelection(shown)
  const select = React.useCallback(
    (v: string) => {
      if (!v) return
      setInner(v)
      onValueChange?.(v)
    },
    [onValueChange]
  )
  // frames for the scrub worklet
  const box = useSharedValue<Record<string, LayoutRectangle>>({})
  React.useEffect(() => {
    box.set(frames)
  }, [frames, box])
  const over = (v: string | null) => {
    if (v && v !== scrub) haptics.selection()
    setScrub(v)
  }
  const commit = (v: string | null) => {
    setScrub(null)
    if (v) select(v)
  }
  const last = useSharedValue<string | null>(null)
  const scrubbing = Gesture.Pan()
    .enabled(!outer.minimized)
    .activeOffsetX([-8, 8])
    .failOffsetY([-14, 14])
    .onUpdate((e) => {
      const v = itemAt(box.value, e.x)
      if (v !== null && v !== last.value) {
        last.set(v)
        runOnJS(over)(v)
      }
    })
    .onEnd(() => {
      runOnJS(commit)(last.value)
      last.set(null)
    })
    .onFinalize(() => {
      if (last.value !== null) runOnJS(commit)(null)
      last.set(null)
    })
  const ctx = React.useMemo(() => ({ value: current, shown, select, register }), [current, shown, select, register])
  return (
    <DockContext.Provider value={ctx}>
      <GestureDetector gesture={scrubbing}>
        <Glass
          interactive
          radius={ui.radius.button}
          accessibilityRole="tablist"
          accessibilityLabel={accessibilityLabel ?? "Navigation"}
          style={[{ flexDirection: "row", alignItems: "center", padding: 6, flexShrink: 1 }, style]}
          {...props}
        >
          {/* folded to one item, the item carries its own fill: the pill's frames would be stale from the expanded layout */}
          {outer.minimized ? null : <Animated.View pointerEvents="none" style={[pill, { borderRadius: ui.radius.button, backgroundColor: ui.fill }]} />}
          {children}
        </Glass>
      </GestureDetector>
    </DockContext.Provider>
  )
}

/** A destination. `badge` puts a count in a red badge on its corner; `prominent` tints it like the current one. */
export function DockItem({ value, disabled, badge, prominent = false, style, children, accessibilityLabel, ...props }: Omit<ViewProps, "children"> & { value: string; disabled?: boolean; badge?: React.ReactNode; prominent?: boolean; children?: React.ReactNode }) {
  const ui = useUI()
  const ctx = React.useContext(DockContext)
  const outer = React.useContext(DockOuter)
  if (!ctx) throw new Error("DockItem must be inside DockBar")
  const on = ctx.shown === value
  const color = on || prominent ? ui.primary : ui.foreground
  if (outer.minimized && ctx.value !== value) return null
  const glyphsOnly = outer.minimized ? React.Children.toArray(children).filter((c) => typeof c !== "string" && typeof c !== "number") : children
  const count = badge != null && badge !== false && badge !== 0 ? badge : null
  const label = accessibilityLabel ?? textOf(children)
  return (
    <Press
      haptic
      disabled={disabled}
      onLayout={ctx.register(value)}
      onPress={() => ctx.select(value)}
      accessibilityRole="tab"
      accessibilityLabel={count !== null && label ? `${label}, ${count}` : label || undefined}
      aria-selected={ctx.value === value}
      aria-disabled={disabled}
      style={[
        outer.compact
          ? { height: ui.control.default, flexDirection: "row", gap: 6, paddingHorizontal: ui.pad.sm }
          : { height: ui.control.lg, minWidth: outer.minimized ? ui.control.lg : 72, gap: 2, paddingHorizontal: outer.minimized ? 0 : 12 },
        { alignItems: "center", justifyContent: "center", borderRadius: ui.radius.button, opacity: disabled ? 0.5 : 1 },
        outer.minimized && { backgroundColor: ui.fill },
        web({ cursor: "pointer", userSelect: "none" }),
        style,
      ]}
      {...props}
    >
      {withGlyphs(glyphsOnly, { color, size: outer.compact ? 18 : 21.6, text: "xs", weight: "600" })}
      {count !== null ? (
        <View pointerEvents="none" style={{ position: "absolute", top: 0, left: "50%", marginLeft: outer.minimized ? 8 : 6, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: ui.radius.badge, backgroundColor: ui.destructive, alignItems: "center", justifyContent: "center" }}>
          <GText size="xs" weight="600" maxFontSizeMultiplier={1.2} style={{ color: ui.destructiveForeground, fontSize: 10.4, lineHeight: 13, fontVariant: ["tabular-nums"] }}>
            {count}
          </GText>
        </View>
      ) : null}
    </Press>
  )
}

const textOf = (node: React.ReactNode): string =>
  typeof node === "string" || typeof node === "number" ? String(node) : Array.isArray(node) ? node.map(textOf).filter(Boolean).join(" ") : React.isValidElement<{ children?: React.ReactNode }>(node) ? textOf(node.props.children) : ""

/**
 * The round accent button beside the bar — compose, add. Tinted, interactive Liquid Glass
 * (NAT-39): the accent mixed into the glass, not a solid fill; it grows on press, never dims.
 */
export function DockAction({ style, children, ...props }: Omit<PressableProps, "style" | "children"> & { style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  const ui = useUI()
  const { minimized } = React.useContext(DockOuter)
  const size = minimized ? ui.control.lg : ui.control.lg + 12
  return (
    <Press haptic liquid accessibilityRole="button" style={[web({ cursor: "pointer" }), style]} {...props}>
      <Glass variant="liquid" interactive tint={ui.primary} radius={size / 2} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        {withGlyphs(children, { color: ui.primaryForeground, size: 24 })}
      </Glass>
    </Press>
  )
}
