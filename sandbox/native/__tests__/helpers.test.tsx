import { screen, act } from "@testing-library/react-native"

import { placeFloating } from "@/components/glass/native/popover"
import { snap } from "@/components/glass/native/slider"
import { Toaster, toast } from "@/components/glass/native/toaster"

import { renderThemed } from "./helpers/render"

// NAT-50 pure helpers that live in component files (so they need react-native to import).

describe("placeFloating", () => {
  const win = { width: 400, height: 800 }
  const size = { width: 200, height: 100 }
  it("places below, centred", () => {
    expect(placeFloating({ x: 150, y: 100, width: 100, height: 40 }, size, win, "bottom", "center", 8)).toEqual({ side: "bottom", left: 100, top: 148 })
  })
  it("flips to the other side when it doesn't fit", () => {
    expect(placeFloating({ x: 150, y: 740, width: 100, height: 40 }, size, win, "bottom", "center", 8).side).toBe("top")
  })
  it("clamps inside the margins", () => {
    expect(placeFloating({ x: 0, y: 100, width: 20, height: 20 }, size, win, "bottom", "center", 8).left).toBe(8)
    expect(placeFloating({ x: 390, y: 100, width: 10, height: 20 }, size, win, "bottom", "end", 8).left).toBe(192)
  })
})

describe("slider snap", () => {
  it("rounds to the step and clamps", () => {
    expect(snap(47, 0, 100, 10)).toBe(50)
    expect(snap(0.30000000004, 0, 1, 0.1)).toBe(0.3)
    expect(snap(120, 0, 100, 5)).toBe(100)
    expect(snap(3, 2, 10, 4)).toBe(2)
  })
})

describe("toaster store", () => {
  it("shows, updates by id and dismisses", async () => {
    await renderThemed(<Toaster />)
    await act(async () => {
      toast.loading("Saving…", { id: "save" })
    })
    expect(screen.getByText("Saving…")).toBeTruthy()
    await act(async () => {
      toast.success("Saved", { id: "save" })
    })
    expect(screen.queryByText("Saving…")).toBeNull()
    expect(screen.getByText("Saved")).toBeTruthy()
    await act(async () => {
      toast.dismiss()
      await new Promise((r) => setTimeout(r, 800))
    })
    expect(screen.queryByText("Saved")).toBeNull()
  })
})
