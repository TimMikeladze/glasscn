"use client"

import { CopyIcon, PinIcon, ShareIcon, Trash2Icon } from "lucide-react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuPreview,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/glass/context-menu"

export default function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="block w-full max-w-xs rounded-surface-sm">
        <ContextMenuPreview className="grid gap-1 rounded-surface-sm bg-fill p-4 text-sm">
          <span className="font-medium">Sunday, 11 October</span>
          <span className="text-muted-foreground">Right-click, or long-press on touch.</span>
        </ContextMenuPreview>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem>
            <PinIcon /> Pin entry
          </ContextMenuItem>
          <ContextMenuItem>
            <CopyIcon /> Copy text <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <ShareIcon /> Share…
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <Trash2Icon /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
