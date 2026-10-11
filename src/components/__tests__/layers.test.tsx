// Apple's rule, as a structural test: never glass on glass. Render the control layer open — overlays,
// the dock, the chat composer — and check that nothing frosted sits inside liquid glass.
import * as React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/glass/alert-dialog"
import { Button } from "@/components/glass/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/glass/dialog"
import { Dock, DockAction, DockLink, DockNav } from "@/components/glass/dock"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/glass/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/glass/popover"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/glass/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/glass/tooltip"

const FROSTED = /(^|\s)(glass|glass-strong|glass-subtle|glass-liquid|glass-liquid-clear|glass-prominent)(\s|$)/
const LIQUID = /(^|\s)glass-liquid(-clear)?(\s|$)/

/** Every frosted element that has a liquid ancestor. */
function glassOnLiquid(root: ParentNode = document.body) {
  const hits: string[] = []
  for (const el of root.querySelectorAll<HTMLElement>("[class]")) {
    if (!FROSTED.test(el.className)) continue
    let up = el.parentElement
    while (up) {
      if (LIQUID.test(up.className)) {
        hits.push(`${el.dataset.slot ?? el.tagName} inside ${up.dataset.slot ?? up.tagName}`)
        break
      }
      up = up.parentElement
    }
  }
  return hits
}

describe("never glass on glass", () => {
  it("overlays are liquid and hold only fills and non-glass buttons", () => {
    render(
      <>
        <Dialog open>
          <DialogContent>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>Give it a name.</DialogDescription>
            <DialogFooter>
              <Button variant="secondary">Cancel</Button>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogTitle>Delete 3 notes?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Sheet open>
          <SheetContent>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the list.</SheetDescription>
          </SheetContent>
        </Sheet>
        <Popover open>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Details</PopoverContent>
        </Popover>
        <DropdownMenu open>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Rename</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip open>
          <TooltipTrigger>Tip</TooltipTrigger>
          <TooltipContent>Saves the entry</TooltipContent>
        </Tooltip>
      </>
    )
    const liquid = [...document.body.querySelectorAll<HTMLElement>("[class]")].filter((el) => LIQUID.test(el.className)).map((el) => el.dataset.slot)
    for (const slot of ["dialog-content", "alert-dialog-content", "sheet-content", "popover-content", "dropdown-menu-content", "tooltip-content"]) expect(liquid, slot).toContain(slot)
    expect(glassOnLiquid()).toEqual([])
  })

  it("the dock and its action are liquid siblings, never nested", () => {
    render(
      <Dock position="static">
        <DockNav>
          <DockLink href="/today" active>
            Today
          </DockLink>
        </DockNav>
        <DockAction aria-label="Write">+</DockAction>
      </Dock>
    )
    expect(glassOnLiquid()).toEqual([])
  })

  it("a glass button inside a liquid panel is caught", () => {
    render(
      <div className="glass-liquid">
        <Button variant="glass">Nested</Button>
      </div>
    )
    expect(glassOnLiquid().length).toBeGreaterThan(0)
  })
})
