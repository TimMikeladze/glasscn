import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Aurora } from "@/components/glass/aurora"

describe("Aurora (UX-04)", () => {
  afterEach(() => vi.useRealTimers())

  it("pauses the drift while the page scrolls, and resumes after", () => {
    vi.useFakeTimers()
    const { container } = render(<Aurora />)
    const el = container.querySelector('[data-slot="aurora"]')!
    act(() => void window.dispatchEvent(new Event("scroll")))
    expect(el.hasAttribute("data-scrolling")).toBe(true)
    act(() => void vi.advanceTimersByTime(200))
    expect(el.hasAttribute("data-scrolling")).toBe(false)
  })

  it("does not track scrolling when held still", () => {
    const { container } = render(<Aurora animate={false} />)
    act(() => void window.dispatchEvent(new Event("scroll")))
    expect(container.querySelector('[data-slot="aurora"]')!.hasAttribute("data-scrolling")).toBe(false)
  })
})
