import { View } from "react-native"

import { GlassTabs, useTabsAccessoryPlacement } from "@/components/glass/native/tabs-layout"
import { GText, useUI } from "@/components/glass/native/ui"

/** The bottom accessory: full width above the bar, inline beside it once it folds (iOS 26). */
function NowPlaying() {
  const ui = useUI()
  const placement = useTabsAccessoryPlacement()
  return (
    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 }}>
      <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: ui.primary }} />
      <GText size="sm" weight="600" numberOfLines={1} style={{ flex: 1 }}>
        {placement === "inline" ? "Rain" : "Rain on a tin roof · 42 min"}
      </GText>
    </View>
  )
}

/** The native-tabs-layout recipe: NativeTabs themed from glasscn tokens. */
export default function TabsLayout() {
  return (
    <GlassTabs>
      <GlassTabs.BottomAccessory>
        <NowPlaying />
      </GlassTabs.BottomAccessory>
      <GlassTabs.Trigger name="index">
        <GlassTabs.Trigger.Icon sf={{ default: "moon", selected: "moon.fill" }} md="bedtime" />
        <GlassTabs.Trigger.Label>Tonight</GlassTabs.Trigger.Label>
      </GlassTabs.Trigger>
      <GlassTabs.Trigger name="library">
        <GlassTabs.Trigger.Icon sf={{ default: "books.vertical", selected: "books.vertical.fill" }} md="library_books" />
        <GlassTabs.Trigger.Label>Library</GlassTabs.Trigger.Label>
        <GlassTabs.Trigger.Badge>3</GlassTabs.Trigger.Badge>
      </GlassTabs.Trigger>
      <GlassTabs.Trigger name="search" role="search">
        <GlassTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        <GlassTabs.Trigger.Label>Search</GlassTabs.Trigger.Label>
      </GlassTabs.Trigger>
    </GlassTabs>
  )
}
