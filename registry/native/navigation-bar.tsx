import * as React from "react"
import { View, type ViewProps } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { ScrollEdge } from "@/components/glass/native/scroll-edge"
import { GText } from "@/components/glass/native/ui"

/**
 * iOS's navigation bar for a ScrollView: put `NavigationBarLargeTitle` first in the
 * scroll content and `NavigationBar` over it (absolute, above the ScrollView), passing
 * `collapsed` — true once the large title has scrolled under the bar (scrollY > ~44).
 * The small inline title fades in and a scroll-edge veil keeps it legible.
 */
function NavigationBar({ title, collapsed = false, leading, trailing, style, ...props }: ViewProps & { title: React.ReactNode; collapsed?: boolean; leading?: React.ReactNode; trailing?: React.ReactNode }) {
  const insets = useSafeAreaInsets()
  return (
    <View role="banner" style={[{ position: "absolute", top: 0, left: 0, right: 0, paddingTop: insets.top, zIndex: 30 }, style]} {...props}>
      <ScrollEdge edge="top" visible={collapsed} size={insets.top + 72} />
      <View style={{ height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8 }}>
        <View style={{ flex: 1, flexDirection: "row", gap: 8 }}>{leading}</View>
        <GText font="heading" weight="700" numberOfLines={1} aria-hidden={!collapsed} style={{ opacity: collapsed ? 1 : 0, flexShrink: 1 }}>
          {title}
        </GText>
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>{trailing}</View>
      </View>
    </View>
  )
}

/** The large title (the screen's heading), first in the scroll content, below the bar. */
function NavigationBarLargeTitle({ title, subtitle }: { title: React.ReactNode; subtitle?: React.ReactNode }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={{ paddingTop: insets.top + 56, paddingHorizontal: 16, paddingBottom: 8 }}>
      <GText role="heading" aria-level={1} font="display" size="3xl" weight="700">
        {title}
      </GText>
      {subtitle ? (
        <GText size="sm" tone="muted">
          {subtitle}
        </GText>
      ) : null}
    </View>
  )
}

export { NavigationBar, NavigationBarLargeTitle }
