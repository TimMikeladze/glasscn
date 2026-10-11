"use client"

import * as React from "react"
import { BookOpenIcon, ChevronLeftIcon, MoonIcon, PenIcon, ShareIcon, SparklesIcon } from "lucide-react"

import { Dock, DockAction, DockBar, DockItem } from "@/components/glass/dock"
import { ScrollEdge } from "@/components/glass/scroll-edge"
import { Toolbar, ToolbarGroup, ToolbarItem, ToolbarSpacer, ToolbarTitle } from "@/components/glass/toolbar"

const nights = Array.from({ length: 14 }, (_, i) => ({
  day: 401 - i,
  note: ["Slept by eleven. No screens after nine.", "Read forty pages of the Rilke letters.", "Long walk, then tea. Mind finally quiet.", "Woke at three, wrote it down, back to sleep."][i % 4],
}))

/**
 * Content scrolling under the bars: the top toolbar and the dock stick to the
 * frame, the scroll-edge bands keep them legible, and their shadows deepen while
 * content is beneath them. The dock folds to its current tab on scroll down.
 */
export default function ScrollEdgeDemo() {
  const [tab, setTab] = React.useState("journal")
  return (
    <div className="relative h-[30rem] w-full max-w-md overflow-y-auto overscroll-contain rounded-surface" tabIndex={0} aria-label="Journal, scrolling under the bars">
      <ScrollEdge edge="top" variant="soft" />
      <Toolbar placement="sticky-top" aria-label="Journal">
        <ToolbarGroup>
          <ToolbarItem aria-label="Back">
            <ChevronLeftIcon className="rtl:-scale-x-100" />
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarSpacer />
        <ToolbarTitle>Journal</ToolbarTitle>
        <ToolbarSpacer />
        <ToolbarGroup>
          <ToolbarItem aria-label="Share">
            <ShareIcon />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
      <ol className="grid gap-3 px-4 pt-4 pb-28">
        {nights.map((n) => (
          <li key={n.day} className="rounded-control bg-fill p-4">
            <p className="text-xs font-semibold text-muted-foreground numeric-glass">Day {n.day}</p>
            <p className="text-sm">{n.note}</p>
          </li>
        ))}
      </ol>
      <ScrollEdge edge="bottom" variant="soft" />
      <div className="sticky bottom-3 z-30 -mt-24">
        <Dock position="static" minimizeBehavior="onScrollDown" data-bar-edge="bottom">
          <DockBar value={tab} onValueChange={setTab} aria-label="Sections">
            <DockItem value="today">
              <MoonIcon />
              Today
            </DockItem>
            <DockItem value="journal" badge={2}>
              <BookOpenIcon />
              Journal
            </DockItem>
            <DockItem value="insights">
              <SparklesIcon />
              Insights
            </DockItem>
          </DockBar>
          <DockAction aria-label="Write tonight">
            <PenIcon />
          </DockAction>
        </Dock>
      </div>
    </div>
  )
}
