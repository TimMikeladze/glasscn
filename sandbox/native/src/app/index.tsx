import { Link, type Href } from "expo-router"
import { Platform, Text, View } from "react-native"

import { canFade, Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { useGlassTheme } from "@/components/glass/native/tokens"
import { Body, Screen, Section, surfaceName } from "@/sandbox/ui"

const ITEMS: { href: Href; name: string; item: string; description: string }[] = [
  { href: "/tokens", name: "Tokens", item: "native-tokens", description: "Every useGlassTheme() value for the current palette and scheme." },
  { href: "/glass", name: "Glass", item: "native-glass", description: "Default, tinted, flat, interactive and bar panes." },
  { href: "/aurora", name: "Aurora", item: "native-aurora", description: "The drifting ground, full screen." },
  { href: "/press", name: "Press", item: "native-press", description: "Squash, dim, haptic, hover lift, disabled." },
]

export default function Index() {
  const t = useGlassTheme()
  return (
    <Screen>
      <Section title="Platform">
        <Glass style={{ padding: 16, gap: 4 }}>
          <Body testID="platform">
            {Platform.OS} {String(Platform.Version ?? "")}
          </Body>
          <Body style={{ color: t.mutedForeground }}>
            Surface: {surfaceName()} · canFade() {String(canFade())}
          </Body>
        </Glass>
      </Section>
      <Section title="Items">
        <View style={{ gap: 10 }}>
          {ITEMS.map((i) => (
            <Link key={i.item} href={i.href} asChild>
              <Press haptic accessibilityRole="link">
                <Glass interactive style={{ padding: 16, gap: 4 }}>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                    <Text style={{ color: t.foreground, fontSize: 17, fontWeight: "600" }}>{i.name}</Text>
                    <Text style={{ color: t.primary, fontSize: 12, fontWeight: "600" }}>{i.item}</Text>
                  </View>
                  <Body style={{ color: t.mutedForeground, fontSize: 14 }}>{i.description}</Body>
                </Glass>
              </Press>
            </Link>
          ))}
        </View>
      </Section>
    </Screen>
  )
}
