import { Platform, Text, View } from "react-native"

import { canFade, Glass } from "@/components/glass/native/glass"
import { useGlassTheme } from "@/components/glass/native/tokens"
import { Body, Screen, Section, surfaceName } from "@/sandbox/ui"

export default function GlassScreen() {
  const t = useGlassTheme()
  return (
    <Screen>
      <Section title="Surface picked" note="iOS 26+: Liquid Glass · older iOS: blur · web: backdrop-filter · Android: fill">
        <Glass style={{ padding: 16 }}>
          <Body testID="surface">
            {Platform.OS}: {surfaceName()} · canFade() = {String(canFade())}
          </Body>
        </Glass>
      </Section>
      <Section title="Default">
        <Glass style={{ padding: 20 }}>
          <Text style={{ color: t.foreground, fontSize: 22, fontWeight: "700" }}>12,480 steps</Text>
          <Body style={{ color: t.mutedForeground }}>Today · 82% of goal</Body>
        </Glass>
      </Section>
      <Section title="Tinted" note="An accent wash in place of the neutral frost.">
        <Glass tint={t.primary + "55"} style={{ padding: 20 }}>
          <Body style={{ fontWeight: "600" }}>Streak: 21 days</Body>
        </Glass>
      </Section>
      <Section title="Radii">
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[0, 12, 26, 40].map((r) => (
            <Glass key={r} radius={r} style={{ flex: 1, height: 80, alignItems: "center", justifyContent: "center" }}>
              <Body>{r}</Body>
            </Glass>
          ))}
        </View>
      </Section>
      <Section title="Flat (raised off)">
        <Glass raised={false} style={{ padding: 20 }}>
          <Body>No shadow on web and Android.</Body>
        </Glass>
      </Section>
      <Section title="Interactive" note="Liquid Glass reacts to touch on iOS 26.">
        <Glass interactive style={{ padding: 20 }}>
          <Body>Touch and drag here.</Body>
        </Glass>
      </Section>
      <Section title="Bar" note="Chrome that fades with scroll: always blur, never Liquid Glass.">
        <Glass bar radius={0} style={{ padding: 16 }}>
          <Body style={{ fontWeight: "600" }}>Journal</Body>
        </Glass>
      </Section>
      <Section title="Nested fill" note="Inside a pane use fills, not another pane.">
        <Glass style={{ padding: 16, gap: 8 }}>
          {["Morning run", "Read 20 pages", "No sugar"].map((h) => (
            <View key={h} style={{ backgroundColor: t.fill, borderRadius: 14, padding: 12 }}>
              <Body>{h}</Body>
            </View>
          ))}
        </Glass>
      </Section>
    </Screen>
  )
}
