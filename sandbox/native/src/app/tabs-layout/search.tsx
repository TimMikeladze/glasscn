import * as React from "react"
import { ScrollView } from "react-native"

import { SearchField } from "@/components/glass/native/search-field"
import { GText, useUI } from "@/components/glass/native/ui"

/** The `role="search"` tab: on iOS 26 it sits apart from the others as the search button. */
export default function Search() {
  const ui = useUI()
  const [q, setQ] = React.useState("")
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: ui.auroraBase }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <SearchField value={q} onValueChange={setQ} suggestions={["Rain", "Rowing", "Reading"].filter((s) => q && s.toLowerCase().startsWith(q.toLowerCase()))} />
      <GText size="sm" tone="muted">
        {q ? `Results for “${q}”` : "Search every night."}
      </GText>
    </ScrollView>
  )
}
