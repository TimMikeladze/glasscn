import * as React from "react"
import { Animated, View, type LayoutChangeEvent, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Glass, canFade } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { SearchField } from "@/components/glass/native/search-field"
import { useSlidingIndicator, withGlyphs } from "@/components/glass/native/segmented-control"
import { GText, useUI, web } from "@/components/glass/native/ui"

/**
 * The floating tab bar: a glass capsule of destinations with a pill that slides
 * to the current one, and an optional round action beside it.
 *
 *   <Dock>
 *     <DockBar value={tab} onValueChange={setTab}>
 *       <DockItem value="today"><MoonIcon />Today</DockItem>
 *       …
 *     </DockBar>
 *     <DockAction accessibilityLabel="Write"><PenIcon /></DockAction>
 *   </Dock>
 *
 * `minimized` (from useScrollEdges in scroll-edge) folds the bar to its current item;
 * a DockAccessory sits above the bar, inline beside it when minimized (`usePlacement()`).
 */
type Placement = "expanded" | "inline"
type DockCtxValue = { minimized: boolean; placement: Placement; compact: boolean; setSearching: (on: boolean) => void }
const DockOuter = React.createContext<DockCtxValue>({ minimized: false, placement: "expanded", compact: false, setSearching: () => {} })

/** Where a DockAccessory sits: above the bar or inline beside the minimized bar. */
export function usePlacement(): Placement {
  return React.useContext(DockOuter).placement
}

export function Dock({ position = "fixed", minimized: scrolled = false, layout = "default", style, children, ...props }: ViewProps & { position?: "fixed" | "static"; minimized?: boolean; layout?: "default" | "compact" }) {
  const insets = useSafeAreaInsets()
  const [searching, setSearching] = React.useState(false)
  const minimized = scrolled || searching
  const ctx = React.useMemo<DockCtxValue>(() => ({ minimized, placement: minimized ? "inline" : "expanded", compact: layout === "compact", setSearching }), [minimized, layout])
  return (
    <DockOuter.Provider value={ctx}>
      <View
        pointerEvents="box-none"
        style={[
          { flexDirection: "row", flexWrap: minimized ? "nowrap" : "wrap", alignItems: "center", justifyContent: "center", gap: 12, rowGap: 8, paddingHorizontal: 12, zIndex: 40 },
          position === "fixed" && { position: "absolute", left: 0, right: 0, bottom: Math.max(16, insets.bottom) },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </DockOuter.Provider>
  )
}

/** A companion strip (now playing, a draft) above the bar; inline beside it when the dock is minimized. */
export function DockAccessory({ style, ...props }: ViewProps) {
  const ui = useUI()
  const placement = usePlacement()
  return (
    <Glass
      interactive
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

type Ctx = { value: string; select: (v: string) => void; register: (v: string) => (e: LayoutChangeEvent) => void }
const DockContext = React.createContext<Ctx | null>(null)

type DockBarProps = Omit<ViewProps, "children"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
}

export function DockBar({ value, defaultValue, onValueChange, accessibilityLabel, style, children, ...props }: DockBarProps) {
  const ui = useUI()
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const current = value ?? inner
  const { register, style: pill } = useSlidingIndicator(current)
  const select = React.useCallback(
    (v: string) => {
      if (!v) return
      setInner(v)
      onValueChange?.(v)
    },
    [onValueChange]
  )
  const ctx = React.useMemo(() => ({ value: current, select, register }), [current, select, register])
  return (
    <DockContext.Provider value={ctx}>
      <Glass
        interactive
        radius={ui.radius.button}
        accessibilityRole="tablist"
        accessibilityLabel={accessibilityLabel ?? "Navigation"}
        style={[{ flexDirection: "row", alignItems: "center", padding: 6 }, style]}
        {...props}
      >
        <Animated.View pointerEvents="none" style={[pill, { borderRadius: ui.radius.button, backgroundColor: ui.fill }]} />
        {children}
      </Glass>
    </DockContext.Provider>
  )
}

export function DockItem({ value, disabled, badge, prominent = false, style, children, ...props }: Omit<ViewProps, "children"> & { value: string; disabled?: boolean; badge?: React.ReactNode; prominent?: boolean; children?: React.ReactNode }) {
  const ui = useUI()
  const ctx = React.useContext(DockContext)
  const outer = React.useContext(DockOuter)
  if (!ctx) throw new Error("DockItem must be inside DockBar")
  const on = ctx.value === value
  const color = on || prominent ? ui.primary : ui.foreground
  if (outer.minimized && !on) return null
  const glyphsOnly = outer.minimized
    ? React.Children.toArray(children).filter((c) => typeof c !== "string" && typeof c !== "number")
    : children
  return (
    <Press
      haptic
      squash={ui.motion.pressScale}
      disabled={disabled}
      onLayout={ctx.register(value)}
      onPress={() => ctx.select(value)}
      accessibilityRole="tab"
      accessibilityLabel={typeof badge === "number" || typeof badge === "string" ? undefined : props.accessibilityLabel}
      aria-selected={on} aria-disabled={disabled}
      style={[
        outer.compact
          ? { height: ui.control.default, flexDirection: "row", gap: 6, paddingHorizontal: ui.pad.sm }
          : { height: ui.control.lg, minWidth: outer.minimized ? ui.control.lg : 72, gap: 2, paddingHorizontal: outer.minimized ? 0 : 12 },
        { alignItems: "center", justifyContent: "center", borderRadius: ui.radius.button, opacity: disabled ? 0.5 : 1 },
        web({ cursor: "pointer", userSelect: "none" }),
        style,
      ]}
      {...props}
    >
      {withGlyphs(glyphsOnly, { color, size: outer.compact ? 18 : 21.6, text: "xs", weight: "600" })}
      {badge != null && badge !== false && badge !== 0 ? (
        <View pointerEvents="none" style={{ position: "absolute", top: 0, left: "50%", marginLeft: 6, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: ui.destructive, alignItems: "center", justifyContent: "center" }}>
          <GText size="xs" weight="600" style={{ color: ui.destructiveForeground, fontSize: 10.4 }}>
            {badge}
          </GText>
        </View>
      ) : null}
    </Press>
  )
}

/** The round accent button beside the bar — compose, add. Tinted liquid glass: the accent in the glass, not a solid fill. */
export function DockAction({ style, children, ...props }: Omit<PressableProps, "style" | "children"> & { style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  const ui = useUI()
  const { minimized } = React.useContext(DockOuter)
  const size = minimized ? ui.control.lg : ui.control.lg + 12
  return (
    <Press haptic dim={canFade()} squash={ui.motion.pressScale} accessibilityRole="button" style={[web({ cursor: "pointer" }), style]} {...props}>
      <Glass interactive tint={ui.primary} radius={size / 2} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        {withGlyphs(children, { color: ui.primaryForeground, size: 24 })}
      </Glass>
    </Press>
  )
}
