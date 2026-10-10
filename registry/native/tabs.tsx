import * as React from "react"
import { Animated, View, type LayoutChangeEvent, type ViewProps, type ViewStyle } from "react-native"

import { Glass, canFade } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { useReduceMotion, useSlidingIndicator, withGlyphs } from "@/components/glass/native/segmented-control"
import { alpha, useUI, web, type UI } from "@/components/glass/native/ui"

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
  const { register, style: indicator, box } = useSlidingIndicator(value)
  const list = React.useMemo(() => ({ variant, register }), [variant, register])
  const base: ViewStyle = {
    flexDirection: orientation === "vertical" ? "column" : "row",
    alignSelf: "flex-start",
    alignItems: orientation === "vertical" ? "stretch" : "center",
    ...tabsListVariants({ variant, ui }),
  }
  const bar =
    variant === "line" ? (
      <Animated.View
        pointerEvents="none"
        style={{ position: "absolute", height: 2, borderRadius: 1, backgroundColor: ui.primary, left: box.x, width: box.w, top: Animated.add(box.y, Animated.add(box.h, -2)) }}
      />
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

function PanelText({ children }: { children: string }) {
  const ui = useUI()
  return <Animated.Text style={{ fontSize: ui.text.sm, lineHeight: 20, color: ui.foreground }}>{children}</Animated.Text>
}

function Panel({ style, ...props }: ViewProps) {
  const ui = useUI()
  const [t] = React.useState(() => new Animated.Value(0))
  const reduce = useReduceMotion()
  React.useEffect(() => {
    if (reduce.current) t.setValue(1)
    else Animated.timing(t, { toValue: 1, duration: ui.motion.duration, useNativeDriver: true }).start()
  }, [t, reduce, ui.motion.duration])
  return (
    <Animated.View
      accessibilityRole="none"
      style={[{ flex: 1, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [4, 0] }) }] }, canFade() && { opacity: t }, style]}
      {...props}
    />
  )
}
