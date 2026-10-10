import * as React from "react"
import { View, type ViewProps } from "react-native"

import { decorate } from "@/components/glass/native/button"
import { Glass } from "@/components/glass/native/glass"
import { alpha, useUI, type UI } from "@/components/glass/native/ui"

type Variant = "default" | "tinted" | "glass" | "secondary" | "outline" | "destructive"

/** The resolved styles for a variant — the native stand-in for the web's cva helper. */
function badgeVariants(ui: UI, { variant = "default" }: { variant?: Variant } = {}) {
  const bg: Record<Variant, string> = {
    default: ui.primary,
    tinted: alpha(ui.primary, ui.scheme === "dark" ? 0.22 : 0.16),
    glass: "transparent",
    secondary: ui.fill,
    outline: "transparent",
    destructive: alpha(ui.destructive, 0.14),
  }
  const fg: Record<Variant, string> = {
    default: ui.primaryForeground,
    tinted: ui.primary,
    glass: ui.foreground,
    secondary: ui.foreground,
    outline: ui.foreground,
    destructive: ui.destructive,
  }
  return {
    container: {
      height: 24,
      paddingHorizontal: 10,
      gap: 4,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      alignSelf: "flex-start" as const,
      overflow: "hidden" as const,
      borderRadius: ui.radius.badge,
      backgroundColor: bg[variant],
      borderWidth: variant === "outline" ? 1 : 0,
      borderColor: ui.glassBorder,
    },
    text: { color: fg[variant], fontSize: 12, lineHeight: 16, fontWeight: "600" as const },
    color: fg[variant],
  }
}

/** A small status capsule. Strings are set as badge text; icons get its colour at 12px. */
function Badge({ variant = "default", style, children, ...props }: ViewProps & { variant?: Variant }) {
  const ui = useUI()
  const v = badgeVariants(ui, { variant })
  const content = decorate(children, v.text, v.color, 12)
  if (variant === "glass")
    return (
      <Glass raised={false} radius={ui.radius.badge} style={[v.container, style]} {...props}>
        {content}
      </Glass>
    )
  return (
    <View style={[v.container, style]} {...props}>
      {content}
    </View>
  )
}

export { Badge, badgeVariants }
