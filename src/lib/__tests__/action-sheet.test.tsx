import * as React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { expect, it, vi } from "vitest"

import { ActionSheet, ActionSheetAction, ActionSheetCancel, ActionSheetContent, ActionSheetDescription, ActionSheetTitle, ActionSheetTrigger } from "@/components/glass/action-sheet"

function Choices({ change, action }: { change: (open: boolean) => void; action?: () => void }) {
  return <ActionSheet onOpenChange={change}><ActionSheetTrigger>Options</ActionSheetTrigger><ActionSheetContent><ActionSheetTitle>Entry</ActionSheetTitle><ActionSheetDescription>Choose an action</ActionSheetDescription><ActionSheetAction onClick={action}>Archive</ActionSheetAction><ActionSheetCancel /></ActionSheetContent></ActionSheet>
}

it("uses a choice dialog and returns focus after outside dismissal", async () => {
  const change = vi.fn()
  render(<Choices change={change} />)
  const trigger = screen.getByRole("button", { name: "Options" })
  fireEvent.click(trigger)
  const dialog = await screen.findByRole("dialog", { name: "Entry" })
  fireEvent.pointerDown(dialog)
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(change.mock.calls).toEqual([[true], [false]])
  await waitFor(() => expect(document.activeElement).toBe(trigger))
})

it("delivers one action and one close notification for a selection", async () => {
  const change = vi.fn()
  const action = vi.fn()
  render(<Choices change={change} action={action} />)
  fireEvent.click(screen.getByRole("button", { name: "Options" }))
  fireEvent.click(await screen.findByRole("button", { name: "Archive" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(action).toHaveBeenCalledOnce()
  expect(change.mock.calls).toEqual([[true], [false]])
})

it("dismisses choices with Escape without selecting an action", async () => {
  const change = vi.fn()
  const action = vi.fn()
  render(<Choices change={change} action={action} />)
  const trigger = screen.getByRole("button", { name: "Options" })
  fireEvent.click(trigger)
  await screen.findByRole("dialog", { name: "Entry" })
  fireEvent.keyDown(document, { key: "Escape" })
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(action).not.toHaveBeenCalled()
  expect(change.mock.calls).toEqual([[true], [false]])
  await waitFor(() => expect(document.activeElement).toBe(trigger))
})
