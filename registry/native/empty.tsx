import * as React from "react"
import { View, type ViewProps } from "react-native"

import { GText, useUI, type GTextProps } from "@/components/glass/native/ui"

/** An empty state: an icon tile, a title (or "No results for …" with `query`), a description and actions. */
function Empty({ style, ...props }: ViewProps) {
  return <View style={[{ flex: 1, alignItems: "center", justifyContent: "center", gap: 24, padding: 24 }, style]} {...props} />
}

function EmptyHeader({ style, ...props }: ViewProps) {
  return <View style={[{ maxWidth: 384, alignItems: "center", gap: 8 }, style]} {...props} />
}

function EmptyMedia({ variant = "default", style, children, ...props }: ViewProps & { variant?: "default" | "icon" }) {
  const ui = useUI()
  const icon = variant === "icon"
  return (
    <View style={[{ marginBottom: 8, alignItems: "center", justifyContent: "center" }, icon ? { width: 48, height: 48, borderRadius: ui.radius.control, backgroundColor: ui.fill } : null, style]} {...props}>
      {icon
        ? React.Children.map(children, (c) => (React.isValidElement<{ color?: string; size?: number }>(c) ? React.cloneElement(c, { color: c.props.color ?? ui.mutedForeground, size: c.props.size ?? 24 }) : c))
        : children}
    </View>
  )
}

function EmptyTitle({ query, children, ...props }: GTextProps & { query?: string }) {
  return (
    <GText font="heading" size="lg" align="center" {...props}>
      {children ?? (query !== undefined ? `No results for “${query}”` : null)}
    </GText>
  )
}

function EmptyDescription(props: GTextProps) {
  return <GText size="sm" tone="muted" align="center" {...props} />
}

function EmptyContent({ style, ...props }: ViewProps) {
  return <View style={[{ width: "100%", maxWidth: 384, alignItems: "center", gap: 16 }, style]} {...props} />
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia }
