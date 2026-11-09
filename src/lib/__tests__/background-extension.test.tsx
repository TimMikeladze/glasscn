import { fireEvent, render, screen } from "@testing-library/react"
import { expect, it, vi } from "vitest"

import { BackgroundExtension } from "@/components/glass/background-extension"

it("extends only the image at both edges and keeps foreground interaction unique", () => {
  const select = vi.fn()
  const { container } = render(<BackgroundExtension src="/lake.jpg" alt="A mountain lake" start={120} end={80}><button onClick={select}>Open collection</button></BackgroundExtension>)
  expect(screen.getAllByRole("img")).toHaveLength(1)
  expect(screen.getByRole("img", { name: "A mountain lake" }).getAttribute("src")).toBe("/lake.jpg")
  const mirrors = container.querySelectorAll('[data-slot="background-extension-mirror"]')
  expect(mirrors).toHaveLength(2)
  expect([...mirrors].every((mirror) => mirror.getAttribute("aria-hidden") === "true" && mirror.querySelectorAll("img").length === 1 && !mirror.querySelector("button"))).toBe(true)
  expect(screen.getAllByRole("button", { name: "Open collection" })).toHaveLength(1)
  fireEvent.click(screen.getByRole("button", { name: "Open collection" }))
  expect(select).toHaveBeenCalledOnce()
})
