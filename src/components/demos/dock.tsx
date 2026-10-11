"use client"

import * as React from "react"
import { BarChart3Icon, BookOpenIcon, MoonIcon, PauseIcon, PenIcon } from "lucide-react"

import { Dock, DockAccessory, DockAction, DockBar, DockItem, DockSearch, usePlacement } from "@/components/glass/dock"

function NowPlaying() {
  // inline beside a minimized dock there's only room for the essentials
  const placement = usePlacement()
  return (
    <>
      <span aria-hidden className="size-7 shrink-0 rounded-control bg-primary/16" />
      <span className="min-w-0 flex-1 truncate font-medium">Wind-down · Rain on tin{placement === "expanded" ? " — 12 min left" : ""}</span>
      <button type="button" aria-label="Pause" className="glass-focus hit-area inline-flex size-control-sm items-center justify-center rounded-button hover:bg-fill">
        <PauseIcon className="size-4" />
      </button>
    </>
  )
}

export default function DockDemo() {
  const [tab, setTab] = React.useState("today")
  const [query, setQuery] = React.useState("")
  const entries = ["Rilke letters", "Rain walk", "Rest day"].filter((e) => query && e.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <Dock position="static">
        <DockAccessory>
          <NowPlaying />
        </DockAccessory>
        <DockBar value={tab} onValueChange={setTab} aria-label="Sections">
          <DockItem value="today">
            <MoonIcon />
            Today
          </DockItem>
          <DockItem value="journal" badge={3}>
            <BookOpenIcon />
            Journal
          </DockItem>
          <DockItem value="insights">
            <BarChart3Icon />
            Insights
          </DockItem>
        </DockBar>
        <DockSearch placeholder="Search entries" value={query} onValueChange={setQuery} suggestions={entries} />
        <DockAction aria-label="Write tonight">
          <PenIcon />
        </DockAction>
      </Dock>
      <p className="text-sm text-muted-foreground">
        On <span className="font-medium text-foreground">{tab}</span> — drag across the bar to scrub
      </p>
    </div>
  )
}
