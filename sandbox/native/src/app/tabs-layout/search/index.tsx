import * as React from "react"
import { ScrollView } from "react-native"
import { Stack } from "expo-router"

import { Glass } from "@/components/glass/native/glass"
import { GText, useUI } from "@/components/glass/native/ui"

const NIGHTS = ["Rain on a tin roof", "Rowing at dawn", "Reading by the fire", "Harbor fog", "Night train"]

/** The `role="search"` tab: the system search field sits at the bottom of the screen on iOS 26. */
export default function Search() {
  const ui = useUI()
  const [q, setQ] = React.useState("")
  const results = NIGHTS.filter((n) => n.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <>
      <Stack.Screen options={{ headerSearchBarOptions: { placeholder: "Nights and sounds", onChangeText: (e) => setQ(e.nativeEvent.text), hideWhenScrolling: false } }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardDismissMode="on-drag" style={{ backgroundColor: ui.auroraBase }} contentContainerStyle={{ padding: 16, gap: 12 }}>
        <GText font="display" size="3xl" role="heading">
          Search
        </GText>
        <GText size="sm" tone="muted">
          {q ? (results.length ? `Results for “${q}”` : `No nights match “${q}”`) : "Search every night."}
        </GText>
        {results.map((name) => (
          <Glass key={name} style={{ padding: 16 }}>
            <GText weight="600">{name}</GText>
          </Glass>
        ))}
      </ScrollView>
    </>
  )
}
