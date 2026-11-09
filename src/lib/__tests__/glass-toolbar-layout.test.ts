import { describe, expect, it } from "vitest"
import { allocateToolbarCommands, type ToolbarLayoutCommand } from "../glass-toolbar-layout"

const commands: ToolbarLayoutCommand[] = [
  { id: "undo", width: 60, priority: 10 },
  { id: "redo", width: 60, priority: 10 },
  { id: "format", width: 80 },
  { id: "export", width: 80, overflow: "always" },
  { id: "share", width: 70, pinned: true },
]
const geometry = { gap: 2, padding: 8, groupGap: 8, overflowWidth: 40 }

describe("toolbar width allocation", () => {
  it("uses measured widths at the exact fit boundary", () => {
    const simple = commands.slice(0, 2)
    expect(allocateToolbarCommands(simple, 130, geometry).visible).toEqual(["undo", "redo"])
    expect(allocateToolbarCommands(simple, 129, geometry).visible).toEqual(["undo"])
    expect(allocateToolbarCommands(simple, 129, geometry).overflow).toEqual(["redo"])
  })
  it("reserves overflow and a separate trailing pinned group even at large widths", () => {
    expect(allocateToolbarCommands(commands, 600, geometry)).toEqual({ visible: ["undo", "redo", "format"], overflow: ["export"], pinned: ["share"], scrollPinned: false })
  })
  it("prioritizes admission while preserving authored visual and overflow order", () => {
    const result = allocateToolbarCommands([{ id: "low", width: 40 }, { id: "high", width: 60, priority: 9 }, { id: "mid", width: 40, priority: 5 }, { id: "extra", width: 40, overflow: "always" }], 152, geometry)
    expect(result.visible).toEqual(["high", "mid"])
    expect(result.overflow).toEqual(["low", "extra"])
  })
  it("scrolls pinned controls rather than losing them at impossible widths", () => {
    const result = allocateToolbarCommands(commands, 70, geometry)
    expect(result.pinned).toEqual(["share"])
    expect(result.visible).toEqual([])
    expect(result.overflow).toEqual(["undo", "redo", "format", "export"])
    expect(result.scrollPinned).toBe(true)
  })
  it("reallocates on text scaling and handles an empty list", () => {
    expect(allocateToolbarCommands(commands.slice(0, 2).map(c => ({ ...c, width: 120 })), 200, geometry).overflow).toEqual(["redo"])
    expect(allocateToolbarCommands([], 0, geometry)).toEqual({ visible: [], pinned: [], overflow: [], scrollPinned: false })
  })
})
