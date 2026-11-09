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
  act(() => result.current.setOpen(false))
  await act(async () => { await Promise.resolve(); await Promise.resolve() })
  expect(panel.style.viewTransitionName).toBe(identity)
  act(() => transitions[1].update())
  expect(trigger.style.viewTransitionName).toBe(identity)
  await act(async () => transitions[1].finish())
  unmount()
  trigger.remove()
  panel.remove()
})
