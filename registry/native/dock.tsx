import * as React from "react"
import { Animated, View, type LayoutChangeEvent, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { useSlidingIndicator, withGlyphs } from "@/components/glass/native/segmented-control"
import { alpha, useUI, web } from "@/components/glass/native/ui"

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
 */
export function Dock({ position = "fixed", style, ...props }: ViewProps & { position?: "fixed" | "static" }) {
  const insets = useSafeAreaInsets()
  return (
    <View
      pointerEvents="box-none"
      style={[
        { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, zIndex: 40 },
        position === "fixed" && { position: "absolute", left: 0, right: 0, bottom: Math.max(16, insets.bottom) },
        style,
      ]}
      {...props}
    />
  )
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

export function DockItem({ value, disabled, style, children, ...props }: Omit<ViewProps, "children"> & { value: string; disabled?: boolean; children?: React.ReactNode }) {
  const ui = useUI()
  const ctx = React.useContext(DockContext)
  if (!ctx) throw new Error("DockItem must be inside DockBar")
  const on = ctx.value === value
  const color = on ? ui.primary : ui.foreground
  return (
    <Press
      haptic
      squash={ui.motion.pressScale}
      disabled={disabled}
      onLayout={ctx.register(value)}
      onPress={() => ctx.select(value)}
      accessibilityRole="tab"
      aria-selected={on} aria-disabled={disabled}
      style={[
        { height: 52, minWidth: 72, alignItems: "center", justifyContent: "center", gap: 2, paddingHorizontal: 12, borderRadius: ui.radius.button, opacity: disabled ? 0.5 : 1 },
        web({ cursor: "pointer", userSelect: "none" }),
        style,
      ]}
      {...props}
    >
      {withGlyphs(children, { color, size: 21.6, text: "xs", weight: "600" })}
    </Press>
  )
}

/** The round accent button beside the bar — compose, add, search. */
export function DockAction({ style, children, ...props }: Omit<PressableProps, "style" | "children"> & { style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  const ui = useUI()
  return (
    <Press
      haptic
      squash={ui.motion.pressScale}
      accessibilityRole="button"
      style={[
        { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", backgroundColor: ui.primary, shadowColor: ui.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
        web({ cursor: "pointer", boxShadow: `0 10px 24px ${alpha(ui.primary, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.35)` }),
        style,
      ]}
      {...props}
    >
      {withGlyphs(children, { color: ui.primaryForeground, size: 24 })}
    </Press>
  )
}
