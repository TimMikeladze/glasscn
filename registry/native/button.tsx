import * as React from "react"
import { View, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native"

import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { GText, alpha, useUI, web, type UI } from "@/components/glass/native/ui"

type Variant = "default" | "glass" | "tinted" | "secondary" | "outline" | "ghost" | "destructive" | "link"
type Size = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
type Shape = "pill" | "rounded"

const SIZES: Record<Size, { h: keyof UI["control"]; pad: keyof UI["pad"] | 0; gap: number; font: number; icon: number }> = {
  default: { h: "default", pad: "default", gap: 8, font: 14, icon: 16 },
  xs: { h: "xs", pad: "xs", gap: 4, font: 12, icon: 12 },
  sm: { h: "sm", pad: "sm", gap: 6, font: 12.8, icon: 14 },
  lg: { h: "lg", pad: "lg", gap: 8, font: 16, icon: 20 },
  icon: { h: "default", pad: 0, gap: 0, font: 14, icon: 16 },
  "icon-xs": { h: "xs", pad: 0, gap: 0, font: 12, icon: 12 },
  "icon-sm": { h: "sm", pad: 0, gap: 0, font: 12.8, icon: 14 },
  "icon-lg": { h: "lg", pad: 0, gap: 0, font: 16, icon: 20 },
}

/**
 * The resolved styles for a variant/size/shape — the native stand-in for the web's
 * cva helper, so other components can look like a button.
 */
function buttonVariants(ui: UI, { variant = "default", size = "default", shape = "pill" }: { variant?: Variant; size?: Size; shape?: Shape } = {}) {
  const s = SIZES[size]
  const height = ui.control[s.h]
  const icon = s.pad === 0
  const bg: Record<Variant, string> = {
    default: ui.primary,
    glass: "transparent",
    tinted: alpha(ui.primary, ui.scheme === "dark" ? 0.22 : 0.16),
    secondary: ui.fill,
    outline: "transparent",
    ghost: "transparent",
    destructive: alpha(ui.destructive, 0.14),
    link: "transparent",
  }
  const fg: Record<Variant, string> = {
    default: ui.primaryForeground,
    glass: ui.foreground,
    tinted: ui.primary,
    secondary: ui.foreground,
    outline: ui.foreground,
    ghost: ui.foreground,
    destructive: ui.destructive,
    link: ui.primary,
  }
  const container: ViewStyle = {
    height,
    width: icon ? height : undefined,
    paddingHorizontal: icon ? 0 : ui.pad[s.pad as keyof UI["pad"]],
    gap: s.gap,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderRadius: shape === "pill" ? ui.radius.button : ui.radius.control,
    borderCurve: "continuous",
    backgroundColor: bg[variant],
    borderWidth: variant === "outline" ? 1 : 0,
    borderColor: ui.glassBorder,
    ...(variant === "default" ? { shadowColor: ui.primary, shadowOpacity: 0.32, shadowRadius: 11, shadowOffset: { width: 0, height: 8 }, elevation: 3 } : null),
  }
  const text: TextStyle = { color: fg[variant], fontSize: s.font, lineHeight: Math.round(s.font * 1.3), fontWeight: "500", textDecorationLine: variant === "link" ? "underline" : "none" }
  return { container, text, iconSize: s.icon, color: fg[variant] }
}

/** Strings become button text; icon elements (lucide etc.) get the button's colour and size unless they set their own. */
export function decorate(children: React.ReactNode, text: StyleProp<TextStyle>, color: string, iconSize: number) {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      const s = String(child).trim()
      return s ? <GText style={text}>{s}</GText> : null
    }
    if (React.isValidElement<{ color?: string; size?: number }>(child) && child.type !== React.Fragment && child.type !== GText) {
      return React.cloneElement(child, { color: child.props.color ?? color, size: child.props.size ?? iconSize })
    }
    return child
  })
}

/**
 * shadcn's Button with glass variants. Capsule by default (`shape="rounded"` for
 * shadcn's corners). Presses squash a touch; hover lifts on pointer devices.
 */
function Button({
  variant = "default",
  size = "default",
  shape = "pill",
  disabled,
  style,
  children,
  ...props
}: Omit<PressableProps, "style" | "children"> & { variant?: Variant; size?: Size; shape?: Shape; style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  const ui = useUI()
  const v = buttonVariants(ui, { variant, size, shape })
  const content = decorate(children, v.text, v.color, v.iconSize)
  const radius = v.container.borderRadius as number
  return (
    <Press
      accessibilityRole="button"
      aria-disabled={!!disabled}
      disabled={disabled}
      haptic
      hover={variant === "link" ? 1 : 1.02}
      squash={variant === "link" ? 1 : ui.motion.pressScale}
      style={[v.container, variant === "glass" ? { backgroundColor: "transparent", padding: 0, paddingHorizontal: 0 } : null, disabled ? { opacity: 0.45 } : null, web({ cursor: disabled ? "default" : "pointer" }), style]}
      {...props}
    >
      {variant === "glass" ? (
        <Glass interactive raised={false} radius={radius} style={{ flex: 1, alignSelf: "stretch", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: v.container.gap, paddingHorizontal: v.container.paddingHorizontal }}>
          {content}
        </Glass>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: v.container.gap }}>{content}</View>
      )}
    </Press>
  )
}

export { Button, buttonVariants }
