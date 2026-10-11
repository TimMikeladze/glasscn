import { ScrollView, View } from "react-native"

import { Glass } from "@/components/glass/native/glass"
import { GText, useUI } from "@/components/glass/native/ui"

/** Long enough to scroll: the tab bar folds on the way down and returns on the way up. */
export function Nights({ title }: { title: string }) {
  const ui = useUI()
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: ui.auroraBase }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <GText font="display" size="3xl" role="heading">
        {title}
      </GText>
      <GText size="sm" tone="muted">
        Scroll down: on iOS 26 the tab bar minimizes and the accessory moves inline.
      </GText>
      {Array.from({ length: 30 }, (_, i) => (
        <Glass key={i} style={{ padding: 16, gap: 4 }}>
          <GText weight="600">Night {311 - i}</GText>
          <View style={{ height: 6, borderRadius: 3, width: `${30 + ((i * 37) % 70)}%`, backgroundColor: ui.fillStrong }} />
        </Glass>
      ))}
    </ScrollView>
  )
}

export default function Tonight() {
  return <Nights title="Tonight" />
}
