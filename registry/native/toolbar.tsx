import * as React from "react"
import { View, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { EllipsisIcon } from "lucide-react-native"

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/glass/native/dropdown-menu"
import { Glass, canFade } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { withGlyphs } from "@/components/glass/native/segmented-control"
import { GText, useUI, web, type GTextProps } from "@/components/glass/native/ui"

/**
 * A floating toolbar: groups of buttons sharing one liquid capsule, spacers, a
 * title, an overflow menu and a standalone prominent action. `placement` floats it
 * at the top or bottom (safe-area aware); `minimized` (from useScrollEdges) shrinks it.
 */
function Toolbar({ placement = "top", minimized = false, style, ...props }: ViewProps & { placement?: "top" | "bottom" | "static"; minimized?: boolean }) {
  const insets = useSafeAreaInsets()
  return (
    <View
      role="toolbar"
      pointerEvents="box-none"
      style={[
        { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, zIndex: 40, transform: [{ scale: minimized ? 0.9 : 1 }] },
        placement === "top" && { position: "absolute", left: 0, right: 0, top: Math.max(12, insets.top) },
        placement === "bottom" && { position: "absolute", left: 0, right: 0, bottom: Math.max(12, insets.bottom) },
        style,
      ]}
      {...props}
    />
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

function ToolbarTitle({ style, ...props }: GTextProps) {
  return <GText font="heading" weight="700" numberOfLines={1} align="center" style={[{ flexShrink: 1 }, style]} {...props} />
}

type ItemProps = Omit<PressableProps, "style" | "children"> & { style?: StyleProp<ViewStyle>; children?: React.ReactNode; prominent?: boolean }

/** A toolbar button; `prominent` is the tinted standalone action (Done, Send). */
function ToolbarItem({ prominent = false, style, children, ...props }: ItemProps) {
  const ui = useUI()
  const size = prominent ? ui.control.lg : ui.control.default
  const button = (
    <Press
      haptic
      dim={!prominent || canFade()}
      squash={ui.motion.pressScale}
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
function ToolbarOverflow({ children, label = "More" }: { children?: React.ReactNode; label?: string }) {
  const ui = useUI()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger accessibilityLabel={label} style={{ width: ui.control.default, height: ui.control.default, borderRadius: ui.radius.button, alignItems: "center", justifyContent: "center" }}>
        <EllipsisIcon size={20} color={ui.foreground} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

export { Toolbar, ToolbarGroup, ToolbarItem, ToolbarOverflow, ToolbarSpacer, ToolbarTitle }
