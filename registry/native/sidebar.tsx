import * as React from "react"
import { Animated, ScrollView, StyleSheet, View, useWindowDimensions, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { PanelLeftIcon } from "lucide-react-native"

import { reduceMotion } from "@/components/glass/native/dialog"
import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { withGlyphs } from "@/components/glass/native/segmented-control"
import { GText, useUI, web, type GTextProps } from "@/components/glass/native/ui"

type Ctx = { open: boolean; setOpen: (open: boolean) => void; toggle: () => void; width: number; overlay: boolean }
const SidebarContext = React.createContext<Ctx | null>(null)

export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>")
  return ctx
}

/** Holds open state. Wide windows (≥ 768) show it beside the content; narrow ones open it over the content. */
function SidebarProvider({ defaultOpen, width = 272, style, children, ...props }: ViewProps & { defaultOpen?: boolean; width?: number }) {
  const { width: window } = useWindowDimensions()
  const overlay = window < 768
  const [open, setOpen] = React.useState(defaultOpen ?? !overlay)
  const ctx = React.useMemo(() => ({ open, setOpen, toggle: () => setOpen((o) => !o), width: Math.min(width, window - 24), overlay }), [open, width, window, overlay])
  return (
    <SidebarContext.Provider value={ctx}>
      <View style={[{ flex: 1 }, style]} {...props}>
        {children}
      </View>
    </SidebarContext.Provider>
  )
}

/** The floating, inset liquid panel. Slides off the leading edge when closed. */
function Sidebar({ style, children, ...props }: ViewProps) {
  const ui = useUI()
  const insets = useSafeAreaInsets()
  const { open, setOpen, width, overlay } = useSidebar()
  const [x] = React.useState(() => new Animated.Value(open ? 0 : -width - 16))
  React.useEffect(() => {
    const to = open ? 0 : -width - 16
    if (reduceMotion()) x.setValue(to)
    else Animated.spring(x, { toValue: to, ...ui.motion.spring, useNativeDriver: true }).start()
  }, [open, width, x, ui.motion.spring])
  return (
    <>
      {overlay && open ? <Press accessibilityRole="button" accessibilityLabel="Close sidebar" onPress={() => setOpen(false)} style={[StyleSheet.absoluteFill, { zIndex: 40, backgroundColor: "rgba(0,0,0,0.2)" }]} /> : null}
      <Animated.View
        aria-hidden={!open}
        style={{ position: "absolute", zIndex: 50, top: insets.top + 12, bottom: insets.bottom + 12, left: insets.left + 12, width, transform: [{ translateX: x }] }}
      >
        <Glass interactive radius={ui.radius.surface} role="navigation" style={[{ flex: 1, overflow: "hidden" }, style]} {...props}>
          {children}
        </Glass>
      </Animated.View>
    </>
  )
}

/** The content: clears the open sidebar on wide windows. */
function SidebarInset({ style, ...props }: ViewProps) {
  const { open, width, overlay } = useSidebar()
  return <View role="main" style={[{ flex: 1, paddingLeft: open && !overlay ? width + 24 : 0 }, style]} {...props} />
}

/** Media that runs on under the sidebar: a mirrored, softened copy fills the strip behind it. */
function BackgroundExtension({ children, style, ...props }: ViewProps) {
  const { open, width, overlay } = useSidebar()
  return (
    <View style={[{ position: "relative" }, style]} {...props}>
      {open && !overlay ? (
        <View aria-hidden pointerEvents="none" style={[{ position: "absolute", top: 0, bottom: 0, left: -(width + 24), width: width + 24, overflow: "hidden", opacity: 0.7, transform: [{ scaleX: -1 }] }, web({ filter: "blur(24px)" })]}>
          {children}
        </View>
      ) : null}
      {children}
    </View>
  )
}

function SidebarTrigger({ style, ...props }: Omit<PressableProps, "style" | "children"> & { style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  const { open, toggle } = useSidebar()
  return (
    <Press haptic accessibilityRole="button" accessibilityLabel="Toggle sidebar" aria-expanded={open} onPress={toggle} style={style} {...props}>
      <Glass interactive radius={ui.radius.button} style={{ width: ui.control.default, height: ui.control.default, alignItems: "center", justifyContent: "center" }}>
        <PanelLeftIcon size={18} color={ui.foreground} />
      </Glass>
    </Press>
  )
}

function SidebarHeader({ style, ...props }: ViewProps) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap: 8, padding: 12 }, style]} {...props} />
}

function SidebarFooter({ style, ...props }: ViewProps) {
  return <View style={[{ marginTop: "auto", gap: 8, padding: 12 }, style]} {...props} />
}

function SidebarContent({ style, children, ...props }: ViewProps) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[{ gap: 12, paddingHorizontal: 8, paddingBottom: 8 }, style]} {...props}>
      {children}
    </ScrollView>
  )
}

function SidebarGroup({ style, ...props }: ViewProps) {
  return <View role="group" style={[{ gap: 2 }, style]} {...props} />
}

function SidebarGroupLabel({ style, ...props }: GTextProps) {
  return <GText size="xs" weight="600" tone="muted" style={[{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 }, style]} {...props} />
}

function SidebarMenu({ style, ...props }: ViewProps) {
  return <View role="list" style={[{ gap: 2 }, style]} {...props} />
}

function SidebarMenuItem(props: ViewProps) {
  return <View role="listitem" {...props} />
}

type ButtonProps = Omit<PressableProps, "style" | "children"> & { style?: StyleProp<ViewStyle>; children?: React.ReactNode; isActive?: boolean }

/** A row; `isActive` marks the current destination. */
function SidebarMenuButton({ isActive = false, style, children, ...props }: ButtonProps) {
  const ui = useUI()
  return (
    <Press
      accessibilityRole="button"
      aria-current={isActive ? "page" : undefined}
      style={[{ height: ui.control.default, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: ui.pad.sm, borderRadius: ui.radius.control, backgroundColor: isActive ? ui.fillStrong : "transparent" }, web({ cursor: "pointer" }), style]}
      {...props}
    >
      {withGlyphs(children, { color: isActive ? ui.primary : ui.foreground, size: 18, weight: isActive ? "600" : "400" })}
    </Press>
  )
}

/** The second (and last) level. */
function SidebarMenuSub({ style, ...props }: ViewProps) {
  const ui = useUI()
  return <View role="list" style={[{ marginLeft: 20, paddingLeft: 8, borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: ui.separator, gap: 2 }, style]} {...props} />
}

const SidebarMenuSubItem = SidebarMenuItem

function SidebarMenuSubButton({ style, ...props }: ButtonProps) {
  const ui = useUI()
  return <SidebarMenuButton style={[{ height: ui.control.sm }, style]} {...props} />
}

export {
  BackgroundExtension,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
}
