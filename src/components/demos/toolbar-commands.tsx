"use client"

import * as React from "react"
import { ToolbarCommands } from "@/components/glass/toolbar"

export default function ToolbarCommandsDemo() {
  const [message, setMessage] = React.useState("Resize the panel to move commands into More.")
  return <div className="w-full space-y-4">
    <div className="max-w-full min-w-40 resize-x overflow-auto p-2" style={{ width: 480 }}><ToolbarCommands aria-label="Document actions" overflowLabel="More document actions" commands={[
      { id: "undo", label: "Undo", priority: 10, onSelect: () => setMessage("Undid the last edit.") },
      { id: "redo", label: "Redo", priority: 10, disabled: true, onSelect: () => setMessage("Redid the last edit.") },
      { id: "format", label: "Format", onSelect: () => setMessage("Formatting selected.") },
      { id: "export", label: "Export", overflow: "always", onSelect: () => setMessage("Export selected.") },
      { id: "share", label: "Share", pinned: true, onSelect: () => setMessage("Share selected.") },
    ]} /></div>
    <p role="status" className="text-sm text-muted-foreground">{message}</p>
  </div>
}
