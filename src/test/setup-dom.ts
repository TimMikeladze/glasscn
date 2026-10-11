// jsdom gaps the components rely on: layout observers and media queries.
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(cleanup)

class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
const g = globalThis as Record<string, unknown>
g.ResizeObserver ??= Observer
g.IntersectionObserver ??= Observer
if (typeof window !== "undefined" && !window.matchMedia)
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList
