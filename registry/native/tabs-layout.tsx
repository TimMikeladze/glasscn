import * as React from "react"
import { Platform } from "react-native"
import { NativeTabs, type NativeTabsProps } from "expo-router/unstable-native-tabs"

import { useGlassTheme } from "@/components/glass/native/tokens"
import { alpha } from "@/components/glass/native/ui"

/**
 * The app's tab bar as a recipe (NAT-38): expo-router's NativeTabs — the system tab
 * bar, Liquid Glass on iOS 26, Material 3 on Android — themed from glasscn tokens.
 * Use it as a `_layout.tsx`; keep `Dock` for bars inside a screen.
 *
 *   // app/(tabs)/_layout.tsx
 *   export default function Layout() {
 *     return (
 *       <GlassTabs>
 *         <GlassTabs.BottomAccessory><NowPlaying /></GlassTabs.BottomAccessory>
 *         <GlassTabs.Trigger name="index">
 *           <GlassTabs.Trigger.Icon sf="house.fill" md="home" />
 *           <GlassTabs.Trigger.Label>Home</GlassTabs.Trigger.Label>
 *         </GlassTabs.Trigger>
 *         <GlassTabs.Trigger name="search" role="search" />
 *       </GlassTabs>
 *     )
 *   }
 *
 * iOS 26: the bar folds while content scrolls down (`minimizeBehavior="onScrollDown"`),
 * a `role="search"` tab sits apart as the search button, and the bottom accessory
 * moves inline beside the folded bar — read where with `useTabsAccessoryPlacement()`.
 * Android: a Material navigation bar on the solid glass colour with the accent indicator.
 */
function GlassTabsLayout({ minimizeBehavior = "onScrollDown", children, ...props }: NativeTabsProps) {
  const t = useGlassTheme()
  const android = Platform.OS === "android"
  return (
    <NativeTabs
      minimizeBehavior={minimizeBehavior}
      tintColor={t.primary}
      iconColor={{ default: t.labelSecondary, selected: t.primary }}
      labelStyle={{ default: { color: t.labelSecondary }, selected: { color: t.primary } }}
      badgeBackgroundColor={t.destructive}
      badgeTextColor={t.destructiveForeground}
      // Android: Material 3 — the bar on the solid glass colour, the accent's indicator pill
      backgroundColor={android ? t.glassSolid : undefined}
      indicatorColor={alpha(t.primary, 0.18)}
      rippleColor={alpha(t.primary, 0.12)}
      labelVisibilityMode={android ? "labeled" : undefined}
      // iPad: the tab bar adapts into a sidebar
      sidebarAdaptable
      {...props}
    >
      {children}
    </NativeTabs>
  )
}

/** The glasscn-themed NativeTabs, with its parts. */
export const GlassTabs = Object.assign(GlassTabsLayout, { Trigger: NativeTabs.Trigger, BottomAccessory: NativeTabs.BottomAccessory })

/** Inside the bottom accessory: `regular` above the bar, `inline` beside the folded bar (iOS 26). */
export const useTabsAccessoryPlacement = NativeTabs.BottomAccessory.usePlacement

export type { NativeTabsProps as GlassTabsProps }
