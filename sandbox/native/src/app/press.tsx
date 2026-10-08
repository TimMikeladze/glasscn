import * as React from "react"
import { Text, View } from "react-native"

import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
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
      <Section title="Haptic" note="A selection haptic on press-in — feel it on a device.">
        <Button label="Complete habit" haptic onPress={() => setCount((c) => c + 1)} />
      </Section>
      <Section title="Deep squash (0.9)">
        <Button label="Start timer" squash={0.9} onPress={() => setCount((c) => c + 1)} />
      </Section>
      <Section title="Hover lift (1.04)" note="Pointer only: web, iPad trackpad.">
        <Button label="Hover me" hover={1.04} onPress={() => setCount((c) => c + 1)} />
      </Section>
      <Section title="Disabled">
        <Button label="Unavailable" disabled onPress={() => setCount((c) => c + 1)} />
      </Section>
      <Section title="Press around glass">
        <View style={{ flexDirection: "row", gap: 10 }}>
          {["Mon", "Tue", "Wed"].map((d) => (
            <Press key={d} haptic style={{ flex: 1 }} onPress={() => setCount((c) => c + 1)}>
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
