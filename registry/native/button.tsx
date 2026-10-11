import * as React from "react"
import { ActivityIndicator, View, type PressableProps, type ViewProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native"

import { ChevronDownIcon } from "lucide-react-native"

import { hitSlop } from "@/components/glass/native/a11y"
import { Glass, canFade } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { GText, alpha, useUI, web, type UI } from "@/components/glass/native/ui"

type Variant = "default" | "glass" | "prominent" | "tinted" | "secondary" | "outline" | "ghost" | "destructive" | "link"
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
    prominent: "transparent",
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
    prominent: ui.primaryForeground,
    tinted: ui.primary,
    secondary: ui.foreground,
    outline: ui.foreground,
    ghost: ui.foreground,
    destructive: ui.destructive,
    link: ui.primary,
  }
  const container: ViewStyle = {
    // minHeight so Dynamic Type can grow the label (NAT-23)
    minHeight: height,
    minWidth: icon ? height : undefined,
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
 * `prominent` is Liquid Glass tinted with the accent; `loading` shows a spinner in place of
 * the leading icon (or over the label) and ignores presses.
 */
function Button({
  variant = "default",
  size = "default",
  shape = "pill",
  disabled,
  loading = false,
  loadingText,
  style,
  children,
  onPress,
  ...props
}: ButtonProps) {
  const ui = useUI()
  const v = buttonVariants(ui, { variant, size, shape })
  const items = React.Children.toArray(children)
  const leadingIcon = !size.startsWith("icon") && items.length > 1 && React.isValidElement(items[0])
  const spinner = <ActivityIndicator size="small" color={v.color} />
  const content = !loading ? (
    decorate(children, v.text, v.color, v.iconSize)
  ) : loadingText !== undefined ? (
    <>
      {spinner}
      {decorate(loadingText, v.text, v.color, v.iconSize)}
    </>
  ) : leadingIcon ? (
    <>
      {spinner}
      {decorate(items.slice(1), v.text, v.color, v.iconSize)}
    </>
  ) : (
    // the label stays (hidden) so the width doesn't change
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: v.container.gap, opacity: 0 }}>{decorate(children, v.text, v.color, v.iconSize)}</View>
      <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" }}>{spinner}</View>
    </View>
  )
  const radius = v.container.borderRadius as number
  const icon = size.startsWith("icon")
  const glass = variant === "glass" || variant === "prominent"
  // Liquid Glass vanishes under a fading ancestor (native rule 3): a glass button
  // never dims its container — not on press, not when disabled; its label dims instead.
  const fades = !glass || canFade()
  return (
    <Press
      accessibilityRole="button"
      aria-busy={loading}
      aria-disabled={!!disabled}
      onPress={loading ? undefined : onPress}
      disabled={disabled}
      haptic
      liquid={glass}
      dim={fades}
      hitSlop={hitSlop(v.container.minHeight as number, icon ? (v.container.minHeight as number) : 44)}
      hover={variant === "link" ? 1 : 1.02}
      squash={variant === "link" ? 1 : ui.motion.pressScale}
      style={[v.container, glass ? { backgroundColor: "transparent", padding: 0, paddingHorizontal: 0 } : null, disabled && fades ? { opacity: 0.45 } : null, web({ cursor: disabled ? "default" : "pointer" }), style]}
      {...props}
    >
      {glass ? (
        // floating control layer: liquid; one Liquid Glass per button, nothing liquid inside it
        <Glass variant="liquid" interactive={!disabled} raised={false} radius={radius} tint={variant === "prominent" ? alpha(ui.primary, 0.94) : undefined} style={{ flexGrow: 1, alignSelf: "stretch", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: v.container.gap, paddingHorizontal: v.container.paddingHorizontal }}>
          {disabled && !fades ? <View style={{ flexDirection: "row", alignItems: "center", gap: v.container.gap, opacity: 0.45 }}>{content}</View> : content}
        </Glass>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: v.container.gap }}>{content}</View>
      )}
    </Press>
  )
}

type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  variant?: Variant
  size?: Size
  shape?: Shape
  /** Shows a spinner and marks the button busy; presses are ignored. */
  loading?: boolean
  /** A label to show while loading (e.g. "Saving…"). */
  loadingText?: React.ReactNode
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

/** A button that opens a menu: the label and a trailing chevron. Use it as a DropdownMenuTrigger's child. */
function PullDownButton({ children, ...props }: ButtonProps) {
  const ui = useUI()
  const v = buttonVariants(ui, { variant: props.variant, size: props.size, shape: props.shape })
  return (
    <Button accessibilityState={{ expanded: false }} {...props}>
      {children}
      <ChevronDownIcon size={v.iconSize} strokeWidth={2.25} color={v.color} style={{ opacity: 0.7 }} aria-hidden />
    </Button>
  )
}

/**
 * A primary action joined to a menu of alternatives: two buttons that read as one (shared outer
 * corners, a hairline between). Children: the action Button, then a PullDownButton (or icon Button).
 */
function SplitButton({ style, children, ...props }: ViewProps) {
  const ui = useUI()
  const kids = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<{ style?: StyleProp<ViewStyle> }>[]
  return (
    <View role="group" style={[{ flexDirection: "row", alignItems: "stretch", alignSelf: "flex-start" }, style]} {...props}>
      {kids.map((c, i) =>
        React.cloneElement(c, {
          key: i,
          style: [
            c.props.style,
            i > 0 ? { borderTopStartRadius: 0, borderBottomStartRadius: 0, borderStartWidth: 1, borderStartColor: ui.separator, paddingStart: 10 } : null,
            i < kids.length - 1 ? { borderTopEndRadius: 0, borderBottomEndRadius: 0 } : null,
          ],
        })
      )}
    </View>
  )
}

export { Button, buttonVariants, PullDownButton, SplitButton }
export type { ButtonProps }
