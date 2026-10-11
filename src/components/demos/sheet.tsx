"use client"

import * as React from "react"

import { Button } from "@/components/glass/button"
import { Input } from "@/components/glass/input"
import { Label } from "@/components/glass/label"
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/glass/sheet"

export default function SheetDemo() {
  const [name, setName] = React.useState("")
  return (
    <div className="flex flex-wrap gap-3">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="glass">Open sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New area</SheetTitle>
            <SheetDescription>Something you’re getting better at.</SheetDescription>
          </SheetHeader>
          <SheetBody className="grid content-start gap-2">
            <Label htmlFor="sheet-area">Name</Label>
            <Input id="sheet-area" placeholder="Jiu-jitsu" />
          </SheetBody>
          <SheetFooter>
            <Button>Add area</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="glass">Detents</Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          detents={["medium", "large"]}
          // drag down to dismiss — but not with an unsaved note
          onBeforeDismiss={() => !name || window.confirm("Discard this note?")}
        >
          <SheetHeader className="pt-7">
            <SheetTitle>Tonight’s note</SheetTitle>
            <SheetDescription>Drag the grabber, or press it, to resize. Drag down to dismiss.</SheetDescription>
          </SheetHeader>
          <SheetBody className="grid content-start gap-2 pb-5">
            <Label htmlFor="sheet-note">Note</Label>
            <Input id="sheet-note" value={name} onChange={(e) => setName(e.target.value)} placeholder="Slept by eleven" />
          </SheetBody>
        </SheetContent>
      </Sheet>

      <Sheet modal={false}>
        <SheetTrigger asChild>
          <Button variant="glass">Inspector</Button>
        </SheetTrigger>
        <SheetContent side="end">
          <SheetHeader>
            <SheetTitle>Entry details</SheetTitle>
            <SheetDescription>Non-modal: the page stays usable behind it.</SheetDescription>
          </SheetHeader>
          <SheetBody className="grid content-start gap-1 text-muted-foreground">
            <p>Day 401 · 7 h 40 min</p>
            <p>Mood: calm</p>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  )
}
