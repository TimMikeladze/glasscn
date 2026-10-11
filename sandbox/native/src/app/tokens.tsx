import { Text, View } from "react-native"

import { Glass } from "@/components/glass/native/glass"
import { useGlassTheme, type GlassTheme } from "@/components/glass/native/tokens"
import { A11Y_SETTINGS, PRESET_NAMES, useSandboxTheme, type PresetGroup } from "@/sandbox/theme"
import { Chip, Screen, Section } from "@/sandbox/ui"

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

/** Every preset group and forced a11y setting, beside the palette picker. */
function Presets() {
  const { presets, setPreset, a11y, setA11y } = useSandboxTheme()
  const t = useGlassTheme()
  return (
    <Glass style={{ padding: 12, gap: 12 }} testID="preset-picker">
      {(Object.keys(PRESET_NAMES) as PresetGroup[]).map((group) => (
        <View key={group} style={{ gap: 6 }}>
          <Text style={{ color: t.mutedForeground, fontSize: 12, fontWeight: "600" }}>{group}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <Chip label="default" active={!presets[group]} onPress={() => setPreset(group, undefined)} />
            {PRESET_NAMES[group].map((name) => (
              <Chip key={name} label={name} active={presets[group] === name} onPress={() => setPreset(group, name as never)} />
            ))}
          </View>
        </View>
      ))}
      <View style={{ gap: 6 }}>
        <Text style={{ color: t.mutedForeground, fontSize: 12, fontWeight: "600" }}>force a11y (forceA11y)</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {A11Y_SETTINGS.map((s) => (
            <Chip key={s} label={s} active={!!a11y[s]} onPress={() => setA11y(s, a11y[s] ? null : true)} />
          ))}
        </View>
      </View>
    </Glass>
  )
}

export default function Tokens() {
  const t = useGlassTheme()
  return (
    <Screen>
      <Section title="Presets + accessibility" note="Applies to every screen. Accessibility chips force the setting on; tap again to follow the OS.">
        <Presets />
      </Section>
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
