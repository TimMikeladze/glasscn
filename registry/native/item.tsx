import * as React from "react"
import { View, type ViewProps } from "react-native"

import { Press } from "@/components/glass/native/press"
import { Separator } from "@/components/glass/native/separator"
import { GText, useUI, type GTextProps } from "@/components/glass/native/ui"

/** shadcn's Item: a row of media, title, description and actions. Pass `onPress` to make the whole row pressable. */
function ItemGroup({ style, ...props }: ViewProps) {
  return <View role="list" style={[{ flexDirection: "column" }, style]} {...props} />
}

const ItemSeparator = Separator

function Item({ variant = "default", size = "default", onPress, style, ...props }: ViewProps & { variant?: "default" | "outline" | "muted"; size?: "default" | "sm"; onPress?: () => void }) {
  const ui = useUI()
  const box = [
    {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      alignItems: "center" as const,
      gap: size === "sm" ? 10 : 16,
      padding: size === "sm" ? 12 : 16,
      borderRadius: ui.radius.control,
      backgroundColor: variant === "muted" ? ui.fill : "transparent",
      borderWidth: variant === "outline" ? 1 : 0,
      borderColor: ui.glassBorder,
    },
    style,
  ]
  if (onPress) return <Press accessibilityRole="button" onPress={onPress} style={box} {...props} />
  return <View role="listitem" style={box} {...props} />
}

function ItemMedia({ variant = "default", style, ...props }: ViewProps & { variant?: "default" | "icon" | "image" }) {
  const ui = useUI()
  const v = variant === "icon" ? { width: 32, height: 32, borderRadius: ui.radius.control - 4, backgroundColor: ui.fill } : variant === "image" ? { width: 40, height: 40, borderRadius: ui.radius.control - 4, overflow: "hidden" as const } : null
  return <View style={[{ alignItems: "center", justifyContent: "center" }, v, style]} {...props} />
}

function ItemContent({ style, ...props }: ViewProps) {
  return <View style={[{ flex: 1, gap: 4 }, style]} {...props} />
}

function ItemTitle(props: GTextProps) {
  return <GText size="sm" weight="500" {...props} />
}

function ItemDescription(props: GTextProps) {
  return <GText size="sm" tone="muted" numberOfLines={2} {...props} />
}

function ItemActions({ style, ...props }: ViewProps) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]} {...props} />
}

function ItemHeader({ style, ...props }: ViewProps) {
  return <View style={[{ flexBasis: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, style]} {...props} />
}

const ItemFooter = ItemHeader

export { Item, ItemMedia, ItemContent, ItemActions, ItemGroup, ItemSeparator, ItemTitle, ItemDescription, ItemHeader, ItemFooter }
