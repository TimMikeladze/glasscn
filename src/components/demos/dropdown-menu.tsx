"use client"

import * as React from "react"
import { CopyIcon, PenIcon, ShareIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/glass/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/glass/dropdown-menu"

export default function DropdownMenuDemo() {
  const [kept, setKept] = React.useState(true)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="glass">This night</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Thursday, Oct 8</DropdownMenuLabel>
        <DropdownMenuItem>
          <PenIcon /> Rewrite <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CopyIcon /> Copy as text
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ShareIcon /> Share
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={kept} onCheckedChange={setKept}>
          Promise kept
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2Icon /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
