import { ArchiveIcon, ShareIcon, TrashIcon } from "lucide-react"

import { ActionSheet, ActionSheetAction, ActionSheetCancel, ActionSheetContent, ActionSheetDescription, ActionSheetHeader, ActionSheetTitle, ActionSheetTrigger } from "@/components/glass/action-sheet"
import { Button } from "@/components/glass/button"

export default function ActionSheetDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <EntrySheet />
      <EntrySheet placement="source" />
    </div>
  )
}

function EntrySheet({ placement = "sheet" }: { placement?: "sheet" | "source" }) {
  return (
    <ActionSheet placement={placement}>
      <ActionSheetTrigger asChild>
        <Button variant="glass">{placement === "source" ? "From the button" : "Entry options"}</Button>
      </ActionSheetTrigger>
      <ActionSheetContent>
        <ActionSheetHeader>
          <ActionSheetTitle>Day 401</ActionSheetTitle>
          <ActionSheetDescription>Slept by eleven. No screens after nine.</ActionSheetDescription>
        </ActionSheetHeader>
        <ActionSheetAction>
          <ShareIcon />
          Share
        </ActionSheetAction>
        <ActionSheetAction>
          <ArchiveIcon />
          Archive
        </ActionSheetAction>
        <ActionSheetAction variant="destructive">
          <TrashIcon />
          Delete entry
        </ActionSheetAction>
        <ActionSheetCancel />
      </ActionSheetContent>
    </ActionSheet>
  )
}
