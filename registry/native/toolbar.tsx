import * as React from "react"
import { ScrollView, View, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useDerivedValue, withSpring } from "react-native-reanimated"
import { EllipsisIcon } from "lucide-react-native"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { useInsets } from "@/components/glass/native/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/glass/native/dropdown-menu"
import { Glass, GlassEffectGroup, canFade } from "@/components/glass/native/glass"
import { allocateToolbarCommands } from "@/components/glass/native/toolbar-layout"
import { Press } from "@/components/glass/native/press"
import { ScrollEdge, useScrollEdge } from "@/components/glass/native/scroll-edge"
import { withGlyphs } from "@/components/glass/native/segmented-control"
import { GIcon, GText, useUI, web, type GTextProps } from "@/components/glass/native/ui"

const ToolbarContext = React.createContext({ minimized: false, joined: false })

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
  const joined = placement === "top" && !!edges?.overTop
  const scale = useDerivedValue(() => (reduced ? (minimized ? 0.9 : 1) : withSpring(minimized ? 0.9 : 1, ui.motion.springConfig)), [minimized, reduced])
  const shrink = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const ctx = React.useMemo(() => ({ minimized, joined }), [minimized, joined])
  return (
    <ToolbarContext.Provider value={ctx}>
      <View
        role="toolbar"
        pointerEvents="box-none"
        style={[
          { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, zIndex: 40 },
          placement === "top" && { position: "absolute", left: 0, right: 0, top: 0, paddingTop: Math.max(12, insets.top), paddingBottom: 8 },
          placement === "bottom" && { position: "absolute", left: 0, right: 0, bottom: Math.max(12, insets.bottom) },
          style,
        ]}
        {...props}
      >
        {placement === "top" ? <ScrollEdge visible={joined} size={Math.max(12, insets.top) + ui.control.lg + 8} /> : null}
        <Animated.View style={[{ flex: 1, transformOrigin: placement === "bottom" ? "bottom" : "top" }, shrink]}>
          <GlassEffectGroup spacing={8} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {children}
          </GlassEffectGroup>
        </Animated.View>
      </View>
    </ToolbarContext.Provider>
  )
}

/** Items sharing one piece of liquid glass. */
function ToolbarGroup({ style, ...props }: ViewProps) {
  const ui = useUI()
  const { joined } = React.useContext(ToolbarContext)
  const layout: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 2, padding: 4 }
  return joined ? <View role="group" style={[layout, style]} {...props} /> : <Glass interactive role="group" radius={ui.radius.button} style={[layout, style]} {...props} />
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
      style={[{ minWidth: size, minHeight: size, paddingVertical: 6, paddingHorizontal: 8, borderRadius: ui.radius.button, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" }, web({ cursor: "pointer" }), style]}
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
        <GIcon><EllipsisIcon size={20} color={ui.foreground} /></GIcon>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

export type ToolbarCommand = {
  id: string
  label: string
  icon?: React.ReactNode
  onSelect: () => void
  priority?: number
  pinned?: boolean
  disabled?: boolean
  overflow?: "auto" | "always"
}

/** Hidden, unconstrained copies measure intrinsic widths including Dynamic Type. */
function ToolbarCommands({ commands, overflowLabel = "More actions", style, onLayout, ...props }: ViewProps & { commands: readonly ToolbarCommand[]; overflowLabel?: string }) {
  const ui = useUI()
  const [width, setWidth] = React.useState(0)
  const [widths, setWidths] = React.useState<Record<string, number>>({})
  const [overflowWidth, setOverflowWidth] = React.useState(ui.control.default)
  const layout = allocateToolbarCommands(commands.map(command => ({ ...command, width: widths[command.id] ?? 0 })), width, { gap: 2, padding: 8, groupGap: 8, overflowWidth })
  const latest = React.useRef(commands)
  React.useLayoutEffect(() => { latest.current = commands }, [commands])
  const activate = (id: string) => {
    const command = latest.current.find(item => item.id === id)
    if (command && !command.disabled) command.onSelect()
  }
  // iOS bar items show a symbol or a word, not both; More spells the label out
  const renderCommand = (id: string) => {
    const command = commands.find(item => item.id === id)!
    return <ToolbarItem key={id} testID={`toolbar-command-${id}`} accessibilityLabel={command.label} aria-disabled={!!command.disabled} disabled={command.disabled} onPress={() => activate(id)}>{command.icon ? <GIcon color={command.disabled ? ui.labelTertiary : ui.foreground}>{command.icon as React.ReactElement<{ color?: string; size?: number }>}</GIcon> : <GText size="sm" dynamicTypeRamp="subheadline" color={command.disabled ? ui.labelTertiary : undefined}>{command.label}</GText>}</ToolbarItem>
  }
  return <View role="toolbar" onLayout={event => { setWidth(event.nativeEvent.layout.width); onLayout?.(event) }} style={[{ width: "100%", minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8 }, style]} {...props}>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden style={{ position: "absolute", left: -100000, top: 0, flexDirection: "row" }}>
      {commands.map(command => <View key={command.id} testID={`toolbar-measure-${command.id}`} onLayout={event => { const measured = event.nativeEvent.layout.width; setWidths(previous => previous[command.id] === measured ? previous : { ...previous, [command.id]: measured }) }}><ToolbarItem accessible={false} focusable={false}>{command.icon ? <GIcon color={command.disabled ? ui.labelTertiary : ui.foreground}>{command.icon as React.ReactElement<{ color?: string; size?: number }>}</GIcon> : <GText size="sm" dynamicTypeRamp="subheadline" color={command.disabled ? ui.labelTertiary : undefined}>{command.label}</GText>}</ToolbarItem></View>)}
      <View testID="toolbar-measure-overflow" onLayout={event => setOverflowWidth(event.nativeEvent.layout.width)}><ToolbarItem accessible={false} focusable={false}><GIcon><EllipsisIcon size={20} color={ui.foreground} /></GIcon></ToolbarItem></View>
    </View>
    {layout.visible.length || layout.overflow.length ? <ToolbarGroup style={{ flexShrink: 0 }}>
      {layout.visible.map(renderCommand)}
      {layout.overflow.length ? <DropdownMenu>
        <DropdownMenuTrigger accessibilityLabel={overflowLabel} style={{ minWidth: overflowWidth, minHeight: ui.control.default, alignItems: "center", justifyContent: "center" }}><GIcon><EllipsisIcon size={20} color={ui.foreground} /></GIcon></DropdownMenuTrigger>
        <DropdownMenuContent align="end">{layout.overflow.map(id => {
          const command = commands.find(item => item.id === id)!
          return <DropdownMenuItem key={id} disabled={command.disabled} onSelect={() => activate(id)}>{command.label}</DropdownMenuItem>
        })}</DropdownMenuContent>
      </DropdownMenu> : null}
    </ToolbarGroup> : null}
    {layout.pinned.length ? <ScrollView horizontal accessibilityLabel="Pinned actions" showsHorizontalScrollIndicator={layout.scrollPinned} style={{ flexGrow: 0, flexShrink: 1, minWidth: 0, marginLeft: "auto" }} contentContainerStyle={{ alignItems: "center" }}><ToolbarGroup>{layout.pinned.map(renderCommand)}</ToolbarGroup></ScrollView> : null}
  </View>
}

export { ToolbarCommands, Toolbar, ToolbarGroup, ToolbarItem, ToolbarOverflow, ToolbarSpacer, ToolbarTitle }
