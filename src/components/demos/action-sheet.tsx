import { ArchiveIcon, ShareIcon, TrashIcon } from "lucide-react"

import { ActionSheet, ActionSheetAction, ActionSheetCancel, ActionSheetContent, ActionSheetDescription, ActionSheetHeader, ActionSheetTitle, ActionSheetTrigger } from "@/components/glass/action-sheet"
import { Button } from "@/components/glass/button"

export default function ActionSheetDemo() {
  return (
    <ActionSheet>
      <ActionSheetTrigger asChild>
        <Button variant="glass">Entry options</Button>
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
