import * as React from "react"
import { type StyleProp, type ViewProps, type ViewStyle } from "react-native"

import { Glass, GlassEffectGroup } from "@/components/glass/native/glass"
import { Press, type PressProps } from "@/components/glass/native/press"
import { withGlyphs } from "@/components/glass/native/segmented-control"
import { useUI } from "@/components/glass/native/ui"

export type GlassClusterProps = ViewProps & {
  spacing?: number
  mergeDistance?: number
}

/** Separate sibling system effects merge as their distance falls below mergeDistance. */
export function GlassCluster({ spacing = 12, mergeDistance = 24, style, ...props }: GlassClusterProps) {
  return <GlassEffectGroup spacing={mergeDistance} style={[{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: spacing }, style]} {...props} />
}

export type GlassClusterItemProps = Omit<PressProps, "style" | "children"> & {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export function GlassClusterItem({ style, children, asChild, ...props }: GlassClusterItemProps) {
  const ui = useUI()
  return (
    <Glass variant="liquid" interactive={!props.disabled} radius={ui.radius.button} style={style}>
      <Press
        squash={1}
        haptic
        asChild={asChild}
        style={{ minHeight: ui.control.lg, minWidth: ui.control.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: ui.pad.sm, paddingVertical: 8 }}
        {...props}
      >
        {asChild ? children : withGlyphs(children, { color: ui.foreground, size: 20, weight: "600" })}
      </Press>
    </Glass>
  )
}
