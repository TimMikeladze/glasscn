import * as React from "react"
import { View, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useDerivedValue, withSpring } from "react-native-reanimated"
import { EllipsisIcon } from "lucide-react-native"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { useInsets } from "@/components/glass/native/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/glass/native/dropdown-menu"
import { Glass, GlassEffectGroup, canFade } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { useScrollEdge } from "@/components/glass/native/scroll-edge"
import { withGlyphs } from "@/components/glass/native/segmented-control"
import { GText, useUI, web, type GTextProps } from "@/components/glass/native/ui"

const ToolbarContext = React.createContext({ minimized: false })

/**
 * A floating toolbar: groups of buttons sharing one liquid capsule, spacers, a
 * title, an overflow menu and a standalone prominent action. `placement` floats it
 * at the top or bottom (safe-area aware). `minimize="onScrollDown"` shrinks it while
 * the ScrollEdgeProvider's content scrolls down; `minimized` drives it by hand.
 */
function Toolbar({
  placement = "top",
  minimize = "never",
  minimized: minimizedProp,
  style,
  children,
  ...props
}: ViewProps & { placement?: "top" | "bottom" | "static"; minimize?: "never" | "onScrollDown"; minimized?: boolean }) {
  const ui = useUI()
  const insets = useInsets()
  const reduced = useReducedMotion()
  const edges = useScrollEdge()
  const minimized = minimizedProp ?? (minimize === "onScrollDown" && !!edges?.minimized)
  const scale = useDerivedValue(() => (reduced ? (minimized ? 0.9 : 1) : withSpring(minimized ? 0.9 : 1, ui.motion.springConfig)), [minimized, reduced])
  const shrink = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const ctx = React.useMemo(() => ({ minimized }), [minimized])
  return (
    <ToolbarContext.Provider value={ctx}>
      <Animated.View
        role="toolbar"
        pointerEvents="box-none"
        style={[
          { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, zIndex: 40, transformOrigin: placement === "bottom" ? "bottom" : "top" },
          placement === "top" && { position: "absolute", left: 0, right: 0, top: Math.max(12, insets.top) },
          placement === "bottom" && { position: "absolute", left: 0, right: 0, bottom: Math.max(12, insets.bottom) },
          shrink,
          style,
        ]}
        {...props}
      >
        <GlassEffectGroup spacing={8} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
          {children}
        </GlassEffectGroup>
      </Animated.View>
    </ToolbarContext.Provider>
  )
}

/** Items sharing one piece of liquid glass. */
function ToolbarGroup({ style, ...props }: ViewProps) {
  const ui = useUI()
  return <Glass interactive role="group" radius={ui.radius.button} style={[{ flexDirection: "row", alignItems: "center", gap: 2, padding: 4 }, style]} {...props} />
}

function ToolbarSpacer({ variant = "flexible" }: { variant?: "flexible" | "fixed" }) {
  return <View aria-hidden style={variant === "flexible" ? { flex: 1 } : { width: 8 }} />
}

/** The title between the groups: centred, truncating; hidden while minimized. */
function ToolbarTitle({ style, ...props }: GTextProps) {
  const { minimized } = React.useContext(ToolbarContext)
  if (minimized) return null
  return <GText font="heading" weight="700" numberOfLines={1} align="center" accessibilityRole="header" style={[{ flexShrink: 1 }, style]} {...props} />
}

type ItemProps = Omit<PressableProps, "style" | "children"> & { style?: StyleProp<ViewStyle>; children?: React.ReactNode; prominent?: boolean }

/** A toolbar button; `prominent` is the tinted standalone action (Done, Send). */
function ToolbarItem({ prominent = false, style, children, ...props }: ItemProps) {
  const ui = useUI()
  const size = prominent ? ui.control.lg : ui.control.default
  const button = (
    <Press
      haptic
      // inside the glass, so dimming the label is safe; the prominent capsule grows instead
      dim={!prominent && canFade()}
      liquid={prominent}
      accessibilityRole="button"
      hitSlop={6}
      style={[{ minWidth: size, height: size, paddingHorizontal: 8, borderRadius: ui.radius.button, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" }, web({ cursor: "pointer" }), style]}
      {...props}
    >
      {withGlyphs(children, { color: prominent ? ui.primaryForeground : ui.foreground, size: 20, weight: "500" })}
    </Press>
  )
  return prominent ? (
    <Glass interactive radius={ui.radius.button} tint={ui.primary}>
      {button}
    </Glass>
  ) : (
    button
  )
}

/** "More": the overflow, in a glass menu. Children are DropdownMenu items. */
function ToolbarOverflow({ children, label = "More", align = "end" }: { children?: React.ReactNode; label?: string; align?: "start" | "center" | "end" }) {
  const ui = useUI()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger accessibilityLabel={label} hitSlop={Math.ceil((44 - ui.control.default) / 2)} style={{ width: ui.control.default, height: ui.control.default, borderRadius: ui.radius.button, alignItems: "center", justifyContent: "center" }}>
        <EllipsisIcon size={20} color={ui.foreground} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

export { Toolbar, ToolbarGroup, ToolbarItem, ToolbarOverflow, ToolbarSpacer, ToolbarTitle }
