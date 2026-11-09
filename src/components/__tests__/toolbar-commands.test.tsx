import * as React from "react"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ToolbarCommands, type ToolbarCommand } from "../glass/toolbar"

let width = 400
let resize: () => void
let callbacks: (() => void)[]
beforeEach(() => {
  width = 400
  callbacks = []
  resize = () => callbacks.forEach(callback => callback())
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function(this: HTMLElement) {
    const w = this.dataset.slot === "toolbar-commands" ? width : this.hasAttribute("data-measure-overflow") ? 40 : 60
    return { x: 0, y: 0, top: 0, left: 0, right: w, bottom: 40, width: w, height: 40, toJSON() {} }
  })
  vi.stubGlobal("ResizeObserver", class { constructor(cb: () => void) { callbacks.push(cb) } observe() {} unobserve() {} disconnect() {} })
})
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

function openMenu() {
  fireEvent.pointerDown(screen.getByRole("button", { name: "More document actions" }), { button: 0, ctrlKey: false, pointerType: "mouse" })
}

describe("adaptive toolbar commands", () => {
  it("keeps Share trailing and overflow-only actions accessible when expanded", () => {
    render(<ToolbarCommands commands={[{ id: "undo", label: "Undo", onSelect() {} }, { id: "export", label: "Export", overflow: "always", onSelect() {} }, { id: "share", label: "Share", pinned: true, onSelect() {} }]} overflowLabel="More document actions" />)
    expect(screen.getByRole("button", { name: "Share" }).closest('[data-slot="toolbar-commands-pinned"]')).not.toBeNull()
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull()
    openMenu()
    expect(screen.getByRole("menuitem", { name: "Export" })).toBeDefined()
  })
  it("does not activate disabled commands and uses updated callbacks while the menu is open", () => {
    const oldAction = vi.fn(), updatedAction = vi.fn(), disabledAction = vi.fn()
    const list = (onSelect: () => void): ToolbarCommand[] => [{ id: "export", label: "Export", overflow: "always", onSelect }, { id: "locked", label: "Locked", overflow: "always", disabled: true, onSelect: disabledAction }]
    const { rerender } = render(<ToolbarCommands commands={list(oldAction)} overflowLabel="More document actions" />)
    openMenu()
    rerender(<ToolbarCommands commands={list(updatedAction)} overflowLabel="More document actions" />)
    fireEvent.click(screen.getByRole("menuitem", { name: "Locked" }))
    expect(disabledAction).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("menuitem", { name: "Export" }))
    expect(oldAction).not.toHaveBeenCalled()
    expect(updatedAction).toHaveBeenCalledTimes(1)
  })
  it("moves removed command focus to More without stealing focus from the editor", () => {
    render(<><ToolbarCommands commands={[{ id: "low", label: "Format", onSelect() {} }, { id: "undo", label: "Undo", priority: 10, onSelect() {} }, { id: "share", label: "Share", pinned: true, onSelect() {} }]} /><textarea aria-label="Editor" /></>)
    screen.getByRole("button", { name: "Format" }).focus()
    act(() => { width = 190; resize() })
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "More actions" }))
    screen.getByRole("textbox", { name: "Editor" }).focus()
    act(() => { width = 400; resize() })
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Editor" }))
  })
  it("reallocates on resize with stable order and keyboard reachability", () => {
    const action = vi.fn()
    render(<ToolbarCommands aria-label="Document actions" commands={[{ id: "low", label: "Format", onSelect: action }, { id: "undo", label: "Undo", priority: 10, onSelect: action }, { id: "share", label: "Share", pinned: true, onSelect: action }]} />)
    const root = screen.getByRole("toolbar", { name: "Document actions" })
    const undo = within(root).getByRole("button", { name: "Undo" })
    undo.focus()
    fireEvent.keyDown(undo, { key: "End" })
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Share" }))
    act(() => { width = 190; resize() })
    expect(screen.queryByRole("button", { name: "Format" })).toBeNull()
    expect(screen.getByRole("button", { name: "Undo" })).toBeDefined()
  })
})
