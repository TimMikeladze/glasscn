"use client"

import { ArchiveIcon, CheckIcon, ChevronLeftIcon, PinIcon, ShareIcon, TrashIcon } from "lucide-react"

import { DropdownMenuItem } from "@/components/glass/dropdown-menu"
import { Toolbar, ToolbarGroup, ToolbarItem, ToolbarOverflow, ToolbarSpacer, ToolbarTitle } from "@/components/glass/toolbar"

export default function ToolbarDemo() {
  return (
    <div className="grid w-full max-w-md gap-6">
      <Toolbar placement="static" aria-label="Entry">
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
    </div>
  )
}
