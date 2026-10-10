import * as React from "react"
import { View, type ViewProps } from "react-native"

import { Glass } from "@/components/glass/native/glass"
import { GText, alpha, useUI, type GTextProps } from "@/components/glass/native/ui"

type CardSize = "default" | "sm"
const CardContext = React.createContext<{ size: CardSize; spacing: number }>({ size: "default", spacing: 20 })

const asText = (children: React.ReactNode, props: GTextProps) =>
  typeof children === "string" || typeof children === "number" ? <GText {...props}>{children}</GText> : children

/** shadcn's Card API on a glass pane. Same parts, same props — swap the import. */
function Card({
  size = "default",
  intensity = "default",
  tint = "none",
  elevation = "raised",
  style,
  children,
  ...props
}: ViewProps & { size?: CardSize; intensity?: "default" | "strong" | "subtle"; tint?: "none" | "primary" | "destructive"; elevation?: "raised" | "flat" }) {
  const ui = useUI()
  const spacing = size === "sm" ? 16 : 20
  const base = intensity === "strong" ? ui.glassStrong : intensity === "subtle" ? ui.fill : undefined
  const tinted = tint === "primary" ? alpha(ui.primary, 0.3) : tint === "destructive" ? alpha(ui.destructive, 0.3) : base
  const kids = React.Children.toArray(children)
  const hasFooter = kids.some((c) => React.isValidElement(c) && c.type === CardFooter)
  const value = React.useMemo(() => ({ size, spacing }), [size, spacing])
  return (
    <CardContext.Provider value={value}>
      <Glass
        radius={size === "sm" ? ui.radius.surface - 6 : ui.radius.surface}
        tint={tinted}
        raised={elevation === "raised"}
        style={[{ gap: spacing, paddingTop: spacing, paddingBottom: hasFooter ? 0 : spacing, overflow: "hidden" }, style]}
        {...props}
      >
        {children}
      </Glass>
    </CardContext.Provider>
  )
}

/** Title and description; a CardAction among the children sits top-right. */
function CardHeader({ style, children, ...props }: ViewProps) {
  const { spacing } = React.useContext(CardContext)
  const kids = React.Children.toArray(children)
  const action = kids.filter((c) => React.isValidElement(c) && c.type === CardAction)
  const rest = kids.filter((c) => !action.includes(c))
  return (
    <View style={[{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: spacing }, style]} {...props}>
      <View style={{ flex: 1, gap: 4 }}>{rest}</View>
      {action}
    </View>
  )
}

function CardTitle({ children, ...props }: GTextProps) {
  const { size } = React.useContext(CardContext)
  return (
    <GText accessibilityRole="header" font="heading" size={size === "sm" ? "sm" : "base"} {...props}>
      {children}
    </GText>
  )
}

function CardDescription(props: GTextProps) {
  return <GText size="sm" tone="muted" {...props} />
}

function CardAction({ style, ...props }: ViewProps) {
  return <View style={[{ alignSelf: "flex-start" }, style]} {...props} />
}

function CardContent({ style, children, ...props }: ViewProps) {
  const { spacing } = React.useContext(CardContext)
  return (
    <View style={[{ paddingHorizontal: spacing }, style]} {...props}>
      {asText(children, { size: "sm" })}
    </View>
  )
}

function CardFooter({ style, ...props }: ViewProps) {
  const ui = useUI()
  const { spacing } = React.useContext(CardContext)
  return (
    <View
      style={[{ flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: 1, borderTopColor: ui.glassBorder, backgroundColor: ui.fill, padding: spacing }, style]}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
