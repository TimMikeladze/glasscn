import * as React from "react"
import { I18nManager, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useDerivedValue, withSpring } from "react-native-reanimated"
import { PanelLeftIcon } from "lucide-react-native"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { useInsets } from "@/components/glass/native/dialog"
import { BackgroundExtension } from "@/components/glass/native/background-extension"
import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { withGlyphs } from "@/components/glass/native/segmented-control"
import { GIcon, GText, useUI, web, type GTextProps } from "@/components/glass/native/ui"

type Ctx = { open: boolean; setOpen: (open: boolean) => void; toggle: () => void; width: number; overlay: boolean }
const SidebarContext = React.createContext<Ctx | null>(null)

export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>")
  return ctx
}

/** Holds open state. Wide windows (≥ 768) show it beside the content; narrow ones open it over the content. */
function SidebarProvider({ defaultOpen, width = 272, style, children, onLayout, ...props }: ViewProps & { defaultOpen?: boolean; width?: number }) {
  const { width: window } = useWindowDimensions()
  const [measured, setMeasured] = React.useState<number | null>(null)
  const available = measured ?? window
  const overlay = available < 768
  const [requested, setOpen] = React.useState(defaultOpen)
  const open = requested ?? !overlay
  const ctx = React.useMemo(() => ({ open, setOpen, toggle: () => setOpen(!open), width: Math.max(0, Math.min(width, available - 24)), overlay }), [open, width, available, overlay])
  return (
    <SidebarContext.Provider value={ctx}>
      <View style={[{ flex: 1 }, style]} onLayout={(event) => { setMeasured(event.nativeEvent.layout.width); onLayout?.(event) }} {...props}>
        {children}
      </View>
    </SidebarContext.Provider>
  )
}

/** Wide sidebars meet window edges; compact presentations float over the content. */
function Sidebar({ style, children, ...props }: ViewProps) {
  const ui = useUI()
  const insets = useInsets()
  const reduced = useReducedMotion()
  const { open, setOpen, width, overlay } = useSidebar()
  const leadingInset = I18nManager.isRTL ? insets.right : insets.left
  const direction = I18nManager.isRTL ? 1 : -1
  const x = useDerivedValue(() => {
    const to = open ? 0 : direction * (width + 16 + leadingInset)
    return reduced ? to : withSpring(to, ui.motion.springConfig)
  }, [open, width, reduced, leadingInset, direction])
  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))
  const scrim = useAnimatedStyle(() => ({ opacity: Math.max(0, Math.min(1, 1 - Math.abs(x.value) / (width + 16))) }))
  const content = (
    <>
      {overlay && open ? (
        <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 40 }, scrim]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close sidebar" onPress={() => setOpen(false)} style={[StyleSheet.absoluteFill, { backgroundColor: ui.dim }]} />
        </Animated.View>
      ) : null}
      <Animated.View
        aria-hidden={!open}
        importantForAccessibility={open ? "auto" : "no-hide-descendants"}
        accessibilityViewIsModal={overlay && open}
        style={[{ position: "absolute", zIndex: 50, top: overlay ? insets.top + 12 : 0, bottom: overlay ? insets.bottom + 12 : 0, start: overlay ? leadingInset + 12 : 0, width }, slide]}
      >
        <Glass variant="liquid" radius={overlay ? ui.radius.surface : 0} raised={overlay} role="navigation" style={[{ flex: 1, overflow: "hidden", paddingTop: overlay ? 0 : insets.top, paddingBottom: overlay ? 0 : insets.bottom }, style]} {...props}>
          {children}
        </Glass>
      </Animated.View>
    </>
  )
  return overlay ? <Modal visible={open} transparent animationType="none" presentationStyle="overFullScreen" onRequestClose={() => setOpen(false)}>{content}</Modal> : content
}

/** The content: clears the open sidebar on wide windows. */
function SidebarInset({ style, ...props }: ViewProps) {
  const { open, width, overlay } = useSidebar()
  return <View role="main" style={[{ flex: 1, paddingStart: open && !overlay ? width : 0 }, style]} {...props} />
}

function SidebarTrigger({ style, ...props }: Omit<PressableProps, "style" | "children"> & { style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  const { open, toggle } = useSidebar()
  return (
    <Press haptic liquid accessibilityRole="button" accessibilityLabel="Toggle sidebar" aria-expanded={open} onPress={toggle} style={style} {...props}>
      <Glass variant="liquid" interactive radius={ui.radius.button} style={{ width: ui.control.default, height: ui.control.default, alignItems: "center", justifyContent: "center" }}>
        <GIcon><PanelLeftIcon size={18} color={ui.foreground} /></GIcon>
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
      aria-selected={isActive}
      style={[{ minHeight: Math.max(44, ui.control.default), flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: ui.pad.sm, borderRadius: ui.radius.control, backgroundColor: isActive ? ui.fillStrong : "transparent" }, web({ cursor: "pointer" }), style]}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (typeof child === "string" || typeof child === "number") return <GText size="sm" color={ui.foreground} weight={isActive ? "600" : "400"}>{child}</GText>
        if (React.isValidElement(child) && (child.type === GText || child.type === Text)) return child
        return withGlyphs(child, { color: ui.primary, size: 18 })
      })}
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
