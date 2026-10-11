import * as React from "react"
import { View, type LayoutChangeEvent, type ViewProps, type ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { Glass, canFade } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { useSlidingSelection, withGlyphs } from "@/components/glass/native/segmented-control"
import { GText, alpha, useUI, web, type UI } from "@/components/glass/native/ui"

type Orientation = "horizontal" | "vertical"
type Variant = "default" | "plain" | "line"

type TabsCtx = { value: string; select: (v: string) => void; orientation: Orientation }
const TabsContext = React.createContext<TabsCtx | null>(null)
const ListContext = React.createContext<{ variant: Variant; register: (v: string) => (e: LayoutChangeEvent) => void } | null>(null)

function useTabs() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("Tabs parts must be inside <Tabs>")
  return ctx
}

type TabsProps = ViewProps & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: Orientation
}

export function Tabs({ value, defaultValue, onValueChange, orientation = "horizontal", style, ...props }: TabsProps) {
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const current = value ?? inner
  const select = React.useCallback(
    (v: string) => {
      setInner(v)
      onValueChange?.(v)
    },
    [onValueChange]
  )
  const ctx = React.useMemo(() => ({ value: current, select, orientation }), [current, select, orientation])
  return (
    <TabsContext.Provider value={ctx}>
      <View style={[{ flexDirection: orientation === "horizontal" ? "column" : "row", gap: 12 }, style]} {...props} />
    </TabsContext.Provider>
  )
}

/** The list's track style per variant — the native stand-in for the web cva. */
export function tabsListVariants({ variant = "default", ui }: { variant?: Variant | null; ui: UI }): ViewStyle {
  if (variant === "line") return { gap: 4, padding: 0, borderRadius: 0 }
  return { padding: 4, borderRadius: ui.radius.button }
}

/**
 * The trigger row: `default` is a glass capsule with a sliding pill, `plain`
 * drops the track, `line` slides an underline.
 */
export function TabsList({ variant = "default", style, children, ...props }: ViewProps & { variant?: Variant }) {
  const ui = useUI()
  const { value, orientation } = useTabs()
  const { register, style: indicator } = useSlidingSelection(value)
  const list = React.useMemo(() => ({ variant, register }), [variant, register])
  const base: ViewStyle = {
    flexDirection: orientation === "vertical" ? "column" : "row",
    alignSelf: "flex-start",
    alignItems: orientation === "vertical" ? "stretch" : "center",
    ...tabsListVariants({ variant, ui }),
  }
  const bar =
    variant === "line" ? (
      <Animated.View pointerEvents="none" style={indicator}>
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, borderRadius: 1, backgroundColor: ui.primary }} />
      </Animated.View>
    ) : (
      <Animated.View pointerEvents="none" style={[indicator, { borderRadius: ui.radius.button, backgroundColor: ui.fillStrong }, web({ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" })]} />
    )
  const inner = (
    <>
      {bar}
      {children}
    </>
  )
  return (
    <ListContext.Provider value={list}>
      {variant === "default" ? (
        <Glass radius={ui.radius.button} raised={false} accessibilityRole="tablist" style={[base, style]} {...props}>
          {inner}
        </Glass>
      ) : (
        <View accessibilityRole="tablist" style={[base, style]} {...props}>
          {inner}
        </View>
      )}
    </ListContext.Provider>
  )
}

export function TabsTrigger({ value, disabled, style, children, ...props }: Omit<ViewProps, "children"> & { value: string; disabled?: boolean; children?: React.ReactNode }) {
  const ui = useUI()
  const tabs = useTabs()
  const list = React.useContext(ListContext)
  const line = list?.variant === "line"
  const on = tabs.value === value
  const color = on ? (line ? ui.primary : ui.foreground) : alpha(ui.foreground, 0.65)
  return (
    <Press
      haptic
      squash={1}
      hitSlop={6}
      disabled={disabled}
      onLayout={list?.register(value)}
      onPress={() => tabs.select(value)}
      accessibilityRole="tab"
      aria-selected={on} aria-disabled={disabled}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: tabs.orientation === "vertical" ? "flex-start" : "center",
          gap: 6,
          height: line ? 36 : 32,
          minWidth: 44,
          paddingHorizontal: line ? 8 : 14,
          borderRadius: line ? 0 : ui.radius.button,
          opacity: disabled ? 0.5 : 1,
        },
        tabs.orientation === "horizontal" && { flexGrow: 1 },
        web({ cursor: disabled ? "default" : "pointer", userSelect: "none" }),
        style,
      ]}
      {...props}
    >
      {withGlyphs(children, { color, size: 16, text: "sm", weight: "500" })}
    </Press>
  )
}

/** The active tab's panel: rises in (and fades where glass allows it). */
export function TabsContent({ value, style, children, ...props }: ViewProps & { value: string }) {
  const tabs = useTabs()
  if (tabs.value !== value) return null
  return (
    <Panel key={value} style={style} {...props}>
      {typeof children === "string" ? <PanelText>{children}</PanelText> : children}
    </Panel>
  )
}

/** A string panel's text (NAT-41: GText, so it takes the theme's type and Dynamic Type caps). */
function PanelText({ children }: { children: string }) {
  return <GText size="sm">{children}</GText>
}

/** The panel rises 4pt in; it fades too only where nothing inside could be Liquid Glass's ancestor. */
function Panel({ style, ...props }: ViewProps) {
  const ui = useUI()
  const reduced = useReducedMotion()
  const t = useSharedValue(reduced ? 1 : 0)
  React.useEffect(() => {
    t.set(reduced ? 1 : withSpring(1, ui.motion.springConfig))
  }, [t, reduced, ui.motion.springConfig])
  const fade = canFade()
  const rise = useAnimatedStyle(() => ({ transform: [{ translateY: 4 * (1 - t.value) }], opacity: fade ? Math.min(1, t.value) : 1 }))
  return <Animated.View role="tabpanel" style={[{ flex: 1 }, rise, style]} {...props} />
}
