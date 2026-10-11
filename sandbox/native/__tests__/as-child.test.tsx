import * as React from "react"
import { fireEvent, screen } from "@testing-library/react-native"

import { Button } from "@/components/glass/native/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/glass/native/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/glass/native/dropdown-menu"

import { renderThemed } from "./helpers/render"

// Radix's asChild: the trigger merges into its child instead of nesting a second pressable
// (which swallowed the tap — the menu never opened).

describe("asChild triggers", () => {
  it("a Button as the dropdown trigger opens the menu and keeps its own onPress", async () => {
    const own = jest.fn()
    await renderThemed(
      <DropdownMenu native={false}>
        <DropdownMenuTrigger asChild>
          <Button onPress={own}>Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    // one pressable, not a Press nested in a Press
    expect(screen.getAllByRole("button")).toHaveLength(1)
    expect(screen.getByRole("button").props.accessibilityState?.expanded).toBe(false)
    await fireEvent.press(screen.getByText("Options"))
    expect(own).toHaveBeenCalledTimes(1)
    // open (the content itself waits on measureInWindow, a no-op under jest)
    expect(screen.getByRole("button").props.accessibilityState?.expanded).toBe(true)
  })

  it("a Button as the dialog trigger opens the dialog", async () => {
    await renderThemed(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Edit</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Edit night</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(screen.queryByText("Edit night")).toBeNull()
    await fireEvent.press(screen.getByText("Edit"))
    expect(screen.getByText("Edit night")).toBeTruthy()
  })
})
