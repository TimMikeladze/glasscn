import * as React from "react"
import { Text, View } from "react-native"

import { Glass, canFade } from "@/components/glass/native/glass"
import { haptics, Press, setHapticsEnabled } from "@/components/glass/native/press"
import { useGlassTheme } from "@/components/glass/native/tokens"
import { Body, Screen, Section } from "@/sandbox/ui"

function Button({ label, ...props }: React.ComponentProps<typeof Press> & { label: string }) {
  const t = useGlassTheme()
  return (
    <Press accessibilityRole="button" accessibilityLabel={label} style={{ backgroundColor: props.disabled ? t.fill : t.primary, borderRadius: 999, paddingVertical: 14, alignItems: "center" }} {...props}>
      <Text style={{ color: props.disabled ? t.mutedForeground : t.primaryForeground, fontWeight: "600", fontSize: 16 }}>{label}</Text>
    </Press>
  )
}

export default function PressScreen() {
  const [count, setCount] = React.useState(0)
  const [buzz, setBuzz] = React.useState(true)
  return (
    <Screen>
      <Section title="Taps" note="Every press below increments this.">
        <Glass style={{ padding: 16 }}>
          <Body testID="press-count">Pressed {count}×</Body>
        </Glass>
      </Section>
      <Section title="Default (0.97 squash)">
        <Button label="Log workout" onPress={() => setCount((c) => c + 1)} />
      </Section>
      <Section title="Haptic" note="A selection haptic when the press lands (never on press-in, so scrolls don't buzz).">
        <Button label="Complete habit" haptic onPress={() => setCount((c) => c + 1)} />
      </Section>
      <Section title="Deep squash (0.9)">
        <Button label="Start timer" squash={0.9} onPress={() => setCount((c) => c + 1)} />
      </Section>
      <Section title="Hover lift (1.04)" note="Pointer only: web, iPad trackpad.">
        <Button label="Hover me" hover={1.04} onPress={() => setCount((c) => c + 1)} />
      </Section>
      <Section title="Liquid grows · dim" note="liquid: grows (pressGrow) instead of squashing · dim: fades (never around Liquid Glass).">
        <Button label="Liquid" liquid onPress={() => setCount((c) => c + 1)} />
        <Button label="Dim" dim onPress={() => setCount((c) => c + 1)} />
        <Press onPress={() => setCount((c) => c + 1)} style={({ pressed }) => ({ padding: 14, borderRadius: 999, alignItems: "center", borderWidth: 1, borderColor: pressed ? "#888" : "transparent" })}>
          <Body>Function style (border while pressed)</Body>
        </Press>
      </Section>
      <Section title="Haptics API" note={`haptics ${buzz ? "on" : "off"} (setHapticsEnabled)`}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Button label="selection" onPress={() => haptics.selection()} />
          <Button label="impact" onPress={() => haptics.impact("medium")} />
          <Button label="success" onPress={() => haptics.notify("success")} />
          <Button
            label={buzz ? "Turn off" : "Turn on"}
            onPress={() => {
              setHapticsEnabled(!buzz)
              setBuzz(!buzz)
            }}
          />
        </View>
      </Section>
      <Section title="Disabled">
        <Button label="Unavailable" disabled onPress={() => setCount((c) => c + 1)} />
      </Section>
      <Section title="Press around glass" note="dim={canFade()}: squash only on iOS 26, where dimming would make the Liquid Glass vanish.">
        <View style={{ flexDirection: "row", gap: 10 }}>
          {["Mon", "Tue", "Wed"].map((d) => (
            <Press key={d} haptic dim={canFade()} style={{ flex: 1 }} onPress={() => setCount((c) => c + 1)}>
              <Glass interactive style={{ padding: 18, alignItems: "center" }}>
                <Body style={{ fontWeight: "600" }}>{d}</Body>
              </Glass>
            </Press>
          ))}
        </View>
      </Section>
    </Screen>
  )
}
