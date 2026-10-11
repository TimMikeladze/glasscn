// M2 controls: behaviour of the liquid-layer additions (loading, drag, momentary, groups).
import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Button, PullDownButton, SplitButton } from "@/components/glass/button"
import { GlassGroup, GlassGroupItem } from "@/components/glass/glass-group"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { Slider } from "@/components/glass/slider"
import { Switch } from "@/components/glass/switch"

describe("Button", () => {
  it("loading marks it busy, ignores clicks and swaps the leading icon for a spinner", () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        <svg data-testid="icon" /> Send
      </Button>
    )
    const button = screen.getByRole("button", { name: "Send" })
    expect(button.getAttribute("aria-busy")).toBe("true")
    expect(screen.queryByTestId("icon")).toBeNull()
    expect(button.querySelector("[data-slot=button-spinner]")).toBeTruthy()
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
  it("loading without an icon keeps the label (and the width) under the spinner; loadingText replaces it", () => {
    const { rerender } = render(<Button loading>Save</Button>)
    expect(screen.getByRole("button").textContent).toBe("Save")
    rerender(<Button loading loadingText="Saving…">Save</Button>)
    expect(screen.getByRole("button").textContent).toBe("Saving…")
  })
  it("prominent is tinted liquid glass; pull-down and split buttons render", () => {
    render(
      <SplitButton>
        <Button variant="prominent">Save</Button>
        <PullDownButton aria-label="More" />
      </SplitButton>
    )
    expect(screen.getByRole("button", { name: "Save" }).className).toMatch(/(^|\s)glass-prominent(\s|$)/)
    expect(screen.getByRole("group").querySelectorAll("button")).toHaveLength(2)
  })
})

describe("Switch", () => {
  it("toggles on click, and a drag back to its own side keeps it", () => {
    render(<Switch aria-label="Wi-Fi" />)
    const s = screen.getByRole("switch")
    fireEvent.click(s, { detail: 1 })
    expect(s.getAttribute("aria-checked")).toBe("true")
    // checked; drag toward the off side… then toward the on side again: no change
    fireEvent.pointerDown(s, { clientX: 40 })
    fireEvent.pointerMove(s, { clientX: 60, buttons: 1 })
    fireEvent.click(s, { detail: 1 })
    expect(s.getAttribute("aria-checked")).toBe("true")
    // a drag to the off side toggles
    fireEvent.pointerDown(s, { clientX: 60 })
    fireEvent.pointerMove(s, { clientX: 30, buttons: 1 })
    fireEvent.click(s, { detail: 1 })
    expect(s.getAttribute("aria-checked")).toBe("false")
  })
})

describe("SegmentedControl", () => {
  it("momentary reports presses and keeps nothing selected", () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl momentary onValueChange={onValueChange} aria-label="Jump">
        <SegmentedControlItem value="prev">Previous</SegmentedControlItem>
        <SegmentedControlItem value="next">Next</SegmentedControlItem>
      </SegmentedControl>
    )
    fireEvent.click(screen.getByText("Next"))
    expect(onValueChange).toHaveBeenCalledWith("next")
    expect(document.querySelector('[data-slot="segmented-control-item"][data-state="on"]')).toBeNull()
  })
  it("defaults to the capsule shape", () => {
    render(
      <SegmentedControl defaultValue="a" aria-label="x">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
      </SegmentedControl>
    )
    expect(document.querySelector("[data-slot=segmented-control]")!.getAttribute("data-shape")).toBe("capsule")
  })
})

describe("Slider", () => {
  it("renders ticks per step, end icons, and a neutral-origin range", () => {
    render(<Slider defaultValue={[3]} min={-5} max={5} step={5} ticks neutralValue={0} minIcon={<span>-</span>} maxIcon={<span>+</span>} aria-label="Balance" />)
    expect(document.querySelectorAll("[data-slot=slider-ticks] > span")).toHaveLength(3)
    expect(document.querySelector("[data-slot=slider-container]")).toBeTruthy()
    const range = document.querySelector<HTMLElement>("[data-slot=slider-range]")!
    expect(range.style.insetInlineStart).toBe("50%")
    expect(range.style.width).toBe("30%")
  })
})

describe("GlassGroup", () => {
  it("is one liquid group of transparent items; selection is aria-pressed", () => {
    render(
      <GlassGroup indicator aria-label="Style">
        <GlassGroupItem selected>Bold</GlassGroupItem>
        <GlassGroupItem selected={false}>Italic</GlassGroupItem>
      </GlassGroup>
    )
    const group = screen.getByRole("group", { name: "Style" })
    expect(group.className).toMatch(/(^|\s)glass-liquid(\s|$)/)
    expect(screen.getByRole("button", { name: "Bold" }).getAttribute("aria-pressed")).toBe("true")
    expect(screen.getByRole("button", { name: "Italic" }).getAttribute("aria-pressed")).toBe("false")
    for (const b of screen.getAllByRole("button")) expect(b.className).not.toMatch(/(^|\s)glass-liquid(\s|$)/)
  })
})
