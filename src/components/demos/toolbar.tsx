"use client"

import { ArchiveIcon, CheckIcon, ChevronLeftIcon, PinIcon, ShareIcon, TrashIcon } from "lucide-react"

import { DropdownMenuItem } from "@/components/glass/dropdown-menu"
import { Toolbar, ToolbarGroup, ToolbarItem, ToolbarOverflow, ToolbarSpacer, ToolbarTitle } from "@/components/glass/toolbar"

export default function ToolbarDemo() {
  return (
    <div data-slot="toolbar-demo-scroll" className="h-[26rem] w-full max-w-md overflow-y-auto overscroll-contain rounded-surface" tabIndex={0} aria-label="Entry preview">
      <Toolbar placement="sticky-top" minimize="onScrollDown" aria-label="Entry">
        <ToolbarGroup>
          <ToolbarItem aria-label="Back">
            <ChevronLeftIcon className="rtl:-scale-x-100" />
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarSpacer />
        <ToolbarTitle>Tonight</ToolbarTitle>
        <ToolbarSpacer />
        <ToolbarGroup>
          <ToolbarItem aria-label="Share">
            <ShareIcon />
          </ToolbarItem>
          <ToolbarOverflow>
            <DropdownMenuItem>
              <ArchiveIcon />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem>
              <PinIcon />
              Pin
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <TrashIcon />
              Delete
            </DropdownMenuItem>
          </ToolbarOverflow>
        </ToolbarGroup>
        <ToolbarItem prominent aria-label="Done">
          <CheckIcon />
        </ToolbarItem>
      </Toolbar>
      <article className="grid gap-5 px-5 pt-7 pb-12 text-sm leading-relaxed">
        <div>
          <h3 className="type-title-2 font-semibold">A walk after rain</h3>
          <p className="mt-1 text-muted-foreground">October 24 · 8:42 PM</p>
        </div>
        <p>The path was quiet tonight. Water still hung from the branches, catching the last light.</p>
        <p>I left the headphones at home. There was enough to listen to: leaves, the creek, someone calling a dog across the park.</p>
        {[
          ["Notice", "The things that changed since yesterday. The warm window at the corner. A new trail through the leaves."],
          ["Keep", "A little time without a destination. A conversation that lasted longer than expected."],
          ["Return", "Tomorrow, before the day fills up. The same path will have something else to offer."],
          ["Remember", "There was nothing to finish tonight. Getting outside was enough."],
        ].map(([title, body]) => <section key={title} className="grid gap-1"><h4 className="font-semibold">{title}</h4><p>{body}</p></section>)}
      </article>
    </div>
  )
}
