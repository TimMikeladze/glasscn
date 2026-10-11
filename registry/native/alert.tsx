import * as React from "react"
import { View, type ViewProps } from "react-native"

import { GText, alpha, useUI, type GTextProps, type UI } from "@/components/glass/native/ui"

type Variant = "default" | "info" | "success" | "destructive"

function alertVariants(ui: UI, { variant = "default" }: { variant?: Variant } = {}) {
  const tint: Record<Variant, [string, string]> = {
    default: [ui.fill, ui.mutedForeground],
    info: [alpha(ui.primary, ui.scheme === "dark" ? 0.16 : 0.1), ui.primary],
    success: [alpha(ui.success, 0.12), ui.success],
    destructive: [alpha(ui.destructive, 0.12), ui.destructive],
  }
  return { backgroundColor: tint[variant][0], accent: tint[variant][1] }
}

const AlertContext = React.createContext<{ accent: string; variant: Variant }>({ accent: "", variant: "default" })

/** An inline callout on a fill: an icon, a title, a description; status tints. */
function Alert({ variant = "default", style, children, ...props }: ViewProps & { variant?: Variant }) {
  const ui = useUI()
  const v = alertVariants(ui, { variant })
  const kids = React.Children.toArray(children)
  const icon = kids.find((c) => React.isValidElement(c) && typeof c.type !== "string" && !(c.type as { alertPart?: boolean }).alertPart)
  const rest = kids.filter((c) => c !== icon)
  return (
    <AlertContext.Provider value={{ accent: v.accent, variant }}>
      <View
        role={variant === "destructive" ? "alert" : "status"}
        style={[{ flexDirection: "row", gap: 12, borderRadius: ui.radius.control, paddingHorizontal: ui.pad.sm, paddingVertical: 12, backgroundColor: v.backgroundColor }, style]}
        {...props}
      >
        {React.isValidElement<{ color?: string; size?: number }>(icon) ? React.cloneElement(icon, { color: icon.props.color ?? v.accent, size: icon.props.size ?? 16 }) : null}
        <View style={{ flex: 1, gap: 2 }}>{rest}</View>
      </View>
    </AlertContext.Provider>
  )
}

function AlertTitle(props: GTextProps) {
  const { accent, variant } = React.useContext(AlertContext)
  return <GText size="sm" weight="600" color={variant === "default" ? undefined : accent} numberOfLines={1} {...props} />
}
AlertTitle.alertPart = true

function AlertDescription(props: GTextProps) {
  return <GText size="sm" tone="muted" {...props} />
}
AlertDescription.alertPart = true

function AlertAction({ style, ...props }: ViewProps) {
  return <View style={[{ alignSelf: "flex-end" }, style]} {...props} />
}
AlertAction.alertPart = true

export { Alert, AlertTitle, AlertDescription, AlertAction, alertVariants }
