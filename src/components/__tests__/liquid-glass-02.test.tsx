import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LiquidGlass02 } from "../blocks/liquid-glass-02"

describe("advanced glass scenes", () => {
  it("keeps selection linked to the landmark inspector and independent badges", () => {
    render(<LiquidGlass02 scene="landmarks" />)
    fireEvent.click(screen.getByRole("button", { name: "Select Open coast" }))
    expect(screen.getByTestId("landmark-inspector").textContent).toContain("Open coast")
    fireEvent.click(screen.getByRole("button", { name: "Add summit badge" }))
    expect(screen.getByRole("button", { name: "Summit badge" })).toBeDefined()
    fireEvent.click(screen.getByRole("button", { name: "Reverse badges" }))
    fireEvent.click(screen.getByRole("button", { name: "Summit badge" }))
    expect(screen.getByRole("status").textContent).toContain("Summit")
  })
  it("edits the parent note while its nonmodal formatting sheet is open, then saves", () => {
    render(<LiquidGlass02 scene="notes" />)
    fireEvent.click(screen.getByRole("button", { name: "Format note" }))
    const note = screen.getByRole("textbox", { name: "Note text" })
    fireEvent.change(note, { target: { value: "Bring the field guide." } })
    expect(screen.getByText("Draft")).toBeDefined()
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    expect(screen.getByText("Saved")).toBeDefined()
    expect((note as HTMLTextAreaElement).value).toBe("Bring the field guide.")
  })
  it("opens a search destination without focusing and focuses the prominent action", () => {
    render(<LiquidGlass02 scene="search" />)
    fireEvent.click(screen.getByRole("button", { name: "Search destination" }))
    expect(document.activeElement?.tagName).not.toBe("INPUT")
    fireEvent.click(screen.getByRole("button", { name: "Search now" }))
    expect(document.activeElement).toBe(screen.getByRole("searchbox", { name: "Search all collections" }))
    fireEvent.change(document.activeElement!, { target: { value: "no such landmark" } })
    expect(screen.getByText(/No results for/)).toBeDefined()
  })
  it("switches material grounds and reveals details independently on clear controls", () => {
    render(<LiquidGlass02 scene="materials" />)
    fireEvent.click(screen.getByRole("button", { name: "Dark content" }))
    expect(screen.getByRole("button", { name: "Bright content" }).getAttribute("aria-pressed")).toBe("true")
    fireEvent.click(screen.getByRole("button", { name: "Show details dark media" }))
    expect(screen.getByText("Night recording · 21:45")).toBeDefined()
    expect(screen.getByRole("slider", { name: "Neutral balance" }).getAttribute("aria-valuenow")).toBe("0")
    expect(screen.getByRole("slider", { name: "Playback progress" })).toBeDefined()
  })
  it("removes a SearchField scope token and restores the complete library", () => {
    render(<LiquidGlass02 scene="search" />)
    fireEvent.click(screen.getByRole("button", { name: "Show Places folder" }))
    expect(screen.queryByRole("button", { name: "Open Summit journal" })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Remove Places filter" }))
    expect(screen.getByRole("button", { name: "Open Summit journal" })).toBeDefined()
    expect(screen.queryByRole("button", { name: "Remove Places filter" })).toBeNull()
  })
  it("removes recents and filters the current collection", () => {
    render(<LiquidGlass02 scene="search" />)
    fireEvent.click(screen.getByRole("button", { name: "Remove recent Coast" }))
    expect(screen.queryByRole("button", { name: "Search recent Coast" })).toBeNull()
    fireEvent.change(screen.getByRole("textbox", { name: "Filter this library" }), { target: { value: "Summit" } })
    expect(screen.queryByRole("button", { name: "Open Alpine lake" })).toBeNull()
    expect(screen.getByRole("button", { name: "Open Summit journal" })).toBeDefined()
  })
})
