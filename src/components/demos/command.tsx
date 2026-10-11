"use client"

import * as React from "react"
import { BookOpenIcon, CalendarIcon, FlameIcon, MoonIcon, PenLineIcon, SettingsIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/glass/command"
import { Kbd } from "@/components/glass/kbd"

function Items({ onRun }: { onRun?: () => void }) {
  return (
    <>
      <CommandEmpty>No matching commands.</CommandEmpty>
      <CommandGroup heading="Journal">
        <CommandItem onSelect={onRun}>
          <PenLineIcon />
          New entry
          <CommandShortcut>⌘N</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={onRun}>
          <BookOpenIcon />
          Read this week
        </CommandItem>
        <CommandItem onSelect={onRun} keywords={["streak", "habit"]}>
          <FlameIcon />
          Show streak
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Settings">
        <CommandItem onSelect={onRun}>
          <CalendarIcon />
          Reminder time
        </CommandItem>
        <CommandItem onSelect={onRun}>
          <MoonIcon />
          Dark appearance
        </CommandItem>
        <CommandItem onSelect={onRun} disabled>
          <SettingsIcon />
          Sync (offline)
        </CommandItem>
      </CommandGroup>
    </>
  )
}

/** Inline on a card, and as ⌘K in a liquid dialog. */
export default function CommandDemo() {
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <div className="glass w-full overflow-hidden rounded-surface">
        <Command>
          <CommandInput placeholder="Search commands…" />
          <CommandList>
            <Items />
          </CommandList>
        </Command>
      </div>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open palette <Kbd>⌘K</Kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command…" />
        <CommandList>
          <Items onRun={() => setOpen(false)} />
        </CommandList>
      </CommandDialog>
    </div>
  )
}
