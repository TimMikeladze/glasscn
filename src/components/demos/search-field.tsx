"use client"

import * as React from "react"

import { SearchField } from "@/components/glass/search-field"

const entries = ["Rilke letters", "Rain walk", "Rest day", "Running club", "Reading by the window"]

export default function SearchFieldDemo() {
  const [query, setQuery] = React.useState("")
  const [picked, setPicked] = React.useState<string | null>(null)
  const matches = query ? entries.filter((e) => e.toLowerCase().includes(query.toLowerCase())) : []
  return (
    <div className="grid w-full max-w-sm gap-6">
      <SearchField placeholder="Search entries" value={query} onValueChange={setQuery} suggestions={matches} onSuggestionSelect={setPicked} />
      <div className="flex items-center gap-3">
        <SearchField minimized placeholder="Search tags" className="flex-1" />
        <span className="text-sm text-muted-foreground">{picked ? `Opened “${picked}”` : "Press the button to open"}</span>
      </div>
    </div>
  )
}
