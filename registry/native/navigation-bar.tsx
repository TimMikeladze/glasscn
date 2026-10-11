import * as React from "react"
import { View, type ViewProps } from "react-native"
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated"

import { useInsets } from "@/components/glass/native/dialog"
import { ScrollEdge, useScrollEdge } from "@/components/glass/native/scroll-edge"
import { GText } from "@/components/glass/native/ui"

/** How far the large title scrolls before the inline title has fully taken over. */
const HANDOFF = [28, 52] as const

/**
 * iOS's navigation bar for a ScrollView: put `NavigationBarLargeTitle` first in the
 * scroll content and `NavigationBar` over it (absolute, above the ScrollView). It tracks
 * the scroll on the UI thread — `scrollY` (a Reanimated shared value, e.g. from
 * `useScrollEdges()`), or the enclosing `ScrollEdgeProvider` — and hands the large title
 * over to the inline one while a scroll-edge veil fades in. `collapsed` still works for a
 * bar driven by hand. The bar is not glass; put glass buttons in its slots.
 *
 *   <NavigationBar title="Journal">
 *     <NavigationBarLeading>…</NavigationBarLeading>
 *     <NavigationBarTrailing>…</NavigationBarTrailing>
 *   </NavigationBar>
 */
function NavigationBar({
  title,
  titleDisplayMode = "large",
  collapsed,
  scrollY: scrollProp,
  leading,
  trailing,
  style,
  children,
  ...props
}: ViewProps & {
  title: React.ReactNode
  /** `large` starts with a big title under the bar (NavigationBarLargeTitle); `inline` keeps it small in the bar. */
  titleDisplayMode?: "large" | "inline"
  /** Drive it by hand: true once the large title has scrolled under the bar. Wins over the scroll value. */
  collapsed?: boolean
  /** The scroll offset to follow. Defaults to the ScrollEdgeProvider's. */
  scrollY?: SharedValue<number>
  leading?: React.ReactNode
  trailing?: React.ReactNode
}) {
  const insets = useInsets()
  const edges = useScrollEdge()
  const fallback = useSharedValue(0)
  const scrollY = scrollProp ?? edges?.scrollY ?? fallback
  const inline = titleDisplayMode === "inline"
  const manual = useSharedValue(collapsed ? 1 : 0)
  React.useEffect(() => {
    manual.set(withTiming(collapsed ? 1 : 0, { duration: 200 }))
  }, [collapsed, manual])
  const hasManual = collapsed !== undefined
  const progress = useDerivedValue(() => {
    if (inline) return 1
    if (hasManual) return manual.value
    const [a, b] = HANDOFF
    return Math.min(1, Math.max(0, (scrollY.value - a) / (b - a)))
  })
  const titleFade = useAnimatedStyle(() => ({ opacity: progress.value }))
  // slot children: NavigationBarLeading / NavigationBarTrailing, wherever they're written
  const parts = React.Children.toArray(children)
  const lead = parts.filter((c) => React.isValidElement(c) && c.type === NavigationBarLeading)
  const trail = parts.filter((c) => React.isValidElement(c) && c.type === NavigationBarTrailing)
  const rest = parts.filter((c) => !lead.includes(c) && !trail.includes(c))
  return (
    <View role="banner" style={[{ position: "absolute", top: 0, left: 0, right: 0, paddingTop: insets.top, zIndex: 30 }, style]} {...props}>
      <ScrollEdge edge="top" progress={progress} size={insets.top + 72} />
      <View style={{ height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8 }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
          {leading}
          {lead}
        </View>
        <Animated.View style={[{ flexShrink: 1 }, titleFade]}>
          {/* the large title is the heading; this copy is for sight only until it's the only title */}
          <GText font="heading" weight="700" numberOfLines={1} role={inline ? "heading" : undefined} aria-hidden={!inline} importantForAccessibility={inline ? "auto" : "no-hide-descendants"}>
            {title}
          </GText>
        </Animated.View>
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
          {trailing}
          {trail}
        </View>
      </View>
      {rest}
    </View>
  )
}

/** Back, close, a sidebar toggle — the start of the bar. */
function NavigationBarLeading({ style, ...props }: ViewProps) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]} {...props} />
}

/** Actions — the end of the bar. */
function NavigationBarTrailing({ style, ...props }: ViewProps) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]} {...props} />
}

/** The large title (the screen's heading), first in the scroll content, below the bar. */
function NavigationBarLargeTitle({ title, subtitle }: { title: React.ReactNode; subtitle?: React.ReactNode }) {
  const insets = useInsets()
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

export { NavigationBar, NavigationBarLargeTitle, NavigationBarLeading, NavigationBarTrailing }
