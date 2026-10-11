"use client"

import * as React from "react"
import { ChevronsUpDownIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/glass/collapsible"

export default function CollapsibleDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="grid w-full max-w-xs gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">3 tags on this entry</span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={open ? "Hide tags" : "Show tags"}>
            <ChevronsUpDownIcon />
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-control bg-fill px-pad-sm py-2 text-sm">#gratitude</div>
      <CollapsibleContent className="grid gap-2">
        <div className="rounded-control bg-fill px-pad-sm py-2 text-sm">#family</div>
        <div className="rounded-control bg-fill px-pad-sm py-2 text-sm">#autumn</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
