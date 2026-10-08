"use client"

import * as React from "react"
import { BarChart3Icon, BookOpenIcon, MoonIcon, PenIcon } from "lucide-react"

import { Dock, DockAction, DockBar, DockItem } from "@/components/glass/dock"

export default function DockDemo() {
  const [tab, setTab] = React.useState("today")
  return (
    <div className="flex flex-col items-center gap-4">
      <Dock position="static">
        <DockBar value={tab} onValueChange={setTab} aria-label="Sections">
          <DockItem value="today">
            <MoonIcon />
            Today
          </DockItem>
          <DockItem value="journal">
            <BookOpenIcon />
            Journal
          </DockItem>
          <DockItem value="insights">
            <BarChart3Icon />
            Insights
          </DockItem>
        </DockBar>
        <DockAction aria-label="Write tonight">
          <PenIcon />
        </DockAction>
      </Dock>
      <p className="text-sm text-muted-foreground">
        On <span className="font-medium text-foreground">{tab}</span>
      </p>
    </div>
  )
}
