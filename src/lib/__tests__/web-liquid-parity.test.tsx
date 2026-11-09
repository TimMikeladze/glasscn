import type { CSSProperties } from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/glass/popover"
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/glass/sheet"
import { Toolbar, ToolbarGroup, ToolbarItem } from "@/components/glass/toolbar"
import { Dock, DockBar, DockItem, DockLink, DockNav } from "@/components/glass/dock"
import { Sidebar, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/glass/sidebar"
import { ThemeScope } from "@/components/glass/theme-scope"

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); Reflect.deleteProperty(document, "startViewTransition"); Reflect.deleteProperty(document, "elementFromPoint") })

describe("responsive sidebar", () => {
  it("keeps closed mobile navigation out of focus and restores the opener after Escape", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query.includes("max-width"), media: query, onchange: null,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
    }))
    render(
      <SidebarProvider>
        <SidebarTrigger />
        <Sidebar aria-label="Library"><SidebarMenuButton>Photos</SidebarMenuButton></Sidebar>
      </SidebarProvider>
    )
    const trigger = screen.getByRole("button", { name: "Toggle sidebar" })
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByRole("button", { name: "Photos" })).toBeNull()
    trigger.focus()
    fireEvent.click(trigger)
    const dialog = await screen.findByRole("dialog", { name: "Library" })
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(dialog.contains(document.activeElement)).toBe(true)
    fireEvent.keyDown(dialog, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Library" })).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })
})

describe("full-height sheet", () => {
  it("anchors the large detent to the viewport instead of keeping the partial-sheet gap", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent side="bottom" detents={["medium", "large"]} defaultDetent={1} aria-describedby={undefined}>
          <SheetTitle>Place details</SheetTitle>
        </SheetContent>
      </Sheet>
    )
    const panel = screen.getByRole("dialog") as HTMLElement
    expect(panel.style.height).toBe(`${window.innerHeight}px`)
    expect(panel.style.bottom).toBe("0px")
    expect(panel.style.insetInline).toBe("0px")
    expect(panel.style.borderBottomLeftRadius).toBe("0px")
    expect(panel.style.borderBottomRightRadius).toBe("0px")
  })
})

describe("scoped overlay portals", () => {
  it("carries scoped primitives and scheme outside clipping ancestors and follows updates", async () => {
    const view = (blur: string) => (
      <ThemeScope scheme="light" style={{ "--glass-blur": blur, "--primary": "rgb(12, 45, 67)" } as CSSProperties}>
        <Popover defaultOpen>
          <PopoverTrigger>Open details</PopoverTrigger>
          <PopoverContent aria-label="Details">Photo details</PopoverContent>
        </Popover>
      </ThemeScope>
    )
    const { rerender, unmount } = render(view("7px"))
    const content = await screen.findByRole("dialog", { name: "Details" })
    const host = content.closest<HTMLElement>("[data-glass-portal]")
    expect(host).not.toBeNull()
    expect(host?.parentElement).toBe(document.body)
    expect(host?.classList.contains("light")).toBe(true)
    expect(host?.style.getPropertyValue("--glass-blur")).toBe("7px")
    expect(host?.style.getPropertyValue("--primary")).toBe("rgb(12, 45, 67)")
    rerender(view("19px"))
    await waitFor(() => expect(host?.style.getPropertyValue("--glass-blur")).toBe("19px"))
    unmount()
    expect(document.querySelector("[data-glass-portal]")).toBeNull()
  })
})

describe("source presentation", () => {
  it("coalesces repeated activation while the browser is still capturing the source", async () => {
    const updates: (() => void)[] = []
    let finish: (() => void) | undefined
    Object.defineProperty(document, "startViewTransition", { configurable: true, value: (update: () => void) => {
      updates.push(update)
      return { finished: new Promise<void>((resolve) => { finish = resolve }), skipTransition: () => finish?.() }
    } })
    render(<Sheet><SheetTrigger>Open place</SheetTrigger><SheetContent aria-describedby={undefined}><SheetTitle>Place</SheetTitle></SheetContent></Sheet>)
    const trigger = screen.getByRole("button", { name: "Open place" })
    fireEvent.click(trigger)
    fireEvent.click(trigger)
    expect(updates).toHaveLength(1)
    await act(async () => { updates[0](); finish?.() })
    expect(screen.getByRole("dialog", { name: "Place" })).toBeTruthy()
    expect([...document.querySelectorAll<HTMLElement>("*")].some((element) => element.style.viewTransitionName?.startsWith("glass-presentation-"))).toBe(false)
  })

  it("keeps one source identity through sheet open and close, with no duplicate transition names", async () => {
    const snapshots: { from?: string; to?: string; fromSlot?: string | null; toSlot?: string | null }[] = []
    const named = () => [...document.querySelectorAll<HTMLElement>("*")].filter((element) => element.style.viewTransitionName?.startsWith("glass-presentation-"))
    Object.defineProperty(document, "startViewTransition", { configurable: true, value: (update: () => void) => {
      const before = named()
      expect(before).toHaveLength(1)
      const from = before[0].style.viewTransitionName
      const fromSlot = before[0].dataset.slot
      update()
      const after = named()
      expect(after).toHaveLength(1)
      snapshots.push({ from, to: after[0].style.viewTransitionName, fromSlot, toSlot: after[0].dataset.slot })
      return { finished: Promise.resolve() }
    } })
    render(
      <Sheet>
        <SheetTrigger>Open place</SheetTrigger>
        <SheetContent aria-describedby={undefined}>
          <SheetTitle>Place</SheetTitle><SheetClose>Close place</SheetClose>
        </SheetContent>
      </Sheet>
    )
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Open place" })))
    expect(snapshots[0]).toMatchObject({ fromSlot: "sheet-trigger", toSlot: "sheet-content" })
    expect(snapshots[0].from).toBe(snapshots[0].to)
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Close place" })))
    expect(snapshots[1]).toMatchObject({ fromSlot: "sheet-content", toSlot: "sheet-trigger" })
    expect(named()).toHaveLength(0)
  })

  it("opens immediately without a spatial transition when Reduce Motion is on", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query.includes("prefers-reduced-motion"), media: query, onchange: null,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
    }))
    const start = vi.fn()
    Object.defineProperty(document, "startViewTransition", { configurable: true, value: start })
    render(<Popover><PopoverTrigger>Details</PopoverTrigger><PopoverContent aria-label="Photo">Photo</PopoverContent></Popover>)
    fireEvent.click(screen.getByRole("button", { name: "Details" }))
    expect(screen.getByRole("dialog", { name: "Photo" })).toBeTruthy()
    expect(start).not.toHaveBeenCalled()
  })
})

describe("scrolled toolbar", () => {
  it("tracks the nearest scroller without a ScrollEdge sentinel", () => {
    const { container } = render(
      <div style={{ overflowY: "auto" }}>
        <Toolbar placement="sticky-top" aria-label="Photo"><ToolbarGroup><ToolbarItem>Share</ToolbarItem></ToolbarGroup></Toolbar>
      </div>
    )
    const scroller = container.firstElementChild as HTMLElement
    const bar = screen.getByRole("toolbar", { name: "Photo" })
    expect(bar.hasAttribute("data-over-content")).toBe(false)
    scroller.scrollTop = 90
    fireEvent.scroll(scroller)
    expect(bar.hasAttribute("data-over-content")).toBe(true)
    scroller.scrollTop = 0
    fireEvent.scroll(scroller)
    expect(bar.hasAttribute("data-over-content")).toBe(false)
  })
})

describe("dock scrubbing", () => {
  it("can scrub back to the segment where the drag started", () => {
    vi.stubGlobal("PointerEvent", MouseEvent)
    render(<Dock position="static"><DockBar defaultValue="photos"><DockItem value="photos">Photos</DockItem><DockItem value="albums">Albums</DockItem></DockBar></Dock>)
    const photos = screen.getByRole("radio", { name: "Photos" })
    const albums = screen.getByRole("radio", { name: "Albums" })
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: (x: number) => x > 20 ? albums : photos })
    fireEvent.pointerDown(photos, { button: 0, buttons: 1, clientX: 0, clientY: 10 })
    fireEvent.pointerMove(window, { buttons: 1, clientX: 40, clientY: 10 })
    expect(albums.getAttribute("aria-checked")).toBe("true")
    fireEvent.pointerMove(window, { buttons: 1, clientX: 10, clientY: 10 })
    expect(photos.getAttribute("aria-checked")).toBe("true")
    fireEvent.pointerUp(window, { clientX: 10, clientY: 10 })
  })

  it("does not navigate on pointer cancellation or navigate twice after a completed drag", () => {
    vi.stubGlobal("PointerEvent", MouseEvent)
    const navigate = vi.fn((event: React.MouseEvent) => event.preventDefault())
    render(<Dock position="static"><DockNav><DockLink href="#photos" active>Photos</DockLink><DockLink href="#albums" onClick={navigate}>Albums</DockLink></DockNav></Dock>)
    const photos = screen.getByRole("link", { name: "Photos" })
    const albums = screen.getByRole("link", { name: "Albums" })
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: () => albums })
    fireEvent.pointerDown(photos, { button: 0, buttons: 1, clientX: 0, clientY: 10 })
    fireEvent.pointerMove(window, { buttons: 1, clientX: 40, clientY: 10 })
    fireEvent.pointerCancel(window, { clientX: 40, clientY: 10 })
    expect(navigate).not.toHaveBeenCalled()
    fireEvent.pointerDown(photos, { button: 0, buttons: 1, clientX: 0, clientY: 10 })
    fireEvent.pointerMove(window, { buttons: 1, clientX: 40, clientY: 10 })
    fireEvent.pointerUp(window, { clientX: 40, clientY: 10 })
    fireEvent.click(albums, { detail: 1 })
    expect(navigate).toHaveBeenCalledTimes(1)
  })
})
