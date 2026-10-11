"use client"

import * as React from "react"
import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { ConfirmationPopover, ConfirmationPopoverContent, ConfirmationPopoverTrigger } from "@/components/glass/confirmation-popover"

export default function ConfirmationPopoverDemo() {
  const [deleted, setDeleted] = React.useState(false)
  return (
    <div className="flex items-center gap-3">
      <ConfirmationPopover>
        <ConfirmationPopoverTrigger asChild>
          <Button variant="destructive" disabled={deleted}>
            <Trash2Icon /> Delete entry
          </Button>
        </ConfirmationPopoverTrigger>
        <ConfirmationPopoverContent
          title="Delete this entry?"
          description="It will be removed from all your devices."
          confirmLabel="Delete"
          onConfirm={() => setDeleted(true)}
        />
      </ConfirmationPopover>
      {deleted ? (
        <>
          <span role="status" className="text-sm text-muted-foreground">
            Deleted.
          </span>
          <Button variant="ghost" onClick={() => setDeleted(false)}>
            Undo
          </Button>
        </>
      ) : null}
    </div>
  )
}
