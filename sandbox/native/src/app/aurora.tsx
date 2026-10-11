import { View } from "react-native"

import { Glass } from "@/components/glass/native/glass"
import { useGlassTheme } from "@/components/glass/native/tokens"
import { Body, Screen, Section } from "@/sandbox/ui"

export default function AuroraScreen() {
  const t = useGlassTheme()
  return (
    <Screen>
      <View style={{ height: 360 }} />
      <Section title="Aurora" note="Three blobs drift over the base colour on the UI thread (Reanimated), sized to their container, at the motion preset’s aurora speed. Reduce Motion (or motion “none”) stops them.">
        <Glass style={{ padding: 16, gap: 6 }}>
          <Body>base {t.auroraBase}</Body>
          <Body>blobs {t.aurora.join(" · ")}</Body>
        </Glass>
      </Section>
    </Screen>
  )
}
