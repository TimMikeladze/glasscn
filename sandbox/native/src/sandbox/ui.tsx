import * as React from "react"
import { Platform, ScrollView, StyleSheet, Text, View, type TextProps } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Aurora } from "@/components/glass/native/aurora"
import { Glass, hasLiquidGlass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { useGlassTheme } from "@/components/glass/native/tokens"
import { PALETTES, useSandboxTheme } from "@/sandbox/theme"

/** Which surface `Glass` renders on this platform. */
export function surfaceName() {
  if (hasLiquidGlass()) return "Liquid Glass"
  return Platform.select({ ios: "UIVisualEffect blur", web: "backdrop-filter", default: "translucent fill" })
}

/** A screen: the aurora ground, the theme picker, then scrolling content. */
export function Screen({ children, picker = true }: { children: React.ReactNode; picker?: boolean }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={{ flex: 1 }}>
      <Aurora />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 16 }}>
        {picker ? <ThemePicker /> : null}
        {children}
      </ScrollView>
    </View>
  )
}

/** Palette chips and a light/dark toggle — drives every screen. */
export function ThemePicker() {
  const { palette, scheme, setPalette, setScheme } = useSandboxTheme()
  const t = useGlassTheme()
  return (
    <Glass style={{ padding: 12, gap: 10 }} testID="theme-picker">
      <View style={styles.row}>
        {PALETTES.map((p) => (
          <Chip key={p} label={p} active={p === palette} onPress={() => setPalette(p)} />
        ))}
      </View>
      <View style={styles.row}>
        <Chip label="light" active={scheme === "light"} onPress={() => setScheme("light")} />
        <Chip label="dark" active={scheme === "dark"} onPress={() => setScheme("dark")} />
        <Body style={{ marginLeft: "auto", color: t.mutedForeground }}>
          {palette} · {scheme}
        </Body>
      </View>
    </Glass>
  )
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  const t = useGlassTheme()
  return (
    <Press haptic onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.chip, { backgroundColor: active ? t.primary : t.fill }]}>
      <Text style={{ color: active ? t.primaryForeground : t.foreground, fontWeight: "600", fontSize: 13 }}>{label}</Text>
    </Press>
  )
}

/** A titled pane holding one case. */
export function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  const t = useGlassTheme()
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: t.foreground, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginLeft: 4 }}>{title}</Text>
      {children}
      {note ? <Body style={{ color: t.mutedForeground, marginLeft: 4, fontSize: 13 }}>{note}</Body> : null}
    </View>
  )
}

export function Body({ style, ...props }: TextProps) {
  const t = useGlassTheme()
  return <Text style={[{ color: t.foreground, fontSize: 15 }, style]} {...props} />
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
})
