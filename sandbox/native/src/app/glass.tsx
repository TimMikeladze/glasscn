import * as React from "react"
import { Platform, Text, View } from "react-native"

import { canFade, Glass, GlassEffectGroup, useReduceTransparency } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { useGlassTheme } from "@/components/glass/native/tokens"
import { Body, Screen, Section, surfaceName } from "@/sandbox/ui"

export default function GlassScreen() {
  const t = useGlassTheme()
  const solid = useReduceTransparency()
  const [shown, setShown] = React.useState(true)
  return (
    <Screen>
      <Section title="Surface picked" note="iOS 26+: Liquid Glass · older iOS: blur · web: backdrop-filter · Android: fill">
        <Glass style={{ padding: 16 }}>
          <Body testID="surface">
            {Platform.OS}: {surfaceName()} · canFade() = {String(canFade())}
          </Body>
          <Body testID="reduce-transparency" style={{ color: t.mutedForeground }}>
            Reduce Transparency: {solid ? "on — solid fill (Liquid Glass adapts itself)" : "off"}
          </Body>
        </Glass>
      </Section>
      <Section title="Default">
        <Glass style={{ padding: 20 }}>
          <Text style={{ color: t.foreground, fontSize: 22, fontWeight: "700" }}>12,480 steps</Text>
          <Body style={{ color: t.mutedForeground }}>Today · 82% of goal</Body>
        </Glass>
      </Section>
      <Section title="Two layers" note="material = content (cards, lists) · liquid = floating controls · liquid-clear = over media.">
        <View style={{ flexDirection: "row", gap: 10 }}>
          {(["material", "liquid", "liquid-clear"] as const).map((v) => (
            <Glass key={v} variant={v} style={{ flex: 1, height: 80, alignItems: "center", justifyContent: "center" }}>
              <Body>{v}</Body>
            </Glass>
          ))}
        </View>
      </Section>
      <Section title="Material intensity">
        <View style={{ flexDirection: "row", gap: 10 }}>
          {(["subtle", "default", "strong"] as const).map((i) => (
            <Glass key={i} intensity={i} style={{ flex: 1, height: 64, alignItems: "center", justifyContent: "center" }}>
              <Body>{i}</Body>
            </Glass>
          ))}
        </View>
      </Section>
      <Section title="Materialise (visible)" note="iOS 26 animates the glass effect in and out; elsewhere a scale. Never an opacity fade.">
        <Press haptic onPress={() => setShown((v) => !v)} style={{ alignSelf: "flex-start", padding: 8 }}>
          <Body style={{ color: t.primary, fontWeight: "600" }}>{shown ? "Hide" : "Show"}</Body>
        </Press>
        <Glass variant="liquid" visible={shown} style={{ padding: 20 }}>
          <Body>Liquid, visible = {String(shown)}</Body>
        </Glass>
      </Section>
      <Section title="Never liquid in liquid" note="A liquid Glass inside liquid renders clear: one shared backdrop.">
        <Glass variant="liquid" style={{ padding: 12, flexDirection: "row", gap: 8 }}>
          <Glass variant="liquid" radius={14} style={{ padding: 12 }}>
            <Body>inner (clear)</Body>
          </Glass>
          <Glass variant="liquid" radius={14} tint={t.primary} style={{ padding: 12 }}>
            <Body>inner tinted</Body>
          </Glass>
        </Glass>
      </Section>
      <Section title="Effect group" note="iOS 26: neighbouring liquid glass merges and morphs (GlassContainer).">
        <GlassEffectGroup spacing={16} style={{ flexDirection: "row", gap: 6 }}>
          {["A", "B", "C"].map((x) => (
            <Glass key={x} variant="liquid" interactive radius={24} style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}>
              <Body>{x}</Body>
            </Glass>
          ))}
        </GlassEffectGroup>
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
