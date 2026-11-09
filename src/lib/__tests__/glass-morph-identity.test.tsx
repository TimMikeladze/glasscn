import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { expect, it, vi } from "vitest"

import { GlassMorph, GlassMorphItem } from "@/components/glass/glass-morph"

it("keeps sibling identities and consumer refs while reordering actions", () => {
  const ref = React.createRef<HTMLDivElement>()
  const action = vi.fn()
  const view = (reverse: boolean) => <GlassMorph ref={ref} value={reverse}>{(reverse ? ["b", "a"] : ["a", "b"]).map((id) => <GlassMorphItem key={id} id={id} accessibilityLabel={`Action ${id}`} onPress={action}>{id}</GlassMorphItem>)}</GlassMorph>
  const { rerender } = render(view(false))
  const first = screen.getByRole("button", { name: "Action a" })
  expect(ref.current?.dataset.slot).toBe("glass-morph")
  rerender(view(true))
  expect(screen.getByRole("button", { name: "Action a" })).toBe(first)
  expect([...ref.current!.querySelectorAll("[data-glass-morph-id]")].map((item) => (item as HTMLElement).dataset.glassMorphId)).toEqual(["b", "a"])
  fireEvent.click(first)
  expect(action).toHaveBeenCalledOnce()
})
