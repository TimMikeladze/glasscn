import { act, renderHook } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"

import { useGlassPresentation } from "@/lib/glass-transitions"

afterEach(() => { Reflect.deleteProperty(document, "startViewTransition"); vi.restoreAllMocks() })

it("an interrupted opening cannot erase the next closing transition's source", async () => {
  const transitions: { update: () => void; finish: () => void }[] = []
  Object.defineProperty(document, "startViewTransition", { configurable: true, value: (update: () => void) => {
    let finish!: () => void
    const finished = new Promise<void>((resolve) => { finish = resolve })
    transitions.push({ update, finish })
    return { ready: Promise.resolve(), updateCallbackDone: Promise.resolve(), finished, skipTransition: () => finish() }
  } })
  const trigger = document.createElement("button")
  const panel = document.createElement("div")
  document.body.append(trigger, panel)
  const { result, unmount } = renderHook(() => useGlassPresentation({}))
  act(() => { result.current.setTrigger(trigger); result.current.setContent(panel); result.current.setOpen(true) })
  act(() => transitions[0].update())
  const identity = panel.style.viewTransitionName
  expect(identity).toMatch(/^glass-presentation-/)
  // the direction picks the trigger's snapshot in the stylesheet
  expect(panel.style.getPropertyValue("view-transition-class")).toBe("glass-presentation glass-presentation-open")
  act(() => result.current.setOpen(false))
  await act(async () => { await Promise.resolve(); await Promise.resolve() })
  expect(panel.style.viewTransitionName).toBe(identity)
  act(() => transitions[1].update())
  expect(trigger.style.viewTransitionName).toBe(identity)
  expect(trigger.style.getPropertyValue("view-transition-class")).toBe("glass-presentation glass-presentation-close")
  await act(async () => transitions[1].finish())
  unmount()
  trigger.remove()
  panel.remove()
})

// Chrome copies backdrop-filter onto the group but not border-radius: the blur painted square.
it("rounds the view-transition group from the source's corners to the destination's", async () => {
  let finish!: () => void
  const finished = new Promise<void>((resolve) => { finish = resolve })
  let update!: () => void
  Object.defineProperty(document, "startViewTransition", { configurable: true, value: (callback: () => void) => {
    update = callback
    return { ready: Promise.resolve(), updateCallbackDone: Promise.resolve(), finished, skipTransition: () => finish() }
  } })
  const root = document.documentElement as HTMLElement & { animate: unknown; getAnimations: unknown }
  const cancel = vi.fn()
  const animate = vi.fn(() => ({ cancel }))
  Object.assign(root, { animate, getAnimations: () => [] })
  const trigger = document.createElement("button")
  const panel = document.createElement("div")
  // longhands: jsdom doesn't expand the shorthand in getComputedStyle
  for (const corner of ["TopLeft", "TopRight", "BottomRight", "BottomLeft"] as const) {
    trigger.style[`border${corner}Radius`] = "9999px"
    panel.style[`border${corner}Radius`] = "18px"
  }
  vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({ width: 80, height: 40 } as DOMRect)
  vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({ width: 200, height: 240 } as DOMRect)
  document.body.append(trigger, panel)
  const { result, unmount } = renderHook(() => useGlassPresentation({}))
  act(() => { result.current.setTrigger(trigger); result.current.setContent(panel); result.current.setOpen(true) })
  act(() => update())
  await act(async () => { await Promise.resolve(); await Promise.resolve() })
  const [keyframes, options] = animate.mock.calls[0] as unknown as [Record<string, string>[], { pseudoElement: string }]
  // capsule capped at half the trigger's height, so the corners shrink from the first frame
  expect(keyframes[0].borderTopLeftRadius).toBe("20px")
  expect(keyframes[1].borderBottomRightRadius).toBe("18px")
  // Chrome lowercases the pseudo-element argument; a mixed-case name would miss the group
  expect(options.pseudoElement).toBe(`::view-transition-group(${panel.style.viewTransitionName})`)
  expect(options.pseudoElement).toBe(options.pseudoElement.toLowerCase())
  await act(async () => { finish(); await finished; await Promise.resolve() })
  expect(cancel).toHaveBeenCalled()
  Reflect.deleteProperty(root, "animate")
  Reflect.deleteProperty(root, "getAnimations")
  unmount()
  trigger.remove()
  panel.remove()
})
