import { Text, View } from "react-native"

import { Glass } from "@/components/glass/native/glass"
import { useGlassTheme, type GlassTheme } from "@/components/glass/native/tokens"
import { Screen, Section } from "@/sandbox/ui"

const COLOR_KEYS = ["foreground", "mutedForeground", "primary", "primaryForeground", "glass", "glassStrong", "glassSolid", "glassTint", "glassBorder", "glassShadow", "fill", "fillStrong", "auroraBase"] as const satisfies readonly (keyof GlassTheme)[]

function Swatch({ name, color }: { name: string; color: string }) {
  const t = useGlassTheme()
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: color, borderWidth: 1, borderColor: t.fillStrong }} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.foreground, fontWeight: "600" }}>{name}</Text>
        <Text selectable style={{ color: t.mutedForeground, fontSize: 12, fontVariant: ["tabular-nums"] }}>
          {color}
        </Text>
      </View>
    </View>
  )
}

export default function Tokens() {
  const t = useGlassTheme()
  return (
    <Screen>
      <Section title="Colours">
        <Glass style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          {COLOR_KEYS.map((k) => (
            <Swatch key={k} name={k} color={t[k]} />
          ))}
        </Glass>
      </Section>
      <Section title="Aurora + chart">
        <Glass style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          {t.aurora.map((c, i) => (
            <Swatch key={`a${i}`} name={`aurora[${i}]`} color={c} />
          ))}
          {t.chart.map((c, i) => (
            <Swatch key={`c${i}`} name={`chart[${i}]`} color={c} />
          ))}
        </Glass>
      </Section>
    </Screen>
  )
}
