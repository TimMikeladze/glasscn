import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Dock, DockBar, DockItem } from "@/components/glass/dock"
import { nextMinimized } from "@/components/glass/scroll-edge"
import { SearchField } from "@/components/glass/search-field"
import { detentHeight, settleDetent } from "@/components/glass/sheet"
import { Toolbar, ToolbarGroup, ToolbarItem } from "@/components/glass/toolbar"

describe("nextMinimized (minimize on scroll down)", () => {
  it("hides on a real scroll down, returns on scroll up and near the top", () => {
    expect(nextMinimized(false, 100, 140)).toBe(true)
    expect(nextMinimized(true, 140, 100)).toBe(false)
    expect(nextMinimized(true, 200, 30)).toBe(false)
  })
  it("ignores jitter below the threshold", () => {
    expect(nextMinimized(true, 200, 197)).toBe(true)
    expect(nextMinimized(false, 200, 205)).toBe(false)
  })
})

describe("sheet detents", () => {
  it("resolves detents against the viewport", () => {
    expect(detentHeight("medium", 800)).toBe(400)
    expect(detentHeight("large", 800, 24)).toBe(776)
    expect(detentHeight(0.3, 800)).toBe(240)
    expect(detentHeight("900px", 800, 24)).toBe(776)
  })
  it("settles on the nearest detent, or dismisses below the smallest", () => {
    const h = [400, 776]
    expect(settleDetent(h, 700)).toBe(1)
    expect(settleDetent(h, 450)).toBe(0)
    expect(settleDetent(h, 150)).toBe(-1)
    // a fast fling down from the smallest dismisses
    expect(settleDetent(h, 390, 2)).toBe(-1)
    // a fling up from medium reaches large
    expect(settleDetent(h, 450, -2)).toBe(1)
  })
})

describe("SearchField", () => {
  it("clears, cancels and picks suggestions from the keyboard", () => {
    const onPick = vi.fn()
    const onChange = vi.fn()
    render(<SearchField placeholder="Search entries" defaultValue="ra" onValueChange={onChange} suggestions={["Rain walk", "Rest day"]} onSuggestionSelect={onPick} />)
    const input = screen.getByRole("combobox", { name: "Search entries" })
    fireEvent.focus(input)
    expect(screen.getByRole("listbox")).toBeTruthy()
    fireEvent.keyDown(input, { key: "ArrowDown" })
    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(input.getAttribute("aria-activedescendant")).toMatch(/-1$/)
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onPick).toHaveBeenCalledWith("Rest day")
    fireEvent.click(screen.getByRole("button", { name: "Clear" }))
    expect(onChange).toHaveBeenLastCalledWith("")
  })
  it("starts minimized as a button that opens into a field", () => {
    render(<SearchField minimized placeholder="Search tags" />)
    fireEvent.click(screen.getByRole("button", { name: "Search tags" }))
    expect(screen.getByRole("searchbox", { name: "Search tags" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy()
  })
})

describe("Toolbar", () => {
  it("is a toolbar whose arrow keys move between items", () => {
    render(
      <Toolbar placement="static" aria-label="Entry">
        <ToolbarGroup>
          <ToolbarItem aria-label="Back">B</ToolbarItem>
          <ToolbarItem aria-label="Share">S</ToolbarItem>
        </ToolbarGroup>
        <ToolbarItem prominent aria-label="Done">D</ToolbarItem>
      </Toolbar>
    )
    const back = screen.getByRole("button", { name: "Back" })
    back.focus()
    fireEvent.keyDown(back, { key: "ArrowRight" })
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Share" }))
    fireEvent.keyDown(document.activeElement!, { key: "End" })
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Done" }))
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" })
    expect(document.activeElement).toBe(back)
  })
})

describe("Dock", () => {
  it("announces badges with the item", () => {
    render(
      <Dock position="static">
        <DockBar defaultValue="a" aria-label="Sections">
          <DockItem value="a">Today</DockItem>
          <DockItem value="b" badge={3}>
            Journal
          </DockItem>
        </DockBar>
      </Dock>
    )
    const item = screen.getByText("Journal").closest('[data-slot="dock-item"]')
    expect(item?.textContent).toBe("Journal3 new")
  })
})
