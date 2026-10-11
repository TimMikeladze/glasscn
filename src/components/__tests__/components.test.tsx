// Behaviour, not looks: roles, attributes, refs and providers. Class strings are left to the
// style refactors — the only class assertion is the tint hook, which is a contract.
import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/glass/alert-dialog"
import { DockBar, DockItem, DockLink, DockNav } from "@/components/glass/dock"
import { Glass } from "@/components/glass/glass"
import { GroupedListContent, GroupedListItem, GroupedListTitle } from "@/components/glass/grouped-list"
import { Kbd, KbdGroup } from "@/components/glass/kbd"
import { Progress } from "@/components/glass/progress"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { Tabs, TabsList, TabsTrigger } from "@/components/glass/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/glass/tooltip"

describe("Tooltip", () => {
  it("renders without a TooltipProvider", () => {
    render(
      <Tooltip open>
        <TooltipTrigger>Save</TooltipTrigger>
        <TooltipContent>Saves the entry</TooltipContent>
      </Tooltip>
    )
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy()
    expect(screen.getByRole("tooltip").textContent).toContain("Saves the entry")
  })
})

describe("GroupedListItem", () => {
  it("with asChild keeps the button's and link's own roles, inside a listitem", () => {
    render(
      <GroupedListContent>
        <GroupedListItem asChild>
          <button type="button">
            <GroupedListTitle>Reminders</GroupedListTitle>
          </button>
        </GroupedListItem>
        <GroupedListItem asChild>
          <a href="/privacy">
            <GroupedListTitle>Privacy</GroupedListTitle>
          </a>
        </GroupedListItem>
        <GroupedListItem>
          <GroupedListTitle>Version</GroupedListTitle>
        </GroupedListItem>
      </GroupedListContent>
    )
    const list = screen.getByRole("list")
    expect(within(list).getAllByRole("listitem")).toHaveLength(3)
    const button = within(list).getByRole("button", { name: "Reminders" })
    const link = within(list).getByRole("link", { name: "Privacy" })
    expect(button.getAttribute("role")).toBeNull()
    expect(link.getAttribute("role")).toBeNull()
    expect(button.parentElement?.getAttribute("role")).toBe("listitem")
    expect(link.parentElement?.getAttribute("role")).toBe("listitem")
  })

  it("disabled disables a button child", () => {
    render(
      <GroupedListItem asChild disabled>
        <button type="button">Off</button>
      </GroupedListItem>
    )
    expect((screen.getByRole("button", { name: "Off" }) as HTMLButtonElement).disabled).toBe(true)
  })
})

describe("DockNav / DockLink", () => {
  it("is a navigation landmark of links; the active one is aria-current=page", () => {
    render(
      <DockNav>
        <DockLink href="/today" active>
          Today
        </DockLink>
        <DockLink href="/trends">Trends</DockLink>
        <DockLink asChild>
          <a href="/settings">Settings</a>
        </DockLink>
      </DockNav>
    )
    const nav = screen.getByRole("navigation")
    const links = within(nav).getAllByRole("link")
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/today", "/trends", "/settings"])
    expect(within(nav).getByRole("link", { name: "Today" }).getAttribute("aria-current")).toBe("page")
    expect(within(nav).getByRole("link", { name: "Trends" }).hasAttribute("aria-current")).toBe(false)
  })
})

describe("sliding-indicator groups accept a user ref", () => {
  // the hook measures the selected item and writes --indicator-* on the group: proof it still owns the node
  const measured = (el: HTMLElement) => el.style.getPropertyValue("--indicator-opacity") === "1"

  it("SegmentedControl", () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <SegmentedControl ref={ref} defaultValue="week" aria-label="Range">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
      </SegmentedControl>
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(ref.current?.getAttribute("data-slot")).toBe("segmented-control")
    expect(ref.current?.querySelector('[data-slot="segmented-control-thumb"]')).not.toBeNull()
    expect(measured(ref.current!)).toBe(true)
  })

  it("TabsList (callback ref)", () => {
    let node: HTMLDivElement | null = null
    render(
      <Tabs defaultValue="a">
        <TabsList ref={(el) => void (node = el)}>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(node).toBe(screen.getByRole("tablist"))
    expect(node!.querySelector('[data-slot="tabs-indicator"]')).not.toBeNull()
    expect(measured(node!)).toBe(true)
  })

  it("DockBar", () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <DockBar ref={ref} defaultValue="today" aria-label="Views">
        <DockItem value="today">Today</DockItem>
        <DockItem value="trends">Trends</DockItem>
      </DockBar>
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(ref.current?.querySelector('[data-slot="dock-indicator"]')).not.toBeNull()
    expect(measured(ref.current!)).toBe(true)
  })

  it("DockNav", () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <DockNav ref={ref}>
        <DockLink href="/" active>
          Home
        </DockLink>
      </DockNav>
    )
    expect(ref.current).toBe(screen.getByRole("navigation"))
    expect(measured(ref.current!)).toBe(true)
  })
})

describe("AlertDialog", () => {
  it("is an alertdialog with a title, a description, Cancel and Action", () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Delete entry?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    )
    const dialog = screen.getByRole("alertdialog", { name: "Delete entry?" })
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeTruthy()
    expect(within(dialog).getByRole("button", { name: "Delete" })).toBeTruthy()
  })
})

describe("Progress", () => {
  it("honours max", () => {
    render(<Progress value={5} max={10} aria-label="Sleep goal" />)
    const bar = screen.getByRole("progressbar", { name: "Sleep goal" })
    expect(bar.getAttribute("aria-valuemax")).toBe("10")
    expect(bar.getAttribute("aria-valuenow")).toBe("5")
    // the fill is half (50% wide, or 50% left to go), never 5% — however the indicator is drawn
    const style = bar.querySelector('[data-slot="progress-indicator"]')?.getAttribute("style") ?? ""
    expect(style).toMatch(/\b50%/)
  })
})

describe("KbdGroup", () => {
  it("is a <kbd> of <kbd>s, valid inside a paragraph", () => {
    const { container } = render(
      <p>
        Press{" "}
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </p>
    )
    const group = container.querySelector('[data-slot="kbd-group"]')
    expect(group?.tagName).toBe("KBD")
    expect(group?.querySelectorAll("kbd")).toHaveLength(2)
  })
})

describe("Glass tint", () => {
  it("each tint changes the pane, and its --glass-tinted value is valid (non-empty, not self-referencing)", () => {
    const { container, rerender } = render(<Glass data-testid="pane" />)
    const plain = container.firstElementChild!.className
    for (const tint of ["primary", "destructive"] as const) {
      rerender(<Glass tint={tint} />)
      const cls = container.firstElementChild!.className
      expect(cls, tint).not.toBe(plain)
      const arbitrary = cls.match(/\[--glass-tinted:([^\]]*)\]/)
      if (arbitrary) {
        expect(arbitrary[1].trim(), tint).not.toBe("")
        expect(arbitrary[1], tint).not.toContain("var(--glass-tinted")
      }
    }
  })
})
